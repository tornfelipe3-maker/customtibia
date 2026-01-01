import { useState, useEffect, useRef } from 'react';
import { Player, LogEntry, HitSplat, Item, Monster, OfflineReport, ImbuType, DeathReport, AscensionPerk } from '../types';
import { processGameTick, calculateOfflineProgress, StorageService, generateTaskOptions, resetCombatState, validateProgressSanity } from '../services';
// Added MONSTERS to the imports from constants
import { MONSTERS, BOSSES, INITIAL_PLAYER_STATS } from '../constants';
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

export const useGameEngine = (initialPlayer: Player | null, userId: string | null) => {
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
  const killBatchRef = useRef<{[id: string]: number}>({}); // BATCH DE KILLS PARA PERFORMANCE
  
  const addLog = (message: string, type: LogEntry['type'] = 'info', rarity?: any) => {
      setLogs(prev => [...prev, { id: Math.random().toString(), message, type, timestamp: Date.now(), rarity }]);
  };

  const actions = useGameActions(
      playerRef, setPlayer, setGameSpeed, setAnalyzerHistory, setIsPaused, setActiveTutorial, setReforgeResult,
      addLog, monsterHpRef, setCurrentMonsterHp, setActiveMonster, setSessionKills, setOfflineReport, setDeathReport
  );

  useEffect(() => {
    const syncAndStart = async () => {
      if (initialPlayer) {
          const migratedPlayer = { ...initialPlayer };
          const serverNow = await StorageService.getServerTime();
          lastTickRef.current = serverNow;

          if (!migratedPlayer.imbuements) {
              migratedPlayer.imbuements = {
                  [ImbuType.LIFE_STEAL]: { tier: 0, timeRemaining: 0 },
                  [ImbuType.MANA_LEECH]: { tier: 0, timeRemaining: 0 },
                  [ImbuType.STRIKE]: { tier: 0, timeRemaining: 0 }
              };
          }
          if (migratedPlayer.imbuActive === undefined) migratedPlayer.imbuActive = true;
          if (!migratedPlayer.ascension) migratedPlayer.ascension = { ...INITIAL_PLAYER_STATS.ascension };
          if (!migratedPlayer.uniqueInventory) migratedPlayer.uniqueInventory = [];
          if (!migratedPlayer.uniqueDepot) migratedPlayer.uniqueDepot = []; 
          if (!migratedPlayer.tutorials) migratedPlayer.tutorials = { ...INITIAL_PLAYER_STATS.tutorials };
          
          const { player: updatedPlayer, report, stopHunt, stopTrain } = calculateOfflineProgress(migratedPlayer, migratedPlayer.lastSaveTime, serverNow);
          
          if (report && (report.xpGained > 0 || report.goldGained > 0 || report.skillTrained)) {
              setOfflineReport(report); 
              setIsPaused(true); 
          }
          if (stopHunt) updatedPlayer.activeHuntId = null;
          if (stopTrain) updatedPlayer.activeTrainingSkill = null;
          
          updatedPlayer.lastSaveTime = serverNow;
          setPlayer(updatedPlayer);
          playerRef.current = updatedPlayer;
      }
    };
    syncAndStart();
  }, [initialPlayer]);

  // --- PERF: BATCH SYNC DE KILLS E SAVE ---
  useEffect(() => {
      if (!userId) return;
      const timer = setInterval(async () => {
          if (playerRef.current && !isPaused) {
              // Envia Batch de Kills para o Global Stats
              if (Object.keys(killBatchRef.current).length > 0) {
                  const batch = { ...killBatchRef.current };
                  killBatchRef.current = {};
                  await StorageService.syncMonsterKills(batch);
              }
              // Salva Personagem
              await StorageService.save(userId, playerRef.current);
          }
      }, 30000); // A cada 30 segundos
      return () => clearInterval(timer);
  }, [userId, isPaused]);

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
          
          let ticksToProcess = Math.floor(delta / tickDuration);
          if (ticksToProcess <= 0) return;

          let tempPlayer = playerRef.current;
          let tempMonsterHp = monsterHpRef.current;
          
          let batchLogs: LogEntry[] = [];
          let batchHits: HitSplat[] = [];
          let batchStats = { xp: 0, profit: 0, waste: 0 };
          
          let stopBatchHunt = false;
          let triggerUpdate = null;
          // Track the active monster throughout simulated ticks
          let currentTickActiveMonster = activeMonster;

          for (let i = 0; i < ticksToProcess; i++) {
              const simTime = lastTickRef.current + ((i + 1) * tickDuration);
              const result = processGameTick(tempPlayer, tempPlayer.activeHuntId, tempPlayer.activeTrainingSkill, tempMonsterHp, simTime);
              
              tempPlayer = result.player;
              tempMonsterHp = result.monsterHp;
              // Capture active monster from latest simulated tick
              currentTickActiveMonster = result.activeMonster;

              if (result.newLogs.length > 0) batchLogs.push(...result.newLogs);
              if (result.newHits.length > 0) batchHits.push(...result.newHits);
              
              batchStats.xp += result.stats.xpGained;
              batchStats.profit += result.stats.profitGained;
              batchStats.waste += result.stats.waste;

              // Adiciona ao Batch de Kills para performance
              result.killedMonsters.forEach(km => {
                // Fixed line 157: MONSTERS is now imported from constants
                const monster = MONSTERS.find(m => m.name === km.name) || BOSSES.find(b => b.name === km.name);
                if (monster) {
                    killBatchRef.current[monster.id] = (killBatchRef.current[monster.id] || 0) + km.count;
                }
              });

              if (result.triggers.tutorial || result.triggers.death) triggerUpdate = result.triggers;
              if (result.stopHunt) { stopBatchHunt = true; break; }
          }

          lastTickRef.current += (ticksToProcess * tickDuration);

          if (batchLogs.length > 0) setLogs(prev => [...prev, ...batchLogs].slice(-100));
          if (batchHits.length > 0) setHits(prev => [...prev, ...batchHits].filter(h => h.id > now - 2000).slice(-50));

          if (batchStats.xp > 0 || batchStats.profit > 0) {
              setAnalyzerHistory(prev => {
                  const newEntry = { timestamp: now, xp: batchStats.xp, profit: batchStats.profit, waste: batchStats.waste };
                  return [...prev, newEntry].slice(-3600);
              });
          }

          if (triggerUpdate) {
              if (triggerUpdate.tutorial) { setIsPaused(true); setActiveTutorial(triggerUpdate.tutorial); }
              else if (triggerUpdate.death) { 
                  setIsPaused(true); 
                  setDeathReport(triggerUpdate.death); 
                  // LOG GLOBAL DE MORTE
                  StorageService.logGlobalDeath(tempPlayer.name, tempPlayer.level, tempPlayer.vocation, triggerUpdate.death.killerName);
              }
          }

          playerRef.current = tempPlayer; 
          setPlayer(tempPlayer);
          monsterHpRef.current = tempMonsterHp;
          // Fixed line 192: Use the tracked monster from the last processed tick
          setActiveMonster(triggerUpdate?.death ? undefined : currentTickActiveMonster);
          setCurrentMonsterHp(tempMonsterHp);

          if (stopBatchHunt) {
              playerRef.current = { ...tempPlayer, activeHuntId: null, activeHuntStartTime: 0 };
              setPlayer(playerRef.current);
              monsterHpRef.current = 0;
          }
      };

      worker.onmessage = () => runGameLoop();
      worker.postMessage({ type: 'START', interval: 1000 / gameSpeed });

      return () => {
          worker.postMessage({ type: 'STOP' });
          worker.terminate();
      };
  }, [!!player, isPaused, gameSpeed]);

  return { player, logs, hits, activeMonster, currentMonsterHp, reforgeResult, activeTutorial, actions, analyzerHistory, sessionKills, offlineReport, deathReport, gameSpeed };
};
