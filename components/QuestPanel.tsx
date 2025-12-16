
import React from 'react';
import { QUESTS, SHOP_ITEMS } from '../constants';
import { Player, Quest } from '../types';
import { Scroll, CheckCircle, Lock, Gift, Shield, Sword, Coins, Star } from 'lucide-react';

interface QuestPanelProps {
  playerQuests: Player['quests'];
  onClaimQuest: (questId: string) => void;
  playerLevel: number;
}

export const QuestPanel: React.FC<QuestPanelProps> = ({ playerQuests, onClaimQuest, playerLevel }) => {
  
  // Sort quests: Claimable first, then In Progress, then Completed, then Locked
  const sortedQuests = [...QUESTS].sort((a, b) => {
      const getStatusScore = (q: Quest) => {
          const prog = playerQuests[q.id] || { kills: 0, completed: false };
          const isCompleted = prog.completed;
          const isReady = !isCompleted && 
                          (q.requiredKills ? prog.kills >= q.requiredKills : false) &&
                          (q.requiredLevel ? playerLevel >= q.requiredLevel : true);
          
          if (isReady) return 0; // Top priority
          if (!isCompleted) return 1; // In progress
          if (isCompleted) return 2; // Done
          return 3;
      };
      return getStatusScore(a) - getStatusScore(b);
  });

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 bg-gray-900 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2 text-yellow-600">
          <Scroll size={20} />
          <h2 className="text-lg font-bold font-serif">Quest Log</h2>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 gap-4">
          {sortedQuests.map((quest) => {
            const playerProgress = playerQuests[quest.id] || { kills: 0, completed: false };
            
            // Check requirements
            const killsDone = quest.requiredKills ? playerProgress.kills >= quest.requiredKills : true;
            const levelDone = quest.requiredLevel ? playerLevel >= quest.requiredLevel : true;
            const canClaim = !playerProgress.completed && killsDone && levelDone;

            const progressPercent = quest.requiredKills 
                ? Math.min(100, (playerProgress.kills / quest.requiredKills) * 100) 
                : (levelDone ? 100 : Math.min(100, (playerLevel / (quest.requiredLevel || 1)) * 100));

            return (
              <div 
                key={quest.id} 
                className={`border rounded-lg p-4 transition-all
                    ${playerProgress.completed ? 'bg-gray-800/50 border-gray-700 opacity-70' : 
                      canClaim ? 'bg-green-900/10 border-green-600 shadow-[0_0_10px_rgba(0,255,0,0.1)]' : 
                      'bg-gray-700/50 border-gray-600'}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-bold text-base ${canClaim ? 'text-green-400' : 'text-gray-200'}`}>{quest.name}</h3>
                  {playerProgress.completed ? (
                    <span className="text-gray-500 flex items-center text-xs font-bold bg-black/30 px-2 py-1 rounded border border-gray-700">
                      <CheckCircle size={12} className="mr-1" /> Done
                    </span>
                  ) : canClaim ? (
                    <span className="text-green-400 flex items-center text-xs font-bold animate-pulse">
                      <Gift size={14} className="mr-1" /> Ready!
                    </span>
                  ) : (
                    <span className="text-gray-500 flex items-center text-xs font-bold">
                      <Lock size={12} className="mr-1" /> Active
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-gray-400 mb-3 italic">{quest.description}</p>
                
                {/* Requirements Progress */}
                <div className="space-y-1 mb-3">
                   {quest.requiredKills && (
                       <div className="flex justify-between text-xs font-mono text-gray-300">
                          <span>Target: {quest.targetMonsterId} ({playerProgress.kills}/{quest.requiredKills})</span>
                       </div>
                   )}
                   {quest.requiredLevel && (
                       <div className="flex justify-between text-xs font-mono text-gray-300">
                          <span>Required Level: {quest.requiredLevel} (Current: {playerLevel})</span>
                       </div>
                   )}
                   
                   <div className="w-full bg-gray-800 rounded-full h-2 border border-gray-600 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${canClaim ? 'bg-green-500' : 'bg-blue-500'}`} 
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                   </div>
                </div>
                
                {/* Rewards Preview */}
                <div className="flex flex-wrap gap-2 items-center mt-3 pt-2 border-t border-gray-600/50">
                   <span className="text-[10px] text-gray-500 font-bold uppercase mr-1">Rewards:</span>
                   
                   {quest.rewardGold && (
                       <span className="text-xs text-yellow-500 flex items-center bg-black/30 px-1.5 py-0.5 rounded border border-yellow-900/30">
                           <Coins size={10} className="mr-1"/> {quest.rewardGold} gp
                       </span>
                   )}
                   {quest.rewardExp && (
                       <span className="text-xs text-blue-400 flex items-center bg-black/30 px-1.5 py-0.5 rounded border border-blue-900/30">
                           <Star size={10} className="mr-1"/> {quest.rewardExp} xp
                       </span>
                   )}
                   {quest.rewardItems && quest.rewardItems.map((ri, idx) => {
                       const itemDef = SHOP_ITEMS.find(i => i.id === ri.itemId);
                       return (
                           <span key={idx} className="text-xs text-gray-300 flex items-center bg-black/30 px-1.5 py-0.5 rounded border border-gray-600">
                               {itemDef?.type === 'equipment' ? <Shield size={10} className="mr-1"/> : <Gift size={10} className="mr-1"/>}
                               {itemDef?.name || ri.itemId} {ri.count > 1 ? `x${ri.count}` : ''}
                           </span>
                       );
                   })}
                   {quest.rewardNpcAccess && (
                       <span className="text-xs text-purple-400 flex items-center bg-black/30 px-1.5 py-0.5 rounded border border-purple-900/30">
                           NPC: {quest.rewardNpcAccess}
                       </span>
                   )}
                </div>

                {/* Claim Button */}
                {canClaim && (
                    <button 
                        onClick={() => onClaimQuest(quest.id)}
                        className="w-full mt-3 py-2 bg-green-700 hover:bg-green-600 text-white font-bold text-xs rounded border border-green-500 shadow-lg flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={14} /> CLAIM REWARD
                    </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
