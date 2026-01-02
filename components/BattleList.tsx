
import React, { useState } from 'react';
import { Player, Monster } from '../types';
import { MONSTERS, BOSSES } from '../constants';
import { Search, X, Info, Swords, Footprints, Clock, CheckCircle2, Lock, Map as MapIcon, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Sprite } from './common/Sprite';

interface BattleListProps {
  player: Player;
  activeHunt: string | null;
  bossCooldowns: { [bossId: string]: number };
  onStartHunt: (id: string, name: string, isBoss: boolean) => void;
  onInspectMonster: (monster: Monster, e: React.MouseEvent) => void;
  onAreaHunt: (monster: Monster, e: React.MouseEvent) => void;
}

const CITIES = [
  { id: 1, name: 'Rookgaard', map: 'https://static.wikia.nocookie.net/tibia/images/a/aa/Rookgaard_map.jpg/revision/latest?cb=20110723031352&path-prefix=en&format=original' },
  { id: 2, name: 'Thais', map: 'https://static.wikia.nocookie.net/tibia/images/f/f4/Map_thais.jpg/revision/latest?cb=20111204213324&path-prefix=en&format=original' },
  { id: 3, name: 'Venore', map: 'https://www.tibiawiki.com.br/images/b/b4/Map_venore.jpg' },
  { id: 4, name: 'Ankrahmun', map: 'https://static.wikia.nocookie.net/tibia/images/c/c2/Map_of_Ankrahmun.jpg/revision/latest?cb=20111204213903&path-prefix=en' },
  { id: 5, name: 'Darashia', map: 'https://static.wikia.nocookie.net/tibia/images/7/75/Map_darashia.jpg/revision/latest?cb=20111204213730&path-prefix=en&format=original' },
  { id: 6, name: 'Edron', map: 'https://static.wikia.nocookie.net/tibia/images/b/be/Map_edron.jpg/revision/latest?cb=20111204213705&path-prefix=en' },
  { id: 7, name: 'Roshamuul', map: 'https://static.wikia.nocookie.net/tibia/images/c/c4/Roshamuul_Map.jpg/revision/latest?cb=20131211112130&path-prefix=en&format=original' },
  { id: 8, name: 'Issavi', map: 'https://static.wikia.nocookie.net/tibia/images/8/88/Issavi_Map.jpg/revision/latest?cb=20220603195812&path-prefix=en&format=original' },
];

export const BattleList: React.FC<BattleListProps> = ({
  player,
  activeHunt,
  bossCooldowns,
  onStartHunt,
  onInspectMonster,
  onAreaHunt
}) => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'monsters' | 'bosses'>('monsters');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  // Helper para determinar o Tier baseado no level
  const getMonsterTier = (level: number): number => {
    if (level <= 8) return 1;
    if (level <= 19) return 2;
    if (level <= 39) return 3;
    if (level <= 99) return 4;
    if (level <= 199) return 5;
    if (level <= 299) return 6;
    if (level <= 399) return 7;
    return 8;
  };

  const filteredMonsters = MONSTERS.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = selectedTier === null || getMonsterTier(m.level) === selectedTier;
    return matchesSearch && matchesTier;
  }).sort((a, b) => a.exp - b.exp);
  
  const filteredBosses = BOSSES.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#222]">
      {/* Battle List Controls */}
      <div className="flex bg-[#2d2d2d] border-b border-[#111] shrink-0">
         <button 
           onClick={() => setTab('monsters')}
           className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider border-r border-[#444] transition-colors ${tab === 'monsters' ? 'text-[#eee] bg-[#444]' : 'text-[#888] hover:bg-[#333]'}`}
         >
           {t('hunt_tab_battle')}
         </button>
         <button 
           onClick={() => setTab('bosses')}
           className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${tab === 'bosses' ? 'text-purple-300 bg-[#444]' : 'text-[#888] hover:bg-[#333]'}`}
         >
           {t('hunt_tab_bosses')}
         </button>
      </div>

      {/* SEARCH BAR (Only visible when list is open or bosses) */}
      {(tab === 'bosses' || (tab === 'monsters' && selectedTier !== null)) && (
        <div className="bg-[#2d2d2d] border-b border-[#111] p-2 flex flex-col gap-2 shadow-inner shrink-0 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
                {tab === 'monsters' && (
                  <button 
                    onClick={() => setSelectedTier(null)}
                    className="p-1.5 tibia-btn bg-[#333] border-[#555] text-gray-300 hover:text-white"
                    title="Back to Cities"
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}
                <div className="relative flex-1">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"><Search size={14}/></div>
                    <input 
                      type="text"
                      placeholder={t('hunt_search')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#111] border border-[#444] rounded pl-9 pr-8 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#666] shadow-inner"
                    />
                    {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                            <X size={14}/>
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* List Area */}
      <div className="flex-1 overflow-y-auto tibia-inset custom-scrollbar bg-[#222]">
        <div className="p-1">
          {tab === 'monsters' && (
            selectedTier === null ? (
              /* CITY SELECTION GRID */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 animate-in fade-in zoom-in duration-300">
                {CITIES.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => setSelectedTier(city.id)}
                    className="flex flex-col tibia-panel overflow-hidden group hover:border-yellow-600 transition-all hover:-translate-y-1 shadow-lg bg-[#252525]"
                  >
                    <div className="h-28 w-full relative overflow-hidden bg-black">
                       <img 
                         src={city.map} 
                         className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" 
                         alt={city.name}
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#252525] via-transparent to-transparent"></div>
                       <div className="absolute top-2 right-2 bg-black/60 border border-yellow-900/50 px-2 py-0.5 rounded text-[10px] font-black text-yellow-500">
                         TIER {city.id}
                       </div>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <MapIcon size={14} className="text-yellow-600" />
                          <span className="font-bold text-[#eee] tracking-wide uppercase text-xs">{city.name}</span>
                       </div>
                       <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center border border-white/5 text-[10px] text-gray-500 group-hover:text-yellow-500 transition-colors">
                          ›
                       </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* MONSTER LIST FOR SELECTED TIER */
              <div className="grid grid-cols-1 gap-1 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-[#1a1a1a] px-3 py-1.5 flex items-center justify-between border-b border-[#333] mb-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <MapIcon size={12}/> {CITIES.find(c => c.id === selectedTier)?.name} Region
                    </span>
                    <span className="text-[9px] text-yellow-600 font-bold bg-yellow-900/10 px-2 rounded border border-yellow-900/30">Tier {selectedTier}</span>
                </div>
                
                {filteredMonsters.map((monster) => {
                  const isActive = activeHunt === monster.id;
                  return (
                    <div
                      key={monster.id}
                      onClick={() => onStartHunt(monster.id, monster.name, false)}
                      className={`
                        flex items-center p-2 cursor-pointer transition-colors border-b border-black/30 group/row rounded-sm
                        ${isActive ? 'bg-[#333] border-l-4 border-l-green-500' : 'hover:bg-[#2a2a2a] bg-[#252525]'}
                      `}
                    >
                      <div className="w-12 h-12 bg-[#181818] border border-[#444] flex items-center justify-center shrink-0 mr-4 shadow-inner rounded-sm relative overflow-hidden">
                         <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_70%)]"></div>
                         <Sprite 
                           src={monster.image} 
                           type="monster" 
                           size={40} 
                           className="max-w-[40px] max-h-[40px] z-10" 
                         />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                              <span className={`text-sm font-bold ${isActive ? 'text-green-400' : 'text-[#ddd]'}`}>{monster.name}</span>
                              {monster.level > player.level + 20 && <span className="text-[9px] text-red-500 font-bold bg-red-900/20 px-1.5 py-0.5 rounded border border-red-900/30">{t('hunt_danger')}</span>}
                          </div>
                      </div>

                      <button 
                        onClick={(e) => onInspectMonster(monster, e)}
                        className="ml-2 h-[30px] px-3 flex items-center gap-1.5 tibia-btn bg-[#0d1b2a] border border-blue-900/40 hover:border-blue-500 hover:bg-[#162a40] group/info shadow-lg transition-all active:translate-y-[1px]"
                      >
                          <Info size={14} className="text-blue-500/80 group-hover/info:text-blue-300" />
                          <span className="text-[10px] font-bold text-blue-500/80 group-hover/info:text-blue-300 tracking-wide">{t('hunt_info')}</span>
                      </button>

                      <button
                          onClick={(e) => {
                              e.stopPropagation();
                              onStartHunt(monster.id, monster.name, false);
                          }}
                          className="ml-1 h-[30px] px-3 flex items-center gap-1.5 tibia-btn bg-[#2a0d0d] border border-red-900/60 hover:border-red-500 hover:bg-[#401010] group/hunt shadow-lg transition-all active:translate-y-[1px]"
                      >
                          <Swords size={14} className="text-red-500/80 group-hover/hunt:text-red-300" />
                          <span className="text-[10px] font-bold text-red-500/80 group-hover/hunt:text-red-300 tracking-wide hidden sm:inline">{t('hunt_start')}</span>
                      </button>

                      <button 
                          onClick={(e) => onAreaHunt(monster, e)}
                          className="ml-1 px-3 py-1.5 tibia-btn bg-[#2a1111] border-[#500] hover:bg-[#3a1a1a] flex items-center gap-1.5 shadow-[0_0_5px_rgba(200,0,0,0.1)] group/btn opacity-80 hover:opacity-100"
                      >
                          <Footprints size={14} className="text-red-500 group-hover/btn:text-red-300" />
                          <span className="text-[10px] font-bold text-red-500 group-hover/btn:text-red-300 hidden sm:inline">{t('hunt_lure')}</span>
                      </button>
                    </div>
                  );
                })}
                {filteredMonsters.length === 0 && (
                   <div className="p-12 text-center text-gray-600 text-sm italic opacity-50">No creatures found in this region.</div>
                )}
              </div>
            )
          )}

          {tab === 'bosses' && (
            <div className="grid grid-cols-1 gap-1 p-1 animate-in slide-in-from-left-4 duration-300">
              {filteredBosses.map((boss) => {
                const isActive = activeHunt === boss.id;
                const cooldownUntil = bossCooldowns[boss.id] || 0;
                const now = Date.now();
                const onCooldown = cooldownUntil > now;
                
                const remainingSeconds = onCooldown ? Math.ceil((cooldownUntil - now) / 1000) : 0;
                const hours = Math.floor(remainingSeconds / 3600);
                const minutes = Math.floor((remainingSeconds % 3600) / 60);

                return (
                  <div
                    key={boss.id}
                    className={`
                      flex flex-col w-full text-left border border-black/40 rounded-sm mb-2 overflow-hidden transition-all
                      ${isActive ? 'ring-1 ring-purple-500 bg-[#333]' : onCooldown ? 'opacity-60 grayscale-[0.5] bg-[#1a1a1a]' : 'bg-[#252525] hover:bg-[#2a2a2a]'}
                    `}
                  >
                     <div className={`flex items-center p-3 ${!onCooldown && 'bg-gradient-to-r from-[#2a1a3a] to-transparent'}`}>
                        <div className="w-14 h-14 bg-[#111] border border-purple-900/40 flex items-center justify-center shrink-0 mr-4 shadow-inner rounded relative overflow-hidden">
                            <div className="absolute inset-0 bg-purple-600/5 animate-pulse"></div>
                            <Sprite 
                               src={boss.image} 
                               type="monster" 
                               size={48} 
                               className="max-w-[48px] max-h-[48px] z-10" 
                            />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-bold text-purple-200 tracking-tight leading-none mb-1.5">{boss.name}</div>
                            <div className="flex items-center gap-1.5">
                               {onCooldown ? (
                                   <div className="flex items-center gap-1 text-[10px] text-orange-500 font-mono font-bold bg-orange-950/20 px-1.5 py-0.5 rounded border border-orange-900/30">
                                       <Clock size={11} className="animate-pulse" />
                                       {hours}h {minutes}m
                                   </div>
                               ) : (
                                   <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                       <CheckCircle2 size={11} />
                                       AVAILABLE
                                   </div>
                               )}
                            </div>
                        </div>

                        <div className="flex gap-1.5 pl-2">
                            <button 
                                onClick={(e) => onInspectMonster(boss, e)}
                                className="p-2.5 tibia-btn bg-purple-950/30 border-purple-900/40 hover:border-purple-400 text-purple-300 rounded shadow-md transition-all active:translate-y-0.5"
                            >
                                <Info size={16} />
                            </button>
                            
                            <button 
                                disabled={onCooldown}
                                onClick={() => !onCooldown && onStartHunt(boss.id, boss.name, true)}
                                className={`
                                    px-4 py-2 tibia-btn font-bold text-[11px] uppercase tracking-tighter flex items-center gap-2 rounded shadow-lg transition-all
                                    ${onCooldown 
                                        ? 'bg-[#111] border-[#333] text-gray-600 cursor-not-allowed' 
                                        : 'bg-purple-800 hover:bg-purple-700 border-purple-400 text-white active:translate-y-0.5'}
                                `}
                            >
                                {onCooldown ? <Lock size={12}/> : <Swords size={14}/>}
                                {onCooldown ? 'Locked' : 'Battle'}
                            </button>
                        </div>
                     </div>
                  </div>
                );
              })}
              {filteredBosses.length === 0 && (
                  <div className="p-12 text-center text-gray-600 text-sm italic opacity-50">No bosses match your criteria.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
