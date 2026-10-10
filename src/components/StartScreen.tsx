import React from 'react';
import { Mail, Play, Trophy, Users, Volume, Volume1, Volume2, VolumeX, Shield, Zap, Sparkles } from 'lucide-react';
import { SoundVolumeLevel } from '../audio/soundManager';
import { CharacterConfig } from '../game/types';

interface StartScreenProps {
  volumeLevel: SoundVolumeLevel;
  selectedCharacter: CharacterConfig;
  onCycleVolume: () => void;
  onOpenContact: () => void;
  onStartSinglePlayer: () => void;
  onOpenMultiplayer: () => void;
  onOpenRanking: () => void;
  onOpenCharacterSelect: () => void;
  onOpenAdmin: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  volumeLevel,
  selectedCharacter,
  onCycleVolume,
  onOpenContact,
  onStartSinglePlayer,
  onOpenMultiplayer,
  onOpenRanking,
  onOpenCharacterSelect,
  onOpenAdmin,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-4 overflow-y-auto select-none bg-gradient-to-b from-sky-400 via-amber-200 to-green-600">
      {/* Cartoon Sky Clouds & Sun */}
      <div className="absolute top-2 left-6 w-24 h-10 bg-white/70 rounded-full blur-[1px] pointer-events-none" />
      <div className="absolute top-6 right-8 w-28 h-12 bg-white/60 rounded-full blur-[1px] pointer-events-none" />

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

      {/* Center: Vibrant Cartoon Logo (matching uploaded logo.png) */}
      <div className="flex flex-col items-center justify-center my-auto z-10 text-center max-w-xs">
        {/* Logo Mascot Illustration */}
        <div className="relative mb-2">
          {/* Chick Face with Rambo Bandana */}
          <div className="w-24 h-24 bg-white rounded-full border-4 border-amber-950 shadow-2xl relative flex items-center justify-center mx-auto">
            {/* Red Bandana */}
            <div className="absolute -top-1 w-24 h-7 bg-red-600 rounded-t-full border-b-2 border-amber-950 flex items-center justify-center">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">RAMBO</span>
            </div>
            {/* Bandana Tail */}
            <div className="absolute top-2 -right-5 w-6 h-4 bg-red-600 rounded-r-full -rotate-12 border border-amber-950" />
            {/* Eyes */}
            <div className="flex gap-4 mt-2">
              <div className="w-4 h-4 bg-amber-950 rounded-full relative">
                <span className="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 right-0.5" />
              </div>
              <div className="w-4 h-4 bg-amber-950 rounded-full relative">
                <span className="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 right-0.5" />
              </div>
            </div>
            {/* Beak */}
            <div className="w-5 h-4 bg-amber-400 border-2 border-amber-950 rounded-b-full absolute bottom-4" />
          </div>

          {/* Glowing Egg Bomb in Hand */}
          <div className="absolute -bottom-2 -right-3 w-12 h-14 bg-white rounded-full border-2 border-amber-950 shadow-lg flex items-center justify-center">
            <span className="w-3 h-3 bg-red-600 rounded-full absolute top-3 left-2" />
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full absolute bottom-2 right-2" />
            {/* Fuse & Spark */}
            <span className="w-1 h-3 bg-amber-900 absolute -top-3 left-3 rounded-full" />
            <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full absolute -top-4 left-2.5 animate-ping" />
          </div>
        </div>

        {/* 3D Title: CHICKEN BOOM RESCUE */}
        <h1 className="font-['Titan_One',sans-serif] text-4xl sm:text-5xl text-yellow-300 text-stroke-lg tracking-wider drop-shadow-[0_6px_0_#78350f]">
          CHICKEN
        </h1>
        <div className="relative">
          <h2 className="font-['Titan_One',sans-serif] text-5xl sm:text-6xl text-red-500 text-stroke-lg tracking-widest drop-shadow-[0_8px_0_#450a0a]">
            BOOM
          </h2>
        </div>
        {/* Wooden Plaque "RESCUE" */}
        <div className="mt-1 px-6 py-1.5 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 rounded-xl border-4 border-amber-950 shadow-xl rotate-[-2deg]">
          <span className="font-['Titan_One',sans-serif] text-2xl text-white tracking-widest drop-shadow-[0_2px_0_#451a03]">
            RESCUE
          </span>
        </div>
      </div>

      {/* Selected Character Quick Selector */}
      <div className="w-full max-w-xs z-10 mb-3">
        <button
          onClick={onOpenCharacterSelect}
          className="w-full flex items-center justify-between px-3 py-2 bg-amber-950/80 backdrop-blur-md rounded-2xl border-2 border-amber-500/80 text-amber-200 hover:bg-amber-900 transition-colors shadow-lg"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedCharacter.avatarEmoji}</span>
            <div className="text-left">
              <div className="text-[11px] text-amber-400 uppercase font-bold">Personaje Seleccionado</div>
              <div className="text-xs font-black text-white">{selectedCharacter.name}</div>
            </div>
          </div>
          <span className="text-[11px] font-black bg-amber-600/80 px-2 py-0.5 rounded-lg text-white">
            CAMBIAR
          </span>
        </button>
      </div>

      {/* 3 Main Action Buttons */}
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
