
import { useState, useEffect, useRef } from 'react';
import { Player, LogEntry, HitSplat, Item, Monster, OfflineReport } from '../types';
import { processGameTick, calculateOfflineProgress, StorageService, generateTaskOptions } from '../services';
import { BOSSES } from '../constants';
import { useGameActions } from './useGameActions';

// Web Worker code to run the timer in a separate thread
// This prevents the browser from throttling the game loop when the tab is inactive
const WORKER_CODE = `
self.onmessage = function(e) {
    if (e.data.type === 'START') {
        if (self.timer) clearInterval(self.timer);
        self.timer = setInterval(() => {
            self.postMessage('TICK');
        }, e.data.interval);
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
  const [gameSpeed, setGameSpeed] = useState<number>(1); // 1x, 2x, 4x
  
  // Analyzer State (Ephemeral)
  const [analyzerHistory, setAnalyzerHistory] = useState<{ timestamp: number, xp: number, profit: number, waste: number }[]>([]);
  const [sessionKills, setSessionKills] = useState<{[name: string]: number}>({}); // NEW: Track kills for analyzer

  // Offline Report State
  const [offlineReport, setOfflineReport] = useState<OfflineReport | null>(null);

  // Tutorial State
  const [isPaused, setIsPaused] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState<'mob' | 'item' | 'ascension' | 'level12' | null>(null);

  // Refs for loop access to prevent stale state closures
  const playerRef = useRef<Player | null>(initialPlayer);
  const monsterHpRef = useRef<number>(0);
  
  // New Ref to track simulation time for background catch-up
  const lastTickRef = useRef<number>(Date.now());
  
  // Sync refs
  useEffect(() => { playerRef.current = player; }, [player]);

  // Helper for Log
  const addLog = (message: string, type: LogEntry['type'] = 'info', rarity?: any) => {
      setLogs(prev => [...prev, { id: Math.random().toString(), message, type, timestamp: Date.now(), rarity }]);
  };

  // --- ACTIONS FACADE ---
  // All business logic is now delegated to this hook to clean up the Engine
  const actions = useGameActions(
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
      setOfflineReport
  );

  // Offline Progress & Migration (Run once on mount/login)
  useEffect(() => {
      if (initialPlayer) {
          // Migration: Ensure new fields exist on old saves
          const migratedPlayer = { ...initialPlayer };
          if (!migratedPlayer.uniqueInventory) migratedPlayer.uniqueInventory = [];
          if (!migratedPlayer.uniqueDepot) migratedPlayer.uniqueDepot = []; // MIGRATION: CRITICAL FIX
          if (!migratedPlayer.relics) migratedPlayer.relics = [];
          if (!migratedPlayer.runeCooldown) migratedPlayer.runeCooldown = 0;
          if (!migratedPlayer.gmExtra) migratedPlayer.gmExtra = { forceRarity: null };
          
          // MIGRATION: Prey Rerolls (If updated from old version)
          if (migratedPlayer.prey && migratedPlayer.prey.rerollsAvailable === undefined) {
              migratedPlayer.prey.rerollsAvailable = 3;
          }
          
          // MIGRATION: Task Free Reroll
          if (migratedPlayer.taskNextFreeReroll === undefined) {
              migratedPlayer.taskNextFreeReroll = 0;
          }

          // MIGRATION: Settings
          if (!migratedPlayer.settings.attackSpellRotation) {
              migratedPlayer.settings.attackSpellRotation = [];
          }

          // MIGRATION: Handle missing isNameChosen
          if (migratedPlayer.isNameChosen === undefined) {
              migratedPlayer.isNameChosen = migratedPlayer.level > 2;
          }
          
          // MIGRATION: Tutorials
          if (!migratedPlayer.tutorials) {
              migratedPlayer.tutorials = { 
                  introCompleted: false, 
                  seenRareMob: false, 
                  seenRareItem: false,
                  seenAscension: false,
                  seenLevel12: false,
                  seenMenus: []
              };
          } else {
              // Ensure new tutorial fields exist on old saves
              const tuts = migratedPlayer.tutorials as any;
              if (tuts.introCompleted === undefined) tuts.introCompleted = false;
              if (tuts.seenMenus === undefined) tuts.seenMenus = [];
              if (tuts.seenAscension === undefined) tuts.seenAscension = false;
              if (tuts.seenLevel12 === undefined) tuts.seenLevel12 = false;
          }

          // MIGRATION: Active Hazard Level
          if (migratedPlayer.activeHazardLevel === undefined) {
              migratedPlayer.activeHazardLevel = 0;
          }

          // MIGRATION: TASK SYSTEM OVERHAUL
          // Ensure taskOptions has 8 slots. If old system (array < 8 or undefined), generate new board.
          // Legacy activeTask is ignored/cleared.
          if (!migratedPlayer.taskOptions || migratedPlayer.taskOptions.length !== 8) {
              migratedPlayer.taskOptions = generateTaskOptions(migratedPlayer.level);
          }
          // Ensure all tasks have 'status'
          migratedPlayer.taskOptions = migratedPlayer.taskOptions.map(t => ({
              ...t,
              status: t.status || 'available',
              category: t.category || t.type // ensure category exists
          }));
          
          const { player: updatedPlayer, report, stopHunt, stopTrain } = calculateOfflineProgress(migratedPlayer, migratedPlayer.lastSaveTime);
          
          if (report) {
              setOfflineReport(report); // Trigger Modal
              setIsPaused(true); // PAUSE GAME until user closes modal
          }
          if (stopHunt) updatedPlayer.activeHuntId = null;
          if (stopTrain) updatedPlayer.activeTrainingSkill = null;
          
          setPlayer(updatedPlayer);
      }
  }, [initialPlayer]);

  // Safety Sync: Ensure game is paused if there is a pending offline report
  useEffect(() => {
      if (offlineReport !== null) {
          setIsPaused(true);
      }
  }, [offlineReport]);

  // Save Loop (every 30s)
  useEffect(() => {
      if (!accountName) return;
      const timer = setInterval(() => {
          if (playerRef.current) {
              // Forced Consistency Check before save
              const toSave = { ...playerRef.current, lastSaveTime: Date.now() };
              if (!toSave.uniqueDepot) toSave.uniqueDepot = []; // Safety check
              StorageService.save(accountName, toSave);
          }
      }, 30000);
      return () => clearInterval(timer);
  }, [accountName]);

  // Game Loop using Web Worker to prevent throttling AND Catch-up Logic
  useEffect(() => {
      if (!player) return;
      if (isPaused) return;

      // Reset the time reference when the game resumes or starts
      lastTickRef.current = Date.now();

      // Create Worker
      const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));

      worker.onmessage = () => {
          if (!playerRef.current) return;
          if (isPaused) {
              // If paused, just keep resetting the clock so we don't accumulate "catch up" while looking at a modal
              lastTickRef.current = Date.now();
              return; 
          }
          
          const now = Date.now();
          const tickDuration = 1000 / gameSpeed;
          
          // Calculate elapsed time since last processed tick
          let delta = now - lastTickRef.current;
          
          // CATCH-UP LOGIC:
          // If delta is huge (e.g. user minimized tab for 10 mins), we have many ticks to process.
          // Cap it to avoid infinite freeze (e.g., max 15 minutes of instant processing).
          // If > 15 mins, the offline estimator on reload is better, but here we cap to be safe.
          const MAX_CATCHUP_MS = 15 * 60 * 1000;
          if (delta > MAX_CATCHUP_MS) {
              delta = MAX_CATCHUP_MS;
              lastTickRef.current = now - MAX_CATCHUP_MS;
          }

          let ticksToProcess = Math.floor(delta / tickDuration);
          
          // If no full tick has passed yet, wait.
          if (ticksToProcess <= 0) return;

          // Prepare Batch Variables
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

          // --- EXECUTE TICKS ---
          for (let i = 0; i < ticksToProcess; i++) {
              // Calculate specific timestamp for this tick to ensure accurate cooldowns
              const simTime = lastTickRef.current + ((i + 1) * tickDuration);
              
              const result = processGameTick(tempPlayer, tempPlayer.activeHuntId, tempPlayer.activeTrainingSkill, tempMonsterHp, simTime);
              
              tempPlayer = result.player;
              tempMonsterHp = result.monsterHp;
              tempActiveMonster = result.activeMonster;

              // Accumulate Outputs
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

              if (result.triggers.tutorial || result.triggers.oracle) {
                  triggerUpdate = result.triggers;
              }

              if (result.stopHunt) {
                  stopBatchHunt = true;
                  // Stop future ticks in this batch from processing combat if hunt stopped
                  if (!result.stopTrain) { // Unless we are training? (Mutually exclusive usually)
                       // Keep processing regeneration if stopped hunting? 
                       // For simplicity, if stop triggered, we break loop to update UI immediately
                       break; 
                  }
              }
              if (result.stopTrain) {
                  stopBatchTrain = true;
                  break;
              }
          }

          // Advance the time reference by the amount we successfully processed
          lastTickRef.current += (ticksToProcess * tickDuration);

          // --- UPDATE STATE BATCH ---
          
          // 1. Logs & Hits (Slice to prevent memory overflow)
          if (batchLogs.length > 0) setLogs(prev => [...prev, ...batchLogs].slice(-100));
          if (batchHits.length > 0) setHits(prev => [...prev, ...batchHits].filter(h => h.id > now - 2000).slice(-50)); // Only show recent hits visually

          // 2. Kills for Analyzer
          if (Object.keys(batchKills).length > 0) {
              setSessionKills(prev => {
                  const newState = { ...prev };
                  Object.entries(batchKills).forEach(([name, count]) => {
                      newState[name] = (newState[name] || 0) + count;
                  });
                  return newState;
              });
          }

          // 3. Analyzer History (One entry per batch to save memory)
          if (batchStats.xp > 0 || batchStats.profit > 0 || batchStats.waste > 0) {
              setAnalyzerHistory(prev => {
                  const newEntry = { timestamp: now, xp: batchStats.xp, profit: batchStats.profit, waste: batchStats.waste };
                  const newHistory = [...prev, newEntry];
                  if (newHistory.length > 3600) return newHistory.slice(-3600);
                  return newHistory;
              });
          }

          // 4. Triggers
          if (triggerUpdate) {
              if (triggerUpdate.tutorial) {
                  setIsPaused(true);
                  setActiveTutorial(triggerUpdate.tutorial);
                  // Update player tutorial flags immediately
                  if (triggerUpdate.tutorial === 'mob') tempPlayer.tutorials.seenRareMob = true;
                  if (triggerUpdate.tutorial === 'item') tempPlayer.tutorials.seenRareItem = true;
                  if (triggerUpdate.tutorial === 'ascension') tempPlayer.tutorials.seenAscension = true;
                  if (triggerUpdate.tutorial === 'level12') tempPlayer.tutorials.seenLevel12 = true;
              } else if (triggerUpdate.oracle) {
                  setIsPaused(true);
              }
          }

          // 5. Final Player & Monster State
          setPlayer(tempPlayer);
          
          monsterHpRef.current = tempMonsterHp;
          setActiveMonster(tempActiveMonster);
          setCurrentMonsterHp(tempMonsterHp);

          if (stopBatchHunt) {
              setPlayer(prev => prev ? ({ ...prev, activeHuntId: null, activeHuntStartTime: 0 }) : null);
              monsterHpRef.current = 0;
          }
          if (stopBatchTrain) {
              setPlayer(prev => prev ? ({ ...prev, activeTrainingSkill: null, activeTrainingStartTime: 0 }) : null);
          }
      };

      // Start the worker timer to wake us up frequently
      // Even if main thread throttles to 1s, the loop above catches up the missing ticks
      const interval = 1000 / gameSpeed;
      worker.postMessage({ type: 'START', interval });

      return () => {
          worker.postMessage({ type: 'STOP' });
          worker.terminate();
      };
  }, [!!player, isPaused, gameSpeed]); // Restart loop if speed changes

  return { player, logs, hits, activeMonster, currentMonsterHp, reforgeResult, activeTutorial, actions, analyzerHistory, sessionKills, offlineReport, gameSpeed };
};
