
import { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { Player, EquipmentSlot } from '../types';
import { SHOP_ITEMS } from '../constants';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentAccountName, setCurrentAccountName] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loadedPlayer, setLoadedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('data, username')
            .eq('id', session.user.id)
            .single();
          
          if (profile && !error) {
            setLoadedPlayer(profile.data);
            setCurrentUserId(session.user.id);
            setCurrentAccountName(profile.username);
            setIsAuthenticated(true);
          }
        }
      } catch (e) {
        console.error("Session check failed", e);
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (acc: string, pass: string) => {
    setAuthError(null);
    setIsAuthLoading(true);
    
    const result = await StorageService.login(acc, pass);
    
    if (result.success && result.data) {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      setCurrentAccountName(acc);
      setLoadedPlayer(result.data);
      setIsAuthenticated(true);
    } else {
      setAuthError(result.error || 'Falha no login. Verifique dados.');
    }
    setIsAuthLoading(false);
  };

  const register = async (acc: string, pass: string) => {
    setAuthError(null);
    setIsAuthLoading(true);
    
    const result = await StorageService.register(acc, pass);
    
    if (result.success && result.data) {
        const starterPlayer = result.data;
        
        // --- LÓGICA DE GM ---
        // Se o nome for admin, damos poderes de GM instantaneamente
        if (acc.toLowerCase() === 'admin') {
            starterPlayer.isGm = true;
        }

        const coat = SHOP_ITEMS.find(i => i.id === 'coat');
        const club = SHOP_ITEMS.find(i => i.id === 'club');
        if (coat) starterPlayer.equipment[EquipmentSlot.BODY] = coat;
        if (club) starterPlayer.equipment[EquipmentSlot.HAND_RIGHT] = club;
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Salva o personagem já com a flag isGm se for o admin
            await StorageService.save(user.id, starterPlayer);
            setCurrentUserId(user.id);
            setCurrentAccountName(acc);
            setLoadedPlayer(starterPlayer);
            setIsAuthenticated(true);
        }
    } else {
        setAuthError(result.error || 'Erro ao registrar conta.');
    }
    setIsAuthLoading(false);
  };

  const logout = async () => {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setCurrentUserId(null);
      setCurrentAccountName(null);
      setLoadedPlayer(null);
  };

  return {
      isAuthenticated,
      currentAccount: currentUserId,
      currentAccountName,
      authError,
      isAuthLoading,
      loadedPlayer,
      login,
      register,
      importSave: () => alert("Cloud Storage Ativo."),
      logout
  };
};
