import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  Play,
  Trophy,
  ArrowLeft,
  RefreshCw,
  Video,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { AnalyticsEvent, getAnalyticsSummary, getTopRankings, RankingItem, trackAnalytics } from '../firebase/services';

interface AdminDashboardProps {
  onBackToGame: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToGame }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVisits: 0,
    totalGamesStarted: 0,
    totalVictories: 0,
    totalGameOvers: 0,
    recentEvents: [] as AnalyticsEvent[],
  });
  const [rankings, setRankings] = useState<RankingItem[]>([]);

  const loadData = async () => {
    setLoading(true);
    const [analyticsData, rankingsData] = await Promise.all([
      getAnalyticsSummary(),
      getTopRankings(),
    ]);
    setStats(analyticsData);
    setRankings(rankingsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTestEvent = async () => {
    await trackAnalytics('page_visit');
    await loadData();
  };

  const winRate =
    stats.totalGamesStarted > 0
      ? Math.round((stats.totalVictories / stats.totalGamesStarted) * 100)
      : 0;

  return (
    <div className="w-full h-full min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 overflow-y-auto">
      {/* Top Navigation */}
      <div className="max-w-5xl mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToGame}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft size={16} />
            <span>Volver al Juego</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BarChart3 size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-white leading-tight">
                ANAPSE Video - Dashboard Administrativo
              </h1>
              <p className="text-xs text-slate-400">
                Monitoreo de métricas y Firebase Analytics para <strong>Chicken Boom Rescue</strong>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Actualizar Datos</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto mt-6 flex flex-col gap-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* 1. Visitas */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>VISITAS TOTALES</span>
              <Users size={16} className="text-sky-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-white">
              {stats.totalVisits.toLocaleString()}
            </span>
            <span className="text-[10px] text-sky-400/80 font-semibold">Colección Firebase `analytics`</span>
          </div>

          {/* 2. Partidas Iniciadas */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>PARTIDAS JUGADAS</span>
              <Play size={16} className="text-amber-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-white">
              {stats.totalGamesStarted.toLocaleString()}
            </span>
            <span className="text-[10px] text-amber-400/80 font-semibold">Eventos `game_start`</span>
          </div>

          {/* 3. Victorias / Rescates */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>ANIMALES RESCATADOS</span>
              <Trophy size={16} className="text-yellow-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-white">
              {stats.totalVictories.toLocaleString()}
            </span>
            <span className="text-[10px] text-yellow-400/80 font-semibold">Eventos `game_victory`</span>
          </div>

          {/* 4. Tasa de Éxito */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>TASA DE VICTORIA</span>
              <Activity size={16} className="text-emerald-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              {winRate}%
            </span>
            <span className="text-[10px] text-emerald-400/80 font-semibold">Efectividad de rescate</span>
          </div>
        </div>

        {/* Content Section: Analytics Logs & Current Ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Recent Activity Feed from Firebase Analytics */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-sky-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Eventos Recientes (Firebase Analytics)
                </h3>
              </div>
              <button
                onClick={handleTestEvent}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-bold underline"
              >
                + Registrar Visita Test
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto flex flex-col gap-2 pr-1">
              {stats.recentEvents.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 font-semibold">
                  No hay eventos registrados recientemente.
                </div>
              ) : (
                stats.recentEvents.slice(0, 15).map((evt, idx) => (
                  <div
                    key={evt.id || idx}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          evt.eventType === 'page_visit'
                            ? 'bg-sky-400'
                            : evt.eventType === 'game_victory'
                            ? 'bg-yellow-400'
                            : evt.eventType === 'game_start'
                            ? 'bg-amber-400'
                            : 'bg-red-400'
                        }`}
                      />
                      <span className="font-bold text-slate-200 capitalize">
                        {evt.eventType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span>{evt.device || 'web'}</span>
                      <span>•</span>
                      <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Real-time Leaderboard preview from Firebase Ranking */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-yellow-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Ranking Firebase (`ranking`)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-bold">
                {rankings.length} Registros
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto flex flex-col gap-2 pr-1">
              {rankings.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 font-semibold">
                  Aún no hay puntuaciones en Firebase.
                </div>
              ) : (
                rankings.slice(0, 10).map((r, idx) => (
                  <div
                    key={r.id || idx}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-center font-black text-slate-400">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-white truncate max-w-[140px]">
                        {r.playerName}
                      </span>
                      {r.rescued && (
                        <span className="text-[10px] text-emerald-400 font-black">
                          ✓ Rescatado
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-black text-amber-400">
                      {r.score.toLocaleString()} PTS
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Integration Credentials and Status */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <span>
              Firebase Firestore conectado con ID: <strong>ai-studio-12bc6b7a-66fc-4e0b-84fd-f5270068c59f</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Video size={16} className="text-amber-400" />
            <span>Contacto: <strong>anapsep_video@hotmail.com</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
