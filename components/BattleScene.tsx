
import React, { useState, useEffect } from 'react';
import { Player, Monster, HitSplat, Vocation } from '../types';
import { VOCATION_SPRITES } from '../constants';
import { Skull, Octagon, Sparkles, AlertTriangle, Crown, Flame, Search } from 'lucide-react';

interface BattleSceneProps {
  player: Player;
  activeMonster: Monster | undefined;
  activeHuntCount: number;
  currentMonsterHp: number;
  hits: HitSplat[];
  onStopHunt: () => void;
  isHunting?: boolean; // New prop
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
  const [playerSprite, setPlayerSprite] = useState<string>(VOCATION_SPRITES[player.vocation]);
  const [isSpawning, setIsSpawning] = useState(false);
  
  // Calculate death state based on HP
  const isDead = activeMonster && currentMonsterHp <= 0;

  // VISUAL FIX FOR 1-HIT KILLS:
  // Use GUID (if available) or fallback to ID. GUID changes every spawn.
  const uniqueKey = activeMonster?.guid || activeMonster?.id;

  // When a new monster loads (uniqueKey changes), we force 'isSpawning' to true for a fraction of a second.
  // This ensures the slide-in animation plays even if the monster dies in the same tick.
  useEffect(() => {
      if (uniqueKey) {
          setIsSpawning(true);
          const timer = setTimeout(() => {
              setIsSpawning(false);
          }, 300); // Matches the new CSS animation speed (0.3s)
          return () => clearTimeout(timer);
      }
  }, [uniqueKey]);

  useEffect(() => {
    setPlayerSprite(VOCATION_SPRITES[player.vocation]);
  }, [player.vocation]);

  const handleSpriteError = () => {
    setPlayerSprite(VOCATION_SPRITES[Vocation.NONE]);
  };

  const getHitColor = (type: HitSplat['type']) => {
      switch(type) {
          case 'damage': return 'text-[#b90000]';
          case 'heal': return 'text-[#00c000]'; 
          case 'speech': return 'text-yellow-400 text-[10px] font-normal';
          default: return 'text-gray-400';
      }
  };

  // Stronger Visual Filters for Sprites
  const getInfluencedStyle = (m: Monster | undefined) => {
      if (!m || !m.isInfluenced) return {};
      
      switch(m.influencedType) {
          case 'corrupted': // Purple/Void
              return { 
                  filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.8)) hue-rotate(240deg) saturate(1.8) contrast(1.2)' 
              };
          case 'enraged': // Red/Angry
              return { 
                  filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.8)) sepia(0.5) saturate(4) hue-rotate(-40deg) contrast(1.2)' 
              };
          case 'blessed': // Golden/Holy
              return { 
                  filter: 'drop-shadow(0 0 15px rgba(234,179,8,0.8)) brightness(1.3) sepia(0.8) hue-rotate(40deg) saturate(1.5)' 
              };
          default: return {};
      }
  };

  // Border Class for the main container
  const getBorderClass = () => {
      if (!activeMonster || !activeMonster.isInfluenced) return 'border-[#000]';
      switch(activeMonster.influencedType) {
          case 'enraged': return 'border-enraged';
          case 'blessed': return 'border-blessed';
          case 'corrupted': return 'border-corrupted';
          default: return 'border-[#000]';
      }
  };

  // Atmosphere Overlay Element with key to force remount animation
  const getAtmosphere = () => {
      if (!activeMonster || !activeMonster.isInfluenced) return null;
      // Key ensures animation restarts when type changes
      const key = `${activeMonster.id}-${activeMonster.influencedType}`;
      
      switch(activeMonster.influencedType) {
          case 'enraged': return <div key={key} className="atmosphere atmosphere-enraged" />;
          case 'blessed': return <div key={key} className="atmosphere atmosphere-blessed" />;
          case 'corrupted': return <div key={key} className="atmosphere atmosphere-corrupted" />;
          default: return null;
      }
  };

  const getInfluenceLabel = (m: Monster | undefined) => {
      if (!m || !m.isInfluenced) return null;
      switch(m.influencedType) {
          case 'corrupted': return (
              <div className="bg-purple-900/80 border border-purple-500 px-2 py-0.5 rounded text-[10px] text-purple-200 font-extrabold uppercase animate-pulse flex items-center gap-1 shadow-lg mb-1">
                  <Sparkles size={10}/> CORRUPTED
              </div>
          );
          case 'enraged': return (
              <div className="bg-red-900/80 border border-red-500 px-2 py-0.5 rounded text-[10px] text-red-200 font-extrabold uppercase animate-pulse flex items-center gap-1 shadow-lg mb-1">
                  <AlertTriangle size={10}/> ENRAGED
              </div>
          );
          case 'blessed': return (
              <div className="bg-yellow-900/80 border border-yellow-500 px-2 py-0.5 rounded text-[10px] text-yellow-200 font-extrabold uppercase animate-pulse flex items-center gap-1 shadow-lg mb-1">
                  <Crown size={10}/> BLESSED
              </div>
          );
          default: return null;
      }
  };

  const getSkullIcon = (m: Monster | undefined) => {
      if (!m || !m.isInfluenced) return null;
      
      let url = '';
      let title = '';
      
      switch(m.influencedType) {
          case 'blessed': 
              url = 'https://tibia.fandom.com/wiki/Special:FilePath/White_Skull.gif'; 
              title = 'White Skull (Blessed)';
              break;
          case 'enraged': 
              url = 'https://tibia.fandom.com/wiki/Special:FilePath/Red_Skull.gif'; 
              title = 'Red Skull (Enraged)';
              break;
          case 'corrupted': 
              url = 'https://tibia.fandom.com/wiki/Special:FilePath/Black_Skull.gif'; 
              title = 'Black Skull (Corrupted)';
              break;
      }
      
      if (!url) return null;
      
      return (
          <img 
            src={url} 
            className="w-4 h-4 object-contain shrink-0 drop-shadow-md" 
            alt="skull" 
            title={title}
          />
      );
  };

  const renderHits = (target: 'player' | 'monster') => {
      return hits.filter(h => h.target === target).map(hit => {
         const randomX = (hit.id % 20) - 10;
         const randomY = (hit.id % 10) - 5;
         
         if (hit.type === 'miss') {
             return (
                 <div 
                    key={hit.id} 
                    className="hit-miss"
                    style={{ top: `calc(40% + ${randomY}px)`, left: `calc(50% + ${randomX}px)` }}
                 ></div>
             );
         }
         
         if (hit.type === 'speech') {
             return (
                 <div 
                    key={hit.id}
                    className="absolute z-50 text-center whitespace-nowrap animate-[float-up_1.5s_linear_forwards] pointer-events-none font-bold text-yellow-400 text-xs drop-shadow-[1px_1px_0_#000]"
                    style={{ top: `calc(-10% + ${randomY}px)`, left: `50%`, transform: 'translateX(-50%)' }}
                 >
                    {hit.value}
                 </div>
             );
         }

         return (
             <div 
                key={hit.id}
                className={`damage-float ${getHitColor(hit.type)}`}
                style={{ top: `calc(20% + ${randomY}px)`, left: `calc(50% + ${randomX}px)` }}
             >
                {hit.value}
             </div>
         );
      });
  };

  // Determine effective count for visualization
  // If monster is influenced, we force count to 1 for display logic
  const displayHuntCount = activeMonster && activeMonster.isInfluenced ? 1 : activeHuntCount;

  return (
      <div className={`h-80 game-window-bg relative border-b-2 shadow-md shrink-0 flex items-center justify-center overflow-hidden group transition-all duration-300 ${getBorderClass()}`}>
         
         {/* ATMOSPHERE LAYER */}
         {getAtmosphere()}

         {/* Active Combat Scene */}
         {activeMonster ? (
            <div className="relative w-full max-w-[500px] h-full flex items-center justify-center space-x-32 z-10">
               
               {/* Player Character Container */}
               <div className="flex flex-col items-center animate-[pulse_2s_infinite] relative">
                  <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
                       {renderHits('player')}
                  </div>

                  <div className="relative z-10 w-20 h-20 flex items-center justify-center drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
                     <img 
                        src={playerSprite} 
                        className="max-w-full max-h-full scale-[2] pixelated" 
                        alt="Player" 
                        onError={handleSpriteError}
                     />
                  </div>
                  <div className="mt-6 w-16 h-2 bg-black border border-black/50 shadow">
                     <div 
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                     ></div>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-white drop-shadow-md bg-black/40 px-2 py-0.5 rounded">{player.name || 'Hero'}</span>
                      {player.activeHazardLevel > 0 && (
                          <div className="flex items-center gap-0.5 bg-red-900/80 px-1 py-0.5 rounded border border-red-600 shadow-md" title="Active Hazard Level">
                              <Flame size={8} className="text-red-300"/>
                              <span className="text-[9px] font-bold text-red-100 leading-none">{player.activeHazardLevel}</span>
                          </div>
                      )}
                  </div>
               </div>

               {/* VS / Attack FX */}
               <div className="z-0 animate-[ping_1.5s_infinite] opacity-30 absolute">
                  <div className="w-2 h-2 bg-white rounded-full blur-sm"></div>
               </div>

               {/* Monster Character Container */}
               <div className="flex flex-col items-center relative">
                  <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
                       {renderHits('monster')}
                  </div>

                  <div className="mb-2 text-center flex flex-col items-center min-h-[30px] justify-end">
                     {getInfluenceLabel(activeMonster)}
                     
                     <div className="flex items-center justify-center gap-1.5 bg-black/60 px-3 py-1 rounded border border-black/20">
                        {getSkullIcon(activeMonster)}
                        <span className="text-xs font-bold text-[#0f0] drop-shadow-[1px_1px_0_#000]">
                            {activeMonster.name}
                        </span>
                        {displayHuntCount > 1 && <span className="text-red-500 text-[10px] font-bold ml-1">x{displayHuntCount}</span>}
                     </div>
                  </div>
                  
                  <div className="relative z-10 w-24 h-24 flex items-center justify-center drop-shadow-[6px_6px_0_rgba(0,0,0,0.5)]">
                     {activeMonster.image ? (
                        <div 
                            key={uniqueKey} // VITAL: Forces re-mount on monster change (GUID), restarting animations
                            className={`relative monster-sprite-container ${isDead && !isSpawning ? 'death-anim' : 'spawn-anim'}`}
                        >
                            {/* Main Sprite with Dynamic Filter */}
                            <img 
                                src={activeMonster.image} 
                                className="max-w-full max-h-full object-contain scale-[2.5] pixelated" 
                                style={getInfluencedStyle(activeMonster)}
                                alt="monster" 
                            />
                            
                            {/* Clones for 'Lure' mode - Only show if displayHuntCount > 1 (so NOT rare) */}
                            {(!isDead || isSpawning) && displayHuntCount > 1 && (
                                <div className="absolute -right-6 -bottom-2 z-[-1]">
                                    <img src={activeMonster.image} className="w-24 h-24 opacity-60 scale-150 pixelated" style={getInfluencedStyle(activeMonster)} alt="mob" />
                                </div>
                            )}
                            
                            {/* Instant Death Overlay (Skull) - Only show if truly dead and finished spawning */}
                            {isDead && !isSpawning && (
                                <div className="absolute inset-0 flex items-center justify-center z-50">
                                    <Skull size={32} className="text-gray-400 drop-shadow-md animate-bounce" />
                                </div>
                            )}
                        </div>
                     ) : <Skull size={48} className="text-red-500" />}
                  </div>

                  <div className="mt-6 w-20 h-2 bg-black border border-black/50 shadow">
                     <div 
                        className="h-full transition-all duration-200"
                        style={{ 
                           width: `${Math.max(0, ((currentMonsterHp || 0) / (activeMonster.maxHp * displayHuntCount)) * 100)}%`,
                           backgroundColor: (currentMonsterHp || 0) < (activeMonster.maxHp * displayHuntCount) * 0.2 ? '#d00' : 
                                            (currentMonsterHp || 0) < (activeMonster.maxHp * displayHuntCount) * 0.5 ? '#dd0' : '#0c0'
                        }}
                     ></div>
                  </div>
               </div>

               {/* FIXED Stop Button */}
               <div className="absolute bottom-2 right-2 z-30">
                  <button onClick={onStopHunt} className="tibia-btn px-4 py-2 text-xs text-red-200 border-red-900 bg-red-900/80 shadow-lg font-bold hover:scale-105 transition-transform flex items-center gap-2">
                     <Octagon size={16} /> STOP HUNT
                  </button>
               </div>
            </div>
         ) : isHunting ? (
            // SEARCHING STATE (To prevent glitchy 0HP static monster)
            <div className="flex flex-col items-center justify-center p-8 bg-black/60 rounded-lg border border-[#444] backdrop-blur-sm z-10 animate-pulse">
                <Search size={32} className="text-yellow-500 mb-2" />
                <p className="text-gray-300 font-bold text-sm tracking-wide">Tracking prey...</p>
                <div className="absolute bottom-2 right-2">
                    <button onClick={onStopHunt} className="text-[10px] text-red-400 hover:text-red-300 font-bold underline">
                        Cancel
                    </button>
                </div>
            </div>
         ) : (
            // IDLE STATE
            <div className="text-[#888] text-sm font-bold drop-shadow-md text-center opacity-80 z-10 bg-black/60 p-6 rounded-lg border border-[#444] backdrop-blur-sm relative z-10">
               <p className="text-gray-300 mb-2 text-lg">Idle State</p>
               <p className="text-xs font-normal opacity-70">Select a creature from the list below</p>
            </div>
         )}
         
         {/* HUD Info Overlay */}
         {activeMonster && (
             <div className="absolute top-3 left-3 z-20 text-[10px] text-white drop-shadow-[1px_1px_0_#000] font-mono opacity-80 pointer-events-none bg-black/30 p-1.5 rounded border border-black/20">
                <div>HP: {currentMonsterHp?.toLocaleString()} / {(activeMonster.maxHp * displayHuntCount).toLocaleString()}</div>
                <div>XP: {(activeMonster.exp * displayHuntCount).toLocaleString()}</div>
             </div>
         )}
      </div>
  );
};
