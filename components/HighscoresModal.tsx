
import React, { useState } from 'react';
import { HighscoresData } from '../services/storage';
import { Trophy, Medal, X, Crown, Users } from 'lucide-react';

interface HighscoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: HighscoresData | null;
}

export const HighscoresModal: React.FC<HighscoresModalProps> = ({ isOpen, onClose, data }) => {
  const [activeCategory, setActiveCategory] = useState('Level');

  if (!isOpen) return null;

  const categories = data ? Object.keys(data) : [];
  const activeList = data ? data[activeCategory] : [];

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="tibia-panel w-full max-w-4xl h-[600px] flex flex-col shadow-2xl relative">
        
        {/* Header */}
        <div className="bg-[#2d2d2d] border-b border-[#111] px-4 py-3 flex justify-between items-center shrink-0 shadow-md">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-yellow-900/20 border border-yellow-700/50 rounded-full">
                    <Trophy size={20} className="text-yellow-500"/>
                </div>
                <div>
                    <h2 className="font-bold text-[#eee] text-lg font-serif tracking-wide leading-none">Highscores</h2>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Global Rankings</span>
                </div>
            </div>
            <button onClick={onClose} className="text-[#888] hover:text-white font-bold p-1 transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden bg-[#222]">
            
            {/* Sidebar Categories */}
            <div className="w-48 bg-[#1a1a1a] border-r border-[#333] overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1 shadow-inner">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`
                            px-3 py-2.5 text-xs font-bold text-left rounded transition-all flex justify-between items-center border
                            ${activeCategory === cat 
                                ? 'bg-[#333] text-yellow-500 border-[#555] shadow-sm' 
                                : 'bg-transparent text-gray-500 hover:bg-[#222] hover:text-gray-300 border-transparent'}
                        `}
                    >
                        {cat}
                        {activeCategory === cat && <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_5px_yellow]"></div>}
                    </button>
                ))}
            </div>

            {/* Ranking Table */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-[url('https://tibia.fandom.com/wiki/Special:FilePath/Background_Artwork_Texture.jpg')] bg-repeat">
                
                <div className="sticky top-0 bg-[#2d2d2d]/95 backdrop-blur-sm border-b border-[#444] p-3 text-center shadow-md z-10">
                    <h3 className="text-lg font-bold text-yellow-500 font-serif inline-flex items-center gap-2">
                        Top 10 {activeCategory}
                    </h3>
                </div>

                {!data ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-2">
                        <div className="w-6 h-6 border-2 border-t-yellow-500 border-r-transparent border-b-yellow-500 border-l-transparent rounded-full animate-spin"></div>
                        <span className="text-xs">Updating Rankings...</span>
                    </div>
                ) : activeList.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">No records found.</div>
                ) : (
                    <div className="p-4">
                        <div className="w-full bg-[#1a1a1a] border border-[#444] rounded-sm shadow-lg overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#111] text-[10px] uppercase text-gray-500 border-b border-[#333]">
                                        <th className="p-3 w-16 text-center">Rank</th>
                                        <th className="p-3">Name</th>
                                        <th className="p-3 w-32">Vocation</th>
                                        <th className="p-3 w-24 text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {activeList.map((entry, index) => {
                                        const rank = index + 1;
                                        let rankDisplay: React.ReactNode = <span className="font-mono text-gray-500 text-xs">#{rank}</span>;
                                        let rowBg = index % 2 === 0 ? 'bg-[#252525]' : 'bg-[#2a2a2a]';
                                        let textColor = 'text-gray-300';
                                        let nameColor = entry.isPlayer ? 'text-green-400' : 'text-gray-300';

                                        if (rank === 1) {
                                            rankDisplay = <Crown size={18} className="text-yellow-400 mx-auto drop-shadow-md" />;
                                            textColor = 'text-yellow-200 font-bold';
                                            rowBg = 'bg-yellow-900/10';
                                        } else if (rank === 2) {
                                            rankDisplay = <Medal size={16} className="text-gray-300 mx-auto" />;
                                            textColor = 'text-gray-200 font-bold';
                                        } else if (rank === 3) {
                                            rankDisplay = <Medal size={16} className="text-amber-700 mx-auto" />;
                                            textColor = 'text-amber-500 font-bold';
                                        }

                                        return (
                                            <tr key={index} className={`${rowBg} hover:bg-[#333] transition-colors border-b border-[#111] last:border-0`}>
                                                <td className="p-3 text-center">{rankDisplay}</td>
                                                <td className={`p-3`}>
                                                    <span className={`${nameColor} ${entry.isPlayer ? 'font-bold' : ''}`}>{entry.name}</span>
                                                    {entry.isPlayer && <span className="ml-2 text-[9px] bg-green-900 text-green-300 px-1 rounded border border-green-700">YOU</span>}
                                                </td>
                                                <td className="p-3 text-xs text-gray-500">{entry.vocation}</td>
                                                <td className={`p-3 text-right font-mono ${textColor}`}>{entry.value.toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                <div className="p-4 text-center">
                    <p className="text-[10px] text-gray-500 italic flex items-center justify-center gap-1">
                        <Users size={12} /> Rankings update every 5 minutes.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
