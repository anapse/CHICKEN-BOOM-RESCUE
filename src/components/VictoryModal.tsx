import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Award } from 'lucide-react';
import { PlayerState } from '../game/types';

interface VictoryModalProps {
  player: PlayerState;
  timeRemaining: number;
  mode: 'single' | 'multiplayer';
  onRestart: () => void;
  onQuitToMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  player,
  timeRemaining,
  mode,
  onRestart,
  onQuitToMenu,
}) => {
  const timeBonus = Math.floor(timeRemaining * 10);
  const totalScore = player.score + timeBonus;

  useEffect(() => {
    // Blast confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    const timer = setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm cartoon-card rounded-3xl p-6 flex flex-col items-center border-4 border-amber-900 shadow-2xl">
        {/* Victory Icon / Cup */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 border-4 border-amber-900 flex items-center justify-center text-4xl shadow-xl -mt-12 mb-3 animate-bounce">
          <Trophy size={42} className="text-amber-950 fill-amber-950" />
        </div>

        <h3 className="font-['Titan_One',sans-serif] text-3xl text-amber-950 text-center tracking-wide">
          {mode === 'single' ? '¡ANIMALES RESCATADOS!' : '¡CAMPEÓN DE LA COPA!'}
        </h3>

        <p className="text-xs font-bold text-amber-800 text-center mt-0.5 mb-4">
          {mode === 'single'
            ? `¡Increíble trabajo, ${player.name}! Has abierto la jaula y salvado la granja.`
            : `¡Victoria rotunda para ${player.name} en el duelo multijugador!`}
        </p>

        {/* Rescued Animals mini cartoon celebration */}
        {mode === 'single' && (
          <div className="flex items-center justify-center gap-3 bg-amber-200/90 border-2 border-amber-400 py-2.5 px-4 rounded-2xl w-full mb-3 text-2xl shadow-inner">
            <span className="animate-bounce">🐷</span>
            <span className="animate-bounce delay-100">🐑</span>
            <span className="animate-bounce delay-200">🐰</span>
            <span className="animate-bounce delay-300">🐣</span>
          </div>
        )}

        {/* Score Breakdown Card */}
        <div className="w-full bg-amber-100/90 border-2 border-amber-400 rounded-2xl p-3 flex flex-col gap-1.5 text-xs text-amber-950 font-bold mb-4">
          <div className="flex justify-between">
            <span>Puntos de Juego:</span>
            <span className="font-black">{player.score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-emerald-800">
            <span>Bonus por Tiempo ({Math.floor(timeRemaining)}s):</span>
            <span className="font-black">+{timeBonus.toLocaleString()}</span>
          </div>
          <div className="border-t border-amber-300 pt-1.5 flex justify-between items-center text-sm font-black text-amber-900">
            <span className="flex items-center gap-1">
              <Award size={16} /> PUNTUACIÓN TOTAL:
            </span>
            <span className="font-['Titan_One',sans-serif] text-lg text-amber-950">
              {totalScore.toLocaleString()} PTS
            </span>
          </div>
          <div className="text-[10px] text-emerald-700 text-center font-black mt-1">
            ✓ Guardado automáticamente en el Ranking Top 50
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-2xl btn-cartoon-yellow flex items-center justify-center gap-2 font-['Titan_One',sans-serif] text-xl text-amber-950 tracking-wider shadow-lg active:scale-95 transition-transform"
          >
            <RotateCcw size={20} />
            <span>JUGAR DE NUEVO</span>
          </button>

          <button
            onClick={onQuitToMenu}
            className="w-full py-3 rounded-2xl btn-cartoon-blue flex items-center justify-center gap-2 font-['Titan_One',sans-serif] text-base text-white tracking-wider shadow-lg active:scale-95 transition-transform"
          >
            <Home size={18} />
            <span>MENÚ PRINCIPAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
