
import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useGameEngine } from './hooks/useGameEngine';
import { useLanguage } from './contexts/LanguageContext'; // New Import
import { AuthScreen } from './components/AuthScreen';
import { CharacterPanel } from './components/CharacterPanel';
import { LogPanel } from './components/LogPanel';
import { HuntPanel } from './components/HuntPanel';
import { TrainingPanel } from './components/TrainingPanel';
import { ShopPanel } from './components/ShopPanel';
import { CastlePanel } from './components/CastlePanel';
import { StorePanel } from './components/StorePanel';
import { BankPanel } from './components/BankPanel';
import { SpellPanel } from './components/SpellPanel';
import { TaskPanel } from './components/TaskPanel';
import { PreyPanel } from './components/PreyPanel';
import { AscensionPanel } from './components/AscensionPanel';
import { DepotPanel } from './components/DepotPanel';
import { QuestPanel } from './components/QuestPanel';
import { BotPanel } from './components/BotPanel';
import { GmPanel } from './components/GmPanel';
import { HighscoresModal } from './components/HighscoresModal';
import { OracleModal } from './components/OracleModal';
import { ReforgeModal } from './components/ReforgeModal';
import { TutorialModal } from './components/TutorialModal';
import { WikiModal } from './components/WikiModal';
import { HuntAnalyzer } from './components/HuntAnalyzer'; // New Import
import { HazardPanel } from './components/HazardPanel'; // NEW IMPORT
import { OfflineModal } from './components/OfflineModal'; // NEW IMPORT
import { Sidebar } from './components/Sidebar'; // NEW IMPORT
import { StorageService } from './services/storage';
import { 
    Save, LogOut, Trophy, Layout, Settings, Compass, Map, 
    CircleDollarSign, Coins, Crown, Ghost, ShoppingBag, 
    Skull, Briefcase, Zap, Bot, Flame, Shield, MapPin, 
    Swords, Landmark, ScrollText, BookOpen, Globe, AlertTriangle
} from 'lucide-react';

const App = () => {
  const { isAuthenticated, loadedPlayer, currentAccount, login, register, importSave, authError, isAuthLoading, logout } = useAuth();
  const { player, logs, hits, activeMonster, currentMonsterHp, reforgeResult, activeTutorial, actions, analyzerHistory, sessionKills, offlineReport, gameSpeed } = useGameEngine(loadedPlayer, currentAccount);
  const { t } = useLanguage(); // Language hook
  const [activeTab, setActiveTab] = useState('hunt'); 
  const [showHighscores, setShowHighscores] = useState(false);
  const [showWiki, setShowWiki] = useState(false); 
  const [showAnalyzer, setShowAnalyzer] = useState(false); // Analyzer State
  const [highscoresData, setHighscoresData] = useState(null);

  const fetchHighscores = () => {
      const data = StorageService.getHighscores();
      // @ts-ignore
      setHighscoresData(data);
      setShowHighscores(true);
  };

  const handleMenuClick = (menuId: string) => {
      setActiveTab(menuId);
  };

  if (!isAuthenticated || !player) {
    return <AuthScreen onLogin={login} onRegister={register} onImport={importSave} errorMsg={authError} isLoading={isAuthLoading} />;
  }

  const exportSave = () => {
      if (currentAccount) {
          const str = StorageService.exportSaveString(currentAccount);
          if (str) navigator.clipboard.writeText(str).then(() => alert("Save string copied to clipboard!"));
      }
  };

  const handleChallengeBoss = (id: string, name: string, cost: number) => {
      // Deduct gold and start fight
      actions.removeGold(cost);
      actions.startHunt(id, name, true, 1);
      setActiveTab('hunt');
  };

  const handleLogout = () => {
      if (currentAccount && player) {
          // Force save on logout to ensure active activities (Hunt/Train) are persisted
          StorageService.save(currentAccount, { ...player, lastSaveTime: Date.now() });
      }
      logout();
  };

  // --- MENU CONFIGURATION ---
  const MENU_CATEGORIES = [
      {
          title: t('cat_caves'),
          items: [
              { id: 'hunt', label: t('menu_hunt'), icon: Swords, color: 'text-red-400' },
              { id: 'tasks', label: t('menu_tasks'), icon: Skull, color: 'text-orange-400' },
              { id: 'prey', label: t('menu_prey'), icon: Compass, color: 'text-blue-300' },
              { id: 'hazard', label: 'Hazard System', icon: AlertTriangle, color: 'text-red-600' }, // NEW ITEM
              { id: 'quests', label: t('menu_quests'), icon: Map, color: 'text-yellow-600' },
          ]
      },
      {
          title: t('cat_city'),
          items: [
              { id: 'shop', label: t('menu_shop'), icon: CircleDollarSign, color: 'text-green-400' },
              { id: 'bank', label: t('menu_bank'), icon: Landmark, color: 'text-yellow-500' },
              { id: 'depot', label: t('menu_depot'), icon: Briefcase, color: 'text-amber-700' },
              { id: 'spells', label: t('menu_spells'), icon: ScrollText, color: 'text-purple-400' },
              { id: 'castle', label: t('menu_castle'), icon: Crown, color: 'text-yellow-200' },
          ]
      },
      {
          title: t('cat_char'),
          items: [
              { id: 'train', label: t('menu_train'), icon: Shield, color: 'text-gray-400' },
              { id: 'ascension', label: t('menu_ascension'), icon: Ghost, color: 'text-purple-300' },
              { id: 'bot', label: t('menu_bot'), icon: Bot, color: 'text-cyan-400' },
          ]
      },
      {
          title: t('cat_system'),
          items: [
              { id: 'store', label: t('menu_store'), icon: ShoppingBag, color: 'text-green-500' },
              { id: 'highscores', label: t('menu_highscores'), icon: Trophy, color: 'text-yellow-500', action: fetchHighscores },
              { id: 'wiki', label: t('menu_wiki'), icon: BookOpen, color: 'text-blue-300', action: () => setShowWiki(true) },
              { id: 'save', label: t('menu_save'), icon: Save, color: 'text-blue-400', action: exportSave },
              { id: 'logout', label: t('menu_logout'), icon: LogOut, color: 'text-red-500', action: handleLogout },
          ]
      }
  ];

  return (
    <div className="flex h-screen w-screen bg-[#0d0d0d] text-gray-200 font-sans overflow-hidden select-none">
        
        {/* --- LEFT SIDEBAR (VERTICAL MENU) --- */}
        <Sidebar 
            activeTab={activeTab} 
            onMenuClick={handleMenuClick}
            menuCategories={MENU_CATEGORIES}
        />

        {/* --- MAIN CONTENT (CENTER - GAME VIEW) --- */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative z-10 bg-[#121212]">
            
            {/* Game Window View */}
            <div className="flex-1 overflow-hidden relative shadow-inner">
                {activeTab === 'hunt' && (
                    <HuntPanel 
                        player={player} 
                        activeHunt={player.activeHuntId} 
                        activeMonster={activeMonster} 
                        bossCooldowns={player.bossCooldowns}
                        onStartHunt={(id, name, isBoss, count) => actions.startHunt(id, name, isBoss, count)}
                        onStopHunt={actions.stopHunt}
                        currentMonsterHp={currentMonsterHp}
                        hits={hits}
                    />
                )}
                {activeTab === 'train' && <TrainingPanel player={player} isTraining={!!player.activeTrainingSkill} trainingSkill={player.activeTrainingSkill} onStartTraining={actions.startTraining} onStopTraining={actions.stopTraining}/>}
                
                {activeTab === 'shop' && (
                    <ShopPanel 
                        playerGold={player.gold} 
                        playerBankGold={player.bankGold}
                        playerLevel={player.level} 
                        playerEquipment={player.equipment} 
                        playerInventory={player.inventory} 
                        playerUniqueInventory={player.uniqueInventory} 
                        playerQuests={player.quests} 
                        skippedLoot={player.skippedLoot} 
                        playerHasBlessing={player.hasBlessing} 
                        isGm={player.isGm} 
                        onBuyItem={actions.buyItem} 
                        onSellItem={actions.sellItem} 
                        onToggleSkippedLoot={actions.handleToggleSkippedLoot} 
                        onBuyBlessing={actions.handleBuyBlessing}
                    />
                )}

                {activeTab === 'castle' && <CastlePanel player={player} onPromote={actions.promotePlayer} onBuyBlessing={actions.handleBuyBlessing} />}
                {activeTab === 'store' && <StorePanel player={player} onBuyCoins={actions.buyCoins} onBuyPremium={actions.buyPremium} onBuyBoost={actions.buyBoost} />}
                {activeTab === 'bank' && <BankPanel playerGold={player.gold} bankGold={player.bankGold} onDeposit={actions.depositGold} onWithdraw={actions.withdrawGold} />}
                {activeTab === 'spells' && <SpellPanel player={player} onBuySpell={actions.buySpell} />}
                
                {activeTab === 'tasks' && (
                    <TaskPanel 
                        player={player} 
                        onSelectTask={actions.selectTask} 
                        onCancelTask={actions.cancelTask} 
                        onRerollTasks={actions.rerollTasks} 
                        onClaimReward={actions.claimTaskReward} 
                        onRerollSpecific={actions.rerollSpecificTask}
                    />
                )}
                
                {activeTab === 'prey' && <PreyPanel player={player} onReroll={actions.rerollPrey} onActivate={actions.activatePrey} onCancel={actions.cancelPrey} />}
                {activeTab === 'hazard' && <HazardPanel player={player} onStartHunt={(id, name, isBoss) => actions.startHunt(id, name, isBoss, 1)} bossCooldowns={player.bossCooldowns} onSetActiveHazard={actions.setActiveHazardLevel} onChallengeBoss={handleChallengeBoss} />} 
                {activeTab === 'ascension' && <AscensionPanel player={player} onAscend={actions.ascend} onUpgrade={actions.upgradeAscension} />}
                
                {activeTab === 'depot' && (
                    <DepotPanel 
                        playerDepot={player.depot} 
                        playerUniqueDepot={player.uniqueDepot} 
                        onWithdrawItem={actions.withdrawItem} 
                    />
                )}
                
                {activeTab === 'quests' && <QuestPanel playerQuests={player.quests} onClaimQuest={actions.claimQuest} playerLevel={player.level} />}
                {activeTab === 'bot' && <BotPanel player={player} onUpdateSettings={actions.updateSettings} />}
            </div>

            {/* Server Log (Bottom Console) */}
            <div className="h-[180px] border-t-2 border-[#333] bg-black shadow-[0_-5px_15px_rgba(0,0,0,0.5)] z-20">
                <LogPanel logs={logs} />
            </div>
        </div>

        {/* --- RIGHT SIDEBAR (CHARACTER & INVENTORY) --- */}
        <div className="w-[300px] flex flex-col bg-[#222] border-l border-[#111] shadow-2xl shrink-0 z-20 h-full">
            <div className="flex-1 overflow-hidden relative">
                <CharacterPanel 
                    player={player} 
                    onUpdateSettings={actions.updateSettings} 
                    onEquipItem={actions.equipItem} 
                    onDepositItem={actions.depositItem}
                    onDiscardItem={actions.discardItem}
                    onToggleSkippedLoot={actions.toggleSkippedLoot}
                    onUnequipItem={actions.unequipItem}
                    onReforgeItem={actions.reforgeItem}
                    onToggleAnalyzer={() => setShowAnalyzer(!showAnalyzer)}
                />
            </div>
        </div>

        {/* Floating Modals */}
        <HighscoresModal isOpen={showHighscores} onClose={() => setShowHighscores(false)} data={highscoresData} />
        <WikiModal isOpen={showWiki} onClose={() => setShowWiki(false)} />
        
        {/* Hunt Analyzer with Kill Count */}
        <HuntAnalyzer 
            isOpen={showAnalyzer} 
            onClose={() => setShowAnalyzer(false)} 
            onReset={actions.resetAnalyzer}
            history={analyzerHistory} 
            killCounts={sessionKills}
        />
        
        {/* REFORGE RESULT MODAL */}
        {reforgeResult && (
            <ReforgeModal 
                oldItem={reforgeResult.oldItem} 
                newItem={reforgeResult.newItem} 
                onClose={actions.closeReforgeModal} 
            />
        )}

        {/* TUTORIAL MODAL (First Time Experience) */}
        {activeTutorial && (
            <TutorialModal 
                type={activeTutorial} 
                onClose={actions.closeTutorial} 
            />
        )}

        {/* PROGRESSION MODALS (The Oracle & Name Selection) */}
        <OracleModal 
            player={player} 
            onChooseName={actions.chooseName} 
            onChooseVocation={actions.chooseVocation} 
        />
        
        {player.isGm && (
            <GmPanel 
                player={player} 
                gameSpeed={gameSpeed}
                onLevelUp={actions.gmLevelUp} 
                onSkillUp={actions.gmSkillUp} 
                onAddGold={actions.gmAddGold}
                onAddSoulPoints={actions.gmAddSoulPoints}
                onSetRarity={actions.gmSetRarity} 
                onSetSpeed={actions.setGameSpeed}
                onSetHazard={actions.gmSetHazardLevel}
            />
        )}

        {/* OFFLINE REPORT MODAL (Always Last for Z-Index Safety) */}
        {offlineReport && (
            <OfflineModal 
                report={offlineReport} 
                onClose={actions.closeOfflineModal}
            />
        )}
    </div>
  );
};

export default App;
