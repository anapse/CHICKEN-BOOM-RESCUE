import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Flame, Radio, Shield, Sparkles, Zap } from 'lucide-react';
import { PlayerState } from '../game/types';

interface BottomPowerUpsProps {
  player: PlayerState;
  hasActiveRemoteBomb: boolean;
  onMove: (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
  onPlaceBomb: () => void;
  onTriggerRemote: () => void;
}

export const BottomPowerUps: React.FC<BottomPowerUpsProps> = ({
  player,
  hasActiveRemoteBomb,
  onMove,
  onPlaceBomb,
  onTriggerRemote,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none p-2 sm:p-3 flex flex-col gap-2">
      {/* 1. Active Power-Ups Row (Overlay bar) */}
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto w-full pointer-events-auto">
        {/* Double / Triple Egg Status */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-black transition-all ${
            player.bombRange > 1
              ? 'bg-amber-600/90 border-amber-300 text-yellow-200 shadow-md animate-pulse'
              : 'bg-black/40 border-zinc-700/60 text-zinc-500'
          }`}
        >
          <Flame size={14} className={player.bombRange > 1 ? 'text-yellow-300' : 'text-zinc-600'} />
          <span>ALCANCE {player.bombRange}</span>
          {player.bombType !== 'NORMAL' && (
            <span className="text-[10px] bg-black/40 px-1 rounded">({player.bombStock})</span>
          )}
        </div>

        {/* Shield Status */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-black transition-all ${
            player.hasShield
              ? 'bg-blue-600/90 border-blue-300 text-blue-100 shadow-md animate-pulse'
              : 'bg-black/40 border-zinc-700/60 text-zinc-500'
          }`}
        >
          <Shield size={14} className={player.hasShield ? 'text-blue-200' : 'text-zinc-600'} />
          <span>{player.hasShield ? `${Math.ceil(player.shieldTimer)}s` : 'ESCUDO'}</span>
        </div>

        {/* Ghost Status */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-black transition-all ${
            player.isGhost
              ? 'bg-purple-600/90 border-purple-300 text-purple-100 shadow-md animate-pulse'
              : 'bg-black/40 border-zinc-700/60 text-zinc-500'
          }`}
        >
          <Sparkles size={14} className={player.isGhost ? 'text-purple-200' : 'text-zinc-600'} />
          <span>{player.isGhost ? `${Math.ceil(player.ghostTimer)}s` : 'FANTASMA'}</span>
        </div>

        {/* Speed Status */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-black transition-all ${
            player.speedMultiplier > 1
              ? 'bg-emerald-600/90 border-emerald-300 text-emerald-100 shadow-md animate-pulse'
              : 'bg-black/40 border-zinc-700/60 text-zinc-500'
          }`}
        >
          <Zap size={14} className={player.speedMultiplier > 1 ? 'text-emerald-200' : 'text-zinc-600'} />
          <span>VELOCIDAD</span>
        </div>
      </div>

      {/* 2. On-Screen Touch Controls (Mobile-First Gameplay) */}
      <div className="flex items-center justify-between max-w-md mx-auto w-full px-2 pointer-events-auto">
        {/* Directional Pad */}
        <div className="relative w-32 h-32 bg-black/40 backdrop-blur-md rounded-full border-2 border-amber-600/40 p-2 shadow-xl flex items-center justify-center">
          {/* UP */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onMove('UP'); }}
            onClick={() => onMove('UP')}
            className="absolute top-1 left-10 w-12 h-10 bg-gradient-to-b from-amber-600 to-amber-800 active:from-amber-400 active:to-amber-600 rounded-xl flex items-center justify-center text-white shadow border border-amber-500"
          >
            <ChevronUp size={24} />
          </button>

          {/* DOWN */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onMove('DOWN'); }}
            onClick={() => onMove('DOWN')}
            className="absolute bottom-1 left-10 w-12 h-10 bg-gradient-to-b from-amber-600 to-amber-800 active:from-amber-400 active:to-amber-600 rounded-xl flex items-center justify-center text-white shadow border border-amber-500"
          >
            <ChevronDown size={24} />
          </button>

          {/* LEFT */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onMove('LEFT'); }}
            onClick={() => onMove('LEFT')}
            className="absolute left-1 top-10 w-10 h-12 bg-gradient-to-r from-amber-600 to-amber-800 active:from-amber-400 active:to-amber-600 rounded-xl flex items-center justify-center text-white shadow border border-amber-500"
          >
            <ChevronLeft size={24} />
          </button>

          {/* RIGHT */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onMove('RIGHT'); }}
            onClick={() => onMove('RIGHT')}
            className="absolute right-1 top-10 w-10 h-12 bg-gradient-to-l from-amber-600 to-amber-800 active:from-amber-400 active:to-amber-600 rounded-xl flex items-center justify-center text-white shadow border border-amber-500"
          >
            <ChevronRight size={24} />
          </button>

          {/* Center Hub */}
          <div className="w-8 h-8 rounded-full bg-amber-950/80 border border-amber-600/50" />
        </div>

        {/* Action Buttons: Remote Detonate & Main Egg Bomb */}
        <div className="flex items-center gap-3">
          {/* Remote Detonate Button (appears when remote bomb equipped or active) */}
          {(player.bombType === 'REMOTE' || hasActiveRemoteBomb) && (
            <button
              onTouchStart={(e) => { e.preventDefault(); onTriggerRemote(); }}
              onClick={onTriggerRemote}
              className="w-16 h-16 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-700 active:scale-95 border-2 border-emerald-300 shadow-xl flex flex-col items-center justify-center text-white animate-pulse"
              title="Detonar Bomba Remota"
            >
              <Radio size={22} />
              <span className="text-[10px] font-black uppercase mt-0.5">DETONAR</span>
            </button>
          )}

          {/* MAIN BOMB BUTTON: Stylized Egg with Spark */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onPlaceBomb(); }}
            onClick={onPlaceBomb}
            className="w-20 h-20 rounded-3xl btn-cartoon-red flex flex-col items-center justify-center text-white active:scale-90 transition-transform shadow-2xl relative group"
            title="Colocar Huevo Bomba (Espacio)"
          >
            {/* Cute Egg Bomb Graphic */}
            <div className="relative w-9 h-11 bg-white rounded-full border-2 border-amber-950 flex items-center justify-center shadow-inner">
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 left-2" />
              <span className="w-2 h-2 rounded-full bg-red-500 absolute bottom-2 right-2" />
              {/* Burning fuse */}
              <span className="w-1 h-3 bg-amber-900 absolute -top-3 left-3 rounded-full" />
              <span className="w-2 h-2 bg-yellow-400 rounded-full absolute -top-4 left-2.5 animate-ping" />
            </div>
            <span className="text-[10px] font-['Titan_One',sans-serif] tracking-wider mt-0.5 text-yellow-200">
              BOMBA
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
