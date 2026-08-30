import React from 'react';
import { VisualContextData } from '../../lib/visualGeneratorEngine';
import { Sparkles, Compass, Palette, Box, Sun, ShieldAlert } from 'lucide-react';

interface Props {
  contextData: VisualContextData;
  category: string;
}

export const VisualContextCard: React.FC<Props> = ({ contextData, category }) => {
  return (
    <div id="visual-context-card" className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Contexto Real de AURORA Activo
            </h4>
            <p className="text-xs text-slate-400">
              Garantía de coherencia estética y espacial 2.5D
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-[11px] font-mono bg-cyan-950/60 border border-cyan-800 text-cyan-300 rounded-md">
          {contextData.cameraAngle}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        {/* World Location & Biome */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-300">Ubicación y Atmósfera</span>
          </div>
          <div className="text-xs font-medium text-emerald-300 truncate">
            {contextData.regionName} &rsaquo; {contextData.biomeName}
          </div>
          <p className="text-[11px] text-slate-500 italic mt-0.5 truncate">
            "{contextData.biomeAtmosphere}"
          </p>
        </div>

        {/* Style Bible Palette */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-slate-300">Paleta Style Bible</span>
            </div>
            <span className="text-[10px] text-slate-400 truncate max-w-[90px]">{contextData.paletteName}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            {contextData.paletteColors?.slice(0, 5).map((hex, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-md border border-slate-700 shadow-sm flex items-center justify-center text-[9px] font-mono"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        </div>

        {/* 2.5D Technical Scale & Sorting */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Box className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-slate-300">Estándar 2.5D Dimétrico</span>
          </div>
          <div className="text-xs text-indigo-300 flex items-center justify-between">
            <span>Escala: <b>{contextData.scaleStandard}</b></span>
            <span className="font-mono text-[10px] bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/50">
              Y-Sort: +{contextData.recommendedYSortOffset}px
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Anchor: [{contextData.recommendedAnchor.x}, {contextData.recommendedAnchor.y}]
          </div>
        </div>
      </div>

      {/* Grounding cues: Similar entities & Lighting */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Entidades en este bioma:</span>
          {contextData.similarEntities.length > 0 ? (
            contextData.similarEntities.map((name, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-800/90 text-slate-300 rounded text-[11px] border border-slate-700">
                {name}
              </span>
            ))
          ) : (
            <span className="text-slate-500 text-[11px]">Ninguna registrada aún</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Sun className="w-3 h-3 text-amber-400" />
          <span>Luz: {contextData.lightingKey}</span>
        </div>
      </div>
    </div>
  );
};
