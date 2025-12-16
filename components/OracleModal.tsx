
import React, { useState } from 'react';
import { Player, Vocation } from '../types';
import { VOCATION_SPRITES } from '../constants';
import { Sword, Crosshair, Zap, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface OracleModalProps {
  player: Player;
  onChooseName: (name: string) => void;
  onChooseVocation: (voc: Vocation) => void;
}

export const OracleModal: React.FC<OracleModalProps> = ({ player, onChooseName, onChooseVocation }) => {
  const { t } = useLanguage();
  const [nameInput, setNameInput] = useState('');
  
  // Logic: 
  // Level 2 -> Name Choice (if not chosen)
  // Level 8 -> Vocation Choice (if None)
  
  const showNameModal = player.level >= 2 && !player.isNameChosen;
  const showVocationModal = player.level >= 8 && player.vocation === Vocation.NONE;

  if (!showNameModal && !showVocationModal) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in zoom-in duration-300">
      
      {/* NAME SELECTION (Level 2) */}
      {showNameModal && (
          <div className="tibia-panel w-full max-w-sm p-6 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] border-yellow-900/50 relative">
              <div className="mb-4">
                  <h2 className="text-xl font-bold text-yellow-500 font-serif mb-1">{t('oracle_name_title')}</h2>
                  <p className="text-xs text-gray-400">{t('oracle_name_desc')}</p>
                  <p className="text-sm text-gray-300 mt-2">{t('oracle_name_prompt')}</p>
              </div>

              <input 
                type="text" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={t('oracle_name_placeholder')}
                className="w-full bg-black/50 border border-gray-600 rounded p-3 text-center text-white font-bold mb-4 focus:border-yellow-500 outline-none"
                autoFocus
              />

              <button 
                onClick={() => nameInput.length >= 3 && onChooseName(nameInput)}
                disabled={nameInput.length < 3}
                className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-blue-100 border border-blue-700 font-bold rounded shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('oracle_name_confirm')}
              </button>
          </div>
      )}

      {/* VOCATION SELECTION (Level 8) */}
      {!showNameModal && showVocationModal && (
          <div className="tibia-panel w-full max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden shadow-[0_0_50px_rgba(255,215,0,0.1)] border-2 border-yellow-600/30">
              
              <div className="p-6 text-center bg-gradient-to-b from-black to-[#1a1a1a] border-b border-[#333]">
                  <h2 className="text-3xl font-bold text-yellow-500 font-serif tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{t('oracle_voc_title')}</h2>
                  <p className="text-sm text-gray-400 mt-2 italic max-w-lg mx-auto">
                      {t('oracle_voc_desc')}
                  </p>
              </div>

              <div className="flex-1 p-6 overflow-y-auto bg-[url('https://tibia.fandom.com/wiki/Special:FilePath/Background_Artwork_Texture.jpg')] bg-cover">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full items-center">
                      
                      {/* KNIGHT */}
                      <button onClick={() => onChooseVocation(Vocation.KNIGHT)} className="group relative h-[300px] bg-black/60 border-2 border-red-900/50 hover:border-red-500 rounded-lg flex flex-col items-center justify-between p-4 transition-all hover:-translate-y-2 hover:bg-black/80 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                          <div className="mt-4 text-red-500 group-hover:scale-110 transition-transform"><Sword size={48} /></div>
                          <img src={VOCATION_SPRITES[Vocation.KNIGHT]} className="scale-[3] pixelated" />
                          <div className="text-center">
                              <h3 className="text-xl font-bold text-red-400 mb-1">{t('voc_knight')}</h3>
                              <p className="text-[10px] text-gray-400 leading-tight px-2">{t('voc_knight_desc')}</p>
                          </div>
                      </button>

                      {/* PALADIN */}
                      <button onClick={() => onChooseVocation(Vocation.PALADIN)} className="group relative h-[300px] bg-black/60 border-2 border-orange-900/50 hover:border-orange-500 rounded-lg flex flex-col items-center justify-between p-4 transition-all hover:-translate-y-2 hover:bg-black/80 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                          <div className="mt-4 text-orange-500 group-hover:scale-110 transition-transform"><Crosshair size={48} /></div>
                          <img src={VOCATION_SPRITES[Vocation.PALADIN]} className="scale-[3] pixelated" />
                          <div className="text-center">
                              <h3 className="text-xl font-bold text-orange-400 mb-1">{t('voc_paladin')}</h3>
                              <p className="text-[10px] text-gray-400 leading-tight px-2">{t('voc_paladin_desc')}</p>
                          </div>
                      </button>

                      {/* SORCERER */}
                      <button onClick={() => onChooseVocation(Vocation.SORCERER)} className="group relative h-[300px] bg-black/60 border-2 border-purple-900/50 hover:border-purple-500 rounded-lg flex flex-col items-center justify-between p-4 transition-all hover:-translate-y-2 hover:bg-black/80 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                          <div className="mt-4 text-purple-500 group-hover:scale-110 transition-transform"><Zap size={48} /></div>
                          <img src={VOCATION_SPRITES[Vocation.SORCERER]} className="scale-[3] pixelated" />
                          <div className="text-center">
                              <h3 className="text-xl font-bold text-purple-400 mb-1">{t('voc_sorcerer')}</h3>
                              <p className="text-[10px] text-gray-400 leading-tight px-2">{t('voc_sorcerer_desc')}</p>
                          </div>
                      </button>

                      {/* DRUID */}
                      <button onClick={() => onChooseVocation(Vocation.DRUID)} className="group relative h-[300px] bg-black/60 border-2 border-cyan-900/50 hover:border-cyan-500 rounded-lg flex flex-col items-center justify-between p-4 transition-all hover:-translate-y-2 hover:bg-black/80 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                          <div className="mt-4 text-cyan-500 group-hover:scale-110 transition-transform"><Heart size={48} /></div>
                          <img src={VOCATION_SPRITES[Vocation.DRUID]} className="scale-[3] pixelated" />
                          <div className="text-center">
                              <h3 className="text-xl font-bold text-cyan-400 mb-1">{t('voc_druid')}</h3>
                              <p className="text-[10px] text-gray-400 leading-tight px-2">{t('voc_druid_desc')}</p>
                          </div>
                      </button>

                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
