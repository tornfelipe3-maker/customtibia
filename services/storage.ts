
import { Player, SkillType, Vocation } from '../types';
import { INITIAL_PLAYER_STATS } from '../constants';

const ACCOUNTS_KEY = 'tibia_idle_accounts_v1';

interface AccountDb {
  [accountName: string]: {
    password: string;
    data: Player;
  }
}

export interface HighscoreEntry {
    name: string;
    vocation: string;
    value: number;
    isPlayer: boolean; // To highlight the player in the list
}

export interface HighscoresData {
    [category: string]: HighscoreEntry[];
}

// Mock Data for "Online" feel
const LEGEND_NAMES = [
    'Eternal Oblivion', 'Bubble', 'Cachero', 'Mateusz Dragon Wielki', 'Setzer Gambler', 
    'Arieswar', 'Seromontis', 'Taifun Devilry', 'Lord\'Paulistinha', 'Tripida',
    'Kharsek', 'Moonzinn', 'Bobeek', 'Goraca', 'Dev onica'
];

const generateMockPlayers = (): Player[] => {
    // Generates fake players to populate the leaderboard
    return LEGEND_NAMES.map((name, index) => {
        // Create varied levels based on "legend" status roughly
        const baseLevel = 200 - (index * 10) + Math.floor(Math.random() * 50); 
        const vocation = Object.values(Vocation)[Math.floor(Math.random() * 4) + 1] as Vocation; // Random voc except None/Monk occasionally
        
        return {
            ...INITIAL_PLAYER_STATS,
            name: name,
            level: Math.max(10, baseLevel),
            vocation: vocation,
            // Mock skills roughly based on level
            skills: {
                [SkillType.MAGIC]: { level: Math.floor(baseLevel / 3), progress: 0 },
                [SkillType.SWORD]: { level: Math.floor(baseLevel / 2), progress: 0 },
                [SkillType.AXE]: { level: Math.floor(baseLevel / 2), progress: 0 },
                [SkillType.CLUB]: { level: Math.floor(baseLevel / 2), progress: 0 },
                [SkillType.DISTANCE]: { level: Math.floor(baseLevel / 2), progress: 0 },
                [SkillType.DEFENSE]: { level: Math.floor(baseLevel / 2), progress: 0 },
                [SkillType.FIST]: { level: Math.floor(baseLevel / 4), progress: 0 },
            }
        };
    });
};

export const StorageService = {
  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  async login(account: string, pass: string): Promise<{ success: boolean; data?: Player; error?: string }> {
    await this.delay(300); 

    // --- GM BACKDOOR ---
    if (account.toLowerCase() === 'gamemaster' && pass === 'tibia') {
        // Check if GM data exists in local storage, if not, create a god char
        const dbStr = localStorage.getItem(ACCOUNTS_KEY);
        let gmData: Player;
        
        if (dbStr) {
            const db: AccountDb = JSON.parse(dbStr);
            if (db['gamemaster']) {
                gmData = db['gamemaster'].data;
                gmData.isGm = true; // Ensure flag is always true
                return { success: true, data: gmData };
            }
        }

        // Initialize new GM
        gmData = {
            ...INITIAL_PLAYER_STATS,
            name: 'Gamemaster',
            vocation: Vocation.KNIGHT, // Default GM voc
            isGm: true,
            level: 100, // Start high
            gold: 1000000,
            maxHp: 2000,
            hp: 2000,
            maxMana: 1000,
            mana: 1000,
        };
        
        // Save it so state persists
        await this.save('gamemaster', gmData);
        // Also save password for consistency
        const currentDbStr = localStorage.getItem(ACCOUNTS_KEY);
        let currentDb: AccountDb = currentDbStr ? JSON.parse(currentDbStr) : {};
        currentDb['gamemaster'] = { password: 'tibia', data: gmData };
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(currentDb));

        return { success: true, data: gmData };
    }
    // -------------------

    try {
      const dbStr = localStorage.getItem(ACCOUNTS_KEY);
      if (!dbStr) return { success: false, error: 'Account not found.' };

      const db: AccountDb = JSON.parse(dbStr);
      const acc = db[account];

      if (!acc) return { success: false, error: 'Account not found.' };
      if (acc.password !== pass) return { success: false, error: 'Incorrect password.' };

      return { success: true, data: acc.data };
    } catch (e) {
      return { success: false, error: 'Corrupted data.' };
    }
  },

  async register(account: string, pass: string): Promise<{ success: boolean; data?: Player; error?: string }> {
    await this.delay(300);

    if (account.toLowerCase() === 'gamemaster') return { success: false, error: 'Name reserved.' };

    try {
      const dbStr = localStorage.getItem(ACCOUNTS_KEY);
      let db: AccountDb = dbStr ? JSON.parse(dbStr) : {};

      if (db[account]) return { success: false, error: 'Account already exists.' };

      const newPlayer = JSON.parse(JSON.stringify(INITIAL_PLAYER_STATS));

      db[account] = { password: pass, data: newPlayer };
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(db));

      return { success: true, data: newPlayer };
    } catch (e) {
      return { success: false, error: 'Registration failed.' };
    }
  },

  async save(account: string, data: Player): Promise<boolean> {
    try {
      const dbStr = localStorage.getItem(ACCOUNTS_KEY);
      if (dbStr) {
        const db: AccountDb = JSON.parse(dbStr);
        // Use account key directly
        if (db[account]) {
          db[account].data = data;
          localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(db));
          return true;
        } else if (data.isGm && account === 'gamemaster') {
             // Handle GM save if key missing
             db[account] = { password: 'tibia', data: data };
             localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(db));
             return true;
        }
      }
      return false;
    } catch (e) {
      console.error("Save failed", e);
      return false;
    }
  },

  exportSaveString(account: string): string | null {
    const dbStr = localStorage.getItem(ACCOUNTS_KEY);
    if (!dbStr) return null;
    const db: AccountDb = JSON.parse(dbStr);
    const acc = db[account];
    if (!acc) return null;

    try {
        const json = JSON.stringify(acc);
        return btoa(unescape(encodeURIComponent(json))); 
    } catch (e) {
        return null;
    }
  },

  importSaveString(saveString: string): { success: boolean; accountName?: string; error?: string } {
    try {
        const json = decodeURIComponent(escape(atob(saveString)));
        const accData = JSON.parse(json);

        if (!accData.data || !accData.password || !accData.data.name) {
            return { success: false, error: 'Invalid save format.' };
        }

        const key = accData.data.name.toLowerCase().replace(/\s/g, '_') || 'imported_user';

        const dbStr = localStorage.getItem(ACCOUNTS_KEY);
        let db: AccountDb = dbStr ? JSON.parse(dbStr) : {};

        db[key] = accData;
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(db));

        return { success: true, accountName: key };

    } catch (e) {
        return { success: false, error: 'Invalid save string.' };
    }
  },

  getHighscores(): HighscoresData | null {
      try {
          const dbStr = localStorage.getItem(ACCOUNTS_KEY);
          let realPlayers: Player[] = [];
          
          if (dbStr) {
            const db: AccountDb = JSON.parse(dbStr);
            realPlayers = Object.values(db).map(acc => acc.data).filter(p => p.name);
          }

          // Combine Real Players with Fake Legends to create a competitive "Online" environment
          const mockPlayers = generateMockPlayers();
          const allPlayers = [...realPlayers, ...mockPlayers];

          // Helper to get Top 10 sorted
          const getTop = (getValue: (p: Player) => number) => {
              return allPlayers
                  .sort((a, b) => getValue(b) - getValue(a))
                  .slice(0, 10)
                  .map(p => ({
                      name: p.name,
                      vocation: p.vocation,
                      value: Math.floor(getValue(p)),
                      isPlayer: realPlayers.some(rp => rp.name === p.name) // Check if it's a real user
                  }));
          };

          return {
              'Level': getTop(p => p.level + (p.currentXp / p.maxXp)),
              'Magic Level': getTop(p => p.skills[SkillType.MAGIC].level + (p.skills[SkillType.MAGIC].progress / 100)),
              'Sword Fighting': getTop(p => p.skills[SkillType.SWORD].level + (p.skills[SkillType.SWORD].progress / 100)),
              'Axe Fighting': getTop(p => p.skills[SkillType.AXE].level + (p.skills[SkillType.AXE].progress / 100)),
              'Club Fighting': getTop(p => p.skills[SkillType.CLUB].level + (p.skills[SkillType.CLUB].progress / 100)),
              'Distance Fighting': getTop(p => p.skills[SkillType.DISTANCE].level + (p.skills[SkillType.DISTANCE].progress / 100)),
              'Shielding': getTop(p => p.skills[SkillType.DEFENSE].level + (p.skills[SkillType.DEFENSE].progress / 100)),
              'Fist Fighting': getTop(p => p.skills[SkillType.FIST].level + (p.skills[SkillType.FIST].progress / 100)),
          };

      } catch (e) {
          console.error("Highscore fetch error", e);
          return null;
      }
  }
};
