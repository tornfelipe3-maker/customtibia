
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MenuItem {
    id: string;
    label: string;
    icon: LucideIcon;
    color: string;
    unread?: boolean; // Novo: Sinaliza mensagens não lidas
    action?: () => void;
}

interface MenuCategory {
    title: string;
    items: MenuItem[];
}

interface SidebarProps {
    activeTab: string;
    onMenuClick: (id: string) => void;
    menuCategories: MenuCategory[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    activeTab, 
    onMenuClick, 
    menuCategories 
}) => {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="w-64 bg-[#0f0f0f] border-r border-[#333] flex flex-col shadow-[4px_0_15px_rgba(0,0,0,0.5)] z-40 shrink-0 relative">
            
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://tibia.fandom.com/wiki/Special:FilePath/Background_Artwork_Texture.jpg')] opacity-5 pointer-events-none mix-blend-overlay"></div>

            {/* Logo Area */}
            <div className="h-20 flex flex-col items-center justify-center border-b border-[#333] bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] relative z-10 shrink-0">
                <h1 className="text-2xl font-bold font-serif tracking-[0.15em] text-[#e0e0e0] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center">
                    TIBIA<span className="text-yellow-600 ml-1">IDLE</span>
                </h1>
                <div className="text-[10px] text-[#666] uppercase tracking-[0.3em] mt-1 font-bold">RPG Clicker</div>
            </div>

            {/* Scrollable Menu Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 relative z-10">
                {menuCategories.map((cat, idx) => (
                    <div key={idx} className="animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                        <h3 className="text-xs uppercase font-extrabold text-[#555] tracking-widest mb-3 px-3 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#444]"></span>
                            {cat.title}
                        </h3>
                        <div className="space-y-1">
                            {cat.items.map(item => {
                                const isActive = activeTab === item.id && !item.action;
                                const isAction = !!item.action;
                                const isUnread = item.unread && !isActive;
                                
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => item.action ? item.action() : onMenuClick(item.id)}
                                        className={`
                                            w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden
                                            ${isActive 
                                                ? 'bg-gradient-to-r from-[#2a2a2a] to-transparent text-white shadow-md translate-x-1' 
                                                : isUnread
                                                    ? 'bg-cyan-950/20 text-cyan-300 animate-pulse border border-cyan-900/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                                                    : isAction
                                                        ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/10'
                                                        : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200 hover:translate-x-1'
                                            }
                                        `}
                                    >
                                        {/* Active Indicator Bar */}
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-600 shadow-[0_0_10px_#ca8a04]"></div>}
                                        
                                        {/* Unread Notification Dot */}
                                        {isUnread && (
                                            <div className="absolute right-3 flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_5px_red]"></span>
                                            </div>
                                        )}

                                        <item.icon 
                                            size={20} 
                                            className={`
                                                shrink-0 transition-all duration-300
                                                ${isActive 
                                                    ? `${item.color} drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] scale-110` 
                                                    : isUnread
                                                        ? 'text-cyan-400 drop-shadow-[0_0_3px_rgba(34,211,238,0.5)] scale-105'
                                                        : 'opacity-60 group-hover:opacity-100 group-hover:scale-105'
                                                }
                                                ${isAction ? 'group-hover:text-red-400' : ''}
                                            `} 
                                        />
                                        <span className={`tracking-wide ${isActive || isUnread ? 'font-bold' : ''}`}>{item.label}</span>
                                        
                                        {/* Action Arrow for non-active items */}
                                        {!isActive && !isAction && !isUnread && (
                                            <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 font-serif">
                                                ›
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Footer Area: Language & Version */}
            <div className="p-4 bg-[#0a0a0a] border-t border-[#333] relative z-10 shrink-0">
                {/* Language Toggle */}
                <div className="flex gap-2 mb-4">
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded border transition-all duration-200 text-xs font-bold
                            ${language === 'en' 
                                ? 'bg-blue-900/40 text-blue-200 border-blue-800 shadow-[0_0_10px_rgba(30,58,138,0.3)]' 
                                : 'bg-[#151515] text-gray-500 border-[#333] hover:bg-[#222] hover:text-gray-300'
                            }`}
                    >
                        <span className="text-base leading-none">🇺🇸</span> EN
                    </button>
                    <button 
                        onClick={() => setLanguage('pt')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded border transition-all duration-200 text-xs font-bold
                            ${language === 'pt' 
                                ? 'bg-green-900/40 text-green-200 border-green-800 shadow-[0_0_10px_rgba(20,83,45,0.3)]' 
                                : 'bg-[#151515] text-gray-500 border-[#333] hover:bg-[#222] hover:text-gray-300'
                            }`}
                    >
                        <span className="text-base leading-none">🇧🇷</span> PT
                    </button>
                </div>

                <div className="text-[10px] text-center text-gray-600 font-mono tracking-wider opacity-60">
                    Alpha v2.4
                </div>
            </div>
        </div>
    );
};
