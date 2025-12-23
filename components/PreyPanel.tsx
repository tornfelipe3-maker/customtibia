
import React, { useState, useEffect } from 'react';
import { Player, PreySlot, PreyBonusType } from '../types';
import { MONSTERS } from '../constants';
import { RefreshCw, Star, Swords, Shield, Coins, Skull, Clock, Sparkles, PlayCircle, Timer, XCircle, Layers } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PreyPanelProps {
  player: Player;
  onReroll: (slotIndex: number) => void;
  onRerollAll: () => void;
  onActivate: (slotIndex: number) => void;
  onCancel: (slotIndex: number) => void;
}

const getBonusTheme = (type: PreyBonusType) => {
    switch (type) {
        case 'xp': return { 
            color: 'text-blue-400', 
            bg: 'bg-blue-950', 
            border: 'border-blue-500', 
            label: 'Experience Boost', 
            gradient: 'from-blue-900/40 to-blue-950/10',
            icon: <Star size={18} className="fill-blue-400 text-blue-400"/> 
        };
        case 'damage': return { 
            color: 'text-red-400', 
            bg: 'bg-red-950', 
            border: 'border-red-500', 
            label: 'Damage Bonus', 
            gradient: 'from-red-900/40 to-red-950/10',
            icon: <Swords size={18} className="text-red-400"/> 
        };
        case 'defense': return { 
            color: 'text-green-400', 
            bg: 'bg-green-950', 
            border: 'border-green-500', 
            label: 'Damage Reduction', 
            gradient: 'from-green-900/40 to-green-950/10',
            icon: <Shield size={18} className="fill-green-900 text-green-400"/> 
        };
        case 'loot': return { 
            color: 'text-yellow-400', 
            bg: 'bg-yellow-950', 
            border: 'border-yellow-500', 
            label: 'Loot Chance', 
            gradient: 'from-yellow-900/40 to-yellow-950/10',
            icon: <Coins size={18} className="fill-yellow-600 text-yellow-400"/> 
        };
    }
};

const getRarityInfo = (value: number, max: number) => {
    const ratio = value / max;
    if (ratio === 1) return { label: 'LEGENDARY', color: 'text-orange-500', shadow: 'shadow-[0_0_15px_orange]', border: 'border-orange-500' };
    if (ratio >= 0.8) return { label: 'EPIC', color: 'text-purple-400', shadow: 'shadow-[0_0_10px_purple]', border: 'border-purple-500' };
    if (ratio >= 0.6) return { label: 'RARE', color: 'text-blue-300', shadow: 'shadow-none', border: 'border-blue-400' };
    if (ratio >= 0.3) return { label: 'UNCOMMON', color: 'text-green-300', shadow: 'shadow-none', border: 'border-green-600' };
    return { label: 'COMMON', color: 'text-gray-400', shadow: 'shadow-none', border: 'border-gray-600' };
};

const StarRating: React.FC<{ value: number, max: number }> = ({ value, max }) => {
    const percentage = value / max;
    const stars = 5;
    const filledStars = Math.ceil(percentage * stars);

    return (
        <div className="flex gap-0.5 justify-center mt-1">
            {Array.from({ length: stars }).map((_, i) => (
                <div 
                    key={i} 
                    className={`w-3 h-1 rounded-sm ${i < filledStars ? 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]' : 'bg-gray-700'}`}
                />
            ))}
        </div>
    );
};

const PreyCard: React.FC<{ 
    slot: PreySlot, 
    index: number, 
    isFree: boolean, 
    playerLevel: number, 
    onReroll: (idx: number) => void,
    onActivate: (idx: number) => void,
    onCancel: (idx: number) => void
}> = ({ slot, index, isFree, playerLevel, onReroll, onActivate, onCancel }) => {
    const [timeLeft, setTimeLeft] = useState("");
    const monster = MONSTERS.find(m => m.id === slot.monsterId);
    const rerollCost = playerLevel * 100;
    const theme = getBonusTheme(slot.bonusType);
    
    // Logic for State
    const isActive = slot.active;
    const isExpired = !slot.active && slot.startTime > 0; // Was activated, but now off
    const isNew = !slot.active && slot.startTime === 0;
    const hasValue = slot.bonusValue > 0;

    // Timer Logic
    useEffect(() => {
        if (!isActive) return;
        
        const updateTimer = () => {
            const now = Date.now();
            const end = slot.startTime + slot.duration;
            const diff = end - now;
            
            if (diff <= 0) {
                setTimeLeft("Expired");
            } else {
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${h}h ${m}m ${s}s`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [isActive, slot.startTime, slot.duration]);

    // Determine max based on type
    const maxValue = (slot.bonusType === 'xp' || slot.bonusType === 'loot') ? 50 : 25;
    const progressPercent = (slot.bonusValue / maxValue) * 100;
    const rarity = getRarityInfo(slot.bonusValue, maxValue);

    const isLegendary = rarity.label === 'LEGENDARY';

    return (
        <div className={`
            relative flex flex-col items-center rounded-xl border-2 bg-[#1a1a1a] shadow-xl overflow-hidden group h-[400px] transition-all
            ${isExpired ? 'opacity-60 grayscale border-gray-700' : rarity.border} 
            ${isActive && isLegendary ? 'animate-pulse border-4' : ''}
        `}>
            
            {/* Background Gradient */}
            {!isExpired && <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-50 pointer-events-none`}></div>}
            
            {/* Legendary Shine Effect */}
            {isLegendary && isActive && <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-yellow-500/10 to-transparent pointer-events-none animate-spin-slow"></div>}

            {/* HEADER: TYPE */}
            <div className="w-full py-3 bg-black/40 border-b border-white/10 flex flex-col items-center justify-center relative z-10">
                <div className={`flex items-center gap-2 font-black uppercase text-sm tracking-wider ${isExpired ? 'text-gray-500' : theme.color} drop-shadow-md`}>
                    {theme.icon}
                    <span>{theme.label}</span>
                </div>
            </div>

            {/* MONSTER CIRCLE */}
            <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
                
                {/* Expired Overlay */}
                {isExpired && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
                        <span className="text-red-500 font-black text-2xl rotate-[-15deg] border-4 border-red-500 px-4 py-2 rounded-lg opacity-80">EXPIRED</span>
                    </div>
                )}

                <div className={`w-24 h-24 bg-black/60 rounded-full border-2 ${isExpired ? 'border-gray-600' : theme.border} flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] relative overflow-hidden group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-shadow`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_70%)]"></div>
                    {monster?.image ? (
                        <img src={monster.image} className="max-w-[70px] max-h-[70px] pixelated z-10 scale-[2]" alt={monster.name} />
                    ) : (
                        <Skull size={40} className="text-gray-600 opacity-50" />
                    )}
                </div>
                <div className="mt-3 text-base font-bold text-gray-100 drop-shadow-md bg-black/30 px-3 py-0.5 rounded-full border border-white/5">
                    {monster?.name || "No Creature"}
                </div>
            </div>

            {/* STATS AREA */}
            <div className="w-full bg-[#111] p-3 border-t border-white/10 relative z-10 flex flex-col items-center">
                
                {/* Rarity Label */}
                <div className={`text-[10px] font-black tracking-[0.2em] mb-1 ${isExpired ? 'text-gray-600' : rarity.color} ${!isExpired && rarity.shadow}`}>
                    {hasValue ? rarity.label : 'INACTIVE'} {isLegendary && !isExpired && hasValue && <Sparkles size={10} className="inline ml-1 animate-spin"/>}
                </div>

                {/* Percentage Display */}
                <div className={`text-4xl font-black ${isExpired ? 'text-gray-500' : theme.color} drop-shadow-lg leading-none`}>
                    +{slot.bonusValue}%
                </div>
                
                {/* Visual Bar */}
                <div className="w-full max-w-[140px] h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden border border-gray-700">
                    <div 
                        className={`h-full ${isExpired ? 'bg-gray-600' : (slot.bonusType === 'xp' ? 'bg-blue-500' : slot.bonusType === 'loot' ? 'bg-yellow-500' : slot.bonusType === 'damage' ? 'bg-red-500' : 'bg-green-500')} transition-all duration-500`}
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
                
                {/* Star Rating */}
                <StarRating value={slot.bonusValue} max={maxValue} />

                {/* --- CONTROLS --- */}
                
                {isActive ? (
                    // ACTIVE STATE: Timer + Cancel Button
                    <div className="mt-4 w-full bg-green-900/30 border border-green-700 rounded p-2 text-center">
                        <div className="text-[10px] text-green-400 uppercase font-bold flex items-center justify-center gap-1 mb-1">
                            <Timer size={12}/> Time Remaining
                        </div>
                        <div className="font-mono text-lg font-bold text-white leading-none mb-2">{timeLeft}</div>
                        
                        <button 
                            onClick={() => onCancel(index)}
                            className="w-full py-1 text-[10px] font-bold rounded border border-red-800 bg-red-900/30 hover:bg-red-900/50 text-red-300 flex items-center justify-center gap-1 transition-colors"
                        >
                            <XCircle size={10} /> CANCEL
                        </button>
                    </div>
                ) : (
                    // INACTIVE / EXPIRED STATE: Buttons
                    <div className="mt-4 w-full grid grid-cols-1 gap-2">
                        
                        {/* Activate Button (Only if NOT expired AND has positive value) */}
                        {!isExpired && hasValue && (
                            <button 
                                onClick={() => onActivate(index)}
                                className={`
                                    w-full py-2 text-xs font-bold rounded-sm border shadow-md flex items-center justify-center gap-2
                                    bg-green-700 hover:bg-green-600 border-green-500 text-white animate-pulse
                                `}
                            >
                                <PlayCircle size={14} /> ACTIVATE (2h)
                            </button>
                        )}

                        {/* Reroll Button (Always visible if inactive/expired) */}
                        <button 
                            onClick={() => onReroll(index)}
                            className={`
                                w-full py-2 text-xs font-bold rounded-sm border shadow-lg flex items-center justify-center gap-2 transition-all
                                ${isFree 
                                    ? 'bg-blue-900 hover:bg-blue-800 text-blue-200 border-blue-600' 
                                    : 'bg-[#333] hover:bg-[#444] text-gray-400 border-[#555] hover:text-white'
                                }
                            `}
                        >
                            <RefreshCw size={14} className={isFree ? "animate-spin-slow" : ""} />
                            {isFree ? "FREE REROLL" : `${rerollCost} GP`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const PreyPanel: React.FC<PreyPanelProps> = ({ player, onReroll, onRerollAll, onActivate, onCancel }) => {
  const { t } = useLanguage();
  const [timeUntilFree, setTimeUntilFree] = useState<string>("");

  useEffect(() => {
      const timer = setInterval(() => {
          const now = Date.now();
          if (player.prey.nextFreeReroll > now) {
              const diff = player.prey.nextFreeReroll - now;
              const h = Math.floor(diff / (1000 * 60 * 60));
              const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              setTimeUntilFree(`${h}h ${m}m`);
          } else {
              setTimeUntilFree("Full");
          }
      }, 1000);
      return () => clearInterval(timer);
  }, [player.prey.nextFreeReroll]);

  const rerollsLeft = player.prey.rerollsAvailable || 0;
  const isFree = rerollsLeft > 0;
  
  // Reroll All Logic
  const slotsToRoll = 5;
  const paidNeeded = Math.max(0, slotsToRoll - rerollsLeft);
  const rerollAllCost = paidNeeded * (player.level * 100);
  const totalFunds = player.gold + player.bankGold;
  const canAffordAll = totalFunds >= rerollAllCost;
  const isRerollAllFree = rerollsLeft >= slotsToRoll;

  return (
    <div className="h-full flex flex-col bg-[#121212]">
        {/* Header */}
        <div className="p-4 bg-[#1e1e1e] border-b border-[#333] flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-900 to-blue-950 border border-blue-700/50 rounded-lg text-blue-300 shadow-lg">
                    <Star size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold font-serif text-[#eee] leading-none tracking-wide">Prey System</h2>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Daily Hunting Bonuses</div>
                </div>
            </div>
            
            <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border shadow-inner ${isFree ? 'bg-green-950/30 border-green-800/50 text-green-400' : 'bg-black/40 border-[#333] text-gray-500'}`}>
                <Clock size={16} />
                <div className="flex flex-col items-end">
                    <span className="text-[9px] uppercase font-bold opacity-70">Free Rerolls</span>
                    <span className="text-sm font-mono font-bold leading-none">{rerollsLeft} / 5 <span className="text-[9px] ml-1 opacity-50">({timeUntilFree})</span></span>
                </div>
            </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-950/20 via-blue-900/10 to-blue-950/20 border-b border-blue-900/20 p-2 text-center">
            <p className="text-[10px] text-blue-300/80 uppercase tracking-widest font-bold">
                Activate a prey to gain bonuses for 2 hours (60% weight for current Tier)
            </p>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#000_100%)]">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto items-center">
                {player.prey.slots.map((slot, index) => (
                    <PreyCard 
                        key={index} 
                        index={index} 
                        slot={slot} 
                        isFree={isFree} 
                        playerLevel={player.level} 
                        onReroll={onReroll}
                        onActivate={onActivate}
                        onCancel={onCancel} 
                    />
                ))}
            </div>
        </div>

        {/* Footer Reroll All (Identical to Task Panel Style) */}
        <div className="p-4 border-t border-[#333] bg-[#1a1a1a] flex justify-center shadow-[0_-5px_20px_rgba(0,0,0,0.5)] relative z-20">
            <button 
                onClick={onRerollAll}
                disabled={!isRerollAllFree && !canAffordAll}
                className={`
                    flex items-center justify-center gap-3 px-8 py-3 rounded-lg border shadow-lg transition-all w-full max-w-md
                    ${isRerollAllFree 
                        ? 'bg-gradient-to-r from-green-800 to-green-700 hover:brightness-110 text-white border-green-600' 
                        : (canAffordAll 
                            ? 'bg-[#2a2a2a] hover:bg-[#333] border-[#444] hover:border-gray-500 text-gray-300' 
                            : 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed')
                    }
                `}
            >
                <RefreshCw size={18} className={isRerollAllFree ? 'animate-spin-slow' : ''} />
                <div className="flex flex-col items-start leading-none">
                    <span className="text-xs font-bold uppercase tracking-wider">Reroll All Slots</span>
                    {!isRerollAllFree && (
                        <span className="text-[10px] opacity-60 mt-1">Cost: {rerollAllCost.toLocaleString()} gp</span>
                    )}
                    {isRerollAllFree && (
                        <span className="text-[10px] opacity-90 mt-1 text-green-100">Free Rolls Available</span>
                    )}
                </div>
            </button>
        </div>
    </div>
  );
};
