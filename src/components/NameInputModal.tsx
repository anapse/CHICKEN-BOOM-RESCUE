import React, { useState } from 'react';
import { User, Play, X } from 'lucide-react';

interface NameInputModalProps {
  initialName: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export const NameInputModal: React.FC<NameInputModalProps> = ({
  initialName,
  onConfirm,
  onCancel,
}) => {
  const [name, setName] = useState(initialName || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('¡Por favor ingresa tu nombre de héroe para continuar!');
      return;
    }
    if (trimmed.length > 25) {
      setError('El nombre no debe superar los 25 caracteres.');
      return;
    }
    setError('');
    onConfirm(trimmed);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm cartoon-card rounded-3xl p-6 flex flex-col items-center border-4 border-amber-900 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-amber-900 hover:text-red-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Character selection intentionally happens on the next screen. */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border-4 border-amber-900 flex items-center justify-center text-4xl shadow-lg -mt-12 mb-3">
          <User size={34} className="text-amber-900" />
        </div>

        <h3 className="font-['Titan_One',sans-serif] text-2xl text-amber-950 text-center tracking-wide">
          NOMBRE DEL JUGADOR
        </h3>
        <p className="text-xs font-bold text-amber-800 text-center mt-1 mb-4">
          Ingresa tu apodo para competir en el <strong className="text-amber-950">Ranking Top 50</strong>
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <div className="relative w-full">
            <User size={20} className="absolute left-3.5 top-3.5 text-amber-700 pointer-events-none" />
            <input
              type="text"
              autoFocus
              maxLength={25}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ej: Rambo Pollito"
              className="w-full pl-11 pr-4 py-3 bg-amber-50 border-3 border-amber-800 rounded-2xl font-black text-amber-950 text-base placeholder:text-amber-700/50 focus:outline-none focus:ring-4 focus:ring-amber-400"
            />
          </div>

          {error && (
            <p className="text-xs font-black text-red-600 bg-red-100 border border-red-300 px-3 py-1.5 rounded-xl text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 mt-2 rounded-2xl btn-cartoon-yellow flex items-center justify-center gap-2 font-['Titan_One',sans-serif] text-xl text-amber-950 tracking-wider shadow-xl active:scale-95 transition-transform"
          >
            <Play size={22} className="fill-amber-950" />
            <span>CONTINUAR</span>
          </button>
        </form>
      </div>
    </div>
  );
};
