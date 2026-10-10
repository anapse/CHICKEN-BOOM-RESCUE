import React, { useState } from 'react';
import { X, Users, Play, Swords, Trophy, Sparkles } from 'lucide-react';
import { CHARACTERS } from '../game/constants';
import { CharacterConfig } from '../game/types';

interface MultiplayerLobbyModalProps {
  onStartMatch: (config: {
    player1Name: string;
    player1Char: 'rambo_macho' | 'rambo_hembra' | 'exploradora';
    player2Name: string;
    player2Char: 'rambo_macho' | 'rambo_hembra' | 'exploradora';
  }) => void;
  onClose: () => void;
}

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({
  onStartMatch,
  onClose,
}) => {
  const [p1Name, setP1Name] = useState('Pollito 1');
  const [p1Char, setP1Char] = useState<'rambo_macho' | 'rambo_hembra' | 'exploradora'>('rambo_macho');

  const [p2Name, setP2Name] = useState('Pollito 2');
  const [p2Char, setP2Char] = useState<'rambo_macho' | 'rambo_hembra' | 'exploradora'>('rambo_hembra');

  const [roomCode] = useState(() => `CHICK-${Math.floor(1000 + Math.random() * 9000)}`);

  const handleStart = () => {
    onStartMatch({
      player1Name: p1Name.trim() || 'Jugador 1',
      player1Char: p1Char,
      player2Name: p2Name.trim() || 'Jugador 2',
      player2Char: p2Char,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md cartoon-card rounded-3xl p-5 sm:p-6 flex flex-col items-center border-4 border-amber-900 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-900 hover:text-red-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-blue-500 border-3 border-amber-900 flex items-center justify-center text-white mb-2 shadow-md">
          <Swords size={30} />
        </div>

        <h3 className="font-['Titan_One',sans-serif] text-2xl sm:text-3xl text-amber-950 text-center tracking-wide">
          SALA MULTIJUGADOR
        </h3>

        {/* Room Code Badge */}
        <div className="bg-amber-100 border border-amber-400 px-3 py-1 rounded-full text-xs font-black text-amber-900 mt-1 mb-3 flex items-center gap-1.5 shadow-inner">
          <Sparkles size={13} className="text-amber-600" />
          <span>CÓDIGO DE SALA: <strong>{roomCode}</strong></span>
        </div>

        {/* Victory Condition Notice */}
        <div className="w-full bg-blue-50 border-2 border-blue-300 p-2.5 rounded-2xl text-[11px] text-blue-900 font-semibold mb-3 flex items-center gap-2">
          <Trophy size={20} className="text-yellow-500 fill-yellow-400 shrink-0" />
          <span>
            <strong>REGLA DE VICTORIA:</strong> Ambos pollitos compiten en el mapa. El primero en encontrar la <strong>Llave</strong> y abrir el <strong>Cofre Central</strong> levantará la <strong>Copa del Ganador</strong>.
          </span>
        </div>

        {/* Two Players Configuration */}
        <div className="w-full grid grid-cols-2 gap-3 mb-4">
          {/* Jugador 1 */}
          <div className="bg-amber-100/90 border-2 border-blue-400 p-3 rounded-2xl flex flex-col gap-2">
            <span className="text-xs font-black text-blue-900 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> JUGADOR 1 (AZUL)
            </span>
            <input
              type="text"
              maxLength={15}
              value={p1Name}
              onChange={(e) => setP1Name(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-blue-300 rounded-lg text-xs font-bold text-amber-950"
              placeholder="Nombre J1"
            />
            <select
              value={p1Char}
              onChange={(e) => setP1Char(e.target.value as any)}
              className="w-full px-1.5 py-1 bg-white border border-blue-300 rounded-lg text-[11px] font-bold text-amber-950"
            >
              {CHARACTERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.avatarEmoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Jugador 2 */}
          <div className="bg-amber-100/90 border-2 border-red-400 p-3 rounded-2xl flex flex-col gap-2">
            <span className="text-xs font-black text-red-900 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> JUGADOR 2 (ROJO)
            </span>
            <input
              type="text"
              maxLength={15}
              value={p2Name}
              onChange={(e) => setP2Name(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-red-300 rounded-lg text-xs font-bold text-amber-950"
              placeholder="Nombre J2"
            />
            <select
              value={p2Char}
              onChange={(e) => setP2Char(e.target.value as any)}
              className="w-full px-1.5 py-1 bg-white border border-red-300 rounded-lg text-[11px] font-bold text-amber-950"
            >
              {CHARACTERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.avatarEmoji} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-3.5 rounded-2xl btn-cartoon-yellow flex items-center justify-center gap-2 font-['Titan_One',sans-serif] text-xl text-amber-950 tracking-wider shadow-lg active:scale-95 transition-transform"
        >
          <Play size={20} className="fill-amber-950" />
          <span>¡INICIAR COMBATE!</span>
        </button>
      </div>
    </div>
  );
};
