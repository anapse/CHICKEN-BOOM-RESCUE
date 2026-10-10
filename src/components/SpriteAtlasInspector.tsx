import React, { useEffect, useState } from 'react';
import { ArrowLeft, Grid2X2, Image as ImageIcon } from 'lucide-react';
import { spriteManager } from '../game/SpriteManager';
import { SPRITE_INVENTORY } from '../game/spriteAssets';

interface SpriteAtlasInspectorProps {
  onClose: () => void;
}

interface GridSettings {
  columns: number;
  rows: number;
}

export const SpriteAtlasInspector: React.FC<SpriteAtlasInspectorProps> = ({ onClose }) => {
  const [dimensions, setDimensions] = useState<Record<string, { width: number; height: number }>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [grids, setGrids] = useState<Record<string, GridSettings>>(() =>
    Object.fromEntries(SPRITE_INVENTORY.map((asset) => [
      asset.src,
      /4x4/i.test(asset.src) ? { columns: 4, rows: 4 } : { columns: 1, rows: 1 },
    ])),
  );

  useEffect(() => {
    let active = true;
    void Promise.all(SPRITE_INVENTORY.map(async (asset) => {
      const image = await spriteManager.load(asset.src);
      if (!active) return;
      if (image) {
        setDimensions((previous) => ({
          ...previous,
          [asset.src]: { width: image.naturalWidth, height: image.naturalHeight },
        }));
      } else {
        setFailed((previous) => ({ ...previous, [asset.src]: true }));
      }
    }));
    return () => { active = false; };
  }, []);

  const updateGrid = (src: string, field: keyof GridSettings, raw: string) => {
    const value = Math.max(1, Math.min(64, Number.parseInt(raw, 10) || 1));
    setGrids((previous) => ({
      ...previous,
      [src]: { ...(previous[src] ?? { columns: 1, rows: 1 }), [field]: value },
    }));
  };

  const gridReport = SPRITE_INVENTORY.map((asset) => {
    const size = dimensions[asset.src];
    const grid = grids[asset.src] ?? { columns: 1, rows: 1 };
    return {
      file: asset.src.replace('./sprites/', ''),
      width: size?.width ?? null,
      height: size?.height ?? null,
      columns: grid.columns,
      rows: grid.rows,
      divisible: Boolean(size && size.width % grid.columns === 0 && size.height % grid.rows === 0),
    };
  });

  const copyReport = () => {
    void navigator.clipboard?.writeText(JSON.stringify(gridReport, null, 2));
  };

  return (
    <main className="min-h-full h-full overflow-y-auto bg-stone-950 text-stone-100 p-3 sm:p-5">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-stone-950/95 backdrop-blur border-b border-stone-700 py-3 mb-4">
        <button onClick={onClose} className="rounded-xl bg-amber-500 text-stone-950 px-3 py-2 font-bold flex items-center gap-2">
          <ArrowLeft size={18} /> Volver
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-black">Sprite Atlas Inspector</h1>
          <p className="text-xs text-stone-400">Herramienta técnica · no modifica los PNG originales</p>
        </div>
        <button onClick={copyReport} className="rounded-xl border border-stone-600 px-3 py-2 text-xs font-bold">
          Copiar informe
        </button>
      </header>

      <div className="max-w-5xl mx-auto space-y-4">
        <aside className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
          Ajusta columnas y filas para comprobar visualmente las celdas. Los valores iniciales son solo pistas del nombre del archivo; que las medidas sean divisibles no demuestra que el sprite esté centrado ni que los límites sean correctos.
        </aside>

        {SPRITE_INVENTORY.map((asset) => {
          const size = dimensions[asset.src];
          const grid = grids[asset.src] ?? { columns: 1, rows: 1 };
          const divisible = Boolean(size && size.width % grid.columns === 0 && size.height % grid.rows === 0);
          return (
            <section key={asset.src} className="rounded-2xl border border-stone-700 bg-stone-900 p-3 sm:p-4 space-y-3">
              <div className="flex items-start gap-3">
                <ImageIcon className="text-amber-300 shrink-0 mt-1" size={20} />
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold break-words">{asset.role}</h2>
                  <p className="text-xs text-stone-400 break-all">{asset.src}</p>
                  <p className="text-sm text-stone-300 mt-1">{asset.note}</p>
                </div>
                <span className={`text-xs rounded-lg px-2 py-1 whitespace-nowrap ${size ? 'bg-emerald-900 text-emerald-200' : failed[asset.src] ? 'bg-red-900 text-red-200' : 'bg-stone-800 text-stone-300'}`}>
                  {size ? `${size.width} × ${size.height}` : failed[asset.src] ? 'Error de carga' : 'Cargando…'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-xs">
                <label className="text-xs text-stone-300 flex items-center gap-2">
                  <Grid2X2 size={15} /> Columnas
                  <input type="number" min={1} max={64} value={grid.columns} onChange={(event) => updateGrid(asset.src, 'columns', event.target.value)} className="w-16 bg-stone-800 border border-stone-600 rounded-lg px-2 py-1 text-sm text-white" />
                </label>
                <label className="text-xs text-stone-300 flex items-center gap-2">
                  Filas
                  <input type="number" min={1} max={64} value={grid.rows} onChange={(event) => updateGrid(asset.src, 'rows', event.target.value)} className="w-16 bg-stone-800 border border-stone-600 rounded-lg px-2 py-1 text-sm text-white" />
                </label>
              </div>

              {size && (
                <p className={`text-xs ${divisible ? 'text-emerald-300' : 'text-red-300'}`}>
                  {divisible
                    ? `Medida por celda si fuera una cuadrícula uniforme: ${size.width / grid.columns} × ${size.height / grid.rows} px. Límites visuales todavía sin certificar.`
                    : 'La cuadrícula no divide las dimensiones exactamente.'}
                </p>
              )}

              <div
                className="relative w-full overflow-hidden rounded-xl border border-stone-600"
                style={{
                  aspectRatio: size ? `${size.width} / ${size.height}` : '4 / 3',
                  backgroundColor: '#e5e7eb',
                  backgroundImage: 'linear-gradient(45deg,#cbd5e1 25%,transparent 25%),linear-gradient(-45deg,#cbd5e1 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#cbd5e1 75%),linear-gradient(-45deg,transparent 75%,#cbd5e1 75%)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0,0 12px,12px -12px,-12px 0',
                }}
              >
                <img
                  src={asset.src}
                  alt={asset.role}
                  className="absolute inset-0 w-full h-full object-fill"
                  onLoad={(event) => setDimensions((previous) => ({
                    ...previous,
                    [asset.src]: { width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight },
                  }))}
                  onError={() => setFailed((previous) => ({ ...previous, [asset.src]: true }))}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(to right, rgba(239,68,68,.9) 1px, transparent 1px),linear-gradient(to bottom, rgba(239,68,68,.9) 1px, transparent 1px)',
                    backgroundSize: `${100 / grid.columns}% 100%,100% ${100 / grid.rows}%`,
                  }}
                />
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
};
