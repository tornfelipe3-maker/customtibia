
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGameEngine } from '../hooks/useGameEngine';
import { useLanguage } from '../contexts/LanguageContext'; 
import { AuthScreen } from './AuthScreen';
import { CharacterPanel } from './CharacterPanel';
import { LogPanel } from './LogPanel';
import { HuntPanel } from './HuntPanel';
import { TrainingPanel } from './TrainingPanel';
import { ShopPanel } from './ShopPanel';
import { CastlePanel } from './CastlePanel';
import { StorePanel } from './StorePanel';
import { BankPanel } from './BankPanel';
import { SpellPanel } from './SpellPanel';
import { TaskPanel } from './TaskPanel';
import { PreyPanel } from './PreyPanel';
import { AscensionPanel } from './AscensionPanel';
import { DepotPanel } from './DepotPanel';
import { QuestPanel } from './QuestPanel';
import { BotPanel } from './BotPanel';
import { GmPanel } from './GmPanel';
import { HighscoresModal } from './HighscoresModal';
import { KillStatsModal } from './KillStatsModal';
import { DeathLogModal } from './DeathLogModal';
import { OracleModal } from './OracleModal';
import { ReforgeModal } from './ReforgeModal';
import { TutorialModal } from './TutorialModal';
import { WikiModal } from './WikiModal';
import { HuntAnalyzer } from './HuntAnalyzer'; 
import { StatsPanel } from './StatsPanel'; 
import { HazardPanel } from './HazardPanel'; 
import { OfflineModal } from './OfflineModal'; 
import { DeathModal } from './DeathModal';
import { Sidebar } from './Sidebar'; 
import { MarketPanel } from './MarketPanel';
import { ChatPanel } from './ChatPanel';
import { StorageService } from '../services/storage';
import { ImbuementPanel } from './ImbuementPanel';
import { APP_VERSION } from '../constants/config';
import { supabase } from '../lib/supabase';
import { 
    LogOut, Trophy, Compass, Map, 
    CircleDollarSign, Crown, Ghost, ShoppingBag, 
    Skull, Briefcase, Bot, Shield, 
    Swords, Landmark, ScrollText, BookOpen, AlertTriangle, Sparkles, Store, RefreshCw, BarChart3, MessageSquare
} from 'lucide-react';

const App = () => {
  const { isAuthenticated, loadedPlayer, currentAccount, currentAccountName, login, register, authError, isAuthLoading, logout } = useAuth();
  const { player, logs, hits, activeMonster, currentMonsterHp, reforgeResult, activeTutorial, actions, analyzerHistory, sessionKills, offlineReport, deathReport, gameSpeed } = useGameEngine(loadedPlayer, currentAccount);
  const { t } = useLanguage(); 
  const [activeTab, setActiveTab] = useState('hunt'); 
  const [showHighscores, setShowHighscores] = useState(false);
  const [showKillStats, setShowKillStats] = useState(false);
  const [showDeathLog, setShowDeathLog] = useState(false);
  const [showWiki, setShowWiki] = useState(false); 
  const [showAnalyzer, setShowAnalyzer] = useState(false); 
  const [showStats, setShowStats] = useState(false); 
  const [highscoresData, setHighscoresData] = useState<any>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
        const { data } = await supabase.from('system_config').select('value').eq('key', 'min_version').single();
        if (data && data.value !== APP_VERSION) setUpdateAvailable(true);
    };
    checkVersion();
    const interval = setInterval(checkVersion, 600000); 
    return () => clearInterval(interval);
  }, []);

  const fetchHighscores = async () => {
      const data = await StorageService.getHighscores(currentAccount);
      setHighscoresData(data);
      setShowHighscores(true);
  };

  if (isAuthLoading) {
      return (
          <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-gray-500">
              <div className="w-12 h-12 border-4 border-t-yellow-500 border-gray-800 rounded-full animate-spin mb-4"></div>
              <span className="text-xs uppercase tracking-widest font-bold">Conectando ao Servidor...</span>
          </div>
      );
  }

  if (!isAuthenticated || !player) {
    return <AuthScreen onLogin={login} onRegister={register} onImport={()=>{}} errorMsg={authError} isLoading={isAuthLoading} />;
  }

  const handleLogout = async () => {
      if (currentAccount && player) {
          await StorageService.save(currentAccount, { ...player, lastSaveTime: Date.now() });
      }
      logout();
  };

  const MENU_CATEGORIES = [
      {
          title: t('cat_caves'),
          items: [
              { id: 'hunt', label: t('menu_hunt'), icon: Swords, color: 'text-red-400' },
              { id: 'tasks', label: t('menu_tasks'), icon: Skull, color: 'text-orange-400' },
              { id: 'prey', label: t('menu_prey'), icon: Compass, color: 'text-blue-300' },
              { id: 'hazard', label: 'Hazard System', icon: AlertTriangle, color: 'text-red-600' }, 
              { id: 'quests', label: t('menu_quests'), icon: Map, color: 'text-yellow-600' },
          ]
      },
      {
          title: t('cat_city'),
          items: [
              { id: 'chat', label: 'Chat Global', icon: MessageSquare, color: 'text-cyan-400' },
              { id: 'market', label: 'Mercado Global', icon: Store, color: 'text-yellow-500' },
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
              { id: 'imbuement', label: 'Imbuements', icon: Sparkles, color: 'text-purple-400' },
              { id: 'ascension', label: t('menu_ascension'), icon: Ghost, color: 'text-purple-300' },
              { id: 'bot', label: t('menu_bot'), icon: Bot, color: 'text-cyan-400' },
          ]
      },
      {
          title: t('cat_system'),
          items: [
              { id: 'store', label: t('menu_store'), icon: ShoppingBag, color: 'text-green-500' },
              { id: 'highscores', label: t('menu_highscores'), icon: Trophy, color: 'text-yellow-500', action: fetchHighscores },
              { id: 'killstats', label: 'Kill Statistics', icon: BarChart3, color: 'text-red-500', action: () => setShowKillStats(true) },
              { id: 'deathlog', label: 'Deathlog Global', icon: Skull, color: 'text-orange-600', action: () => setShowDeathLog(true) },
              { id: 'wiki', label: t('menu_wiki'), icon: BookOpen, color: 'text-blue-300', action: () => setShowWiki(true) },
              { id: 'logout', label: t('menu_logout'), icon: LogOut, color: 'text-red-500', action: handleLogout },
          ]
      }
  ];

  return (
    <div className="flex h-screen w-screen bg-[#0d0d0d] text-gray-200 font-sans overflow-hidden select-none">
        
        {updateAvailable && (
            <div className="fixed top-0 left-0 right-0 z-[1000] bg-blue-600 text-white p-2 text-center text-xs font-bold shadow-2xl animate-in slide-in-from-top duration-500 flex items-center justify-center gap-3">
                <Sparkles size={16} /> UMA NOVA VERSÃO DO JOGO ESTÁ DISPONÍVEL!
                <button onClick={() => window.location.reload()} className="bg-white text-blue-600 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-50">
                    <RefreshCw size={12}/> RECARREGAR AGORA
                </button>
            </div>
        )}

        <Sidebar activeTab={activeTab} onMenuClick={setActiveTab} menuCategories={MENU_CATEGORIES} />

        <div className="flex-1 flex flex-col min-w-0 h-full relative z-10 bg-[#121212]">
            <div className="flex-1 overflow-hidden relative shadow-inner">
                {activeTab === 'hunt' && (
                    <HuntPanel player={player} activeHunt={player.activeHuntId} activeMonster={activeMonster} bossCooldowns={player.bossCooldowns} onStartHunt={actions.startHunt} onStopHunt={actions.stopHunt} currentMonsterHp={currentMonsterHp} hits={hits} />
                )}
                {activeTab === 'train' && <TrainingPanel player={player} isTraining={!!player.activeTrainingSkill} trainingSkill={player.activeTrainingSkill} onStartTraining={actions.startTraining} onStopTraining={actions.stopTraining}/>}
                
                {activeTab === 'chat' && (
                    <ChatPanel player={player} userId={currentAccount!} />
                )}

                {activeTab === 'market' && (
                    <MarketPanel 
                        player={player} 
                        userId={currentAccount!} 
                        onBuyMarket={actions.buyFromMarket} 
                        onListMarket={(item, price) => actions.listOnMarket(item, price, currentAccount!, currentAccountName!)} 
                        onCancelMarket={actions.cancelListing} 
                    />
                )}

                {activeTab === 'shop' && <ShopPanel playerGold={player.gold} playerBankGold={player.bankGold} playerLevel={player.level} playerEquipment={player.equipment} playerInventory={player.inventory} playerUniqueInventory={player.uniqueInventory} playerQuests={player.quests} skippedLoot={player.skippedLoot} playerHasBlessing={player.hasBlessing} isGm={player.isGm} onBuyItem={actions.buyItem} onSellItem={actions.sellItem} onToggleSkippedLoot={actions.toggleSkippedLoot} onBuyBlessing={actions.handleBuyBlessing} />}
                {activeTab === 'castle' && <CastlePanel player={player} onPromote={actions.promotePlayer} onBuyBlessing={actions.handleBuyBlessing} />}
                {activeTab === 'store' && <StorePanel player={player} onBuyCoins={actions.buyCoins} onBuyPremium={actions.buyPremium} onBuyBoost={actions.buyBoost} />}
                {activeTab === 'bank' && <BankPanel playerGold={player.gold} bankGold={player.bankGold} onDeposit={actions.depositGold} onWithdraw={actions.withdrawGold} />}
                {activeTab === 'spells' && <SpellPanel player={player} onBuySpell={actions.buySpell} />}
                {activeTab === 'tasks' && <TaskPanel player={player} onSelectTask={actions.selectTask} onCancelTask={actions.cancelTask} onRerollTasks={actions.rerollTasks} onClaimReward={actions.claimTaskReward} onRerollSpecific={actions.rerollSpecificTask} />}
                {activeTab === 'prey' && <PreyPanel player={player} onReroll={actions.rerollPrey} onRerollAll={actions.rerollAllPrey} onActivate={actions.activatePrey} onCancel={actions.cancelPrey} />}
                {activeTab === 'hazard' && <HazardPanel player={player} onStartHunt={(id, name, isBoss) => actions.startHunt(id, name, isBoss, 1)} bossCooldowns={player.bossCooldowns} onSetActiveHazard={actions.setActiveHazardLevel} onChallengeBoss={(id, name, cost) => { actions.removeGold(cost); actions.startHunt(id, name, true, 1); setActiveTab('hunt'); }} />} 
                {activeTab === 'ascension' && <AscensionPanel player={player} onAscend={actions.ascend} onUpgrade={actions.upgradeAscension} />}
                {activeTab === 'imbuement' && <ImbuementPanel player={player} onImbu={actions.handleImbu} onToggleActive={actions.handleToggleImbuActive} />}
                {activeTab === 'depot' && <DepotPanel playerDepot={player.depot} playerUniqueDepot={player.uniqueDepot} onWithdrawItem={actions.withdrawItem} />}
                {activeTab === 'quests' && <QuestPanel playerQuests={player.quests} onClaimQuest={actions.claimQuest} playerLevel={player.level} />}
                {activeTab === 'bot' && <BotPanel player={player} onUpdateSettings={actions.updateSettings} />}
            </div>
            <div className="h-[180px] border-t-2 border-[#333] bg-black shadow-[0_-5px_15px_rgba(0,0,0,0.5)] z-20"><LogPanel logs={logs} /></div>
        </div>

        <div className="w-[300px] flex flex-col bg-[#222] border-l border-[#111] shadow-2xl shrink-0 z-20 h-full">
            <div className="flex-1 overflow-hidden relative text-center pt-2">
                <div className="text-[10px] text-yellow-600 font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded mx-4 border border-yellow-900/30 truncate">
                   Conta: {currentAccountName}
                </div>
                <CharacterPanel player={player} onUpdateSettings={actions.updateSettings} onEquipItem={actions.equipItem} onDepositItem={actions.depositItem} onDiscardItem={actions.discardItem} onToggleSkippedLoot={actions.toggleSkippedLoot} onUnequipItem={actions.unequipItem} onReforgeItem={actions.reforgeItem} onToggleAnalyzer={() => setShowAnalyzer(!showAnalyzer)} onToggleStats={() => setShowStats(!showStats)} />
            </div>
        </div>

        <HighscoresModal isOpen={showHighscores} onClose={() => setShowHighscores(false)} data={highscoresData} />
        <KillStatsModal isOpen={showKillStats} onClose={() => setShowKillStats(false)} />
        <DeathLogModal isOpen={showDeathLog} onClose={() => setShowDeathLog(false)} />
        <WikiModal isOpen={showWiki} onClose={() => setShowWiki(false)} />
        <HuntAnalyzer isOpen={showAnalyzer} onClose={() => setShowAnalyzer(false)} onReset={actions.resetAnalyzer} history={analyzerHistory} />
        <StatsPanel player={player} isOpen={showStats} onClose={() => setShowStats(false)} />
        {reforgeResult && <ReforgeModal oldItem={reforgeResult.oldItem} newItem={reforgeResult.newItem} onClose={actions.closeReforgeModal} />}
        {activeTutorial && <TutorialModal type={activeTutorial} onClose={actions.closeTutorial} />}
        <OracleModal player={player} onChooseName={actions.chooseName} onChooseVocation={actions.chooseVocation} />
        {player.isGm && <GmPanel player={player} gameSpeed={gameSpeed} onLevelUp={actions.gmLevelUp} onSkillUp={actions.gmSkillUp} onAddGold={actions.gmAddGold} onAddGoldTokens={actions.gmAddGoldTokens} onAddSoulPoints={actions.gmAddSoulPoints} onAddBags={actions.gmAddBags} onSetRarity={actions.gmSetRarity} onSetSpeed={actions.setGameSpeed} onSetHazard={actions.gmSetHazardLevel} />}
        {offlineReport && <OfflineModal report={offlineReport} onClose={actions.closeOfflineModal} />}
        {deathReport && <DeathModal report={deathReport} onClose={actions.closeDeathModal} />}
    </div>
  );
};

export default App;
