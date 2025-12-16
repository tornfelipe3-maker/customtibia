
import React from 'react';
import { OfflineReport } from '../types';
import { SHOP_ITEMS } from '../constants';
import { Clock, TrendingUp, Coins, Skull, Swords, Shield, Trophy, CheckCircle } from 'lucide-react';

interface OfflineModalProps {
  report: OfflineReport;
  onClose: () => void;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({ report, onClose }) => {
  
  const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}h ${m}m`;
  };

  const hasLoot = Object.keys(report.lootObtained).length > 0;

  return (
    <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in zoom-in duration-300">
      <div className="tibia-panel w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-[#444] relative flex flex-col bg-[#1a1a1a]">
        
        {/* Header */}
        <div className="bg-[#2d2d2d] border-b border-[#111] px-4 py-3 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
                <Clock size={20} className="text-yellow-500" />
                <div>
                    <h2 className="text-lg font-bold text-[#eee] font-serif tracking-wide leading-none">Welcome Back</h2>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Offline Progress Report</span>
                </div>
            </div>
            <div className="text-xs font-mono text-gray-400 bg-black/40 px-2 py-1 rounded border border-[#333]">
                {formatTime(report.secondsOffline)}
            </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-[url('https://tibia.fandom.com/wiki/Special:FilePath/Background_Artwork_Texture.jpg')] bg-cover relative overflow-y-auto custom-scrollbar max-h-[70vh]">
            <div className="absolute inset-0 bg-black/85 pointer-events-none"></div>
            
            <div className="relative z-10 space-y-6">
                
                {/* 1. Training Section */}
                {report.skillTrained && (
                    <div className="bg-[#222]/90 border border-blue-900/50 rounded-lg p-4 shadow-lg">
                        <h3 className="text-blue-400 font-bold text-sm uppercase mb-3 flex items-center gap-2 border-b border-blue-900/30 pb-2">
                            <Shield size={16}/> Skill Training
                        </h3>
                        <div className="flex justify-between items-center">
                            <div className="text-gray-200 text-sm font-bold capitalize">{report.skillTrained}</div>
                            <div className="text-green-400 font-mono font-bold text-lg">+{report.skillGain?.toFixed(2)}%</div>
                        </div>
                    </div>
                )}

                {/* 2. Hunting Section */}
                {(report.xpGained > 0 || report.goldGained > 0) && (
                    <div className="bg-[#222]/90 border border-red-900/50 rounded-lg p-4 shadow-lg">
                        <h3 className="text-red-400 font-bold text-sm uppercase mb-3 flex items-center gap-2 border-b border-red-900/30 pb-2">
                            <Swords size={16}/> Hunt Results
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-black/40 p-2 rounded border border-[#333]">
                                <div className="text-[10px] text-gray-500 uppercase font-bold">Experience</div>
                                <div className="text-white font-bold flex items-center gap-1">
                                    <TrendingUp size={14} className="text-green-500"/> {report.xpGained.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-black/40 p-2 rounded border border-[#333]">
                                <div className="text-[10px] text-gray-500 uppercase font-bold">Gold Looted</div>
                                <div className="text-white font-bold flex items-center gap-1">
                                    <Coins size={14} className="text-yellow-500"/> {report.goldGained.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {report.leveledUp > 0 && (
                            <div className="bg-yellow-900/20 border border-yellow-700/50 p-2 rounded text-center mb-4 animate-pulse">
                                <div className="text-yellow-500 font-bold flex items-center justify-center gap-2">
                                    <Trophy size={16}/> LEVELED UP +{report.leveledUp}
                                </div>
                            </div>
                        )}

                        <div className="mb-4">
                            <div className="text-[10px] text-gray-500 font-bold mb-1">Monsters Slain</div>
                            <div className="flex flex-wrap gap-2">
                                {report.killedMonsters.map((mob, i) => (
                                    <span key={i} className="text-xs bg-[#333] px-2 py-1 rounded border border-[#444] text-gray-300 flex items-center gap-1">
                                        <Skull size={10} className="text-red-500"/> {mob.count}x {mob.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {hasLoot && (
                            <div>
                                <div className="text-[10px] text-gray-500 font-bold mb-1">Loot Collected</div>
                                <div className="grid grid-cols-6 gap-1 bg-black/40 p-2 rounded border border-[#333] max-h-32 overflow-y-auto custom-scrollbar">
                                    {Object.entries(report.lootObtained).map(([itemId, qty]) => {
                                        const item = SHOP_ITEMS.find(i => i.id === itemId);
                                        if (!item) return null;
                                        return (
                                            <div key={itemId} className="aspect-square bg-[#1a1a1a] border border-[#333] rounded flex items-center justify-center relative group" title={`${qty}x ${item.name}`}>
                                                {item.image ? <img src={item.image} className="w-6 h-6 pixelated"/> : <div className="w-4 h-4 bg-gray-600 rounded-full"/>}
                                                <span className="absolute bottom-0 right-0 text-[8px] bg-black/80 px-0.5 rounded text-white leading-none">{qty}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* If nothing happened */}
                {report.xpGained === 0 && !report.skillTrained && (
                    <div className="text-center text-gray-500 py-8 italic">
                        No significant progress was made while offline.
                    </div>
                )}

            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#222] border-t border-[#444]">
            <button 
                onClick={onClose}
                className="tibia-btn w-full py-3 font-bold text-sm bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 border-green-700 text-white shadow-lg flex items-center justify-center gap-2"
            >
                <CheckCircle size={16}/> Claim Progress
            </button>
        </div>

      </div>
    </div>
  );
};
