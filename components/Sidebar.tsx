
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MenuItem {
    id: string;
    label: string;
    icon: LucideIcon;
    color: string;
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
        <div className="w-48 bg-[#181818] border-r border-[#333] flex flex-col shadow-2xl z-30 shrink-0">
            {/* Logo Area */}
            <div className="h-14 flex items-center justify-center border-b border-[#333] bg-[#111]">
                <h1 className="text-xl font-bold font-serif tracking-widest text-[#c0c0c0] drop-shadow-md">
                    TIBIA<span className="text-yellow-600">IDLE</span>
                </h1>
            </div>

            {/* Language Toggle in Sidebar */}
            <div className="mx-3 mt-4 mb-2 flex gap-1 bg-[#111] p-1 rounded border border-[#333] shadow-inner">
                <button 
                    onClick={() => setLanguage('en')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-[10px] font-bold transition-all duration-200 ${language === 'en' ? 'bg-blue-900/60 text-blue-100 border border-blue-700 shadow-[0_0_10px_rgba(29,78,216,0.2)]' : 'text-gray-600 hover:text-gray-400 hover:bg-[#222] border border-transparent'}`}
                    title="English"
                >
                    <span className="text-sm">🇺🇸</span> EN
                </button>
                <button 
                    onClick={() => setLanguage('pt')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-[10px] font-bold transition-all duration-200 ${language === 'pt' ? 'bg-green-900/60 text-green-100 border border-green-700 shadow-[0_0_10px_rgba(21,128,61,0.2)]' : 'text-gray-600 hover:text-gray-400 hover:bg-[#222] border border-transparent'}`}
                    title="Português"
                >
                    <span className="text-sm">🇧🇷</span> PT
                </button>
            </div>

            {/* Scrollable Menu Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
                {menuCategories.map((cat, idx) => (
                    <div key={idx}>
                        <h3 className="text-[9px] uppercase font-bold text-gray-600 tracking-widest mb-1.5 px-2">
                            {cat.title}
                        </h3>
                        <div className="space-y-0.5">
                            {cat.items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => item.action ? item.action() : onMenuClick(item.id)}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-bold transition-all
                                        ${activeTab === item.id && !item.action 
                                            ? 'bg-[#2a2a2a] text-gray-100 border-l-2 border-yellow-500 shadow-sm' 
                                            : 'text-gray-500 hover:bg-[#222] hover:text-gray-300 border-l-2 border-transparent'}
                                    `}
                                >
                                    <item.icon size={16} className={`${activeTab === item.id && !item.action ? item.color : 'opacity-70 group-hover:opacity-100'} transition-opacity`} />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Version Footer */}
            <div className="p-2 text-[9px] text-center text-gray-700 border-t border-[#222]">
                Alpha v2.3
            </div>
        </div>
    );
};
