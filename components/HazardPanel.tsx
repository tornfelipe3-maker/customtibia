
import React, { useState } from 'react';
import { Player } from '../types';
import { BOSSES } from '../constants';
import { Skull, AlertTriangle, Swords, ShieldAlert, TrendingUp, Trophy, Clock, Flame, Shield, Coins } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HazardPanelProps {
  player: Player;
  onStartHunt: (id: string, name: string, isBoss: boolean) => void;
  bossCooldowns: { [bossId: string]: number };
  onSetActiveHazard: (level: number) => void;
  onChallengeBoss: (id: string, name: string, cost: number) => void; 
}

export const HazardPanel: React.FC<HazardPanelProps> = ({ player, onStartHunt, bossCooldowns, onSetActiveHazard, onChallengeBoss }) => {
  const { t } = useLanguage();
  const [showConfirm, setShowConfirm] = useState(false);
  const bossId = 'primal_menace';
  const boss = BOSSES.find(b => b.id === bossId);
  
  const maxHazard = player.hazardLevel || 0;
  const activeHazard = player.activeHazardLevel || 0;
  const BOSS_COST = 100000;
  
  const cooldownUntil = bossCooldowns[bossId] || 0;
  const now = Date.now();
  const onCooldown = cooldownUntil > now;
  const remainingSeconds = onCooldown ? Math.ceil((cooldownUntil - now) / 1000) : 0;
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);

  // NOVO: XP Bonus 10% por nível, Loot Bonus 5% por nível
  const dmgBonus = activeHazard * 1; // 1%
  const xpBonus = activeHazard * 10; // 10%
  const lootBonus = activeHazard * 5; // 5%
  const dodgeChance = Math.min(25, activeHazard * 0.25);
  const critChance = Math.min(50, activeHazard * 0.5);

  const canAfford = (player.gold + player.bankGold) >= BOSS_COST;

  const handleConfirmChallenge = () => {
      if (boss && canAfford) {
          onChallengeBoss(boss.id, boss.name, BOSS_COST);
          setShowConfirm(false);
      }
  };

  return (
    <div className="h-full flex flex-col bg-[#1a0505] text-red-100 relative overflow-hidden">
        
        <div className="absolute inset-0 bg-[url('https://tibia.fandom.com/wiki/Special:FilePath/Background_Artwork_Texture.jpg')] opacity-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/50 to-black/90 pointer-events-none"></div>

        {showConfirm && (
            <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-[#2a0a0a] border-2 border-red-600 rounded-lg p-6 max-w-sm w-full shadow-[0_0_50px_rgba(220,38,38,0.3)] text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                        <Skull size={120} className="text-red-500" />
                    </div>

                    <h3 className="text-2xl font-bold text-red-500 mb-4 font-serif uppercase tracking-widest border-b border-red-900 pb-2">Warning</h3>
                    
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                        You are about to challenge <strong>The Primal Menace</strong>.
                    </p>
                    
                    <div className="bg-red-950/50 border border-red-800 p-3 rounded mb-4 text-xs text-red-200 font-bold">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Skull size={14}/> DEATH PENALTY IS ACTIVE
                        </div>
                        <span className="font-normal opacity-80">If you die, you will lose Experience, Skills and Gold normally.</span>
                    </div>

                    <div className="bg-black/40 border border-yellow-900/30 p-3 rounded mb-6 flex justify-between items-center">
                        <span className="text-xs text-gray-400 uppercase font-bold">Entry Cost (Bank Accepted)</span>
                        <span className={`font-mono font-bold ${canAfford ? 'text-yellow-500' : 'text-red-500'}`}>
                            {BOSS_COST.toLocaleString()} gp
                        </span>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded border border-gray-600 text-xs"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirmChallenge}
                            disabled={!canAfford}
                            className={`flex-1 py-3 font-bold rounded border text-xs flex items-center justify-center gap-2
                                ${canAfford 
                                    ? 'bg-red-700 hover:bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/50' 
                                    : 'bg-red-900/30 border-red-900 text-red-500 cursor-not-allowed'}
                            `}
                        >
                            {canAfford ? <><Swords size={14}/> Pay & Fight</> : 'Not enough Gold'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="relative z-10 p-6 flex items-center justify-between border-b border-red-900/50 bg-black/40 shadow-xl shrink-0">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-red-900/30 border border-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse">
                    <Skull size={32} className="text-red-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif text-red-200 tracking-wider drop-shadow-md">Hazard System</h2>
                    <div className="text-xs text-red-400 uppercase tracking-widest font-bold">Rotten Blood</div>
                </div>
            </div>
            
            <div className="flex flex-col items-end">
                <div className="text-[10px] uppercase text-red-500 font-bold mb-1">Max Level Reached</div>
                <div className="text-3xl font-mono font-bold text-white drop-shadow-[0_0_10px_red]">{maxHazard} / 100</div>
            </div>
        </div>

        <div className="relative z-10 flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col items-center">
            
            <div className="w-full max-w-4xl bg-black/60 border border-red-900/50 rounded-lg p-6 mb-6 shadow-lg">
                <div className="flex justify-between items-end mb-4">
                    <div className="flex items-center gap-2">
                        <Flame size={20} className="text-orange-500 animate-pulse"/>
                        <span className="font-bold text-lg text-red-200">Active Hazard Level</span>
                    </div>
                    <span className="text-4xl font-black text-white font-mono bg-red-900/20 px-4 py-1 rounded border border-red-900/50">{activeHazard}</span>
                </div>
                
                <input 
                    type="range" 
                    min="0" 
                    max={maxHazard} 
                    value={activeHazard} 
                    onChange={(e) => onSetActiveHazard(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600 border border-gray-600 hover:border-red-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                    <span>Safe (0)</span>
                    <span>Max ({maxHazard})</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                
                <div className="bg-black/60 border border-red-900/30 rounded-lg p-5 shadow-lg">
                    <h3 className="text-lg font-bold text-red-300 mb-4 flex items-center gap-2 border-b border-red-900/30 pb-2">
                        <TrendingUp size={20}/> Active Effects
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="bg-green-950/20 p-3 rounded border border-green-900/30">
                            <div className="text-xs font-bold text-green-400 uppercase mb-2">Rewards (Global Hunt)</div>
                            <div className="flex justify-between text-sm">
                                <span>Experience Bonus</span>
                                <span className="font-bold text-green-300">+{xpBonus}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Loot Chance Bonus (Multiplicative)</span>
                                <span className="font-bold text-green-300">+{lootBonus}%</span>
                            </div>
                        </div>

                        <div className="bg-red-950/20 p-3 rounded border border-red-900/30">
                            <div className="text-xs font-bold text-red-400 uppercase mb-2">Creature Buffs (Global Hunt)</div>
                            <div className="flex justify-between text-sm">
                                <span>Damage Dealt</span>
                                <span className="font-bold text-red-300">+{dmgBonus}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Critical Chance</span>
                                <span className="font-bold text-red-300">{critChance.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Dodge Chance</span>
                                <span className="font-bold text-red-300">{dodgeChance.toFixed(1)}%</span>
                            </div>
                        </div>
                        
                        <div className="text-[10px] text-gray-500 italic text-center border-t border-white/10 pt-2">
                            * Hazard effects do not apply to Boss fights.
                        </div>
                    </div>
                </div>

                <div className="bg-black/60 border border-red-900/30 rounded-lg p-5 shadow-lg flex flex-col items-center text-center">
                    <h3 className="text-lg font-bold text-red-300 mb-4 flex items-center gap-2 border-b border-red-900/30 pb-2 w-full justify-center">
                        <Swords size={20}/> The Primal Menace
                    </h3>
                    
                    <div className="w-24 h-24 bg-[#1a0505] border-2 border-red-800 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,0,0,0.3)] overflow-hidden">
                        {boss?.image ? <img src={boss.image} className="scale-[2] pixelated" /> : <AlertTriangle size={32} className="text-red-500" />}
                    </div>

                    <p className="text-xs text-red-200/80 mb-6 px-4">
                        Defeat the Primal Menace to increase your <strong>Maximum Hazard Level</strong> by 1. Be warned, this creature embodies the corruption itself.
                    </p>

                    <div className="mb-4 text-xs font-mono font-bold text-yellow-500 bg-black/40 px-3 py-1 rounded border border-yellow-900/30">
                        Cost: {BOSS_COST.toLocaleString()} gp
                    </div>

                    {maxHazard >= 100 ? (
                        <div className="bg-yellow-900/20 text-yellow-500 font-bold px-4 py-2 rounded border border-yellow-700 flex items-center gap-2">
                            <Trophy size={16}/> MAXIMUM HAZARD REACHED
                        </div>
                    ) : (
                        <button 
                            onClick={() => setShowConfirm(true)}
                            disabled={onCooldown || !boss}
                            className={`
                                w-full py-4 font-bold text-sm uppercase tracking-widest rounded border transition-all shadow-lg flex items-center justify-center gap-3
                                ${onCooldown 
                                    ? 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed' 
                                    : 'bg-red-700 hover:bg-red-600 border-red-500 text-white shadow-red-900/50 hover:scale-[1.02]'}
                            `}
                        >
                            {onCooldown ? (
                                <><Clock size={16} /> Respawn: {hours}h {minutes}m</>
                            ) : (
                                <><ShieldAlert size={18} /> Challenge Boss</>
                            )}
                        </button>
                    )}
                </div>

            </div>

            <div className="mt-8 text-[10px] text-red-500/50 italic flex items-center gap-2">
                <AlertTriangle size={12}/> Increasing Active Hazard affects ALL normal hunting grounds immediately.
            </div>

        </div>
    </div>
  );
};
