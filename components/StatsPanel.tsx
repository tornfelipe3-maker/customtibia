
import React, { useState, useEffect, useRef } from 'react';
import { Activity, X, TrendingUp, Zap, Swords, Coins, Shield, Sparkles, Ghost, Flame, Skull, Hammer, Crosshair, Star } from 'lucide-react';
import { Player, SkillType } from '../types';
import { getXpStageMultiplier, getPlayerModifier, getAscensionBonusValue } from '../services';

interface StatsPanelProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ player, isOpen, onClose }) => {
  const [position, setPosition] = useState({ x: 20, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (isDragging && dragStartRef.current) {
              setPosition({
                  x: e.clientX - dragStartRef.current.x,
                  y: e.clientY - dragStartRef.current.y
              });
          }
      };
      
      const handleMouseUp = () => {
          setIsDragging(false);
          dragStartRef.current = null;
      };

      if (isDragging) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
      }

      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isDragging]);

  if (!isOpen) return null;

  const now = Date.now();
  const xpStage = getXpStageMultiplier(player.level);
  
  // XP Bonuses
  const ascXp = getAscensionBonusValue(player, 'xp_boost');
  const eqXp = getPlayerModifier(player, 'xpBoost');
  const isPremium = player.premiumUntil > now;
  const isXpBoost = player.xpBoostUntil > now;
  const hasStamina = player.stamina > 0;
  const hazardBonus = 1 + ((player.activeHazardLevel || 0) * 0.10);

  // Cálculo do Multiplicador Final de XP (Lógica idêntica ao GameLoop)
  let totalXpMultiplier = xpStage;
  if (hasStamina) totalXpMultiplier *= 1.5;
  totalXpMultiplier *= (1 + (ascXp / 100));
  if (eqXp > 0) totalXpMultiplier *= (1 + (eqXp / 100));
  if (isPremium) totalXpMultiplier *= 2.0;
  if (isXpBoost) totalXpMultiplier *= 3.0;
  totalXpMultiplier *= hazardBonus;

  // Loot Bonuses
  const ascLoot = getAscensionBonusValue(player, 'loot_boost');
  const eqLoot = getPlayerModifier(player, 'lootBoost');

  // Damage/Combat
  const ascDmg = getAscensionBonusValue(player, 'damage_boost');
  const critChance = getPlayerModifier(player, 'critChance');
  const multiHit = getPlayerModifier(player, 'attackSpeed');
  const reflect = getPlayerModifier(player, 'reflection');
  const dodge = getPlayerModifier(player, 'dodgeChance');
  const bossSlayer = getPlayerModifier(player, 'bossSlayer');
  const goldFind = getPlayerModifier(player, 'goldFind');
  const execute = getPlayerModifier(player, 'executioner');

  // Helper to get total equipment skill bonus
  const getSkillEqBonus = (skill: SkillType) => {
    let bonus = 0;
    Object.values(player.equipment).forEach(item => {
        if (item?.skillBonus?.[skill]) bonus += item.skillBonus[skill]!;
    });
    return bonus;
  };

  const StatRow = ({ label, value, icon, color = "text-gray-300", subValue = "", isHighlight = false }: any) => (
      <div className={`flex justify-between items-center py-1 border-b border-[#333] last:border-0 group hover:bg-white/5 px-1 rounded-sm transition-colors ${isHighlight ? 'bg-yellow-900/10 border-yellow-900/30' : ''}`}>
          <div className="flex items-center gap-2">
              <span className={`${color} opacity-70 group-hover:opacity-100 transition-opacity`}>{icon}</span>
              <span className={`text-[10px] font-bold ${isHighlight ? 'text-yellow-200' : 'text-gray-400'} group-hover:text-gray-200`}>{label}</span>
          </div>
          <div className="text-right">
              <div className={`text-xs font-mono font-bold ${color}`}>{value}</div>
              {subValue && <div className="text-[8px] text-gray-600 font-bold leading-none">{subValue}</div>}
          </div>
      </div>
  );

  return (
    <div 
        className="fixed z-[90] w-64 bg-[#2d2d2d] bg-opacity-95 backdrop-blur-md border border-[#444] rounded shadow-[0_0_20px_rgba(0,0,0,0.6)] flex flex-col font-mono select-none overflow-hidden"
        style={{ top: position.y, left: position.x }}
    >
        {/* Header */}
        <div 
            onMouseDown={handleMouseDown}
            className="bg-[#222] px-3 py-2 border-b border-[#333] flex justify-between items-center cursor-move active:cursor-grabbing shadow-sm"
        >
            <div className="flex items-center gap-1.5">
                <Activity size={14} className="text-cyan-400 animate-pulse"/>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Character Stats</span>
            </div>
            <button 
                onMouseDown={(e) => e.stopPropagation()} 
                onClick={onClose} 
                className="text-gray-500 hover:text-white p-0.5 transition-colors"
            >
                <X size={14} />
            </button>
        </div>

        {/* Content */}
        <div className="p-3 space-y-4 custom-scrollbar max-h-[70vh] overflow-y-auto bg-gradient-to-b from-[#2d2d2d] to-[#1a1a1a]">
            
            {/* PROGRESSION SECTION */}
            <div>
                <div className="text-[9px] font-bold text-cyan-500 uppercase tracking-widest mb-2 border-b border-cyan-900/30 pb-0.5 flex items-center gap-1">
                    <TrendingUp size={10}/> Progression
                </div>
                
                {/* LINHA SOLICITADA: MULTIPLICADOR FINAL */}
                <StatRow 
                    label="Final XP Rate" 
                    value={`${totalXpMultiplier.toFixed(1)}x`} 
                    icon={<Star size={12}/>} 
                    color="text-yellow-400" 
                    subValue="All Bonuses Combined"
                    isHighlight={true}
                />

                <StatRow label="Base Stage" value={`${xpStage}x`} icon={<TrendingUp size={12}/>} color="text-green-400" subValue={`Current Lvl: ${player.level}`}/>
                <StatRow label="Stat XP Bonus" value={`+${ascXp + eqXp}%`} icon={<Zap size={12}/>} color="text-blue-400" subValue={`Eq: ${eqXp}% | Asc: ${ascXp}%`}/>
                
                <div className="flex flex-wrap gap-1 mt-2">
                    {isPremium && <span className="text-[8px] bg-yellow-900/30 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-700/50 font-bold">PREMIUM (2x)</span>}
                    {isXpBoost && <span className="text-[8px] bg-green-900/30 text-green-500 px-1.5 py-0.5 rounded border border-green-700/50 font-bold">XP BOOST (3x)</span>}
                    {hasStamina && <span className="text-[8px] bg-blue-900/30 text-blue-500 px-1.5 py-0.5 rounded border border-blue-700/50 font-bold">STAMINA (1.5x)</span>}
                    {player.activeHazardLevel > 0 && <span className="text-[8px] bg-orange-900/30 text-orange-400 px-1.5 py-0.5 rounded border border-orange-700/50 font-bold">HAZARD (+{player.activeHazardLevel * 10}%)</span>}
                </div>
            </div>

            {/* COMBAT SECTION */}
            <div>
                <div className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-2 border-b border-red-900/30 pb-0.5 flex items-center gap-1">
                    <Swords size={10}/> Combat Power
                </div>
                <StatRow label="Bonus Damage" value={`+${ascDmg}%`} icon={<Swords size={12}/>} color="text-red-400" subValue="From Ascension"/>
                <StatRow label="Critical Chance" value={`${critChance}%`} icon={<Flame size={12}/>} color="text-orange-500" />
                <StatRow label="Multi-Hit Chance" value={`${multiHit}%`} icon={<Zap size={12}/>} color="text-yellow-400" />
                <StatRow label="Reflect Damage" value={`${reflect}%`} icon={<Activity size={12}/>} color="text-indigo-400" />
                <StatRow label="Evasion Chance" value={`${dodge}%`} icon={<Shield size={12}/>} color="text-white" />
                <StatRow label="Executioner" value={`${execute}%`} icon={<Skull size={12}/>} color="text-red-600" />
                <StatRow label="Boss Slayer" value={`+${bossSlayer}%`} icon={<Ghost size={12}/>} color="text-purple-400" />
            </div>

            {/* SKILLS BONUS SECTION */}
            <div>
                <div className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-2 border-b border-blue-900/30 pb-0.5 flex items-center gap-1">
                    <Zap size={10}/> Equipment Bonuses
                </div>
                <StatRow label="Magic Level" value={`+${getSkillEqBonus(SkillType.MAGIC)}`} icon={<Zap size={12}/>} color="text-purple-400" />
                <StatRow label="Melee (Sword/Axe/Club)" value={`+${getSkillEqBonus(SkillType.SWORD) || getSkillEqBonus(SkillType.AXE) || getSkillEqBonus(SkillType.CLUB)}`} icon={<Hammer size={12}/>} color="text-gray-300" />
                <StatRow label="Distance" value={`+${getSkillEqBonus(SkillType.DISTANCE)}`} icon={<Crosshair size={12}/>} color="text-orange-400" />
                <StatRow label="Shielding" value={`+${getSkillEqBonus(SkillType.DEFENSE)}`} icon={<Shield size={12}/>} color="text-blue-300" />
            </div>

            {/* UTILITY SECTION */}
            <div>
                <div className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest mb-2 border-b border-yellow-900/30 pb-0.5 flex items-center gap-1">
                    <Coins size={10}/> Loot & Misc
                </div>
                <StatRow label="Loot Chance" value={`+${ascLoot + eqLoot}%`} icon={<Sparkles size={12}/>} color="text-purple-400" subValue={`Eq: ${eqLoot}% | Asc: ${ascLoot}%`}/>
                <StatRow label="Gold Find" value={`+${goldFind}%`} icon={<Coins size={12}/>} color="text-yellow-500" />
            </div>
            
        </div>
        
        <div className="bg-[#111] px-2 py-1 text-[8px] text-gray-600 text-center border-t border-[#333] rounded-b italic">
            * Values include Equipment and Ascension Perks.
        </div>
    </div>
  );
};
