
import React, { useState } from 'react';
import { KeyRound, User, Lock, Save, Download, Upload, Ticket } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthScreenProps {
  onLogin: (acc: string, pass: string) => void;
  onRegister: (acc: string, pass: string) => void;
  onImport: (saveStr: string) => void;
  errorMsg: string | null;
  isLoading: boolean;
}

// DEFINA SUA SENHA DO ALPHA AQUI
const ALPHA_ACCESS_KEY = "TIBIA2024";

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onRegister, onImport, errorMsg, isLoading }) => {
  const { t, language, setLanguage } = useLanguage();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [password, setPassword] = useState('');
  const [alphaKey, setAlphaKey] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (isLoading) return;

    if (isRegistering) {
        if (alphaKey !== ALPHA_ACCESS_KEY) {
            setLocalError("Invalid Alpha Access Key.");
            return;
        }
        onRegister(accountName, password);
    } else {
        onLogin(accountName, password);
    }
  };

  const handleImportSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(importString.trim()) {
          onImport(importString.trim());
          setShowImport(false);
          setImportString('');
      }
  };

  const [importString, setImportString] = useState('');

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#0d0d0d] p-4 font-sans select-none">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('https://tibia.fandom.com/wiki/Special:Redirect/file/Tibia_Logo_Artwork.jpg')] bg-cover bg-center"></div>

      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-50 flex gap-1 bg-black/60 p-1.5 rounded-lg border border-[#333] shadow-2xl backdrop-blur-md">
          <button 
            onClick={() => setLanguage('en')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${language === 'en' ? 'bg-blue-700 text-white shadow-[0_0_15px_rgba(29,78,216,0.5)] scale-105 border border-blue-500' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'}`}
            title="English"
          >
              <span className="text-xl leading-none drop-shadow-md">🇺🇸</span>
              <span className="font-bold text-xs uppercase tracking-wider">English</span>
          </button>
          <div className="w-[1px] bg-[#444] mx-1"></div>
          <button 
            onClick={() => setLanguage('pt')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${language === 'pt' ? 'bg-green-700 text-white shadow-[0_0_15px_rgba(21,128,61,0.5)] scale-105 border border-green-500' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'}`}
            title="Português"
          >
              <span className="text-xl leading-none drop-shadow-md">🇧🇷</span>
              <span className="font-bold text-xs uppercase tracking-wider">Português</span>
          </button>
      </div>

      <div className="tibia-panel w-full max-w-sm p-1 z-10 shadow-2xl relative">
        <div className="bg-[#2d2d2d] border border-[#111] p-6 flex flex-col items-center">
           
           <h1 className="text-2xl font-bold text-[#c0c0c0] mb-2 drop-shadow-md font-serif tracking-wider">TIBIA IDLE</h1>
           <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#555] to-transparent mb-6"></div>

           {(errorMsg || localError) && (
             <div className="w-full bg-red-900/40 border border-red-800 text-red-200 text-xs p-2 mb-4 text-center rounded">
               {errorMsg || localError}
             </div>
           )}

           {!showImport ? (
               <>
                <div className="text-sm font-bold text-yellow-500 mb-4 flex items-center gap-2">
                    <KeyRound size={16} />
                    <span>{isRegistering ? t('auth_register') : t('auth_login')}</span>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-1">{t('auth_acc_name')}</label>
                        <div className="flex items-center bg-[#111] border border-[#444] rounded px-2">
                            <User size={14} className="text-gray-500 mr-2" />
                            <input 
                            type="text" 
                            className="w-full bg-transparent border-none outline-none text-gray-200 py-2 text-sm"
                            placeholder={t('auth_acc_name')}
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            required
                            minLength={3}
                            disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-1">{t('auth_pass')}</label>
                        <div className="flex items-center bg-[#111] border border-[#444] rounded px-2">
                            <Lock size={14} className="text-gray-500 mr-2" />
                            <input 
                            type="password" 
                            className="w-full bg-transparent border-none outline-none text-gray-200 py-2 text-sm"
                            placeholder="******"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={3}
                            disabled={isLoading}
                            />
                        </div>
                    </div>

                    {isRegistering && (
                        <div>
                            <label className="text-[10px] uppercase font-bold text-yellow-600 mb-1 block ml-1">{t('auth_key')}</label>
                            <div className="flex items-center bg-[#111] border border-yellow-900/50 rounded px-2">
                                <Ticket size={14} className="text-yellow-500 mr-2" />
                                <input 
                                type="text" 
                                className="w-full bg-transparent border-none outline-none text-yellow-200 py-2 text-sm"
                                placeholder={t('auth_key')}
                                value={alphaKey}
                                onChange={(e) => setAlphaKey(e.target.value)}
                                required
                                disabled={isLoading}
                                />
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-4 tibia-btn py-3 font-bold text-sm text-[#eee] border-[#444] hover:border-[#666] flex items-center justify-center"
                    >
                        {isLoading ? <span className="animate-pulse">Accessing...</span> : (isRegistering ? t('auth_btn_register') : t('auth_btn_login'))}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-between w-full text-xs border-t border-[#444] pt-4">
                    <button 
                        onClick={() => { setIsRegistering(!isRegistering); setAccountName(''); setPassword(''); setLocalError(null); }}
                        className="text-blue-400 hover:text-blue-300 underline font-bold"
                    >
                        {isRegistering ? t('auth_link_back') : t('auth_link_create')}
                    </button>
                    
                    <button 
                        onClick={() => setShowImport(true)}
                        className="text-gray-500 hover:text-gray-300 flex items-center gap-1"
                    >
                        <Upload size={12} /> {t('auth_link_import')}
                    </button>
                </div>
               </>
           ) : (
               <>
                <div className="text-sm font-bold text-green-500 mb-4 flex items-center gap-2">
                    <Download size={16} />
                    <span>{t('auth_import')}</span>
                </div>
                
                <form onSubmit={handleImportSubmit} className="w-full">
                    <textarea 
                        className="w-full h-32 bg-[#111] border border-[#444] text-xs text-gray-300 p-2 mb-4 resize-none focus:border-green-500 outline-none font-mono"
                        placeholder="Paste your exported save code here..."
                        value={importString}
                        onChange={(e) => setImportString(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <button 
                            type="button"
                            onClick={() => setShowImport(false)}
                            className="flex-1 tibia-btn py-2 text-xs"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 tibia-btn py-2 text-xs text-green-300 border-green-900"
                        >
                            Import & Load
                        </button>
                    </div>
                </form>
               </>
           )}
           
           <div className="mt-8 text-[9px] text-gray-600 text-center">
              Tibia Idle RPG - Closed Alpha <br/>
              Version 2.0
           </div>
        </div>
      </div>
    </div>
  );
};
