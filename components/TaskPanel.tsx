
import React, { useState, useEffect } from 'react';
import { Player, HuntingTask } from '../types';
import { MONSTERS, SHOP_ITEMS } from '../constants';
import { Skull, Coins, RefreshCw, CheckCircle, Shield, Clock, Star, XCircle, Crosshair, PackageSearch, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TaskPanelProps {
  player: Player;
  onSelectTask: (task: HuntingTask) => void;
  onCancelTask: (taskUuid: string) => void;
  onRerollTasks: () => void;
  onClaimReward: (taskUuid: string) => void;
  onRerollSpecific?: (index: number) => void; // New prop
}

const getDroppers = (itemId: string) => {
    return MONSTERS.filter(m => m.lootTable?.some(l => l.itemId === itemId)).map(m => m.name);
};

const BountyCard: React.FC<{ 
    task: HuntingTask; 
    playerInventory?: {[key:string]: number};
    onClick?: () => void; 
    onCancel?: () => void;
    onClaim?: () => void;
    onReroll?: () => void;
    playerGold: number;
    rerollCost: number;
}> = ({ task, playerInventory, onClick, onCancel, onClaim, onReroll, playerGold, rerollCost }) => {
    const { t } = useLanguage(); // Translation Hook added
    const [showInfo, setShowInfo] = useState(false);
    
    // Determine Image and Logic based on Type
    let imageSrc: string | undefined;
    let progress = 0;
    let currentAmount = 0;
    let isComplete = false;
    const isActive = task.status === 'active';

    if (task.type === 'collect') {
        const item = SHOP_ITEMS.find(i => i.id === task.targetId);
        imageSrc = item?.image;
        currentAmount = playerInventory ? (playerInventory[task.targetId] || 0) : 0;
        progress = Math.min(100, (currentAmount / task.amountRequired) * 100);
        isComplete = isActive && currentAmount >= task.amountRequired;
    } else {
        // Kill Task
        const monster = MONSTERS.find(m => m.id === task.targetId); // Use targetId which maps to monsterId
        imageSrc = monster?.image;
        currentAmount = task.killsCurrent || 0;
        progress = Math.min(100, (currentAmount / task.amountRequired) * 100);
        isComplete = task.isComplete || false;
    }
    
    // Theme: Bounty Hunter (Orange) vs Collector (Blue/Cyan)
    const isCollect = task.type === 'collect';
    const baseColor = isCollect ? 'text-cyan-400' : 'text-orange-400';
    const borderColor = isActive 
        ? (isComplete ? 'border-green-500' : (isCollect ? 'border-cyan-500' : 'border-orange-500')) 
        : (isCollect ? 'border-cyan-900/30 hover:border-cyan-500' : 'border-orange-900/30 hover:border-orange-500');
    
    const bgGradient = isActive 
        ? (isCollect ? 'from-cyan-900/20 to-black' : 'from-orange-900/20 to-black')
        : 'from-stone-900 to-black';

    const headerText = isActive 
        ? (isComplete ? t('task_complete') : (isCollect ? t('task_active_order') : t('task_active_bounty'))) 
        : (isCollect ? t('task_delivery') : t('task_wanted'));

    return (
        <div 
            onClick={!isActive ? onClick : undefined}
            className={`
                relative flex flex-col items-center rounded border-2 bg-[#1a1a1a] shadow-md overflow-hidden group transition-all duration-300
                ${borderColor} ${isActive ? 'h-auto p-2 scale-100' : 'h-[240px] cursor-pointer hover:scale-[1.02]'}
            `}
        >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-b ${bgGradient} opacity-60 pointer-events-none`}></div>
            
            {/* DROP INFO OVERLAY */}
            {showInfo && (
                <div 
                    className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-2 text-center animate-in fade-in"
                    onMouseLeave={() => setShowInfo(false)}
                    onClick={(e) => { e.stopPropagation(); setShowInfo(false); }}
                >
                    <h4 className="text-cyan-400 font-bold text-xs uppercase mb-2 border-b border-cyan-900 pb-1">{t('task_dropped_by')}</h4>
                    <div className="text-[10px] text-gray-300 overflow-y-auto custom-scrollbar max-h-32 w-full">
                        {getDroppers(task.targetId).map(mob => (
                            <div key={mob} className="mb-1">{mob}</div>
                        ))}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="w-full py-1 bg-black/40 border-b border-white/10 flex flex-col items-center justify-center relative z-10">
                <div className={`flex items-center gap-1 font-black uppercase text-[10px] tracking-wider ${isActive && isComplete ? 'text-green-400' : baseColor} drop-shadow-md`}>
                    {isCollect ? <PackageSearch size={12} /> : <Crosshair size={12} />}
                    <span>{headerText}</span>
                </div>
            </div>

            {/* Icon Circle */}
            <div className={`flex-1 flex flex-col items-center justify-center w-full relative z-10 ${isActive ? 'py-3' : ''}`}>
                <div className={`
                    w-16 h-16 bg-black/60 rounded-full border flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] relative overflow-hidden transition-shadow
                    ${isActive ? (isCollect ? 'border-cyan-500 shadow-cyan-500/20' : 'border-orange-500 shadow-orange-500/20') : 'border-stone-600 group-hover:border-white'}
                `}>
                    <div className={`absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)]`}></div>
                    {imageSrc ? (
                        <img src={imageSrc} className="max-w-[50px] max-h-[50px] pixelated z-10 scale-[1.5]" alt={task.targetName} />
                    ) : (
                        <Skull size={30} className="text-gray-600 opacity-50" />
                    )}
                </div>
                
                {/* Item Name & Info Button */}
                <div className="mt-2 w-full flex items-center justify-center gap-1.5 px-1 relative z-20">
                    <div className="text-xs font-bold text-gray-100 drop-shadow-md bg-black/40 px-2 py-0.5 rounded border border-white/10 truncate max-w-[75%] text-center">
                        {task.targetName}
                    </div>
                    {isCollect && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }}
                            className="flex items-center justify-center px-1.5 py-0.5 bg-cyan-900/40 hover:bg-cyan-800 border border-cyan-500/50 rounded text-[9px] font-bold text-cyan-300 hover:text-white hover:border-cyan-400 transition-all shadow-sm group/btn"
                            title={t('task_show_drops')}
                        >
                            <Info size={10} className="mr-0.5 group-hover/btn:scale-110 transition-transform" />
                            INFO
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Area */}
            <div className="w-full bg-[#111] p-2 border-t border-white/10 relative z-10 flex flex-col items-center space-y-2">
                
                {/* Count */}
                <div className="text-center w-full">
                    <div className="flex justify-between items-end mb-1 px-1">
                        <span className="text-[9px] uppercase text-gray-500 font-bold">{isCollect ? t('task_collected') : t('task_slain')}</span>
                        <span className={`font-mono text-[10px] font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                            {isActive ? `${currentAmount}/${task.amountRequired}` : `${task.amountRequired}x`}
                        </span>
                    </div>
                    {isActive && (
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                            <div 
                                className={`h-full transition-all duration-500 ${isComplete ? 'bg-green-500' : (isCollect ? 'bg-cyan-500' : 'bg-orange-500')}`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    )}
                </div>

                {/* Rewards Grid */}
                <div className="grid grid-cols-2 gap-1 w-full">
                    <div className="bg-[#1a1a1a] border border-[#333] rounded px-1 py-0.5 flex items-center gap-1 justify-center">
                        <Star size={10} className="text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-100">{task.rewardXp.toLocaleString()}</span>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#333] rounded px-1 py-0.5 flex items-center gap-1 justify-center">
                        <Coins size={10} className="text-yellow-500" />
                        <span className="text-[10px] font-bold text-yellow-100">{task.rewardGold.toLocaleString()}</span>
                    </div>
                </div>

                {/* Buttons (Active State) */}
                {isActive && (
                    <div className="w-full pt-1">
                        {isComplete ? (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onClaim && onClaim(); }}
                                className="w-full py-2 bg-green-700 hover:bg-green-600 text-white font-bold text-[10px] rounded border border-green-500 flex items-center justify-center gap-1 animate-pulse"
                            >
                                <CheckCircle size={12} /> {isCollect ? t('task_deliver') : t('task_claim')}
                            </button>
                        ) : (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onCancel && onCancel(); }}
                                className="w-full py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 font-bold text-[9px] rounded border border-red-900 flex items-center justify-center gap-1 transition-colors"
                            >
                                <XCircle size={10} /> {t('task_abandon')}
                            </button>
                        )}
                    </div>
                )}

                {/* Accept Prompt with Reroll (Inactive State) */}
                {!isActive && (
                    <div className="w-full grid grid-cols-2 gap-1">
                        <div className="col-span-1">
                            <button 
                                className="w-full py-2 bg-[#222] hover:bg-[#333] border border-[#333] hover:border-gray-500 rounded text-[9px] text-gray-300 font-bold uppercase transition-colors"
                            >
                                {t('task_accept')}
                            </button>
                        </div>
                        <div className="col-span-1">
                            {onReroll && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onReroll(); }}
                                    disabled={playerGold < rerollCost}
                                    className={`w-full py-2 border rounded text-[9px] font-bold uppercase flex flex-col items-center justify-center leading-none transition-colors
                                        ${playerGold >= rerollCost 
                                            ? 'bg-yellow-900/20 hover:bg-yellow-900/40 border-yellow-800 text-yellow-500' 
                                            : 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'}
                                    `}
                                    title={`${t('lbl_cost')}: ${rerollCost} gp`}
                                >
                                    <span className="flex items-center gap-1"><RefreshCw size={8}/> {t('task_reroll_single')}</span>
                                    <span className="text-[8px] opacity-70 mt-0.5">{rerollCost}g</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const TaskPanel: React.FC<TaskPanelProps> = ({ 
  player, 
  onSelectTask, 
  onCancelTask, 
  onRerollTasks, 
  onClaimReward,
  onRerollSpecific 
}) => {
  const { t } = useLanguage();
  const rerollCost = player.level * 800; // Global Reroll Cost (8x individual)
  const individualRerollCost = player.level * 100; // New Individual Cost
  const isFreeReroll = (player.taskNextFreeReroll || 0) <= Date.now();
  const totalFunds = player.gold + player.bankGold;
  
  const [timeUntilFree, setTimeUntilFree] = useState<string>("");

  useEffect(() => {
      const timer = setInterval(() => {
          const now = Date.now();
          const nextFree = player.taskNextFreeReroll || 0;
          if (nextFree > now) {
              const diff = nextFree - now;
              const h = Math.floor(diff / (1000 * 60 * 60));
              const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              setTimeUntilFree(`${h}h ${m}m`);
          } else {
              setTimeUntilFree(t('task_ready'));
          }
      }, 1000);
      return () => clearInterval(timer);
  }, [player.taskNextFreeReroll, t]);

  // Separate tasks
  const killTasks = player.taskOptions.slice(0, 4);
  const collectTasks = player.taskOptions.slice(4, 8);

  return (
    <div className="flex flex-col h-full bg-[#121212]">
       {/* Header */}
       <div className="p-4 bg-[#1e1e1e] border-b border-[#333] flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-orange-900 to-orange-950 border border-orange-700/50 rounded-lg text-orange-400 shadow-lg">
                  <Shield size={24} />
              </div>
              <div>
                  <h2 className="text-xl font-bold font-serif text-[#eee] leading-none tracking-wide">Hunting Board</h2>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Select contracts</div>
              </div>
          </div>
          
          <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border shadow-inner ${isFreeReroll ? 'bg-green-950/30 border-green-800/50 text-green-400' : 'bg-black/40 border-[#333] text-gray-500'}`}>
              <Clock size={16} />
              <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase font-bold opacity-70">{t('task_free_reset')}</span>
                  <span className="text-sm font-mono font-bold leading-none">{isFreeReroll ? t('task_ready') : timeUntilFree}</span>
              </div>
          </div>
       </div>

       {/* Banner */}
       <div className="bg-gradient-to-r from-orange-950/20 via-orange-900/10 to-orange-950/20 border-b border-orange-900/20 p-2 text-center">
            <p className="text-[10px] text-orange-300/60 uppercase tracking-widest font-bold">
                {t('task_banner_hint')}
            </p>
       </div>

       {/* Grid Content */}
       <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#000_100%)]">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
             
             {/* KILL SECTION */}
             <div>
                 <div className="flex items-center gap-2 mb-3 border-b border-[#333] pb-1">
                     <Crosshair size={16} className="text-orange-500"/>
                     <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">{t('task_kill_header')}</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {killTasks.map((task, idx) => (
                        <BountyCard 
                            key={task.uuid} 
                            task={task} 
                            playerInventory={player.inventory}
                            playerGold={totalFunds}
                            rerollCost={individualRerollCost}
                            onClick={() => onSelectTask(task)}
                            onCancel={() => onCancelTask(task.uuid)}
                            onClaim={() => onClaimReward(task.uuid)}
                            onReroll={() => onRerollSpecific && onRerollSpecific(idx)} // 0-3
                        />
                    ))}
                 </div>
             </div>

             {/* COLLECT SECTION */}
             <div>
                 <div className="flex items-center gap-2 mb-3 border-b border-[#333] pb-1">
                     <PackageSearch size={16} className="text-cyan-500"/>
                     <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">{t('task_collect_header')}</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {collectTasks.map((task, idx) => (
                        <BountyCard 
                            key={task.uuid} 
                            task={task} 
                            playerInventory={player.inventory}
                            playerGold={totalFunds}
                            rerollCost={individualRerollCost}
                            onClick={() => onSelectTask(task)}
                            onCancel={() => onCancelTask(task.uuid)}
                            onClaim={() => onClaimReward(task.uuid)}
                            onReroll={() => onRerollSpecific && onRerollSpecific(idx + 4)} // 4-7
                        />
                    ))}
                 </div>
             </div>

          </div>
       </div>

       {/* Footer Reroll */}
       <div className="p-4 border-t border-[#333] bg-[#1a1a1a] flex justify-center shadow-[0_-5px_20px_rgba(0,0,0,0.5)] relative z-20">
          <button 
             onClick={onRerollTasks}
             disabled={!isFreeReroll && totalFunds < rerollCost}
             className={`
                flex items-center justify-center gap-3 px-8 py-3 rounded-lg border shadow-lg transition-all w-full max-w-md
                ${isFreeReroll 
                    ? 'bg-gradient-to-r from-green-800 to-green-700 hover:brightness-110 text-white border-green-600' 
                    : (totalFunds >= rerollCost 
                        ? 'bg-[#2a2a2a] hover:bg-[#333] border-[#444] hover:border-gray-500 text-gray-300' 
                        : 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed')
                }
             `}
          >
             <RefreshCw size={18} className={isFreeReroll ? 'animate-spin-slow' : ''} />
             <div className="flex flex-col items-start leading-none">
                 <span className="text-xs font-bold uppercase tracking-wider">{t('task_reroll_global')}</span>
                 {!isFreeReroll && <span className="text-[10px] opacity-60 mt-1">{t('lbl_cost')}: {rerollCost.toLocaleString()} gp</span>}
             </div>
          </button>
       </div>
    </div>
  );
};
