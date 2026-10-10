import React from 'react';
import { X, Flame, Key, Shield, Sparkles, Zap, Crosshair } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md cartoon-card rounded-3xl p-5 sm:p-6 flex flex-col items-center border-4 border-amber-900 shadow-2xl max-h-[88vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-900 hover:text-red-600 transition-colors"
        >
          <X size={24} />
        </button>

        <h3 className="font-['Titan_One',sans-serif] text-2xl sm:text-3xl text-amber-950 text-center tracking-wide">
          CÓMO JUGAR
        </h3>
        <p className="text-xs font-bold text-amber-800 text-center mt-0.5 mb-4">
          Guía oficial de combate y rescate en Chicken Boom
        </p>

        <div className="w-full flex flex-col gap-3.5 text-xs text-amber-950">
          {/* 1. Misión Principal */}
          <div className="bg-amber-100/90 border-2 border-amber-400 p-3 rounded-2xl">
            <div className="flex items-center gap-2 font-black text-amber-900 text-sm mb-1">
              <Key size={18} className="text-amber-600 fill-amber-500" />
              <span>OBJETIVO DE LA MISIÓN</span>
            </div>
            <p className="font-semibold text-amber-900 leading-relaxed">
              Explora las <strong>3 pantallas</strong> de ancho del mapa. Rompe cajas de madera con tus <strong>Huevos Bomba</strong> para encontrar la <strong>Llave de Oro</strong>. ¡Llega hasta la Jaula en la 3ª pantalla y libera a los animales antes de que acabe el tiempo!
            </p>
          </div>

          {/* 2. Explosión en Cruz (+) */}
          <div className="bg-amber-100/90 border-2 border-amber-400 p-3 rounded-2xl">
            <div className="flex items-center gap-2 font-black text-amber-900 text-sm mb-1">
              <Crosshair size={18} className="text-red-600" />
              <span>EXPLOSIONES EN CRUZ (+)</span>
            </div>
            <p className="font-semibold text-amber-900 leading-relaxed">
              Las bombas solo se propagan en <strong>Cruz (Arriba, Abajo, Izquierda, Derecha)</strong>, nunca en diagonal. <strong>Las cajas bloquean la explosión</strong>: una caja detiene la onda y no deja que se rompa la caja de atrás. ¡Aléjate de tu propia bomba para no dañarte!
            </p>
          </div>

          {/* 3. Controles */}
          <div className="bg-amber-100/90 border-2 border-amber-400 p-3 rounded-2xl">
            <div className="font-black text-amber-900 text-sm mb-1">
              🎮 CONTROLES
            </div>
            <ul className="space-y-1 font-semibold text-amber-900 list-disc list-inside">
              <li><strong>Móvil:</strong> Desliza o pulsa la cruceta táctil para moverte. Pulsa el botón grande de Huevo para poner la bomba.</li>
              <li><strong>Teclado PC:</strong> Flechas o <kbd className="bg-amber-200 px-1 rounded border border-amber-400">WASD</kbd> para moverte. <kbd className="bg-amber-200 px-1 rounded border border-amber-400">ESPACIO</kbd> para bomba y <kbd className="bg-amber-200 px-1 rounded border border-amber-400">E</kbd> para detonación remota.</li>
            </ul>
          </div>

          {/* 4. Power-Ups */}
          <div className="bg-amber-100/90 border-2 border-amber-400 p-3 rounded-2xl">
            <div className="font-black text-amber-900 text-sm mb-1.5">
              ⭐ POWER-UPS PODEROSOS
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
              <div className="flex items-center gap-1.5">
                <Flame size={14} className="text-orange-500 shrink-0" />
                <span><strong>Doble/Triple Huevo:</strong> Mayor alcance.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-amber-500 shrink-0" />
                <span><strong>Velocidad:</strong> Desplazamiento rápido.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield size={14} className="text-blue-500 shrink-0" />
                <span><strong>Escudo:</strong> Inmune a bombas y zorros.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-500 shrink-0" />
                <span><strong>Fantasma:</strong> Inmune a explosiones.</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 mt-4 rounded-2xl btn-cartoon-yellow font-['Titan_One',sans-serif] text-lg text-amber-950 tracking-wider shadow-lg active:scale-95 transition-transform"
        >
          ¡ENTENDIDO, A JUGAR!
        </button>
      </div>
    </div>
  );
};
