import React from 'react';
import { Heart, Key, Pause, Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { SoundVolumeLevel } from '../audio/soundManager';
import { CHARACTERS } from '../game/constants';
import { PlayerState } from '../game/types';

interface HUDProps {
  player: PlayerState;
  timeRemaining: number;
  currentLevel: number;
  volumeLevel: SoundVolumeLevel;
  onCycleVolume: () => void;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  timeRemaining,
  currentLevel,
  volumeLevel,
  onCycleVolume,
  onPause,
}) => {
  const charConfig = CHARACTERS.find((c) => c.id === player.characterId) || CHARACTERS[0];

  // Format timer MM:SS
  const mins = Math.floor(timeRemaining / 60);
  const secs = Math.floor(timeRemaining % 60);
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isTimeCritical = timeRemaining < 45;

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-1.5 flex flex-col gap-1 overflow-hidden">
      {/* Top Bar Container */}
      <div className="flex items-center justify-between gap-1 max-w-full mx-auto w-full min-w-0 pointer-events-auto">
        {/* Left: Player Profile & Hearts */}
        <div className="flex items-center gap-1.5 min-w-0 max-w-[42%] bg-black/60 backdrop-blur-md rounded-2xl px-1.5 py-1 border-2 border-amber-600/60 shadow-lg">
          {/* Avatar Icon */}
          <div className="relative w-8 h-8 shrink-0 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center text-xl shadow border border-amber-300">
            <span>{charConfig.avatarEmoji}</span>
            {player.hasShield && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border border-white" />
            )}
            {player.isGhost && (
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-purple-500 rounded-full border border-white" />
            )}
          </div>

          {/* Hearts & Player Name */}
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-amber-200 tracking-wider truncate max-w-[62px] leading-tight">
              {player.name || charConfig.name}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: player.maxLives }).map((_, i) => (
                <Heart
                  key={i}
                  size={12}
                  className={`transition-transform ${
                    i < player.lives
                      ? 'text-red-500 fill-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.7)] animate-pulse'
                      : 'text-zinc-600 fill-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center: Stylized Timer & Level */}
        <div className="flex shrink-0 flex-col items-center bg-black/70 backdrop-blur-md px-2 py-1 rounded-2xl border-2 border-amber-500/80 shadow-xl">
          <span className="text-[10px] uppercase font-black text-amber-300 tracking-wider">
            NIVEL {currentLevel}
          </span>
          <span
            className={`font-['Titan_One',sans-serif] text-lg tracking-wider leading-tight ${
              isTimeCritical ? 'text-red-400 animate-ping' : 'text-yellow-300'
            }`}
          >
            {timeFormatted}
          </span>
        </div>

        {/* Right: compact key, sound and pause controls */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Golden Key Indicator */}
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${
              player.hasKey
                ? 'bg-gradient-to-b from-yellow-300 to-amber-500 border-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.9)] animate-bounce'
                : 'bg-black/50 border-zinc-700 opacity-40'
            }`}
            title={player.hasKey ? '¡Tienes la Llave de Oro!' : 'Busca la Llave en las Cajas'}
          >
            <Key size={18} className={player.hasKey ? 'text-amber-950 fill-amber-950' : 'text-zinc-400'} />
          </div>

          {/* Sound Button with 4 states */}
          <button
            onClick={onCycleVolume}
            className="w-8 h-8 shrink-0 rounded-xl bg-black/60 hover:bg-black/80 border-2 border-amber-500/60 flex items-center justify-center text-amber-300 active:scale-95 transition-transform"
            title={`Volumen: ${volumeLevel}%`}
          >
            {volumeLevel === 100 && <Volume2 size={18} />}
            {volumeLevel === 50 && <Volume1 size={18} />}
            {volumeLevel === 25 && <Volume size={18} />}
            {volumeLevel === 0 && <VolumeX size={18} className="text-red-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="w-8 h-8 shrink-0 rounded-xl bg-amber-600 hover:bg-amber-500 border-2 border-amber-300 flex items-center justify-center text-white active:scale-95 transition-transform shadow-md"
            title="Pausar Partida"
          >
            <Pause size={18} />
          </button>
        </div>
      </div>

      {/* Sub-bar: Score & Coins banner */}
      <div className="flex items-center justify-between max-w-full mx-auto w-full px-1 pointer-events-auto">
        <div className="bg-amber-950/80 backdrop-blur-sm border border-amber-700/60 px-2.5 py-0.5 rounded-full text-[11px] font-black text-amber-300 flex items-center gap-1 shadow">
          <span>SCORE:</span>
          <span className="text-white text-xs">{player.score}</span>
        </div>

        <div className="bg-amber-950/80 backdrop-blur-sm border border-amber-700/60 px-2.5 py-0.5 rounded-full text-[11px] font-black text-yellow-400 flex items-center gap-1 shadow">
          <span>🪙 MONEDAS:</span>
          <span className="text-white text-xs">{player.coins}</span>
        </div>
      </div>
    </header>
  );
};
