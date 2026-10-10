import React, { useEffect, useState } from 'react';
import { X, Check, Shield, Zap, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { CHARACTERS } from '../game/constants';
import { CharacterConfig } from '../game/types';
import { spriteManager } from '../game/SpriteManager';

interface CharacterSelectModalProps {
  selectedId: string;
  onSelect: (char: CharacterConfig) => void;
  onClose: () => void;
}

const CHARACTER_IMAGES: Record<string, string> = {
  // Use the large standalone character illustrations for the selector, never animation sprite sheets.
  rambo_macho: './sprites/Imagen de ChatGPT 10 oct 2026, 15_49_43.png',
  rambo_hembra: './sprites/Imagen de ChatGPT 10 oct 2026, 15_49_56.png',
  exploradora: './sprites/Imagen de ChatGPT 10 oct 2026, 15_50_04.png',
};

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  selectedId,
  onSelect,
  onClose,
}) => {
  const initialIndex = Math.max(0, CHARACTERS.findIndex((char) => char.id === selectedId));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const selectedCharacter = CHARACTERS[activeIndex] ?? CHARACTERS[0];

  useEffect(() => {
    let cancelled = false;
    void Promise.all(
      CHARACTERS.map(async (character) => {
        const src = CHARACTER_IMAGES[character.id];
        const image = await spriteManager.load(src);
        if (!cancelled) setLoadedImages((current) => ({ ...current, [character.id]: Boolean(image) }));
      }),
    );
    return () => { cancelled = true; };
  }, []);

  const changeCharacter = (direction: -1 | 1) => {
    setActiveIndex((current) => (current + direction + CHARACTERS.length) % CHARACTERS.length);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[340px] max-h-full overflow-y-auto cartoon-card rounded-3xl p-3 sm:p-4 flex flex-col items-center border-4 border-amber-900 shadow-2xl">
        <button
          type="button"
          aria-label="Cerrar selección de personaje"
          onClick={onClose}
          className="absolute top-2 right-2 z-10 text-amber-900 hover:text-red-600 transition-colors p-1"
        >
          <X size={22} />
        </button>

        <h3 className="font-['Titan_One',sans-serif] text-xl sm:text-2xl text-amber-950 text-center tracking-wide pr-6">
          ELIGE TU POLLITO
        </h3>
        <p className="text-[11px] font-bold text-amber-800 text-center mt-0.5 mb-2">
          Desliza o usa las flechas para ver los 3 héroes
        </p>

        <div className="w-full flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Personaje anterior"
            onClick={() => changeCharacter(-1)}
            className="shrink-0 w-9 h-10 rounded-xl bg-amber-200 border-2 border-amber-700 text-amber-950 flex items-center justify-center active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>

          <div
            className="min-w-0 flex-1 flex flex-col items-center"
            onTouchStart={(event) => {
              const touch = event.touches[0];
              (event.currentTarget as HTMLDivElement).dataset.touchX = String(touch.clientX);
            }}
            onTouchEnd={(event) => {
              const startX = Number((event.currentTarget as HTMLDivElement).dataset.touchX);
              const endX = event.changedTouches[0]?.clientX ?? startX;
              const delta = endX - startX;
              if (Math.abs(delta) > 35) changeCharacter(delta < 0 ? 1 : -1);
            }}
          >
            <div className="w-full h-36 sm:h-40 rounded-2xl border-3 border-amber-900 bg-white/80 flex items-center justify-center overflow-hidden p-2">
              {loadedImages[selectedCharacter.id] ? (
                <img
                  key={selectedCharacter.id}
                  src={CHARACTER_IMAGES[selectedCharacter.id]}
                  alt={selectedCharacter.name}
                  className="max-w-full max-h-full object-contain"
                  draggable={false}
                />
              ) : (
                <span className="text-5xl" aria-label={selectedCharacter.name}>{selectedCharacter.avatarEmoji}</span>
              )}
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-2" aria-label={`Personaje ${activeIndex + 1} de ${CHARACTERS.length}`}>
              {CHARACTERS.map((character, index) => (
                <button
                  key={character.id}
                  type="button"
                  aria-label={`Ver ${character.name}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${index === activeIndex ? 'w-6 bg-amber-700' : 'w-2.5 bg-amber-300'}`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            aria-label="Personaje siguiente"
            onClick={() => changeCharacter(1)}
            className="shrink-0 w-9 h-10 rounded-xl bg-amber-200 border-2 border-amber-700 text-amber-950 flex items-center justify-center active:scale-95"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="w-full mt-2 text-center">
          <h4 className="font-['Titan_One',sans-serif] text-lg text-amber-950 leading-tight">{selectedCharacter.name}</h4>
          <p className="text-[10px] text-amber-900/80 font-semibold mt-0.5 line-clamp-2">{selectedCharacter.description}</p>
          <div className="grid grid-cols-3 gap-2 mt-2 text-left">
            <div>
              <div className="flex items-center gap-1 text-[10px] font-black text-blue-700"><Shield size={11} /><span>DEF {selectedCharacter.defense}/5</span></div>
              <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden mt-0.5"><div className="bg-blue-600 h-full rounded-full" style={{ width: `${(selectedCharacter.defense / 5) * 100}%` }} /></div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[10px] font-black text-amber-700"><Zap size={11} /><span>VEL {selectedCharacter.speed}/5</span></div>
              <div className="w-full bg-amber-100 h-1.5 rounded-full overflow-hidden mt-0.5"><div className="bg-amber-600 h-full rounded-full" style={{ width: `${(selectedCharacter.speed / 5) * 100}%` }} /></div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[10px] font-black text-red-700"><Flame size={11} /><span>FZA {selectedCharacter.strength}/5</span></div>
              <div className="w-full bg-red-100 h-1.5 rounded-full overflow-hidden mt-0.5"><div className="bg-red-600 h-full rounded-full" style={{ width: `${(selectedCharacter.strength / 5) * 100}%` }} /></div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelect(selectedCharacter)}
          className="w-full py-2.5 mt-3 rounded-2xl btn-cartoon-yellow font-['Titan_One',sans-serif] text-base text-amber-950 tracking-wider shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <Check size={18} /> CONFIRMAR PERSONAJE
        </button>
      </div>
    </div>
  );
};
