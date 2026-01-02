
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

  let totalXpMultiplier = xpStage;
  if (hasStamina) totalXpMultiplier *= 1.5;
  totalXpMultiplier *= (1 + (ascXp / 100));
  if (eqXp > 0) totalXpMultiplier *= (1 + (eqXp / 100));
  if (isPremium) totalXpMultiplier *= 2.0;
  if (isXpBoost) totalXpMultiplier *= 3.0;
  totalXpMultiplier *= hazardBonus;

  // --- NOVA FÓRMULA DE CHANCE DE RARO (VISUAL) ---
  const baseRareChance = 0.5; // 0.5%
  const lureBonusMult = (player.activeHuntCount - 1) * 0.25; 
  const itemBonusMult = getPlayerModifier(player, 'blessedChance') / 100;
  const totalRareChance = baseRareChance * (1 + lureBonusMult + itemBonusMult);

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
  
  // Meta-Progress
  const soulBonus = getPlayerModifier(player, 'soulGain');

  const getSkillEqBonus = (skill: SkillType) => {
    let bonus = 0;
    Object.values(player.equipment).forEach(item => {
        if (item?.skillBonus?.[skill]) bonus += item.skillBonus[skill]!;
    });
    return bonus;
  };

  const StatRow = ({ label, value, icon, color = "text-gray-300", subValue = "", isHighlight = false }: any) => (
      <div className={`flex justify-between items-center py-2 border-b border-[#333] last:border-0 group hover:bg-white/5 px-1 rounded-sm transition-colors ${isHighlight ? 'bg-yellow-900/10 border-yellow-900/30' : ''}`}>
          <div className="flex items-center gap-2">
              <span className={`${color} opacity-70 group-hover:opacity-100 transition-opacity`}>{icon}</span>
              <span className={`text-xs font-bold ${isHighlight ? 'text-yellow-200' : 'text-gray-400'} group-hover:text-gray-200`}>{label}</span>
          </div>
          <div className="text-right">
              <div className={`text-sm font-mono font-black ${color}`}>{value}</div>
              {subValue && <div className="text-[10px] text-gray-600 font-bold leading-none">{subValue}</div>}
          </div>
      </div>
  );

  return (
    <div 
        className="fixed z-[90] w-72 bg-[#2d2d2d] bg-opacity-95 backdrop-blur-md border border-[#444] rounded shadow-[0_0_20px_rgba(0,0,0,0.6)] flex flex-col font-mono select-none overflow-hidden"
        style={{ top: position.y, left: position.x }}
    >
        <div 
            onMouseDown={handleMouseDown}
            className="bg-[#222] px-3 py-2.5 border-b border-[#333] flex justify-between items-center cursor-move active:cursor-grabbing shadow-sm"
        >
            <div className="flex items-center gap-2">
                <Activity size={16} className="text-cyan-400 animate-pulse"/>
                <span className="text-xs font-bold text-gray-200 uppercase tracking-widest">Character Stats</span>
            </div>
            <button onMouseDown={(e) => e.stopPropagation()} onClick={onClose} className="text-gray-500 hover:text-white p-0.5 transition-colors">
                <X size={18} />
            </button>
        </div>

        <div className="p-3 space-y-5 custom-scrollbar max-h-[75vh] overflow-y-auto bg-gradient-to-b from-[#2d2d2d] to-[#1a1a1a]">
            <div>
                <div className="text-[11px] font-bold text-cyan-500 uppercase tracking-widest mb-2 border-b border-cyan-900/30 pb-1 flex items-center gap-1.5">
                    <TrendingUp size={12}/> Progression
                </div>
                <StatRow label="Final XP Rate" value={`${totalXpMultiplier.toFixed(1)}x`} icon={<Star size={14}/>} color="text-yellow-400" subValue="All Bonuses Combined" isHighlight={true} />
                <StatRow label="Rare Mob Chance" value={`${totalRareChance.toFixed(3)}%`} icon={<Sparkles size={14}/>} color="text-cyan-300" subValue="Multiplicative (0.5% Base)" />
                <StatRow label="Soulpoint Affinity" value={`+${soulBonus}%`} icon={<Ghost size={14}/>} color="text-purple-400" subValue="From Soulwar/Sanguine Set" />
            </div>

            <div>
                <div className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-2 border-b border-red-900/30 pb-1 flex items-center gap-1.5">
                    <Swords size={12}/> Combat Power
                </div>
                <StatRow label="Bonus Damage" value={`+${ascDmg}%`} icon={<Swords size={14}/>} color="text-red-400" subValue="From Ascension"/>
                <StatRow label="Critical Chance" value={`${critChance}%`} icon={<Flame size={14}/>} color="text-orange-500" />
                <StatRow label="Multi-Hit Chance" value={`${multiHit}%`} icon={<Zap size={14}/>} color="text-yellow-400" />
                <StatRow label="Reflect Damage" value={`${reflect}%`} icon={<Activity size={14}/>} color="text-indigo-400" />
                <StatRow label="Evasion Chance" value={`${dodge}%`} icon={<Shield size={14}/>} color="text-white" />
                <StatRow label="Executioner" value={`${execute}%`} icon={<Skull size={14}/>} color="text-red-600" />
                <StatRow label="Boss Slayer" value={`+${bossSlayer}%`} icon={<Ghost size={14}/>} color="text-purple-400" />
            </div>

            <div>
                <div className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-2 border-b border-blue-900/30 pb-1 flex items-center gap-1.5">
                    <Zap size={12}/> Equipment Bonuses
                </div>
                <StatRow label="Magic Level" value={`+${getSkillEqBonus(SkillType.MAGIC)}`} icon={<Zap size={14}/>} color="text-purple-400" />
                <StatRow label="Melee" value={`+${getSkillEqBonus(SkillType.SWORD) || getSkillEqBonus(SkillType.AXE) || getSkillEqBonus(SkillType.CLUB)}`} icon={<Hammer size={14}/>} color="text-gray-300" />
                <StatRow label="Distance" value={`+${getSkillEqBonus(SkillType.DISTANCE)}`} icon={<Crosshair size={14}/>} color="text-orange-400" />
            </div>
            
        </div>
        
        <div className="bg-[#111] px-2 py-2 text-[9px] text-gray-600 text-center border-t border-[#333] rounded-b italic">
            * Values include Equipment and Ascension Perks.
        </div>
    </div>
  );
};
