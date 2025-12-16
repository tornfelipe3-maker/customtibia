
import { useState } from 'react';
import { StorageService } from '../services/storage';
import { Player, EquipmentSlot } from '../types';
import { INITIAL_PLAYER_STATS, SHOP_ITEMS } from '../constants';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [loadedPlayer, setLoadedPlayer] = useState<Player | null>(null);

  const handleLogin = async (acc: string, pass: string) => {
    setAuthError(null);
    setIsAuthLoading(true);
    
    const result = await StorageService.login(acc, pass);
    
    setIsAuthLoading(false);

    if (result.success && result.data) {
      setLoadedPlayer(result.data);
      setCurrentAccount(acc);
      setIsAuthenticated(true);
    } else {
      setAuthError(result.error || 'Login failed.');
    }
  };

  const handleRegister = async (acc: string, pass: string) => {
    setAuthError(null);
    setIsAuthLoading(true);

    // Initial Starter Items Logic
    const newPlayer = JSON.parse(JSON.stringify(INITIAL_PLAYER_STATS));
    const coat = SHOP_ITEMS.find(i => i.id === 'coat');
    const club = SHOP_ITEMS.find(i => i.id === 'club');
    if (coat) newPlayer.equipment[EquipmentSlot.BODY] = coat;
    if (club) newPlayer.equipment[EquipmentSlot.HAND_RIGHT] = club;
    
    const result = await StorageService.register(acc, pass);
    
    if (result.success && result.data) {
        const starterPlayer = result.data;
        if (coat) starterPlayer.equipment[EquipmentSlot.BODY] = coat;
        if (club) starterPlayer.equipment[EquipmentSlot.HAND_RIGHT] = club;
        
        await StorageService.save(acc, starterPlayer);

        setLoadedPlayer(starterPlayer);
        setCurrentAccount(acc);
        setIsAuthenticated(true);
    } else {
        setAuthError(result.error || 'Registration failed.');
    }
    setIsAuthLoading(false);
  };

  const handleImportSave = (saveStr: string) => {
      const result = StorageService.importSaveString(saveStr);
      if (result.success && result.accountName) {
          setAuthError(`Import successful! Login as: ${result.accountName} (use your old password)`);
      } else {
          setAuthError(result.error || "Import failed.");
      }
  };

  const logout = () => {
      setIsAuthenticated(false);
      setCurrentAccount(null);
      setLoadedPlayer(null);
  };

  return {
      isAuthenticated,
      currentAccount,
      authError,
      isAuthLoading,
      loadedPlayer,
      login: handleLogin,
      register: handleRegister,
      importSave: handleImportSave,
      logout
  };
};
