
import React, { useState } from 'react';
import { Player, Monster } from '../types';
import { MONSTERS, BOSSES } from '../constants';
import { Search, X, Info, Swords, Footprints, Clock, CheckCircle2, Lock } from 'lucide-react';
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
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');

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
    const matchesTier = selectedTier === 'all' || getMonsterTier(m.level) === selectedTier;
    return matchesSearch && matchesTier;
  }).sort((a, b) => a.exp - b.exp);
  
  const filteredBosses = BOSSES.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tiers = [1, 2, 3, 4, 5, 6, 7, 8];

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

      {/* SEARCH & IMPROVED TIER FILTER */}
      <div className="bg-[#2d2d2d] border-b border-[#111] p-2 flex flex-col gap-2 shadow-inner shrink-0">
          <div className="relative">
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

          {/* Tier Selection Bar - Redesigned to be Tibia-style and cleaner */}
          {tab === 'monsters' && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar-thin">
                <button
                    onClick={() => setSelectedTier('all')}
                    className={`
                        px-2 py-1 text-[9px] font-bold rounded border transition-all shrink-0
                        ${selectedTier === 'all' 
                            ? 'bg-[#444] border-[#888] text-white shadow-[0_0_5px_rgba(255,255,255,0.1)]' 
                            : 'bg-[#1a1a1a] border-[#333] text-gray-500 hover:text-gray-300'}
                    `}
                >
                    ALL
                </button>
                <div className="w-[1px] h-3 bg-[#444] shrink-0 mx-0.5"></div>
                {tiers.map(tNum => (
                    <button
                        key={tNum}
                        onClick={() => setSelectedTier(tNum)}
                        className={`
                            min-w-[26px] py-1 text-[10px] font-bold rounded border transition-all shrink-0
                            ${selectedTier === tNum 
                                ? 'bg-amber-900/40 border-amber-500 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.2)]' 
                                : 'bg-[#1a1a1a] border-[#333] text-gray-500 hover:border-[#444] hover:text-gray-300'}
                        `}
                    >
                        {tNum}
                    </button>
                ))}
            </div>
          )}
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
                {/* Mini Sprite Box - CLEAN VERSION (No T1/T2 overlay) */}
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

                {/* Monster Action Buttons */}
                <button 
                  onClick={(e) => onInspectMonster(monster, e)}
                  className="ml-2 h-[30px] px-3 flex items-center gap-1.5 tibia-btn bg-[#0d1b2a] border border-blue-900/40 hover:border-blue-500 hover:bg-[#162a40] group/info shadow-lg transition-all active:translate-y-[1px]"
                  title="Bestiary Info"
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
                    title="Start Hunting (Single)"
                >
                    <Swords size={14} className="text-red-500/80 group-hover/hunt:text-red-300" />
                    <span className="text-[10px] font-bold text-red-500/80 group-hover/hunt:text-red-300 tracking-wide hidden sm:inline">{t('hunt_start')}</span>
                </button>

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
                            title="Drop Info"
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
                 
                 {/* Visual Cooldown Bar (if applicable) */}
                 {onCooldown && boss.cooldownSeconds && (
                     <div className="h-1 bg-[#111] w-full">
                         <div 
                            className="h-full bg-orange-600 transition-all duration-1000" 
                            style={{ width: `${Math.min(100, (remainingSeconds / boss.cooldownSeconds) * 100)}%` }}
                         ></div>
                     </div>
                 )}
              </div>
            );
          })}

          {filteredMonsters.length === 0 && tab === 'monsters' && (
              <div className="p-12 text-center text-gray-600 text-sm italic opacity-50">No creatures match your criteria.</div>
          )}
        </div>
      </div>
    </div>
  );
};
