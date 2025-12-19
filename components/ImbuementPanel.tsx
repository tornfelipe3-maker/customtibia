
import React from 'react';
import { Player, ImbuType } from '../types';
import { Sparkles, Zap, Heart, Swords, Clock, Pause, Play, Coins, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ImbuementPanelProps {
  player: Player;
  onImbu: (type: ImbuType, tier: number) => void;
  onToggleActive: () => void;
}

export const ImbuementPanel: React.FC<ImbuementPanelProps> = ({ player, onImbu, onToggleActive }) => {
  const { t } = useLanguage();
  const goldTokens = player.inventory['gold_token'] || 0;

  const IMBU_DATA = [
      { 
          type: ImbuType.LIFE_STEAL, 
          name: 'Vampirism', 
          desc: 'Converts damage dealt into health.', 
          icon: <Heart size={20} className="text-red-500" /> 
      },
      { 
          type: ImbuType.MANA_LEECH, 
          name: 'Void', 
          desc: 'Converts damage dealt into mana.', 
          icon: <Zap size={20} className="text-blue-400" /> 
      },
      { 
          type: ImbuType.STRIKE, 
          name: 'Strike', 
          desc: 'Increases Critical Hit chance.', 
          icon: <Swords size={20} className="text-orange-400" /> 
      }
  ];

  const TIERS = [
      { level: 1, value: 5, cost: 1, label: 'Basic' },
      { level: 2, value: 10, cost: 3, label: 'Intricate' },
      { level: 3, value: 15, cost: 5, label: 'Powerful' }
  ];

  const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}h ${m}m`;
  };

  return (
    <div className="flex flex-col h-full bg-[#1a051a] text-[#ccc] relative overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[url('https://tibia.fandom.com/wiki/Special:FilePath/Background_Artwork_Texture.jpg')] opacity-5 pointer-events-none"></div>
        
        {/* Header */}
        <div className="p-6 bg-black/40 border-b border-purple-900/50 flex justify-between items-center shrink-0 z-10">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-900/30 border border-purple-600 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                    <Sparkles size={24} className="text-purple-300" />
                </div>
                <div>
                    <h2 className="text-xl font-bold font-serif text-purple-100 tracking-wide">Imbuing Shrine</h2>
                    <div className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">NPC Imbu</div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <div className="text-[9px] text-gray-500 uppercase font-bold">Tokens Available</div>
                    <div className="flex items-center gap-1.5 text-yellow-500 font-bold">
                        <img src="https://static.tibia.com/images/charactertrade/gold-token.png" className="w-4 h-4 pixelated" />
                        {goldTokens}
                    </div>
                </div>
                <button 
                    onClick={onToggleActive}
                    className={`flex items-center gap-2 px-4 py-2 rounded border transition-all font-bold text-xs uppercase
                        ${player.imbuActive 
                            ? 'bg-red-900/20 border-red-800 text-red-400 hover:bg-red-900/40' 
                            : 'bg-green-900/20 border-green-800 text-green-400 hover:bg-green-900/40 animate-pulse'}
                    `}
                >
                    {player.imbuActive ? <><Pause size={14}/> Pause Timer</> : <><Play size={14}/> Resume Timer</>}
                </button>
            </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar z-10 space-y-6">
            <div className="bg-purple-950/20 border border-purple-900/30 p-4 rounded text-xs text-purple-200 leading-relaxed italic">
                "Adventurer, I can weave ancient energies into your very soul. Each imbuement lasts for 3 hours and can be paused to conserve its power."
            </div>

            <div className="grid grid-cols-1 gap-6">
                {IMBU_DATA.map(imbu => {
                    const current = player.imbuements[imbu.type];
                    const isActive = current.tier > 0;
                    
                    return (
                        <div key={imbu.type} className="bg-black/30 border border-[#333] rounded-lg overflow-hidden flex flex-col md:flex-row">
                            {/* Imbu Type Header */}
                            <div className="p-4 bg-black/40 border-r border-[#333] w-full md:w-56 flex flex-col justify-center items-center text-center">
                                <div className="mb-2 p-3 bg-[#111] rounded-full border border-[#444] shadow-inner">
                                    {imbu.icon}
                                </div>
                                <h3 className="font-bold text-gray-100 text-lg">{imbu.name}</h3>
                                <p className="text-[10px] text-gray-500 mt-1">{imbu.desc}</p>
                                
                                {isActive && (
                                    <div className="mt-4 w-full bg-purple-900/20 border border-purple-800 rounded p-2">
                                        <div className="text-[9px] uppercase font-bold text-purple-400 mb-1">Active Status</div>
                                        <div className="text-white font-bold text-xs">Tier {current.tier} ({current.tier * 5}%)</div>
                                        <div className="text-purple-300 font-mono text-[10px] mt-1 flex items-center justify-center gap-1">
                                            <Clock size={10}/> {formatTime(current.timeRemaining)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tier Selection */}
                            <div className="flex-1 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#111]/50">
                                {TIERS.map(tier => {
                                    const canAfford = goldTokens >= tier.cost;
                                    const isSelected = current.tier === tier.level;

                                    return (
                                        <button
                                            key={tier.level}
                                            onClick={() => canAfford && onImbu(imbu.type, tier.level)}
                                            disabled={!canAfford}
                                            className={`
                                                relative p-3 rounded border flex flex-col items-center justify-between transition-all group
                                                ${isSelected 
                                                    ? 'bg-purple-900/30 border-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.2)]' 
                                                    : canAfford 
                                                        ? 'bg-[#1a1a1a] border-[#333] hover:border-purple-800 hover:bg-[#222]' 
                                                        : 'bg-[#0a0a0a] border-transparent opacity-50 grayscale cursor-not-allowed'}
                                            `}
                                        >
                                            <div className="text-center">
                                                <div className={`text-[10px] uppercase font-bold mb-1 ${isSelected ? 'text-purple-300' : 'text-gray-500'}`}>{tier.label}</div>
                                                <div className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-gray-400'}`}>+{tier.value}%</div>
                                            </div>

                                            <div className="mt-3 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded border border-[#333] text-[11px] font-bold text-yellow-500">
                                                {tier.cost} <span className="text-[9px] uppercase opacity-60">Tokens</span>
                                            </div>
                                            
                                            {isSelected && (
                                                <div className="absolute top-1 right-1">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_green]"></div>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-red-900/10 border border-red-900/30 p-4 rounded flex gap-3">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <p className="text-[10px] text-gray-400 leading-relaxed">
                    <strong>Note:</strong> Re-imbuing while an existing imbuement is active will overwrite the previous one and reset the timer to 3 hours. Gold tokens are non-refundable.
                </p>
            </div>
        </div>
    </div>
  );
};
