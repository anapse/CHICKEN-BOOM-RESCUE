import React from 'react';
import { Skull, RotateCcw, Home } from 'lucide-react';
import { PlayerState } from '../game/types';

interface GameOverModalProps {
  player: PlayerState;
  onRestart: () => void;
  onQuitToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  player,
  onRestart,
  onQuitToMenu,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm cartoon-card rounded-3xl p-6 flex flex-col items-center border-4 border-amber-900 shadow-2xl">
        {/* Defeat Icon */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-red-500 to-red-700 border-4 border-amber-950 flex items-center justify-center text-4xl shadow-xl -mt-12 mb-3">
          <Skull size={40} className="text-white" />
        </div>

        <h3 className="font-['Titan_One',sans-serif] text-3xl text-red-600 text-center tracking-wide">
          FIN DE LA PARTIDA
        </h3>

        <p className="text-xs font-bold text-amber-800 text-center mt-0.5 mb-4">
          ¡Los astutos zorros te han alcanzado! No te rindas, vuelve a intentarlo.
        </p>

        {/* Score Card */}
        <div className="w-full bg-amber-100/90 border-2 border-amber-400 rounded-2xl p-3 flex flex-col items-center gap-1 mb-4 text-amber-950">
          <span className="text-xs font-black uppercase text-amber-800">PUNTUACIÓN OBTENIDA</span>
          <span className="font-['Titan_One',sans-serif] text-2xl text-amber-950">
            {player.score.toLocaleString()} PTS
          </span>
          <span className="text-[11px] font-bold text-amber-700">
            Monedas recolectadas: 🪙 {player.coins}
          </span>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-2xl btn-cartoon-yellow flex items-center justify-center gap-2 font-['Titan_One',sans-serif] text-xl text-amber-950 tracking-wider shadow-lg active:scale-95 transition-transform"
          >
            <RotateCcw size={20} />
            <span>REINTENTAR</span>
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
