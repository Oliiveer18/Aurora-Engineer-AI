import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import { generatePhaserVisualExport } from '../../lib/visualGeneratorEngine';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Wrench,
  Sparkles,
  Copy,
  Download,
  Code,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const VisualQAView: React.FC = () => {
  const {
    projectContext,
    visualQAReport,
    applyVisualFix,
    applyAllVisualFixes,
    setSelectedVisualAsset,
    showToast,
  } = useAurora();

  const [activeTab, setActiveTab] = useState<'issues' | 'phaser_export'>('issues');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning'>('all');

  const filteredIssues = visualQAReport.issues.filter((issue) => {
    if (filterSeverity === 'all') return true;
    return issue.severity === filterSeverity;
  });

  const phaserCode = generatePhaserVisualExport(projectContext);

  const handleDownloadPhaserConfig = () => {
    const blob = new Blob([phaserCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'auroraVisualRegistry.ts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Archivo auroraVisualRegistry.ts descargado.', 'success');
  };

  return (
    <div id="visual-qa-view" className="space-y-6">
      {/* Health Overview Banner */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* Health Gauge */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
            <span
              className={`text-2xl font-black ${
                visualQAReport.healthScore >= 90
                  ? 'text-emerald-400'
                  : visualQAReport.healthScore >= 70
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {visualQAReport.healthScore}%
            </span>
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Visual QA & Integridad 2.5D</span>
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditoría estricta de puntos de anclaje, foot-points, Y-sorting y vinculaciones de datos con Phaser 3.
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-3">
          {visualQAReport.issues.some((i) => i.autoFixAvailable) && (
            <button
              onClick={applyAllVisualFixes}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/50 transition"
            >
              <Wrench className="w-4 h-4" />
              <span>Corregir Todo Automáticamente</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Assets Auditados</div>
          <div className="text-2xl font-bold text-white mt-1">{visualQAReport.totalAssetsChecked}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Conformidad Total</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{visualQAReport.passedCount}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Advertencias</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{visualQAReport.warningCount}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Incidencias Críticas</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{visualQAReport.criticalCount}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('issues')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'issues'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Incidencias Detectadas ({visualQAReport.issues.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('phaser_export')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'phaser_export'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4 text-cyan-400" />
            <span>Exportador de Assets Phaser 3</span>
          </button>
        </div>

        {activeTab === 'issues' && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg ${
                filterSeverity === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg ${
                filterSeverity === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'text-slate-400'
              }`}
            >
              Críticos
            </button>
            <button
              onClick={() => setFilterSeverity('warning')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg ${
                filterSeverity === 'warning' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-400'
              }`}
            >
              Avisos
            </button>
          </div>
        )}
      </div>

      {/* Tab: Issues List */}
      {activeTab === 'issues' && (
        <div className="space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">¡Biblioteca Visual 100% Calibrada!</h3>
              <p className="text-xs text-slate-400 mt-1">
                No se encontraron anomalías en los anclajes dimétricos, sombras ni enlaces de entidades.
              </p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                  issue.severity === 'critical'
                    ? 'bg-rose-950/20 border-rose-900/60 text-rose-200'
                    : issue.severity === 'warning'
                    ? 'bg-amber-950/20 border-amber-900/60 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {issue.severity === 'critical' ? (
                      <AlertCircle className="w-5 h-5 text-rose-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{issue.assetName}</span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                          issue.severity === 'critical'
                            ? 'bg-rose-900/80 text-rose-300'
                            : 'bg-amber-900/80 text-amber-300'
                        }`}
                      >
                        {issue.issueType.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{issue.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {issue.autoFixAvailable && (
                    <button
                      onClick={() => applyVisualFix(issue)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow transition"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Auto-Corregir</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const asset = projectContext.visualAssets?.find((a) => a.id === issue.assetId);
                      if (asset) setSelectedVisualAsset(asset);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    title="Inspeccionar Asset"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Phaser Export */}
      {activeTab === 'phaser_export' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                Registro Tipado de Assets Visuales para Phaser 3
              </h3>
              <p className="text-xs text-slate-400">
                Archivo TypeScript listo para copiar directamente a tu carpeta <code className="text-cyan-400 font-mono">src/assets/</code> en Cursor.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(phaserCode);
                  showToast('Código copiado al portapapeles.', 'success');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Código</span>
              </button>
              <button
                onClick={handleDownloadPhaserConfig}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .ts</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-cyan-300 font-mono overflow-x-auto max-h-96 leading-relaxed">
            {phaserCode}
          </pre>
        </div>
      )}
    </div>
  );
};
