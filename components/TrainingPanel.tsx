
import React, { useState, useEffect } from 'react';
import { Player, SkillType, Vocation } from '../types';
import { VOCATION_SPRITES, IMG_BASE } from '../constants';
import { 
    Sword, Crosshair, Zap, Shield, Hammer, Axe, 
    Play, Square, Info, Target, Timer, Sparkles
} from 'lucide-react';
import { Sprite } from './common/Sprite';

interface TrainingPanelProps {
  player: Player;
  isTraining: boolean;
  trainingSkill: SkillType | null;
  onStartTraining: (skill: SkillType) => void;
  onStopTraining: () => void;
}

const DUMMY_IMG = `${IMG_BASE}Training_Dummy.gif`;

export const TrainingPanel: React.FC<TrainingPanelProps> = ({ 
  player, 
  isTraining, 
  trainingSkill, 
  onStartTraining, 
  onStopTraining 
}) => {
  const [dummyHit, setDummyHit] = useState(false);

  // Efeito visual de "hit" no dummy enquanto treina
  useEffect(() => {
    if (!isTraining) return;
    const interval = setInterval(() => {
        setDummyHit(true);
        setTimeout(() => setDummyHit(false), 150);
    }, 2000);
    return () => clearInterval(interval);
  }, [isTraining]);

  const canTrain = player.level >= 8 && player.vocation !== Vocation.NONE;

  if (!canTrain) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-[#111] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.05)_0%,transparent_70%)]"></div>
        <div className="relative z-10">
            <div className="w-24 h-24 bg-gray-900 rounded-full border-4 border-gray-800 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <LockIcon size={40} className="text-gray-700" />
            </div>
            <h3 className="text-2xl font-bold text-gray-200 mb-3 font-serif uppercase tracking-widest">Área Restrita</h3>
            <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
                Apenas aventureiros de <strong className="text-blue-400">Level 8+</strong> com uma vocação definida podem acessar o monastério de treino.
            </p>
        </div>
      </div>
    );
  }

  const trainingOptions = [
    { id: SkillType.SWORD, name: 'Espadas', icon: <Sword size={20} />, color: 'text-red-400', border: 'border-red-900/30', bg: 'bg-red-900/5', voc: [Vocation.KNIGHT] },
    { id: SkillType.AXE, name: 'Machados', icon: <Axe size={20} />, color: 'text-orange-400', border: 'border-orange-900/30', bg: 'bg-orange-900/5', voc: [Vocation.KNIGHT] },
    { id: SkillType.CLUB, name: 'Clavas', icon: <Hammer size={20} />, color: 'text-amber-400', border: 'border-amber-900/30', bg: 'bg-amber-900/5', voc: [Vocation.KNIGHT] },
    { id: SkillType.DISTANCE, name: 'Distância', icon: <Crosshair size={20} />, color: 'text-green-400', border: 'border-green-900/30', bg: 'bg-green-900/5', voc: [Vocation.PALADIN] },
    { id: SkillType.MAGIC, name: 'Magia', icon: <Zap size={20} />, color: 'text-purple-400', border: 'border-purple-900/30', bg: 'bg-purple-900/5', voc: [Vocation.SORCERER, Vocation.DRUID] },
    { id: SkillType.DEFENSE, name: 'Defesa', icon: <Shield size={20} />, color: 'text-blue-400', border: 'border-blue-900/30', bg: 'bg-blue-900/5', voc: [Vocation.KNIGHT, Vocation.PALADIN] },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d]">
      
      {/* ARENA VISUAL */}
      <div className="h-64 shrink-0 relative border-b border-[#333] overflow-hidden group shadow-inner">
         <div className="absolute inset-0 bg-[#1a1a1a] opacity-40 bg-[url('https://tibia.fandom.com/wiki/Special:FilePath/Background_Artwork_Texture.jpg')] bg-repeat"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black"></div>
         
         <div className="absolute bottom-0 inset-x-0 h-24 bg-[#222] border-t border-[#333] flex items-center justify-center">
             <div className="w-full h-full opacity-20 bg-[url('/paving.gif')] bg-repeat bg-contain"></div>
         </div>

         <div className="relative h-full w-full flex items-center justify-center gap-32 z-10">
             {/* Personagem */}
             <div className="flex flex-col items-center">
                <div className={`relative transition-transform duration-300 ${isTraining ? 'translate-x-2' : ''}`}>
                    <Sprite src={VOCATION_SPRITES[player.vocation]} type="outfit" size={48} className="scale-[2.5] drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]" />
                    {isTraining && (
                        <div className="absolute -top-4 -right-4 animate-bounce">
                           <Sparkles size={16} className="text-yellow-500 opacity-80" />
                        </div>
                    )}
                </div>
                <div className="mt-10 bg-black/60 px-3 py-0.5 rounded-full border border-white/5 text-[10px] font-bold text-gray-400 uppercase">
                    {player.name}
                </div>
             </div>

             {/* Divisor de Combate */}
             {isTraining && (
                 <div className="absolute flex flex-col items-center">
                    <div className="text-yellow-500/10 font-black text-6xl italic select-none uppercase tracking-tighter">Training</div>
                 </div>
             )}

             {/* Training Dummy */}
             <div className="flex flex-col items-center">
                <div className={`relative transition-all duration-75 ${dummyHit ? 'scale-95 brightness-150 translate-x-1' : 'scale-100'}`}>
                    <Sprite src={DUMMY_IMG} type="monster" size={48} className="scale-[2.5] drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] grayscale-[0.2]" />
                    {dummyHit && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full blur-xl animate-ping"></div>
                        </div>
                    )}
                </div>
                <div className="mt-10 bg-black/60 px-3 py-0.5 rounded-full border border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                    Training Dummy
                </div>
             </div>
         </div>

         {/* Overlay de Status do Treino (Simplificado) */}
         {isTraining && (
             <div className="absolute top-4 right-4 animate-in fade-in slide-in-from-top-4">
                 <div className="bg-green-900/20 border border-green-500/40 backdrop-blur-md px-4 py-2 rounded-lg flex items-center gap-3">
                    <div className="text-[10px] text-green-300 font-black uppercase tracking-widest animate-pulse">Sessão Ativa</div>
                 </div>
             </div>
         )}
      </div>

      {/* PAINEL DE CONTROLES E SELEÇÃO */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gradient-to-b from-[#111] to-[#0a0a0a]">
        
        <div className="max-w-4xl mx-auto">
            
            <div className="flex items-center justify-between mb-8 border-b border-[#333] pb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-100 font-serif tracking-tight">Escola de Guerreiros</h2>
                    <p className="text-xs text-gray-500">Aperfeiçoe suas técnicas de combate.</p>
                </div>
                {isTraining ? (
                    <button 
                        onClick={onStopTraining}
                        className="tibia-btn bg-red-900/40 border-red-700 hover:bg-red-800 text-red-200 px-6 py-2.5 rounded font-black text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                        <Square size={14} fill="currentColor" /> FINALIZAR TREINO
                    </button>
                ) : (
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase bg-black/40 px-4 py-2 rounded-full border border-[#222]">
                        <Timer size={12} className="text-blue-500" /> Suporte a Treino Offline
                    </div>
                )}
            </div>

            {/* Grid de Opções */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trainingOptions.map((opt) => {
                    const isRecommended = opt.voc.includes(player.vocation);
                    const isActive = isTraining && trainingSkill === opt.id;
                    const skillLevel = player.skills[opt.id].level;
                    const skillProg = player.skills[opt.id].progress;

                    return (
                        <button
                            key={opt.id}
                            disabled={isTraining && !isActive}
                            onClick={() => !isActive && onStartTraining(opt.id)}
                            className={`
                                relative flex items-center p-4 rounded-xl border-2 text-left transition-all group
                                ${isActive 
                                    ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)] scale-[1.02]' 
                                    : isTraining 
                                        ? 'opacity-40 grayscale cursor-not-allowed border-[#222]' 
                                        : `${opt.bg} ${opt.border} hover:border-white/20 hover:bg-[#1a1a1a]`}
                            `}
                        >
                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4 border-2 transition-all
                                ${isActive ? 'bg-blue-500 border-blue-400 text-white shadow-lg' : `bg-black/60 ${opt.border} ${opt.color} group-hover:scale-110`}
                            `}>
                                {opt.icon}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`font-black text-sm uppercase tracking-tight ${isActive ? 'text-blue-100' : 'text-gray-200'}`}>
                                        {opt.name}
                                    </span>
                                    {isRecommended && (
                                        <span className="text-[8px] bg-green-900/40 text-green-400 px-1.5 py-0.5 rounded border border-green-800 font-black">RECOMENDADO</span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <div className="text-[10px] font-mono text-gray-500">Level <span className="text-gray-300 font-bold">{skillLevel}</span></div>
                                    <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${isActive ? 'bg-blue-400 animate-pulse' : 'bg-gray-700'}`}
                                            style={{ width: `${skillProg}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-[10px] font-mono text-gray-500">{Math.floor(skillProg)}%</div>
                                </div>
                            </div>

                            <div className="ml-4">
                                {isActive ? (
                                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/50">
                                        <Play size={14} className="text-blue-400 fill-current animate-pulse" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all">
                                        <Target size={14} className="text-gray-600 group-hover:text-gray-400" />
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Dica de Treino */}
            <div className="mt-8 p-4 bg-black/40 border border-[#222] rounded-lg flex gap-4 items-start">
                <div className="p-2 bg-yellow-900/20 rounded text-yellow-600">
                    <Info size={18}/>
                </div>
                <div className="text-[11px] text-gray-500 leading-relaxed">
                    <strong className="text-gray-300 block mb-1">Nota do Instrutor:</strong>
                    Treinar no monastério consome <span className="text-blue-400">Stamina</span> e fornece ganho de habilidade conforme seu estágio atual. 
                    Se você fechar o jogo enquanto treina, seu personagem continuará progredindo através do treinamento offline até que seu estoque de recursos ou tempo limite expire.
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

const LockIcon = ({ size, className }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);
