
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
  async login(account: string, pass: string): Promise<{ success: boolean; data?: Player; error?: string }> {
    // Supabase usa Email para login. Para manter o estilo "Tibia", 
    // mapeamos o username para um email fake @tibia.com internamente se desejar, 
    // ou apenas solicitamos o email no AuthScreen.
    const email = account.includes('@') ? account : `${account.toLowerCase()}@tibiaidle.com`;
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (authError) return { success: false, error: authError.message };

    // Buscar dados do perfil
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('data')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profileData) {
      return { success: false, error: "Profile not found. Contact Admin." };
    }

    return { success: true, data: profileData.data as Player };
  },

  async register(account: string, pass: string): Promise<{ success: boolean; data?: Player; error?: string }> {
    const email = account.includes('@') ? account : `${account.toLowerCase()}@tibiaidle.com`;
    
    // 1. Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: pass,
    });

    if (authError) return { success: false, error: authError.message };
    if (!authData.user) return { success: false, error: "Registration failed." };

    // 2. Criar perfil inicial
    const newPlayer = JSON.parse(JSON.stringify(INITIAL_PLAYER_STATS));
    newPlayer.name = account;

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: account,
        data: newPlayer
      });

    if (profileError) return { success: false, error: profileError.message };

    return { success: true, data: newPlayer };
  },

  async save(userId: string, data: Player): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        data: data,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error("Cloud Save Error:", error);
      return false;
    }
    return true;
  },

  // FIX: Added missing exportSaveString method to handle synchronous generation of save codes from current player data
  exportSaveString(data: Player): string {
    try {
      return btoa(JSON.stringify(data));
    } catch (e) {
      console.error("Failed to export save string", e);
      return "";
    }
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
                isPlayer: false // Ajustar dinamicamente no componente se necessário
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
