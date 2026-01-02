
import React, { useState, useEffect, useRef } from 'react';
import { ChatService, ChatMessage } from '../services/chat';
import { Player } from '../types';
import { MessageSquare, Send, User, X, Hash, MessageCircle, Users, Bell } from 'lucide-react';

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
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [unreadPms, setUnreadPms] = useState<Set<string>>(new Set());
    const [openConversations, setOpenConversations] = useState<string[]>([]);

    // Carregar histórico inicial e persistir conversas abertas
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const [global, priv] = await Promise.all([
                    ChatService.getGlobalMessages(100),
                    ChatService.getPrivateMessages(userId)
                ]);
                setWorldMessages(global);
                setPrivateMessages(priv);

                // Detectar com quem você já tem histórico para abrir as abas
                const partners = new Set<string>();
                priv.forEach(m => {
                    if (m.sender_name !== player.name) partners.add(m.sender_name);
                    if (m.receiver_name && m.receiver_name !== player.name) partners.add(m.receiver_name);
                });
                setOpenConversations(Array.from(partners));
            } catch (e) {
                console.error("Erro ao carregar chat:", e);
            }
        };
        loadHistory();

        const subGlobal = ChatService.subscribeGlobal((payload) => {
            setWorldMessages(prev => [...prev, payload.new as ChatMessage].slice(-100));
        });

        const subPrivate = ChatService.subscribePrivate(userId, (payload) => {
            const newMsg = payload.new as ChatMessage;
            const partner = newMsg.sender_name === player.name ? newMsg.receiver_name! : newMsg.sender_name;
            
            setPrivateMessages(prev => [...prev, newMsg]);
            
            // Abrir aba automaticamente se receber mensagem nova
            setOpenConversations(prev => {
                if (!prev.includes(partner)) return [...prev, partner];
                return prev;
            });

            // Notificação de não lida
            if (activeTab !== partner && newMsg.sender_name !== player.name) {
                setUnreadPms(prev => new Set(prev).add(partner));
            }
        });

        return () => {
            subGlobal.unsubscribe();
            subPrivate.unsubscribe();
        };
    }, [userId, player.name]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [worldMessages, privateMessages, activeTab, openConversations]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        try {
            if (activeTab === 'world') {
                await ChatService.sendGlobalMessage(userId, player.name, inputText, player.isGm);
            } else {
                await ChatService.sendPrivateMessage(userId, player.name, activeTab, inputText);
                const fakeMsg: ChatMessage = {
                    id: Math.random().toString(),
                    sender_id: userId,
                    sender_name: player.name,
                    receiver_name: activeTab,
                    message: inputText,
                    created_at: new Date().toISOString()
                };
                setPrivateMessages(prev => [...prev, fakeMsg]);
            }
            setInputText('');
            inputRef.current?.focus();
        } catch (e: any) {
            alert(e.message || "Erro ao enviar mensagem.");
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
        inputRef.current?.focus();
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
        <div className="flex flex-col h-full bg-[#0d0d0d] text-gray-200 border border-[#333] font-sans shadow-2xl">
            
            {/* TABS ENGINE (TIBIA STYLE) */}
            <div className="flex bg-[#1a1a1a] border-b border-[#333] overflow-x-auto shrink-0 no-scrollbar items-center">
                <button 
                    onClick={() => setActiveTab('world')}
                    className={`h-10 px-4 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 border-r border-[#333]
                        ${activeTab === 'world' ? 'bg-[#222] text-yellow-500 border-b-2 border-b-yellow-600' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                >
                    <Hash size={14} className={activeTab === 'world' ? 'text-yellow-500' : 'text-gray-600'}/> 
                    World Chat
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

                {/* MANUAL PM INPUT */}
                <form onSubmit={(e) => { e.preventDefault(); openPrivateChat(pmTarget); setPmTarget(''); }} className="flex items-center px-4 min-w-[180px] h-full border-l border-[#333] ml-auto bg-black/40">
                    <User size={12} className="text-gray-600 mr-2"/>
                    <input 
                        type="text" 
                        placeholder="Message Player..." 
                        value={pmTarget}
                        onChange={(e) => setPmTarget(e.target.value)}
                        className="bg-transparent border-none text-[10px] w-full focus:outline-none placeholder:text-gray-700 font-bold uppercase"
                    />
                </form>
            </div>

            {/* MESSAGE AREA */}
            <div 
                ref={scrollRef} 
                className="flex-1 overflow-y-auto p-4 font-mono text-[12px] space-y-2 bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/diagonal-stripes.png')] bg-fixed custom-scrollbar"
            >
                {filteredMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-40 select-none">
                        <MessageSquare size={48} className="mb-2"/>
                        <p className="italic">No messages in this channel yet.</p>
                    </div>
                )}
                
                {filteredMessages.map((msg) => (
                    <div key={msg.id} className="group animate-in fade-in slide-in-from-bottom-1 duration-200 bg-black/20 p-1.5 rounded-sm border border-transparent hover:border-white/5">
                        <span className="text-gray-600 mr-2 text-[10px] font-sans">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        {/* NOME CLICÁVEL */}
                        <span 
                            onClick={() => openPrivateChat(msg.sender_name)}
                            className={`font-bold cursor-pointer hover:underline transition-all
                                ${msg.is_gm ? 'text-red-500 drop-shadow-[0_0_2px_rgba(239,68,68,0.3)]' : 
                                  activeTab === 'world' ? 'text-yellow-600 hover:text-yellow-400' : 'text-blue-400 hover:text-blue-300'}`}
                        >
                            {msg.sender_name}{msg.is_gm ? ' [GM]' : ''}:
                        </span>

                        <span className={`ml-2 leading-relaxed ${msg.is_gm ? 'text-red-400 font-bold' : 'text-gray-300'}`}>
                            {msg.message}
                        </span>
                    </div>
                ))}
            </div>

            {/* INPUT AREA */}
            <form onSubmit={handleSendMessage} className="p-4 bg-[#111] border-t border-[#333] flex gap-3 items-center shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
                <div className={`w-2 h-2 rounded-full ${activeTab === 'world' ? 'bg-yellow-500' : 'bg-blue-500'} animate-pulse shadow-[0_0_5px_currentColor]`}></div>
                <input 
                    ref={inputRef}
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={activeTab === 'world' ? "Type to broadcast to everyone..." : `Message ${activeTab}...`}
                    className="flex-1 bg-black border border-[#333] rounded-md px-4 py-2.5 text-sm text-white focus:border-yellow-700 outline-none transition-all placeholder:text-gray-700"
                    maxLength={255}
                    autoComplete="off"
                />
                <button 
                    type="submit" 
                    className={`p-2.5 rounded-md transition-all active:scale-95 disabled:opacity-50 border shadow-md
                        ${activeTab === 'world' 
                            ? 'bg-yellow-600 hover:bg-yellow-500 text-black border-yellow-400' 
                            : 'bg-blue-700 hover:bg-blue-600 text-white border-blue-500'}`}
                    disabled={!inputText.trim()}
                >
                    <Send size={18} />
                </button>
            </form>

            {/* CHANNEL FOOTER INFO */}
            <div className="bg-black px-4 py-1 flex justify-between items-center border-t border-[#222]">
                <div className="text-[9px] text-gray-600 uppercase font-bold flex items-center gap-2">
                    <Users size={10} /> Active Channel: <span className={activeTab === 'world' ? 'text-yellow-700' : 'text-blue-700'}>{activeTab === 'world' ? 'Global' : activeTab}</span>
                </div>
                <div className="text-[9px] text-gray-700 italic">
                    Press Enter to send
                </div>
            </div>
        </div>
    );
};
