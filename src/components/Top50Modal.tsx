import React, { useEffect, useState } from 'react';
import { X, Trophy, Medal, RefreshCw } from 'lucide-react';
import { getTopRankings, RankingItem } from '../firebase/services';

interface Top50ModalProps {
  onClose: () => void;
}

export const Top50Modal: React.FC<Top50ModalProps> = ({ onClose }) => {
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = async () => {
    setLoading(true);
    const data = await getTopRankings();
    setRankings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchScores();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md cartoon-card rounded-3xl p-5 sm:p-6 flex flex-col items-center border-4 border-amber-900 shadow-2xl max-h-[88vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-900 hover:text-red-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="w-14 h-14 rounded-2xl bg-amber-400 border-3 border-amber-900 flex items-center justify-center text-amber-950 mb-2 shadow-md">
          <Trophy size={30} className="fill-amber-950 text-amber-950" />
        </div>

        <h3 className="font-['Titan_One',sans-serif] text-2xl sm:text-3xl text-amber-950 text-center tracking-wide">
          TOP 50 RANKING
        </h3>
        <p className="text-xs font-bold text-amber-800 text-center mb-3">
          Los mejores rescatistas de Chicken Boom Rescue
        </p>

        {/* Refresh button */}
        <div className="w-full flex justify-end mb-2">
          <button
            onClick={fetchScores}
            disabled={loading}
            className="flex items-center gap-1 text-[11px] font-black text-amber-800 hover:text-amber-950 bg-amber-200/80 px-2 py-1 rounded-lg border border-amber-400"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Scores List */}
        <div className="w-full flex-1 overflow-y-auto pr-1 flex flex-col gap-2 min-h-[220px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-amber-800 font-bold">
              <RefreshCw size={24} className="animate-spin text-amber-600" />
              <span>Cargando mejores puntuaciones de Firebase...</span>
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-10 text-amber-800 font-bold">
              ¡Aún no hay puntuaciones registradas! Sé el primero en jugar y figurar en el Top 50.
            </div>
          ) : (
            rankings.map((item, index) => {
              const rank = index + 1;
              const isTop1 = rank === 1;
              const isTop2 = rank === 2;
              const isTop3 = rank === 3;

              return (
                <div
                  key={item.id || `${item.playerName}_${index}`}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl border-2 transition-all ${
                    isTop1
                      ? 'bg-gradient-to-r from-amber-200 to-yellow-300 border-amber-600 shadow-md font-black'
                      : isTop2
                      ? 'bg-gradient-to-r from-slate-100 to-slate-200 border-slate-400 font-bold'
                      : isTop3
                      ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-500 font-bold'
                      : 'bg-white/90 border-amber-200 text-amber-950 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isTop1
                          ? 'bg-yellow-500 text-amber-950 border border-yellow-600'
                          : isTop2
                          ? 'bg-slate-400 text-white'
                          : isTop3
                          ? 'bg-amber-700 text-white'
                          : 'bg-amber-200 text-amber-900'
                      }`}
                    >
                      {rank <= 3 ? <Medal size={14} /> : rank}
                    </div>

                    {/* Player Name */}
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black text-amber-950 truncate max-w-[150px]">
                        {item.playerName}
                      </span>
                      {item.rescued && (
                        <span className="text-[10px] text-emerald-700 font-black">
                          ✓ Animales Rescatados
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-['Titan_One',sans-serif] text-sm text-amber-900 tracking-wider">
                      {item.score.toLocaleString()} PTS
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 mt-4 rounded-2xl btn-cartoon-yellow font-['Titan_One',sans-serif] text-base text-amber-950 tracking-wider shadow-lg active:scale-95 transition-transform"
        >
          VOLVER AL MENÚ
        </button>
      </div>
    </div>
  );
};
