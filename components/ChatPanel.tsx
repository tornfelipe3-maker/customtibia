
import React, { useState, useEffect, useRef } from 'react';
import { ChatService, ChatMessage } from '../services/chat';
import { Player } from '../types';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, User, X, Hash, MessageCircle, Users, Loader2 } from 'lucide-react';

interface ChatPanelProps {
    player: Player;
    userId: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ player, userId }) => {
    const [activeTab, setActiveTab] = useState<'world' | string>('world');
    const [worldMessages, setWorldMessages] = useState<ChatMessage[]>([]);
    const [privateMessages, setPrivateMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [pmTarget, setPmTarget] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [unreadPms, setUnreadPms] = useState<Set<string>>(new Set());
    const [openConversations, setOpenConversations] = useState<string[]>([]);

    const fetchHistory = async () => {
        try {
            const [global, priv] = await Promise.all([
                ChatService.getGlobalMessages(100),
                ChatService.getPrivateMessages(userId)
            ]);
            
            // Mesclar evitando duplicatas (especialmente com mensagens otimistas)
            setWorldMessages(prev => {
                const existingIds = new Set(prev.map(m => m.id));
                const news = global.filter(m => !existingIds.has(m.id));
                return [...prev, ...news].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).slice(-100);
            });
            
            setPrivateMessages(priv);
        } catch (e) {
            console.error("Erro ao sincronizar histórico de chat:", e);
        }
    };

    useEffect(() => {
        fetchHistory();

        // Realtime Subscription
        const subGlobal = ChatService.subscribeGlobal((payload) => {
            const newMsg = payload.new as ChatMessage;
            setWorldMessages(prev => {
                if (prev.find(m => m.id === newMsg.id)) return prev; // Evita duplicata se já foi adicionado otimisticamente
                return [...prev, newMsg].slice(-100);
            });
        });

        const subPrivate = ChatService.subscribePrivate(userId, (payload) => {
            const newMsg = payload.new as ChatMessage;
            if (newMsg.sender_id === userId) return; // Já tratamos o envio localmente

            const partner = newMsg.sender_name === player.name ? newMsg.receiver_name! : newMsg.sender_name;
            setPrivateMessages(prev => [...prev, newMsg]);
            
            setOpenConversations(prev => {
                if (!prev.includes(partner)) return [...prev, partner];
                return prev;
            });

            if (activeTab !== partner) {
                setUnreadPms(prev => new Set(prev).add(partner));
            }
        });

        // Polling de segurança (Fallback para caso o Realtime falhe)
        const pollInterval = setInterval(fetchHistory, 5000);

        return () => {
            subGlobal.unsubscribe();
            subPrivate.unsubscribe();
            clearInterval(pollInterval);
        };
    }, [userId, player.name]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [worldMessages, privateMessages, activeTab, openConversations]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const msgText = inputText.trim();
        if (!msgText || sending) return;

        setSending(true);
        const tempId = `temp-${Date.now()}`;
        
        // --- ATUALIZAÇÃO OTIMISTA ---
        // Adicionamos a mensagem na tela antes mesmo de ir para o banco
        const optimisticMsg: ChatMessage = {
            id: tempId,
            sender_id: userId,
            sender_name: player.name,
            message: msgText,
            is_gm: player.isGm,
            created_at: new Date().toISOString(),
            receiver_name: activeTab === 'world' ? undefined : activeTab
        };

        if (activeTab === 'world') {
            setWorldMessages(prev => [...prev, optimisticMsg].slice(-100));
        } else {
            setPrivateMessages(prev => [...prev, optimisticMsg]);
        }
        
        setInputText('');

        try {
            // Garantir que a sessão ainda é válida para evitar erro de RLS
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Sessão expirada. Por favor, recarregue o jogo.");

            if (activeTab === 'world') {
                await ChatService.sendGlobalMessage(userId, player.name, msgText, player.isGm);
            } else {
                await ChatService.sendPrivateMessage(userId, player.name, activeTab, msgText);
            }
            
            // Removemos a mensagem temporária após a confirmação do Realtime ou polling
            // (O fetchHistory ou o real-time cleaner cuidará disso se o ID for diferente)
        } catch (e: any) {
            console.error("Chat Error:", e.message);
            // Se falhar, removemos a mensagem otimista e avisamos o usuário
            if (activeTab === 'world') {
                setWorldMessages(prev => prev.filter(m => m.id !== tempId));
            } else {
                setPrivateMessages(prev => prev.filter(m => m.id !== tempId));
            }
            alert(`Erro no Chat: ${e.message}`);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const openPrivateChat = (targetName: string) => {
        if (targetName === player.name) return;
        setOpenConversations(prev => {
            if (!prev.includes(targetName)) return [...prev, targetName];
            return prev;
        });
        setActiveTab(targetName);
        setUnreadPms(prev => {
            const next = new Set(prev);
            next.delete(targetName);
            return next;
        });
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const closeTab = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenConversations(prev => prev.filter(c => c !== name));
        if (activeTab === name) setActiveTab('world');
    };

    const filteredMessages = activeTab === 'world' 
        ? worldMessages 
        : privateMessages.filter(m => m.sender_name === activeTab || m.receiver_name === activeTab);

    return (
        <div className="flex flex-col h-full bg-[#0d0d0d] text-gray-200 border border-[#333] font-sans shadow-2xl overflow-hidden">
            
            {/* TABS (TIBIA STYLE) */}
            <div className="flex bg-[#1a1a1a] border-b border-[#333] overflow-x-auto shrink-0 no-scrollbar items-center">
                <button 
                    onClick={() => setActiveTab('world')}
                    className={`h-10 px-4 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 border-r border-[#333]
                        ${activeTab === 'world' ? 'bg-[#222] text-yellow-500 border-b-2 border-b-yellow-600' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                >
                    <Hash size={14} className={activeTab === 'world' ? 'text-yellow-500' : 'text-gray-600'}/> 
                    Global
                </button>
                
                {openConversations.map(name => (
                    <div 
                        key={name} 
                        onClick={() => {
                            setActiveTab(name);
                            setUnreadPms(prev => {
                                const next = new Set(prev);
                                next.delete(name);
                                return next;
                            });
                        }}
                        className={`h-10 px-4 text-[10px] font-bold uppercase border-r border-[#333] transition-all cursor-pointer flex items-center gap-3 shrink-0 group relative
                            ${activeTab === name ? 'bg-blue-900/20 text-blue-400 border-b-2 border-b-blue-500' : 'text-gray-500 hover:text-blue-300 hover:bg-white/5'}
                            ${unreadPms.has(name) ? 'bg-red-900/20' : ''}`}
                    >
                        {unreadPms.has(name) && (
                            <span className="absolute top-1 right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                        <MessageCircle size={14} />
                        <span>{name}</span>
                        <X 
                            size={12} 
                            className="text-gray-600 hover:text-red-500 transition-colors" 
                            onClick={(e) => closeTab(name, e)}
                        />
                    </div>
                ))}

                <form onSubmit={(e) => { e.preventDefault(); openPrivateChat(pmTarget); setPmTarget(''); }} className="flex items-center px-4 min-w-[180px] h-full border-l border-[#333] ml-auto bg-black/40">
                    <input 
                        type="text" 
                        placeholder="Private Message..." 
                        value={pmTarget}
                        onChange={(e) => setPmTarget(e.target.value)}
                        className="bg-transparent border-none text-[10px] w-full focus:outline-none placeholder:text-gray-700 font-bold uppercase"
                    />
                </form>
            </div>

            {/* MESSAGE AREA */}
            <div 
                ref={scrollRef} 
                className="flex-1 overflow-y-auto p-4 font-mono text-[12px] space-y-1.5 bg-[#0a0a0a] custom-scrollbar"
            >
                {filteredMessages.map((msg) => {
                    const isTemp = msg.id.toString().startsWith('temp-');
                    return (
                        <div key={msg.id} className={`group animate-in fade-in slide-in-from-bottom-1 duration-200 transition-opacity ${isTemp ? 'opacity-50' : 'opacity-100'}`}>
                            <span className="text-gray-600 mr-2 text-[10px] font-sans">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            
                            <span 
                                onClick={() => openPrivateChat(msg.sender_name)}
                                className={`font-bold cursor-pointer hover:underline transition-all
                                    ${msg.is_gm ? 'text-red-500' : 
                                    activeTab === 'world' ? 'text-yellow-600' : 'text-blue-400'}`}
                            >
                                {msg.sender_name}{msg.is_gm ? ' [GM]' : ''}:
                            </span>

                            <span className={`ml-2 leading-relaxed ${msg.is_gm ? 'text-red-400 font-bold' : 'text-gray-300'}`}>
                                {msg.message}
                            </span>
                            {isTemp && <Loader2 size={10} className="inline ml-2 animate-spin text-gray-600" />}
                        </div>
                    );
                })}
            </div>

            {/* INPUT AREA */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#111] border-t border-[#333] flex gap-2 items-center">
                <input 
                    ref={inputRef}
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={activeTab === 'world' ? "Global Chat..." : `Message ${activeTab}...`}
                    className="flex-1 bg-black border border-[#333] rounded px-3 py-2 text-sm text-white focus:border-yellow-700 outline-none placeholder:text-gray-800"
                    maxLength={200}
                    autoComplete="off"
                    disabled={sending}
                />
                <button 
                    type="submit" 
                    className={`p-2 rounded transition-all active:scale-95 disabled:opacity-50
                        ${activeTab === 'world' ? 'bg-yellow-700 hover:bg-yellow-600' : 'bg-blue-700 hover:bg-blue-600'}`}
                    disabled={!inputText.trim() || sending}
                >
                    <Send size={18} className="text-white" />
                </button>
            </form>
        </div>
    );
};
