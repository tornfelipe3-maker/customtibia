
import { Player, SkillType, Vocation } from '../types';
import { INITIAL_PLAYER_STATS } from '../constants';
import { supabase } from '../lib/supabase';

export interface HighscoreEntry {
    name: string;
    vocation: string;
    value: number;
    isPlayer: boolean;
}

export interface HighscoresData {
    [category: string]: HighscoreEntry[];
}

export interface GlobalDeath {
    id: string;
    player_name: string;
    level: number;
    vocation: string;
    killer_name: string;
    created_at: string;
}

export interface MonsterStat {
    monster_id: string;
    kill_count: number;
}

export const StorageService = {
  async getServerTime(): Promise<number> {
    const { data, error } = await supabase.rpc('get_server_time');
    if (error || !data) return Date.now();
    return new Date(data).getTime();
  },

  async login(account: string, pass: string): Promise<{ success: boolean; data?: Player; serverTime?: number; error?: string }> {
    const email = account.includes('@') ? account : `${account.toLowerCase()}@tibiaidle.com`;
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
            return { success: false, error: "Nome de conta ou senha incorretos." };
        }
        return { success: false, error: authError.message };
    }

    const [profileRes, serverTime] = await Promise.all([
      supabase.from('profiles').select('data').eq('id', authData.user.id).single(),
      this.getServerTime()
    ]);

    if (profileRes.error || !profileRes.data) {
      return { success: false, error: "Perfil não encontrado." };
    }

    return { 
      success: true, 
      data: profileRes.data.data as Player,
      serverTime 
    };
  },

  async register(account: string, pass: string): Promise<{ success: boolean; data?: Player; error?: string }> {
    const email = account.includes('@') ? account : `${account.toLowerCase()}@tibiaidle.com`;
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: pass,
    });

    if (authError) return { success: false, error: `Erro no Auth: ${authError.message}` };
    if (!authData.user) return { success: false, error: "Falha ao criar usuário." };

    const newPlayer = JSON.parse(JSON.stringify(INITIAL_PLAYER_STATS));
    newPlayer.name = account;
    newPlayer.lastSaveTime = Date.now();
    
    if (account.toLowerCase() === 'admin') {
        newPlayer.isGm = true;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: account,
        data: newPlayer
      });

    if (profileError) {
        return { success: false, error: `Erro de Permissão (RLS): ${profileError.message}` };
    }

    return { success: true, data: newPlayer };
  },

  async save(userId: string, data: Player): Promise<{ success: boolean; error?: string }> {
    const claimedLastSave = data.lastSaveTime;
    const { data: rpcData, error: rpcError } = await supabase.rpc('secure_save_player', {
      p_user_id: userId,
      p_new_data: data,
      p_claimed_last_save: claimedLastSave
    });

    if (rpcError) {
      console.error("Cloud Save Security Error:", rpcError);
      return { success: false, error: rpcError.message };
    }
    return { success: true };
  },

  // --- NEW: GLOBAL STATS METHODS ---

  async logGlobalDeath(playerName: string, level: number, vocation: string, killerName: string) {
    await supabase.from('global_deaths').insert({
        player_name: playerName,
        level: level,
        vocation: vocation,
        killer_name: killerName
    });
  },

  async getLatestDeaths(): Promise<GlobalDeath[]> {
      const { data } = await supabase
          .from('global_deaths')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
      return data || [];
  },

  async syncMonsterKills(killBatch: {[monsterId: string]: number}) {
      if (Object.keys(killBatch).length === 0) return;
      await supabase.rpc('increment_monster_kills_batch', { kill_batches: killBatch });
  },

  async getGlobalMonsterStats(): Promise<MonsterStat[]> {
      const { data } = await supabase
          .from('global_monster_stats')
          .select('*')
          .order('kill_count', { ascending: false });
      return data || [];
  },

  async getHighscores(currentUserId: string | null): Promise<HighscoresData | null> {
    const { data: allProfiles, error } = await supabase
      .from('profiles')
      .select('id, data')
      .order('data->level', { ascending: false })
      .order('data->currentXp', { ascending: false })
      .limit(100);

    if (error || !allProfiles) return null;

    const entries = allProfiles.map(p => {
        const playerData = p.data as Player;
        return { id: p.id, name: playerData.name || "Unknown Hero", data: playerData };
    });

    const getTop = (getValue: (p: Player) => number) => {
        return entries
            .sort((a, b) => getValue(b.data) - getValue(a.data))
            .slice(0, 10)
            .map(e => ({
                name: e.name,
                vocation: e.data.vocation,
                value: Math.floor(getValue(e.data)),
                isPlayer: e.id === currentUserId
            }));
    };

    return {
        'Level': getTop(p => p.level),
        'Magic Level': getTop(p => p.skills[SkillType.MAGIC].level),
        'Sword Fighting': getTop(p => p.skills[SkillType.SWORD].level),
        'Axe Fighting': getTop(p => p.skills[SkillType.AXE].level),
        'Club Fighting': getTop(p => p.skills[SkillType.CLUB].level),
        'Distance Fighting': getTop(p => p.skills[SkillType.DISTANCE].level),
        'Shielding': getTop(p => p.skills[SkillType.DEFENSE].level),
    };
  }
};
