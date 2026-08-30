import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import { AIRoadmapItem } from '../../types/aurora';
import { generateAIRoadmap } from '../../lib/aiRoadmap';
import {
  Map,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Layers,
} from 'lucide-react';

export const AIRoadmapView: React.FC = () => {
  const { projectContext, showToast, setActiveTab } = useAurora();
  const [roadmapItems, setRoadmapItems] = useState<AIRoadmapItem[]>(() =>
    generateAIRoadmap(projectContext)
  );
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('ALL');

  const timeframes: { key: string; label: string; color: string }[] = [
    { key: 'ALL', label: 'Todos', color: 'slate' },
    { key: 'NOW', label: 'NOW (Inmediato)', color: 'emerald' },
    { key: 'NEXT', label: 'NEXT (Siguiente Sprint)', color: 'cyan' },
    { key: 'LATER', label: 'LATER (Medio Plazo)', color: 'purple' },
    { key: 'OPTIONAL', label: 'OPTIONAL (Backlog)', color: 'slate' },
  ];

  const filtered =
    selectedTimeframe === 'ALL'
      ? roadmapItems
      : roadmapItems.filter((i) => i.timeframe === selectedTimeframe);

  const handleExecuteAction = (item: AIRoadmapItem) => {
    if (item.domain === 'BALANCE') {
      setActiveTab('ecosystem_studio');
    } else if (item.domain === 'QUESTS') {
      setActiveTab('ai_builder');
    } else if (item.domain === 'VISUAL') {
      setActiveTab('visual_qa');
    } else {
      setActiveTab('ai_builder');
    }
    showToast(`Navegando al módulo correspondiente para: ${item.title}`, 'info');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                AI Roadmap & Priority Matrix
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                  FORMULA-DRIVEN
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Priorización matemática explicable: Score = f(Impacto, Esfuerzo, Riesgo, Dependencias, Valor para el Jugador).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeframe Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {timeframes.map((tf) => (
          <button
            key={tf.key}
            onClick={() => setSelectedTimeframe(tf.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              selectedTimeframe === tf.key
                ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Roadmap Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                    item.timeframe === 'NOW'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : item.timeframe === 'NEXT'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      : item.timeframe === 'LATER'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {item.timeframe} · {item.domain}
                </span>

                <span className="text-xs font-bold font-mono text-blue-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Score {item.priorityScore}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
              <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {item.rationale}
              </p>

              {/* Score Breakdown Pills */}
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  Impacto: <strong className="text-slate-200">{item.impactScore}/10</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  Esfuerzo: <strong className="text-slate-200">{item.effortScore}/10</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  Riesgo: <strong className="text-slate-200">{item.riskScore}/10</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  Valor Jugador: <strong className="text-slate-200">{item.playerValueScore}/10</strong>
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 truncate max-w-[240px]">
                {item.suggestedAction}
              </span>
              <button
                onClick={() => handleExecuteAction(item)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
              >
                <span>Accionar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
