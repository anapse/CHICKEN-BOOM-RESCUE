import React, { useState } from 'react';
import { X, Check, Shield, Zap, Flame } from 'lucide-react';
import { CHARACTERS } from '../game/constants';
import { CharacterConfig } from '../game/types';

interface CharacterSelectModalProps {
  selectedId: string;
  onSelect: (char: CharacterConfig) => void;
  onClose: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  selectedId,
  onSelect,
  onClose,
}) => {
  const [pendingId, setPendingId] = useState(selectedId);
  const selectedCharacter = CHARACTERS.find((char) => char.id === pendingId) ?? CHARACTERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md cartoon-card rounded-3xl p-5 sm:p-6 flex flex-col items-center border-4 border-amber-900 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-900 hover:text-red-600 transition-colors"
        >
          <X size={24} />
        </button>

        <h3 className="font-['Titan_One',sans-serif] text-2xl sm:text-3xl text-amber-950 text-center tracking-wide">
          SELECCIÓN DE HÉROE
        </h3>
        <p className="text-xs font-bold text-amber-800 text-center mt-0.5 mb-4">
          Elige tu plumífero favorito para la misión de rescate
        </p>

        {/* Characters Grid */}
        <div className="w-full flex flex-col gap-3">
          {CHARACTERS.map((char) => {
            const isSelected = char.id === pendingId;
            return (
              <button
                type="button"
                key={char.id}
                aria-pressed={isSelected}
                onClick={() => setPendingId(char.id)}
                className={`relative w-full p-3.5 rounded-2xl border-3 cursor-pointer transition-all flex items-center gap-3.5 ${
                  isSelected
                    ? 'bg-amber-100 border-amber-600 shadow-md scale-[1.02]'
                    : 'bg-white/80 border-amber-300 hover:bg-amber-50'
                }`}
              >
                {/* Character Avatar */}
                <div
                  className="w-16 h-16 rounded-2xl border-3 border-amber-950 flex items-center justify-center text-3xl shadow-md shrink-0"
                  style={{ backgroundColor: `${char.color}25` }}
                >
                  <span>{char.avatarEmoji}</span>
                </div>

                {/* Character Info & Stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-['Titan_One',sans-serif] text-base text-amber-950 truncate">
                      {char.name}
                    </span>
                    {isSelected && (
                      <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check size={12} /> ACTIVO
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-amber-900/80 line-clamp-1 mb-1 font-semibold">
                    {char.description}
                  </p>

                  {/* Stats Bars */}
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {/* Defensa */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-[10px] font-black text-blue-700">
                        <Shield size={11} />
                        <span>DEF {char.defense}/5</span>
                      </div>
                      <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${(char.defense / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Velocidad */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-[10px] font-black text-amber-700">
                        <Zap size={11} />
                        <span>VEL {char.speed}/5</span>
                      </div>
                      <div className="w-full bg-amber-100 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div
                          className="bg-amber-600 h-full rounded-full"
                          style={{ width: `${(char.speed / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Fuerza */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-[10px] font-black text-red-700">
                        <Flame size={11} />
                        <span>FZA {char.strength}/5</span>
                      </div>
                      <div className="w-full bg-red-100 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div
                          className="bg-red-600 h-full rounded-full"
                          style={{ width: `${(char.strength / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onSelect(selectedCharacter)}
          className="w-full py-3 mt-4 rounded-2xl btn-cartoon-yellow font-['Titan_One',sans-serif] text-lg text-amber-950 tracking-wider shadow-lg active:scale-95 transition-transform"
        >
          CONFIRMAR ELECCIÓN
        </button>
      </div>
    </div>
  );
};
