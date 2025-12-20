
import { useState, useEffect, useRef } from 'react';
import { Player, LogEntry, HitSplat, Item, Monster, OfflineReport, SkillType } from '../types';
import { processGameTick, calculateOfflineProgress, StorageService, generateTaskOptions } from '../services';
import { BOSSES, INITIAL_PLAYER_STATS } from '../constants';
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
      setOfflineReport
  );

  useEffect(() => {
      if (initialPlayer) {
          const migratedPlayer = { ...initialPlayer };
          
          // --- MIGRATION: Ensure all fields exist for older saves ---
          if (!migratedPlayer.skills) migratedPlayer.skills = { ...INITIAL_PLAYER_STATS.skills };
          Object.values(SkillType).forEach(s => {
              if (!migratedPlayer.skills[s as SkillType]) {
                  migratedPlayer.skills[s as SkillType] = { level: 10, progress: 0 };
              }
          });

          if (migratedPlayer.attackCooldown === undefined) migratedPlayer.attackCooldown = 0;
          if (migratedPlayer.healingCooldown === undefined) migratedPlayer.healingCooldown = 0;
          if (migratedPlayer.globalCooldown === undefined) migratedPlayer.globalCooldown = 0;
          if (migratedPlayer.runeCooldown === undefined) migratedPlayer.runeCooldown = 0;
          if (!migratedPlayer.purchasedSpells) migratedPlayer.purchasedSpells = [];
          if (!migratedPlayer.spellCooldowns) migratedPlayer.spellCooldowns = {};
          
          if (!migratedPlayer.settings) migratedPlayer.settings = { ...INITIAL_PLAYER_STATS.settings };
          if (!migratedPlayer.settings.attackSpellRotation) migratedPlayer.settings.attackSpellRotation = [];

          if (!migratedPlayer.uniqueInventory) migratedPlayer.uniqueInventory = [];
          if (!migratedPlayer.uniqueDepot) migratedPlayer.uniqueDepot = []; 
          if (!migratedPlayer.skippedLoot) migratedPlayer.skippedLoot = [];
          
          if (!migratedPlayer.prey) migratedPlayer.prey = INITIAL_PLAYER_STATS.prey;
          if (migratedPlayer.prey.rerollsAvailable === undefined) migratedPlayer.prey.rerollsAvailable = 3;

          if (!migratedPlayer.tutorials) migratedPlayer.tutorials = INITIAL_PLAYER_STATS.tutorials;
          if (!migratedPlayer.ascension) migratedPlayer.ascension = INITIAL_PLAYER_STATS.ascension;
          if (!migratedPlayer.imbuements) migratedPlayer.imbuements = INITIAL_PLAYER_STATS.imbuements;
          if (migratedPlayer.imbuActive === undefined) migratedPlayer.imbuActive = true;

          if (!migratedPlayer.taskOptions || migratedPlayer.taskOptions.length !== 8) {
              migratedPlayer.taskOptions = generateTaskOptions(migratedPlayer.level);
          }
          
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
          let tempActiveMonster = activeMonster; 
          
          let batchLogs: LogEntry[] = [];
          let batchHits: HitSplat[] = [];
          let batchKills: { [name: string]: number } = {};
          let batchStats = { xp: 0, profit: 0, waste: 0 };
          
          let stopBatchHunt = false;
          let stopBatchTrain = false;

          for (let i = 0; i < ticksToProcess; i++) {
              const simTime = lastTickRef.current + ((i + 1) * tickDuration);
              const result = processGameTick(tempPlayer, tempPlayer.activeHuntId, tempPlayer.activeTrainingSkill, tempMonsterHp, simTime);
              
              tempPlayer = result.player;
              tempMonsterHp = result.monsterHp;
              tempActiveMonster = result.activeMonster;

              if (result.newLogs.length > 0) batchLogs.push(...result.newLogs);
              if (result.newHits.length > 0) batchHits.push(...result.newHits);
              if (result.killedMonsters.length > 0) {
                  result.killedMonsters.forEach(kill => { batchKills[kill.name] = (batchKills[kill.name] || 0) + kill.count; });
              }
              batchStats.xp += result.stats.xpGained;
              batchStats.profit += result.stats.profitGained;
              batchStats.waste += result.stats.waste;

              if (result.stopHunt) { stopBatchHunt = true; break; }
              if (result.stopTrain) { stopBatchTrain = true; break; }
          }

          lastTickRef.current += (ticksToProcess * tickDuration);

          if (batchLogs.length > 0) setLogs(prev => [...prev, ...batchLogs].slice(-100));
          if (batchHits.length > 0) setHits(prev => [...prev, ...batchHits].filter(h => h.id > now - 2000).slice(-50));
          if (Object.keys(batchKills).length > 0) {
              setSessionKills(prev => {
                  const newState = { ...prev };
                  Object.entries(batchKills).forEach(([name, count]) => { newState[name] = (newState[name] || 0) + count; });
                  return newState;
              });
          }
          if (batchStats.xp > 0 || batchStats.profit > 0 || batchStats.waste > 0) {
              setAnalyzerHistory(prev => [...prev, { timestamp: now, xp: batchStats.xp, profit: batchStats.profit, waste: batchStats.waste }].slice(-3600));
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
      };

      worker.onmessage = () => runGameLoop();
      const interval = 1000 / gameSpeed;
      worker.postMessage({ type: 'START', interval });

      return () => {
          worker.postMessage({ type: 'STOP' });
          worker.terminate();
      };
  }, [!!player, isPaused, gameSpeed]);

  return { player, logs, hits, activeMonster, currentMonsterHp, reforgeResult, activeTutorial, actions, analyzerHistory, sessionKills, offlineReport, gameSpeed };
};
