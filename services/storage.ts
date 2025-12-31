
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
  // Novo: Obtém a hora exata do servidor Supabase
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

    // Buscamos os dados e o tempo atual do servidor simultaneamente
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

  async save(userId: string, data: Player): Promise<boolean> {
    // Ao salvar, garantimos que o lastSaveTime seja o tempo do servidor para evitar manipulação local
    const serverTime = await this.getServerTime();
    const dataWithTimestamp = { ...data, lastSaveTime: serverTime };

    const { error } = await supabase
      .from('profiles')
      .update({ 
        data: dataWithTimestamp,
        updated_at: new Date(serverTime).toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error("Cloud Save Error:", error);
      return false;
    }
    return true;
  },

  async getHighscores(): Promise<HighscoresData | null> {
    const { data: allProfiles, error } = await supabase
      .from('profiles')
      .select('username, data')
      .limit(100);

    if (error || !allProfiles) return null;

    const players = allProfiles.map(p => p.data as Player);

    const getTop = (getValue: (p: Player) => number) => {
        return players
            .sort((a, b) => getValue(b) - getValue(a))
            .slice(0, 10)
            .map(p => ({
                name: p.name,
                vocation: p.vocation,
                value: Math.floor(getValue(p)),
                isPlayer: false
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
    };
  }
};
