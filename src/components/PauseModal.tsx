import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onQuitToMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onQuitToMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xs cartoon-card rounded-3xl p-6 flex flex-col items-center border-4 border-amber-900 shadow-2xl">
        <h3 className="font-['Titan_One',sans-serif] text-3xl text-amber-950 text-center tracking-wide mb-6">
          JUEGO EN PAUSA
        </h3>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3.5 rounded-2xl btn-cartoon-yellow flex items-center justify-center gap-2 font-['Titan_One',sans-serif] text-xl text-amber-950 tracking-wider shadow-lg active:scale-95 transition-transform"
          >
            <Play size={20} className="fill-amber-950" />
            <span>CONTINUAR</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 rounded-2xl btn-cartoon-blue flex items-center justify-center gap-2 font-['Titan_One',sans-serif] text-lg text-white tracking-wider shadow-lg active:scale-95 transition-transform"
          >
            <RotateCcw size={18} />
            <span>REINICIAR</span>
          </button>

          <button
            onClick={onQuitToMenu}
            className="w-full py-3 rounded-2xl btn-cartoon-red flex items-center justify-center gap-2 font-['Titan_One',sans-serif] text-lg text-white tracking-wider shadow-lg active:scale-95 transition-transform"
          >
            <Home size={18} />
            <span>MENÚ PRINCIPAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
