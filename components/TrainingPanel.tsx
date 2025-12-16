
import React from 'react';
import { Player, SkillType, Vocation } from '../types';
import { Sword, Crosshair, Zap, Shield, Hammer, Axe } from 'lucide-react';

interface TrainingPanelProps {
  player: Player;
  isTraining: boolean;
  trainingSkill: SkillType | null;
  onStartTraining: (skill: SkillType) => void;
  onStopTraining: () => void;
}

export const TrainingPanel: React.FC<TrainingPanelProps> = ({ 
  player, 
  isTraining, 
  trainingSkill, 
  onStartTraining, 
  onStopTraining 
}) => {

  const canTrain = player.level >= 8 && player.vocation !== Vocation.NONE;

  if (!canTrain) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-gray-800 rounded-lg border border-gray-700">
        <Shield size={48} className="mb-4 opacity-20" />
        <h3 className="text-lg font-bold mb-2">Treino Indisponível</h3>
        <p className="text-sm">
          Você precisa atingir o <strong>Level 8</strong> e escolher uma <strong>Vocação</strong> para acessar a área de treino.
        </p>
      </div>
    );
  }

  const trainingOptions = [
    { 
      id: SkillType.SWORD, 
      name: 'Treinar Sword', 
      desc: 'Ideal para Knights. Melhora dano com espadas.',
      icon: <Sword size={24} />,
      recVoc: [Vocation.KNIGHT]
    },
    { 
      id: SkillType.AXE, 
      name: 'Treinar Axe', 
      desc: 'Ideal para Knights. Melhora dano com machados.',
      icon: <Axe size={24} />,
      recVoc: [Vocation.KNIGHT]
    },
    { 
      id: SkillType.CLUB, 
      name: 'Treinar Club', 
      desc: 'Ideal para Knights. Melhora dano com maças.',
      icon: <Hammer size={24} />,
      recVoc: [Vocation.KNIGHT]
    },
    { 
      id: SkillType.DISTANCE, 
      name: 'Treinar Distance', 
      desc: 'Ideal para Paladins. Melhora pontaria.',
      icon: <Crosshair size={24} />,
      recVoc: [Vocation.PALADIN]
    },
    { 
      id: SkillType.MAGIC, 
      name: 'Treinar Magic', 
      desc: 'Ideal para Sorcerers e Druids. Aumenta poder de runas.',
      icon: <Zap size={24} />,
      recVoc: [Vocation.SORCERER, Vocation.DRUID]
    },
    { 
      id: SkillType.DEFENSE, 
      name: 'Treinar Shielding', 
      desc: 'Treino defensivo. Aumenta a defesa com escudos.',
      icon: <Shield size={24} />,
      recVoc: [Vocation.KNIGHT]
    },
  ];

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 bg-gray-900 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2 text-blue-400">
          <Shield size={20} />
          <h2 className="text-lg font-bold font-serif">Training Center</h2>
        </div>
        {isTraining && (
          <button 
            onClick={onStopTraining}
            className="text-xs bg-red-900 text-red-200 px-3 py-1 rounded border border-red-700 hover:bg-red-800"
          >
            Parar Treino
          </button>
        )}
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800 rounded text-sm text-blue-200">
          <p className="mb-1">Treinar aumenta suas skills <strong>5x mais rápido</strong> do que caçar.</p>
          <p className="text-[10px] text-blue-300 opacity-80">Max Offline Training: 12 Horas.</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {trainingOptions.map((opt) => {
            const isRecommended = opt.recVoc.includes(player.vocation);
            const isActive = isTraining && trainingSkill === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => !isActive && onStartTraining(opt.id)}
                className={`
                  flex items-center p-4 rounded-lg border text-left transition-all
                  ${isActive 
                    ? 'bg-blue-900/40 border-blue-500 ring-1 ring-blue-500' 
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}
                `}
              >
                <div className={`p-3 rounded-full mr-4 ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                  {opt.icon}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${isActive ? 'text-blue-200' : 'text-gray-200'}`}>
                      {opt.name}
                    </span>
                    {isRecommended && (
                      <span className="text-[10px] bg-green-900 text-green-300 px-2 py-0.5 rounded-full border border-green-700">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
