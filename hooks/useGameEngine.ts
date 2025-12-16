
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

  // Game Loop using Web Worker to prevent throttling
  useEffect(() => {
      if (!player) return;
      if (isPaused) return;

      // Create Worker
      const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));

      worker.onmessage = () => {
          if (!playerRef.current) return;
          if (isPaused) return; 
          
          const now = Date.now();
          // Use Ref for monsterHp to avoid stale closure (0 hp bug)
          const result = processGameTick(playerRef.current, playerRef.current.activeHuntId, playerRef.current.activeTrainingSkill, monsterHpRef.current, now);
          
          // Update Analyzer History (Rolling 15 min window)
          setAnalyzerHistory(prev => {
              const newEntry = { timestamp: now, xp: result.stats.xpGained, profit: result.stats.profitGained, waste: result.stats.waste };
              const newHistory = [...prev, newEntry];
              if (newHistory.length > 3600) return newHistory.slice(-3600);
              return newHistory;
          });

          // UPDATE KILL COUNTS RELIABLY
          if (result.killedMonsters && result.killedMonsters.length > 0) {
              setSessionKills(prev => {
                  const newState = { ...prev };
                  result.killedMonsters.forEach(kill => {
                      newState[kill.name] = (newState[kill.name] || 0) + kill.count;
                  });
                  return newState;
              });
          }

          // CHECK FOR TRIGGERS
          if (result.triggers.tutorial) {
              setIsPaused(true);
              setActiveTutorial(result.triggers.tutorial);
              
              // Immediately update player tutorial state to prevent re-trigger
              const updatedPlayer = { ...result.player };
              if (result.triggers.tutorial === 'mob') updatedPlayer.tutorials.seenRareMob = true;
              if (result.triggers.tutorial === 'item') updatedPlayer.tutorials.seenRareItem = true;
              if (result.triggers.tutorial === 'ascension') updatedPlayer.tutorials.seenAscension = true;
              if (result.triggers.tutorial === 'level12') updatedPlayer.tutorials.seenLevel12 = true;
              
              setPlayer(updatedPlayer);
          } else if (result.triggers.oracle) {
              // Pause game for Oracle decision (Level 2 Name / Level 8 Vocation)
              setIsPaused(true);
              setPlayer(result.player);
          } else {
              setPlayer(result.player);
          }

          if (result.newLogs.length > 0) setLogs(prev => [...prev, ...result.newLogs].slice(-100)); // Keep last 100
          if (result.newHits.length > 0) setHits(prev => [...prev, ...result.newHits].filter(h => h.id > now - 2000)); // cleanup old hits
          
          // Monster State - Sync Ref and State
          monsterHpRef.current = result.monsterHp;
          setActiveMonster(result.activeMonster);
          setCurrentMonsterHp(result.monsterHp);

          if (result.stopHunt) {
              setPlayer(prev => prev ? ({ ...prev, activeHuntId: null, activeHuntStartTime: 0 }) : null);
              monsterHpRef.current = 0; // Reset internal HP ref on stop
          }
          if (result.stopTrain) {
              setPlayer(prev => prev ? ({ ...prev, activeTrainingSkill: null, activeTrainingStartTime: 0 }) : null);
          }
      };

      // Start the worker timer
      const interval = 1000 / gameSpeed;
      worker.postMessage({ type: 'START', interval });

      return () => {
          worker.postMessage({ type: 'STOP' });
          worker.terminate();
      };
  }, [!!player, isPaused, gameSpeed]); // Restart loop if speed changes

  return { player, logs, hits, activeMonster, currentMonsterHp, reforgeResult, activeTutorial, actions, analyzerHistory, sessionKills, offlineReport, gameSpeed };
};
