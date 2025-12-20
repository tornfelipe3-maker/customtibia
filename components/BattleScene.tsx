
import React, { useState, useEffect } from 'react';
import { Player, Monster, HitSplat, Vocation } from '../types';
import { VOCATION_SPRITES } from '../constants';
import { getEffectiveMaxHp } from '../services';
import { Skull, Octagon, Sparkles, AlertTriangle, Crown, Flame, Search } from 'lucide-react';
import { Sprite } from './common/Sprite';

interface BattleSceneProps {
  player: Player;
  activeMonster: Monster | undefined;
  activeHuntCount: number;
  currentMonsterHp: number;
  hits: HitSplat[];
  onStopHunt: () => void;
  isHunting?: boolean;
}

export const BattleScene: React.FC<BattleSceneProps> = ({
  player,
  activeMonster,
  activeHuntCount,
  currentMonsterHp,
  hits,
  onStopHunt,
  isHunting
}) => {
  const [isSpawning, setIsSpawning] = useState(false);
  const isDead = activeMonster && currentMonsterHp <= 0;
  const uniqueKey = activeMonster?.guid || activeMonster?.id;

  useEffect(() => {
      if (uniqueKey) {
          setIsSpawning(true);
          const timer = setTimeout(() => setIsSpawning(false), 300);
          return () => clearTimeout(timer);
      }
  }, [uniqueKey]);

  const getHitColor = (type: HitSplat['type']) => {
      switch(type) {
          case 'damage': return 'text-[#b90000]';
          case 'heal': return 'text-[#00c000]'; 
          case 'mana': return 'text-[#00aaff]'; 
          case 'speech': return 'text-yellow-400 text-[10px] font-normal';
          default: return 'text-gray-400';
      }
  };

  const getInfluencedStyle = (m: Monster | undefined) => {
      if (!m || !m.isInfluenced) return {};
      switch(m.influencedType) {
          case 'corrupted': return { filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.8)) hue-rotate(240deg) saturate(1.8) contrast(1.2)' };
          case 'enraged': return { filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.8)) sepia(0.5) saturate(4) hue-rotate(-40deg) contrast(1.2)' };
          case 'blessed': return { filter: 'drop-shadow(0 0 15px rgba(234,179,8,0.8)) brightness(1.3) sepia(0.8) hue-rotate(40deg) saturate(1.5)' };
          default: return {};
      }
  };

  const renderHits = (target: 'player' | 'monster') => {
      return hits.filter(h => h.target === target).map(hit => {
         const randomX = (hit.id % 20) - 10;
         const randomY = (hit.id % 10) - 5;
         
         if (hit.type === 'miss') return <div key={hit.id} className="hit-miss" style={{ top: `calc(40% + ${randomY}px)`, left: `calc(50% + ${randomX}px)` }}></div>;
         
         if (hit.type === 'speech') return <div key={hit.id} className="absolute z-50 text-center whitespace-nowrap animate-[float-up_1.5s_linear_forwards] pointer-events-none font-bold text-yellow-400 text-xs drop-shadow-[1px_1px_0_#000]" style={{ top: `calc(-10% + ${randomY}px)`, left: `50%`, transform: 'translateX(-50%)' }}>{hit.value}</div>;
         
         let leftPos = '50%';
         let displayValue = String(hit.value);

         if (target === 'player') {
             if (hit.type === 'heal') {
                 leftPos = '0%'; 
                 displayValue = `+${hit.value} HP`;
             } else if (hit.type === 'mana') {
                 leftPos = '100%'; 
                 displayValue = `+${hit.value} MP`;
             }
         }

         return (
            <div 
                key={hit.id} 
                className={`damage-float ${getHitColor(hit.type)}`} 
                style={{ 
                    top: `calc(10% + ${randomY}px)`, 
                    left: `calc(${leftPos} + ${randomX}px)` 
                }}
            >
                {displayValue}
            </div>
         );
      });
  };

  const displayHuntCount = activeMonster && activeMonster.isInfluenced ? 1 : activeHuntCount;
  const playerEffMaxHp = getEffectiveMaxHp(player);

  return (
      <div className={`h-80 game-window-bg relative border-b-2 shadow-md shrink-0 flex items-center justify-center overflow-hidden group transition-all duration-300 ${!activeMonster ? 'border-black' : activeMonster.isInfluenced ? `border-${activeMonster.influencedType}` : 'border-black'}`}>
         
         {activeMonster ? (
            <div className="relative w-full max-w-[600px] h-full flex items-center justify-center space-x-48 z-10">
               <div className="flex flex-col items-center animate-[pulse_2s_infinite] relative">
                  <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center -mx-20 w-[calc(100%+160px)]">
                    {renderHits('player')}
                  </div>
                  
                  <div className="relative z-10 w-20 h-20 flex items-center justify-center drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
                     <Sprite src={VOCATION_SPRITES[player.vocation]} type="outfit" className="scale-[2]" size={40} />
                  </div>
                  <div className="mt-6 w-16 h-2 bg-black border border-black/50 shadow">
                     <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${(player.hp / playerEffMaxHp) * 100}%` }}></div>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-white drop-shadow-md bg-black/40 px-2 py-0.5 rounded">{player.name || 'Hero'}</span>
                  </div>
               </div>

               <div className="flex flex-col items-center relative">
                  <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">{renderHits('monster')}</div>
                  <div className="mb-2 text-center flex flex-col items-center min-h-[30px] justify-end">
                     <div className="flex items-center justify-center gap-1.5 bg-black/60 px-3 py-1 rounded border border-black/20">
                        <span className="text-xs font-bold text-[#0f0] drop-shadow-[1px_1px_0_#000]">{activeMonster.name}</span>
                        {displayHuntCount > 1 && <span className="text-red-500 text-[10px] font-bold ml-1">x{displayHuntCount}</span>}
                     </div>
                  </div>
                  
                  <div className="relative z-10 w-24 h-24 flex items-center justify-center drop-shadow-[6px_6px_0_rgba(0,0,0,0.5)]">
                    <div key={uniqueKey} className={`relative monster-sprite-container ${isDead && !isSpawning ? 'death-anim' : 'spawn-anim'}`}>
                        <Sprite 
                            src={activeMonster.image} 
                            type="monster" 
                            className="scale-[2.5]" 
                            size={48} 
                            style={getInfluencedStyle(activeMonster)} 
                        />
                        {isDead && !isSpawning && (
                            <div className="absolute inset-0 flex items-center justify-center z-50">
                                <Skull size={32} className="text-gray-400 drop-shadow-md animate-bounce" />
                            </div>
                        )}
                    </div>
                  </div>

                  <div className="mt-6 w-20 h-2 bg-black border border-black/50 shadow">
                     <div className="h-full transition-all duration-200" style={{ width: `${Math.max(0, ((currentMonsterHp || 0) / (activeMonster.maxHp * displayHuntCount)) * 100)}%`, backgroundColor: (currentMonsterHp || 0) < (activeMonster.maxHp * displayHuntCount) * 0.2 ? '#d00' : (currentMonsterHp || 0) < (activeMonster.maxHp * displayHuntCount) * 0.5 ? '#dd0' : '#0c0' }}></div>
                  </div>
               </div>

               <div className="absolute bottom-2 right-2 z-30">
                  <button onClick={onStopHunt} className="tibia-btn px-4 py-2 text-xs text-red-200 border-red-900 bg-red-900/80 shadow-lg font-bold flex items-center gap-2">
                     <Octagon size={16} /> STOP HUNT
                  </button>
               </div>
            </div>
         ) : isHunting ? (
            <div className="flex flex-col items-center justify-center p-8 bg-black/60 rounded-lg border border-[#444] backdrop-blur-sm z-10 animate-pulse">
                <Search size={32} className="text-yellow-500 mb-2" />
                <p className="text-gray-300 font-bold text-sm tracking-wide">Tracking prey...</p>
            </div>
         ) : (
            <div className="text-[#888] text-sm font-bold drop-shadow-md text-center opacity-80 z-10 bg-black/60 p-6 rounded-lg border border-[#444] backdrop-blur-sm relative">
               <p className="text-gray-300 mb-2 text-lg">Idle State</p>
               <p className="text-xs font-normal opacity-70">Select a creature from the list below</p>
            </div>
         )}
      </div>
  );
};
