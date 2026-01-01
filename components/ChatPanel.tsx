
import React, { useState, useEffect, useRef } from 'react';
import { ChatService, ChatMessage } from '../services/chat';
import { Player } from '../types';
import { MessageSquare, Send, User, X, Hash } from 'lucide-react';

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
    const [unreadPms, setUnreadPms] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const [global, priv] = await Promise.all([
                    ChatService.getGlobalMessages(),
                    ChatService.getPrivateMessages(userId)
                ]);
                setWorldMessages(global);
                setPrivateMessages(priv);
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
            setPrivateMessages(prev => [...prev, newMsg]);
            
            if (newMsg.sender_name !== activeTab && newMsg.sender_name !== player.name) {
                setUnreadPms(prev => new Set(prev).add(newMsg.sender_name));
            }
        });

        return () => {
            subGlobal.unsubscribe();
            subPrivate.unsubscribe();
        };
    }, [userId, activeTab, player.name]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [worldMessages, privateMessages, activeTab]);

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
        } catch (e: any) {
            alert(e.message || "Erro ao enviar mensagem.");
        }
    };

    const startPM = (e: React.FormEvent) => {
        e.preventDefault();
        const target = pmTarget.trim();
        if (!target || target === player.name) return;
        setActiveTab(target);
        setPmTarget('');
        setUnreadPms(prev => {
            const next = new Set(prev);
            next.delete(target);
            return next;
        });
    };

    const closeTab = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeTab === name) setActiveTab('world');
        setPrivateMessages(prev => prev.filter(m => m.sender_name !== name && m.receiver_name !== name));
    };

    const getPrivateTabs = () => {
        const partners = new Set<string>();
        privateMessages.forEach(m => {
            if (m.sender_name !== player.name) partners.add(m.sender_name);
            if (m.receiver_name && m.receiver_name !== player.name) partners.add(m.receiver_name);
        });
        return Array.from(partners);
    };

    const filteredMessages = activeTab === 'world' 
        ? worldMessages 
        : privateMessages.filter(m => m.sender_name === activeTab || m.receiver_name === activeTab);

    return (
        <div className="flex flex-col h-full bg-[#0d0d0d] text-gray-200 border border-[#333] rounded-sm overflow-hidden font-sans">
            <div className="flex bg-[#1a1a1a] border-b border-[#333] overflow-x-auto shrink-0 custom-scrollbar-thin">
                <button 
                    onClick={() => setActiveTab('world')}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-r border-[#333] transition-colors flex items-center gap-2 shrink-0 ${activeTab === 'world' ? 'bg-[#222] text-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Hash size={12}/> World
                </button>
                
                {getPrivateTabs().map(name => (
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
                        className={`px-4 py-2 text-[10px] font-bold uppercase border-r border-[#333] transition-colors cursor-pointer flex items-center gap-2 shrink-0 group ${activeTab === name ? 'bg-blue-900/20 text-blue-400' : 'text-gray-500 hover:text-blue-300'}`}
                    >
                        {unreadPms.has(name) && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>}
                        <span>{name}</span>
                        <X 
                            size={10} 
                            className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity ml-1" 
                            onClick={(e) => closeTab(name, e)}
                        />
                    </div>
                ))}

                <form onSubmit={startPM} className="flex items-center px-3 min-w-[150px]">
                    <User size={10} className="text-gray-600 mr-2"/>
                    <input 
                        type="text" 
                        placeholder="Sussurrar para..." 
                        value={pmTarget}
                        onChange={(e) => setPmTarget(e.target.value)}
                        className="bg-black border border-[#2a2a2a] rounded px-2 py-0.5 text-[10px] w-full focus:border-blue-700 outline-none placeholder:text-gray-700"
                    />
                </form>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-1.5 bg-black/60 custom-scrollbar leading-relaxed">
                {filteredMessages.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-700 italic select-none">
                        Nenhuma mensagem aqui ainda.
                    </div>
                )}
                {filteredMessages.map((msg) => (
                    <div key={msg.id} className="break-words animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <span className="text-gray-600 mr-2 text-[9px]">
                            [{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
                        </span>
                        <span className={`font-bold ${msg.is_gm ? 'text-red-500' : activeTab === 'world' ? 'text-yellow-600' : 'text-blue-400'}`}>
                            {msg.sender_name}:
                        </span>
                        <span className={`ml-2 ${msg.is_gm ? 'text-red-400 font-bold' : 'text-gray-300'}`}>
                            {msg.message}
                        </span>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-[#111] border-t border-[#333] flex gap-2 shadow-2xl">
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={activeTab === 'world' ? "Falar com todos..." : `Mensagem privada para ${activeTab}...`}
                    className="flex-1 bg-black border border-[#333] rounded px-4 py-2 text-xs text-white focus:border-yellow-700 outline-none transition-all placeholder:text-gray-600"
                    maxLength={255}
                />
                <button 
                    type="submit" 
                    className="p-2 bg-[#222] hover:bg-[#2a2a2a] rounded text-yellow-500 border border-[#333] transition-all active:scale-95 disabled:opacity-50"
                    disabled={!inputText.trim()}
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
};
