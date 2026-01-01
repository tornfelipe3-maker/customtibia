
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

  /**
   * SAVE SEGURO (ANTI-CHEAT)
   * Agora usamos uma RPC para validar se o tempo passado pelo jogador condiz com o relógio do servidor.
   */
  async save(userId: string, data: Player): Promise<{ success: boolean; error?: string }> {
    // Pegamos o timestamp que o cliente alega ser o último save processado
    const claimedLastSave = data.lastSaveTime;

    // Chamamos a função SQL 'secure_save_player' que criamos no Supabase
    const { data: rpcData, error: rpcError } = await supabase.rpc('secure_save_player', {
      p_user_id: userId,
      p_new_data: data,
      p_claimed_last_save: claimedLastSave
    });

    if (rpcError) {
      console.error("Cloud Save Security Error:", rpcError);
      return { success: false, error: rpcError.message };
    }

    if (rpcData === false) {
      return { success: false, error: "Divergência de tempo detectada (Speedhack Bloqueado)." };
    }

    return { success: true };
  },

  async getHighscores(currentUserId: string | null): Promise<HighscoresData | null> {
    const { data: allProfiles, error } = await supabase
      .from('profiles')
      .select('id, data')
      .order('data->level', { ascending: false })
      .order('data->currentXp', { ascending: false })
      .limit(100);

    if (error || !allProfiles) {
        console.error("Erro ao buscar Highscores:", error);
        return null;
    }

    const entries = allProfiles.map(p => {
        const playerData = p.data as Player;
        return {
            id: p.id,
            name: playerData.name || "Unknown Hero",
            data: playerData
        };
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
