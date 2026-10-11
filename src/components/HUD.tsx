import React from 'react';
import { Heart, Pause, Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { SoundVolumeLevel } from '../audio/soundManager';
import { CHARACTERS } from '../game/constants';
import { SPRITE_ASSETS } from '../game/spriteAssets';
import { PlayerState } from '../game/types';

interface HUDProps {
  player: PlayerState;
  timeRemaining: number;
  currentLevel: number;
  volumeLevel: SoundVolumeLevel;
  onCycleVolume: () => void;
  onPause: () => void;
  onUseInventorySlot: (slotIndex: number) => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  timeRemaining,
  currentLevel,
  volumeLevel,
  onCycleVolume,
  onPause,
  onUseInventorySlot,
}) => {
  const charConfig = CHARACTERS.find((c) => c.id === player.characterId) || CHARACTERS[0];
  const mins = Math.floor(timeRemaining / 60);
  const secs = Math.floor(timeRemaining % 60);
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isTimeCritical = timeRemaining < 45;
  const characterSrc = player.characterId === 'rambo_hembra'
    ? SPRITE_ASSETS.pollitaRambo.src
    : player.characterId === 'exploradora'
      ? SPRITE_ASSETS.gallinitaExploradora.src
      : SPRITE_ASSETS.pollitoRambo.src;

  return (
    <>
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-1.5 overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)_minmax(0,0.85fr)_32px] items-center gap-1 w-full min-w-0 pointer-events-auto">
        {/* Panel 1: character portrait and remaining lives */}
        <div className="flex min-w-0 items-center gap-1.5 rounded-xl border-2 border-amber-600/70 bg-black/75 px-1.5 py-1 shadow-lg">
          <div
            className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-amber-300 bg-amber-500"
            aria-label={charConfig.name}
            title={charConfig.name}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("${characterSrc}")`,
                backgroundSize: '400% 400%',
                backgroundPosition: '0% 0%',
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
              }}
            />
            {player.hasShield && <span className="absolute right-0 top-0 h-2 w-2 rounded-full border border-white bg-blue-500" />}
            {player.isGhost && <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white bg-purple-500" />}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="flex items-center gap-1 text-[11px] font-black leading-none text-white">
              <Heart size={13} className="shrink-0 fill-red-500 text-red-500" />
              <span>x{player.lives}</span>
            </span>
          </div>
        </div>

        {/* Panel 2: timer and level */}
        <div className="flex min-w-0 flex-col items-center rounded-xl border-2 border-amber-500/80 bg-black/75 px-1 py-1 shadow-lg">
          <span className="truncate text-[9px] font-black uppercase leading-tight tracking-wide text-amber-300">NIVEL {currentLevel}</span>
          <span className={`font-['Titan_One',sans-serif] text-base font-black leading-tight tracking-tight ${isTimeCritical ? 'animate-pulse text-red-400' : 'text-yellow-300'}`}>
            {timeFormatted}
          </span>
        </div>

        {/* Panel 3: score is the single points/currency counter */}
        <div className="flex min-w-0 flex-col items-center rounded-xl border-2 border-amber-600/70 bg-amber-950/90 px-1 py-1 shadow-lg">
          <span className="text-[9px] font-black leading-tight text-amber-300">SCORE</span>
          <span className="w-full truncate text-center text-sm font-black leading-tight tabular-nums text-white">{player.score}</span>
        </div>

        {/* Panel 4: vertically stacked pause and sound buttons */}
        <div className="flex w-8 shrink-0 flex-col items-center gap-1">
          <button
            onClick={onPause}
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-amber-300 bg-amber-600 text-white shadow active:scale-95"
            title="Pausar partida"
            aria-label="Pausar partida"
          >
            <Pause size={16} />
          </button>
          <button
            onClick={onCycleVolume}
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-amber-500/60 bg-black/75 text-amber-300 shadow active:scale-95"
            title={`Volumen: ${volumeLevel}%`}
            aria-label="Cambiar volumen"
          >
            {volumeLevel === 100 && <Volume2 size={16} />}
            {volumeLevel === 50 && <Volume1 size={16} />}
            {volumeLevel === 25 && <Volume size={16} />}
            {volumeLevel === 0 && <VolumeX size={16} className="text-red-400" />}
          </button>
        </div>
      </div>
    </header>
    <div className="absolute bottom-2 left-1/2 z-30 flex max-w-[96%] -translate-x-1/2 items-center gap-1 rounded-xl border border-amber-600/70 bg-black/85 p-1.5 shadow-xl pointer-events-auto">
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 border-amber-400 bg-amber-950" title="Huevo normal ilimitado">
        <div className="absolute inset-0" style={{ backgroundImage: `url("${SPRITE_ASSETS.iconSheet.src}")`, backgroundSize: '400% 300%', backgroundPosition: '0% 0%', backgroundRepeat: 'no-repeat' }} />
        <span className="absolute bottom-0 right-0 rounded-tl bg-black/85 px-1 text-[9px] font-black leading-tight text-amber-200">∞</span>
      </div>
      <div className="mx-0.5 h-8 w-px shrink-0 bg-amber-500/70" />
      {Array.from({ length: 6 }).map((_, slotIndex) => {
        // Display one slot per power-up type; duplicates become a quantity badge.
        const uniqueItems = player.inventory.filter((candidate, index) => player.inventory.indexOf(candidate) === index);
        const visibleItem = uniqueItems[slotIndex];
        const itemIndex = visibleItem ? player.inventory.indexOf(visibleItem) : -1;
        const visuals: Record<string, { col: number; row: number; label: string }> = {
          HEART: { col: 0, row: 2, label: 'Corazón: +1 vida' },
          POWERUP_DOUBLE_EGG: { col: 1, row: 0, label: 'Huevo doble' },
          POWERUP_TRIPLE_EGG: { col: 2, row: 0, label: 'Huevo triple' },
          POWERUP_SPEED: { col: 0, row: 1, label: 'Velocidad' },
          POWERUP_GHOST: { col: 2, row: 1, label: 'Fantasma' },
          POWERUP_SHIELD: { col: 1, row: 1, label: 'Escudo' },
          POWERUP_REMOTE: { col: 3, row: 0, label: 'Detonador remoto' },
        };
        const visual = visibleItem ? visuals[visibleItem] : undefined;
        const quantity = visibleItem ? player.inventory.filter((stored) => stored === visibleItem).length : 0;
        const colPosition = visual ? (visual.col / 3) * 100 : 0;
        const rowPosition = visual ? (visual.row / 2) * 100 : 0;
        return (
          <button
            key={slotIndex}
            onClick={() => itemIndex >= 0 && onUseInventorySlot(itemIndex)}
            disabled={!visibleItem || visibleItem === 'KEY' || visibleItem === 'COIN' || visibleItem === 'NONE'}
            title={visual?.label || (visibleItem === 'KEY' ? 'Llave: se usa automáticamente en la jaula' : 'Espacio vacío')}
            aria-label={visual?.label || (visibleItem === 'KEY' ? 'Llave de la jaula' : 'Espacio vacío')}
            className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 ${visibleItem ? 'border-amber-400 bg-amber-900/90 active:scale-95' : 'border-white/20 bg-white/5 opacity-70'}`}
          >
            {visual && <span className="absolute inset-0" style={{ backgroundImage: `url("${SPRITE_ASSETS.iconSheet.src}")`, backgroundSize: '400% 300%', backgroundPosition: `${colPosition}% ${rowPosition}%`, backgroundRepeat: 'no-repeat' }} />}
            {visibleItem && quantity > 1 && <span className="absolute right-0 top-0 z-10 min-w-3 rounded-bl bg-black/95 px-1 text-[10px] font-black leading-tight text-white">{quantity}</span>}
            {!visibleItem && <span className="absolute inset-0 flex items-center justify-center text-sm text-white/20">·</span>}
          </button>
        );
      })}
    </div>
    </>
  );
};
