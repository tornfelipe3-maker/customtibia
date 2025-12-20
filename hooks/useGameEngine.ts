
import { useState, useEffect, useRef } from 'react';
import { Player, LogEntry, HitSplat, Item, Monster, OfflineReport, ImbuType, DeathReport } from '../types';
import { processGameTick, calculateOfflineProgress, StorageService, generateTaskOptions, resetCombatState } from '../services';
import { BOSSES } from '../constants';
import { useGameActions } from './useGameActions';

const WORKER_CODE = `
self.onmessage = function(e) {
    if (e.data.type === 'START') {
        if (self.timer) clearInterval(self.timer);
        self.timer = setInterval(() => {
            self.postMessage('TICK');
        }, Math.max(10, e.data.interval)); 
    } else if (e.data.type === 'STOP') {
        if (self.timer) clearInterval(self.timer);
    }
};
`;

export const useGameEngine = (initialPlayer: Player | null, accountName: string | null) => {
  const [player, setPlayer] = useState<Player | null>(initialPlayer);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [hits, setHits] = useState<HitSplat[]>([]);
  const [activeMonster, setActiveMonster] = useState<Monster | undefined>(undefined);
  const [currentMonsterHp, setCurrentMonsterHp] = useState<number>(0);
  const [reforgeResult, setReforgeResult] = useState<{ oldItem: Item, newItem: Item } | null>(null);
  const [gameSpeed, setGameSpeed] = useState<number>(1); 
  
  const [analyzerHistory, setAnalyzerHistory] = useState<{ timestamp: number, xp: number, profit: number, waste: number }[]>([]);
  const [sessionKills, setSessionKills] = useState<{[name: string]: number}>({});
  const [offlineReport, setOfflineReport] = useState<OfflineReport | null>(null);
  const [deathReport, setDeathReport] = useState<DeathReport | null>(null);

  const [isPaused, setIsPaused] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState<'mob' | 'item' | 'ascension' | 'level12' | null>(null);

  const playerRef = useRef<Player | null>(initialPlayer);
  const monsterHpRef = useRef<number>(0);
  const lastTickRef = useRef<number>(Date.now());
  
  const addLog = (message: string, type: LogEntry['type'] = 'info', rarity?: any) => {
      setLogs(prev => [...prev, { id: Math.random().toString(), message, type, timestamp: Date.now(), rarity }]);
  };

  const actions = useGameActions(
      playerRef, 
      setPlayer,
      setGameSpeed,
      setAnalyzerHistory,
      setIsPaused,
      setActiveTutorial,
      setReforgeResult,
      addLog,
      monsterHpRef,
      setCurrentMonsterHp,
      setActiveMonster,
      setSessionKills,
      setOfflineReport,
      setDeathReport
  );

  useEffect(() => {
      if (initialPlayer) {
          const migratedPlayer = { ...initialPlayer };

          // --- MIGRATION: IMBUEMENTS (ANTI-CRASH) ---
          if (!migratedPlayer.imbuements) {
              migratedPlayer.imbuements = {
                  [ImbuType.LIFE_STEAL]: { tier: 0, timeRemaining: 0 },
                  [ImbuType.MANA_LEECH]: { tier: 0, timeRemaining: 0 },
                  [ImbuType.STRIKE]: { tier: 0, timeRemaining: 0 }
              };
          }
          if (migratedPlayer.imbuActive === undefined) migratedPlayer.imbuActive = true;
          // -------------------------------------------

          if (!migratedPlayer.uniqueInventory) migratedPlayer.uniqueInventory = [];
          if (!migratedPlayer.uniqueDepot) migratedPlayer.uniqueDepot = []; 
          if (!migratedPlayer.relics) migratedPlayer.relics = [];
          if (!migratedPlayer.runeCooldown) migratedPlayer.runeCooldown = 0;
          if (!migratedPlayer.gmExtra) migratedPlayer.gmExtra = { forceRarity: null };
          if (!migratedPlayer.skippedLoot) migratedPlayer.skippedLoot = [];
          if (migratedPlayer.prey && migratedPlayer.prey.rerollsAvailable === undefined) migratedPlayer.prey.rerollsAvailable = 3;
          if (migratedPlayer.taskNextFreeReroll === undefined) migratedPlayer.taskNextFreeReroll = 0;
          if (!migratedPlayer.settings.attackSpellRotation) migratedPlayer.settings.attackSpellRotation = [];
          if (migratedPlayer.isNameChosen === undefined) migratedPlayer.isNameChosen = migratedPlayer.level > 2;
          
          if (migratedPlayer.healthPotionCooldown === undefined) migratedPlayer.healthPotionCooldown = 0;
          if (migratedPlayer.manaPotionCooldown === undefined) migratedPlayer.manaPotionCooldown = 0;

          if (!migratedPlayer.tutorials) {
              migratedPlayer.tutorials = { 
                  introCompleted: false, seenRareMob: false, seenRareItem: false, 
                  seenAscension: false, seenLevel12: false, seenMenus: []
              };
          } else {
              const tuts = migratedPlayer.tutorials as any;
              if (tuts.introCompleted === undefined) tuts.introCompleted = false;
              if (tuts.seenMenus === undefined) tuts.seenMenus = [];
              if (tuts.seenAscension === undefined) tuts.seenAscension = false;
              if (tuts.seenLevel12 === undefined) tuts.seenLevel12 = false;
          }

          if (migratedPlayer.activeHazardLevel === undefined) migratedPlayer.activeHazardLevel = 0;

          if (!migratedPlayer.taskOptions || migratedPlayer.taskOptions.length !== 8) {
              migratedPlayer.taskOptions = generateTaskOptions(migratedPlayer.level);
          }
          migratedPlayer.taskOptions = migratedPlayer.taskOptions.map(t => ({
              ...t,
              status: t.status || 'available',
              category: t.category || t.type 
          }));
          
          const { player: updatedPlayer, report, stopHunt, stopTrain } = calculateOfflineProgress(migratedPlayer, migratedPlayer.lastSaveTime);
          
          if (report) {
              setOfflineReport(report); 
              setIsPaused(true); 
          }
          if (stopHunt) updatedPlayer.activeHuntId = null;
          if (stopTrain) updatedPlayer.activeTrainingSkill = null;
          
          setPlayer(updatedPlayer);
          playerRef.current = updatedPlayer;
          lastTickRef.current = Date.now();
      }
  }, [initialPlayer]);

  useEffect(() => {
      if (offlineReport !== null || deathReport !== null) setIsPaused(true);
  }, [offlineReport, deathReport]);

  useEffect(() => {
      if (!accountName) return;
      const timer = setInterval(() => {
          if (playerRef.current) {
              const toSave = { ...playerRef.current, lastSaveTime: Date.now() };
              if (!toSave.uniqueDepot) toSave.uniqueDepot = []; 
              StorageService.save(accountName, toSave);
          }
      }, 30000);
      return () => clearInterval(timer);
  }, [accountName]);

  useEffect(() => {
      if (!player) return;
      if (isPaused) {
          lastTickRef.current = Date.now();
          return;
      }

      const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));

      const runGameLoop = () => {
          if (!playerRef.current) return;
          if (isPaused) {
              lastTickRef.current = Date.now();
              return; 
          }
          
          const now = Date.now();
          const tickDuration = 1000 / gameSpeed;
          let delta = now - lastTickRef.current;
          
          const MAX_SIMULATION_MS = 15 * 60 * 1000; 

          if (delta > MAX_SIMULATION_MS) { 
              const { player: fastForwardedPlayer, report, stopHunt, stopTrain } = calculateOfflineProgress(playerRef.current, lastTickRef.current);
              
              if (report && (report.xpGained > 0 || report.goldGained > 0 || report.skillGain)) {
                  const xp = report.xpGained;
                  const gold = report.goldGained;
                  const waste = report.waste || 0;
                  
                  setAnalyzerHistory(prev => {
                      const newEntry = { timestamp: now, xp, profit: gold, waste };
                      const newHistory = [...prev, newEntry];
                      if (newHistory.length > 3600) return newHistory.slice(-3600);
                      return newHistory;
                  });

                  const timeAway = Math.floor(report.secondsOffline);
                  if (timeAway > 60) {
                      addLog(`Deep Sleep (${Math.floor(timeAway/60)}m): +${xp.toLocaleString()} XP, +${gold.toLocaleString()} Gold.`, 'info');
                  }
                  
                  if (stopHunt) {
                      fastForwardedPlayer.activeHuntId = null;
                      addLog("Hunt stopped (Time Limit or Resource).", 'danger');
                      setActiveMonster(undefined);
                      setCurrentMonsterHp(0);
                      monsterHpRef.current = 0;
                  }
                  if (stopTrain) {
                      fastForwardedPlayer.activeTrainingSkill = null;
                      addLog("Training stopped (Time Limit).", 'danger');
                  }
              }

              setPlayer(fastForwardedPlayer);
              playerRef.current = fastForwardedPlayer;
              lastTickRef.current = now;
              return;
          }

          let ticksToProcess = Math.floor(delta / tickDuration);
          if (ticksToProcess <= 0) return;

          let tempPlayer = playerRef.current;
          let tempMonsterHp = monsterHpRef.current;
          let tempActiveMonster = activeMonster; 
          
          let batchLogs: LogEntry[] = [];
          let batchHits: HitSplat[] = [];
          let batchKills: { [name: string]: number } = {};
          let batchStats = { xp: 0, profit: 0, waste: 0 };
          
          let stopBatchHunt = false;
          let stopBatchTrain = false;
          let triggerUpdate = null;

          for (let i = 0; i < ticksToProcess; i++) {
              const simTime = lastTickRef.current + ((i + 1) * tickDuration);
              const result = processGameTick(tempPlayer, tempPlayer.activeHuntId, tempPlayer.activeTrainingSkill, tempMonsterHp, simTime);
              
              tempPlayer = result.player;
              tempMonsterHp = result.monsterHp;
              tempActiveMonster = result.activeMonster;

              if (result.newLogs.length > 0) batchLogs.push(...result.newLogs);
              if (result.newHits.length > 0) batchHits.push(...result.newHits);
              
              if (result.killedMonsters.length > 0) {
                  result.killedMonsters.forEach(kill => {
                      batchKills[kill.name] = (batchKills[kill.name] || 0) + kill.count;
                  });
              }

              batchStats.xp += result.stats.xpGained;
              batchStats.profit += result.stats.profitGained;
              batchStats.waste += result.stats.waste;

              if (result.triggers.tutorial || result.triggers.oracle || result.triggers.death) triggerUpdate = result.triggers;
              if (result.stopHunt) { stopBatchHunt = true; break; }
              if (result.stopTrain) { stopBatchTrain = true; break; }
          }

          lastTickRef.current += (ticksToProcess * tickDuration);

          if (batchLogs.length > 0) setLogs(prev => [...prev, ...batchLogs].slice(-100));
          if (batchHits.length > 0) setHits(prev => [...prev, ...batchHits].filter(h => h.id > now - 2000).slice(-50));

          if (Object.keys(batchKills).length > 0) {
              setSessionKills(prev => {
                  const newState = { ...prev };
                  Object.entries(batchKills).forEach(([name, count]) => {
                      newState[name] = (newState[name] || 0) + count;
                  });
                  return newState;
              });
          }

          if (batchStats.xp > 0 || batchStats.profit > 0 || batchStats.waste > 0) {
              setAnalyzerHistory(prev => {
                  const newEntry = { timestamp: now, xp: batchStats.xp, profit: batchStats.profit, waste: batchStats.waste };
                  const newHistory = [...prev, newEntry];
                  if (newHistory.length > 3600) return newHistory.slice(-3600);
                  return newHistory;
              });
          }

          if (triggerUpdate) {
              if (triggerUpdate.tutorial) {
                  setIsPaused(true);
                  setActiveTutorial(triggerUpdate.tutorial);
                  if (triggerUpdate.tutorial === 'mob') tempPlayer.tutorials.seenRareMob = true;
                  if (triggerUpdate.tutorial === 'item') tempPlayer.tutorials.seenRareItem = true;
                  if (triggerUpdate.tutorial === 'ascension') tempPlayer.tutorials.seenAscension = true;
                  if (triggerUpdate.tutorial === 'level12') tempPlayer.tutorials.seenLevel12 = true;
              } else if (triggerUpdate.oracle) {
                  setIsPaused(true);
              } else if (triggerUpdate.death) {
                  setIsPaused(true);
                  setDeathReport(triggerUpdate.death);
              }
          }

          playerRef.current = tempPlayer; 
          setPlayer(tempPlayer);
          monsterHpRef.current = tempMonsterHp;
          setActiveMonster(tempActiveMonster);
          setCurrentMonsterHp(tempMonsterHp);

          if (stopBatchHunt) {
              const resetPlayer = { ...tempPlayer, activeHuntId: null, activeHuntStartTime: 0 };
              playerRef.current = resetPlayer;
              setPlayer(resetPlayer);
              monsterHpRef.current = 0;
          }
          if (stopBatchTrain) {
              const resetPlayer = { ...tempPlayer, activeTrainingSkill: null, activeTrainingStartTime: 0 };
              playerRef.current = resetPlayer;
              setPlayer(resetPlayer);
          }
      };

      worker.onmessage = () => runGameLoop();

      const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
              runGameLoop();
          }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      const interval = 1000 / gameSpeed;
      worker.postMessage({ type: 'START', interval });

      return () => {
          worker.postMessage({ type: 'STOP' });
          worker.terminate();
          document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
  }, [!!player, isPaused, gameSpeed]);

  return { player, logs, hits, activeMonster, currentMonsterHp, reforgeResult, activeTutorial, actions, analyzerHistory, sessionKills, offlineReport, deathReport, gameSpeed };
};
