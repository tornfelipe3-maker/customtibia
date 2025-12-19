
import React, { useState } from 'react';
import { Player, Monster } from '../types';
import { MONSTERS, BOSSES } from '../constants';
import { Search, X, Info, Swords, Footprints, Star } from 'lucide-react';
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

  const filteredMonsters = MONSTERS.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.exp - b.exp);
  
  const filteredBosses = BOSSES.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#222]">
      {/* Battle List Controls */}
      <div className="flex bg-[#2d2d2d] border-b border-[#111] shrink-0">
         <button 
           onClick={() => setTab('monsters')}
           className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider border-r border-[#444] ${tab === 'monsters' ? 'text-[#eee] bg-[#444]' : 'text-[#888] hover:bg-[#333]'}`}
         >
           {t('hunt_tab_battle')}
         </button>
         <button 
           onClick={() => setTab('bosses')}
           className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider ${tab === 'bosses' ? 'text-[#eee] bg-[#444]' : 'text-[#888] hover:bg-[#333]'}`}
         >
           {t('hunt_tab_bosses')}
         </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-[#2d2d2d] border-b border-[#111] p-2 flex justify-center shadow-inner shrink-0">
          <div className="relative w-full max-w-[400px] flex items-center">
              <div className="absolute left-2.5 text-gray-500"><Search size={14}/></div>
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
                    className="absolute right-2 text-gray-500 hover:text-white"
                  >
                      <X size={14}/>
                  </button>
              )}
          </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto tibia-inset custom-scrollbar bg-[#222]">
        <div className="grid grid-cols-1 gap-1 p-1">
          {tab === 'monsters' && filteredMonsters.map((monster) => {
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
                {/* Mini Sprite Box */}
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

                {/* Info Button */}
                <button 
                  onClick={(e) => onInspectMonster(monster, e)}
                  className="ml-2 h-[30px] px-3 flex items-center gap-1.5 tibia-btn bg-[#0d1b2a] border border-blue-900/40 hover:border-blue-500 hover:bg-[#162a40] group/info shadow-lg transition-all active:translate-y-[1px]"
                  title="Bestiary Info"
                >
                    <Info size={14} className="text-blue-500/80 group-hover/info:text-blue-300" />
                    <span className="text-[10px] font-bold text-blue-500/80 group-hover/info:text-blue-300 tracking-wide">{t('hunt_info')}</span>
                </button>

                {/* Hunt Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onStartHunt(monster.id, monster.name, false);
                    }}
                    className="ml-1 h-[30px] px-3 flex items-center gap-1.5 tibia-btn bg-[#2a0d0d] border border-red-900/60 hover:border-red-500 hover:bg-[#401010] group/hunt shadow-lg transition-all active:translate-y-[1px]"
                    title="Start Hunting (Single)"
                >
                    <Swords size={14} className="text-red-500/80 group-hover/hunt:text-red-300" />
                    <span className="text-[10px] font-bold text-red-500/80 group-hover/hunt:text-red-300 tracking-wide hidden sm:inline">{t('hunt_start')}</span>
                </button>

                {/* Area Hunt Button */}
                <button 
                    onClick={(e) => onAreaHunt(monster, e)}
                    className="ml-1 px-3 py-1.5 tibia-btn bg-[#2a1111] border-[#500] hover:bg-[#3a1a1a] flex items-center gap-1.5 shadow-[0_0_5px_rgba(200,0,0,0.1)] group/btn opacity-80 hover:opacity-100"
                    title="Caçar lurando (Aumenta XP e Dano)"
                >
                    <Footprints size={14} className="text-red-500 group-hover/btn:text-red-300" />
                    <span className="text-[10px] font-bold text-red-500 group-hover/btn:text-red-300 hidden sm:inline">{t('hunt_lure')}</span>
                </button>
              </div>
            );
          })}

          {tab === 'bosses' && filteredBosses.map((boss) => {
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
                  flex items-center w-full text-left p-2.5 border-b border-black/30 rounded-sm mb-1 group
                  ${isActive ? 'bg-[#333] border-l-4 border-l-purple-500' : onCooldown ? 'opacity-50 bg-[#1a1a1a]' : 'hover:bg-[#2a2a2a] bg-[#252525]'}
                `}
              >
                 <button 
                    disabled={onCooldown}
                    onClick={() => !onCooldown && onStartHunt(boss.id, boss.name, true)}
                    className="flex-1 flex items-center text-left"
                 >
                    <div className="w-12 h-12 bg-[#181818] border border-[#444] flex items-center justify-center shrink-0 mr-4 shadow-inner rounded-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(100,50,255,0.1)_0%,transparent_70%)]"></div>
                        <Sprite 
                           src={boss.image} 
                           type="monster" 
                           size={42} 
                           className="max-w-[42px] max-h-[42px] z-10" 
                        />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-bold text-purple-300">{boss.name}</div>
                        {onCooldown ? (
                            <div className="text-[10px] text-orange-500 font-mono mt-1 flex items-center gap-1">
                                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                Respawn: {hours}h {minutes}m
                            </div>
                        ) : (
                            <div className="text-[10px] text-green-500 font-bold mt-1 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                AVAILABLE NOW
                            </div>
                        )}
                    </div>
                 </button>

                 {/* Boss Info Button */}
                 <button 
                  onClick={(e) => onInspectMonster(boss, e)}
                  className="ml-2 h-[30px] px-3 flex items-center gap-1.5 tibia-btn bg-[#1a0d2a] border border-purple-900/40 hover:border-purple-500 hover:bg-[#2a1640] group/info shadow-lg transition-all active:translate-y-[1px]"
                  title="Boss Info"
                >
                    <Info size={14} className="text-purple-500/80 group-hover/info:text-purple-300" />
                    <span className="text-[10px] font-bold text-purple-500/80 group-hover/info:text-purple-300 tracking-wide">{t('hunt_info')}</span>
                </button>
              </div>
            );
          })}

          {filteredMonsters.length === 0 && tab === 'monsters' && (
              <div className="p-8 text-center text-gray-500 text-sm">No monsters found matching your search.</div>
          )}
          {filteredBosses.length === 0 && tab === 'bosses' && (
              <div className="p-8 text-center text-gray-500 text-sm">No bosses found matching your search.</div>
          )}
        </div>
      </div>
    </div>
  );
};
