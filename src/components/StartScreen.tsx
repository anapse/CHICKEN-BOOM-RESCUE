import React from 'react';
import { Mail, Play, Trophy, Users, Volume, Volume1, Volume2, VolumeX, Shield, Zap, Sparkles } from 'lucide-react';
import { SoundVolumeLevel } from '../audio/soundManager';
import { spriteManager } from '../game/SpriteManager';
import { SPRITE_ASSETS } from '../game/spriteAssets';

interface StartScreenProps {
  volumeLevel: SoundVolumeLevel;
  onCycleVolume: () => void;
  onOpenContact: () => void;
  onStartSinglePlayer: () => void;
  onOpenMultiplayer: () => void;
  onOpenRanking: () => void;
  onOpenAdmin: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  volumeLevel,
  onCycleVolume,
  onOpenContact,
  onStartSinglePlayer,
  onOpenMultiplayer,
  onOpenRanking,
  onOpenAdmin,
}) => {
  const [hasMenuBg, setHasMenuBg] = React.useState(false);
  const [hasLogoImg, setHasLogoImg] = React.useState(false);

  React.useEffect(() => {
    // Reuse the centralized asset cache for menu art.
    void spriteManager.load(SPRITE_ASSETS.menuBackground.src).then((image) => setHasMenuBg(Boolean(image)));
    void spriteManager.load(SPRITE_ASSETS.logo.src).then((image) => setHasLogoImg(Boolean(image)));
  }, []);

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between items-center p-4 overflow-y-auto select-none bg-gradient-to-b from-sky-400 via-amber-200 to-green-600 bg-cover bg-center"
      style={hasMenuBg ? { backgroundImage: `url('./sprites/fondomenu.png')` } : undefined}
    >
      {/* Top Header Controls: Contact & Sound */}
      <div className="w-full max-w-md flex items-center justify-between z-10 pt-2">
        {/* Contact Button */}
        <button
          onClick={onOpenContact}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-900/80 hover:bg-amber-800 text-amber-200 border-2 border-amber-500 shadow-lg text-xs font-black active:scale-95 transition-transform"
        >
          <Mail size={16} />
          <span>CONTACTO</span>
        </button>

        {/* Sound Toggle (4 States) */}
        <button
          onClick={onCycleVolume}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-900/80 hover:bg-amber-800 text-amber-300 border-2 border-amber-500 shadow-lg text-xs font-black active:scale-95 transition-transform"
        >
          {volumeLevel === 100 && <Volume2 size={18} />}
          {volumeLevel === 50 && <Volume1 size={18} />}
          {volumeLevel === 25 && <Volume size={18} />}
          {volumeLevel === 0 && <VolumeX size={18} className="text-red-400" />}
          <span>{volumeLevel}%</span>
        </button>
      </div>

      {/* Center Logo */}
      <div className="flex flex-col items-center justify-center my-auto z-10 text-center max-w-xs">
        {hasLogoImg ? (
          <img
            src={SPRITE_ASSETS.logo.src}
            alt="Chicken Boom Rescue"
            className="w-full max-w-[280px] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
          />
        ) : (
          <div className="flex flex-col items-center">
            <h1 className="font-['Titan_One',sans-serif] text-4xl sm:text-5xl text-yellow-300 text-stroke-lg tracking-wider drop-shadow-[0_6px_0_#78350f]">
              CHICKEN
            </h1>
            <h2 className="font-['Titan_One',sans-serif] text-5xl sm:text-6xl text-red-500 text-stroke-lg tracking-widest drop-shadow-[0_8px_0_#450a0a]">
              BOOM
            </h2>
            <div className="mt-1 px-6 py-1.5 bg-amber-800 rounded-xl border-3 border-amber-950 shadow-xl">
              <span className="font-['Titan_One',sans-serif] text-2xl text-white tracking-widest">
                RESCUE
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Action Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-2.5 z-10 mb-2">
        {/* 1. JUGAR (Modo Individual / Back) */}
        <button
          onClick={onStartSinglePlayer}
          className="w-full py-3.5 px-4 rounded-2xl btn-cartoon-yellow flex items-center justify-center gap-2.5 font-['Titan_One',sans-serif] text-2xl text-amber-950 tracking-wider shadow-2xl active:scale-95 transition-all"
        >
          <Play size={26} className="fill-amber-950" />
          <span>JUGAR</span>
        </button>

        {/* 2. MULTIJUGADOR (2 Jugadores / Batalla de la Copa) */}
        <button
          onClick={onOpenMultiplayer}
          className="w-full py-3 px-4 rounded-2xl btn-cartoon-blue flex items-center justify-center gap-2.5 font-['Titan_One',sans-serif] text-xl text-white tracking-wider shadow-2xl active:scale-95 transition-all"
        >
          <Users size={22} />
          <span>MULTIJUGADOR</span>
        </button>

        {/* 3. TOP 50 RANKING */}
        <button
          onClick={onOpenRanking}
          className="w-full py-3 px-4 rounded-2xl btn-cartoon-green flex items-center justify-center gap-2.5 font-['Titan_One',sans-serif] text-xl text-white tracking-wider shadow-2xl active:scale-95 transition-all"
        >
          <Trophy size={22} className="text-yellow-200 fill-yellow-300" />
          <span>TOP 50 RANKING</span>
        </button>
      </div>

      {/* Admin Panel Quick Link */}
      <div className="z-10 pb-1">
        <button
          onClick={onOpenAdmin}
          className="text-[11px] font-bold text-amber-900/80 hover:text-amber-950 underline cursor-pointer"
        >
          Dashboard Administrativo /admin
        </button>
      </div>
    </div>
  );
};
