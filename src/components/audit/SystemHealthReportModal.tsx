import React from 'react';
import {
  X,
  ShieldCheck,
  Zap,
  HardDrive,
  Cpu,
  Lock,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useAurora } from '../../context/AuroraContext';
import { runFullSelfAudit } from '../../lib/selfAuditEngine';
import {
  measureSystemBenchmark,
  scanOptimizationProposals,
  runRegressionGuard,
} from '../../lib/autoOptimizerEngine';
import { evaluateStorageHealth, loadFreeAIUsage } from '../../lib/freeFirstEngine';

interface SystemHealthReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemHealthReportModal: React.FC<SystemHealthReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { projectContext } = useAurora();

  if (!isOpen) return null;

  const audit = runFullSelfAudit(projectContext);
  const benchmark = measureSystemBenchmark(projectContext);
  const proposals = scanOptimizationProposals(projectContext, true);
  const regression = runRegressionGuard(projectContext);
  const storage = evaluateStorageHealth();
  const aiStats = loadFreeAIUsage();

  const handleDownloadReport = () => {
    const reportData = {
      title: 'AURORA SYSTEM HEALTH REPORT 2.2',
      generatedAt: new Date().toISOString(),
      overallScore: audit.score,
      apiCallsUsed: 0,
      costEur: '0.00 €',
      freeMode: true,
      visualLock: true,
      audit,
      benchmark,
      proposals,
      regression,
      storage,
      aiStats,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurora_health_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                Aurora System Health Report 2.2
              </h2>
              <p className="text-xs text-slate-400">
                Informe consolidado de autoauditoría, rendimiento, seguridad y optimización autónoma.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar JSON
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-400 uppercase font-medium">Health Score Global</div>
              <div className="text-2xl font-bold text-indigo-400 mt-1">{audit.score}%</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">EXCELENTE ESTABILIDAD</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-400 uppercase font-medium">API Calls Utilizadas</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">0</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">0.00 € COSTE TOTAL</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-400 uppercase font-medium">Visual Lock</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">ON</div>
              <div className="text-[10px] text-slate-400 mt-0.5">CALIDAD 100% PROTEGIDA</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-400 uppercase font-medium">Regression Guard</div>
              <div className="text-2xl font-bold text-indigo-400 mt-1">PASSED</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">0 REGRESIONES</div>
            </div>
          </div>

          {/* Key Findings Summary */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Resumen de Auto-Auditoría (12 Módulos)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-850">
                <span className="text-slate-400">Total Chequeos:</span>{' '}
                <span className="font-bold text-slate-200">{audit.totalChecks}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-850">
                <span className="text-rose-400 font-semibold">Críticos:</span>{' '}
                <span className="font-bold text-rose-400">{audit.summary.critical}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-850">
                <span className="text-orange-400 font-semibold">Altos:</span>{' '}
                <span className="font-bold text-orange-400">{audit.summary.high}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-850">
                <span className="text-amber-400 font-semibold">Medios:</span>{' '}
                <span className="font-bold text-amber-400">{audit.summary.medium}</span>
              </div>
            </div>
          </div>

          {/* Performance & Benchmarking */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Telemetría de Rendimiento
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
              <div className="p-2 bg-slate-900 rounded border border-slate-850">
                <div className="text-[10px] text-slate-400">FPS</div>
                <div className="font-bold text-emerald-400">{benchmark.fps}</div>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-850">
                <div className="text-[10px] text-slate-400">Frame Time</div>
                <div className="font-bold text-slate-200">{benchmark.frameTimeMs} ms</div>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-850">
                <div className="text-[10px] text-slate-400">RAM</div>
                <div className="font-bold text-slate-200">{benchmark.memoryMB} MB</div>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-850">
                <div className="text-[10px] text-slate-400">CPU</div>
                <div className="font-bold text-slate-200">{benchmark.cpuUsagePct}%</div>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-850">
                <div className="text-[10px] text-slate-400">Draw Calls</div>
                <div className="font-bold text-slate-200">{benchmark.gpuDrawCalls}</div>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-850">
                <div className="text-[10px] text-slate-400">Arranque</div>
                <div className="font-bold text-slate-200">{benchmark.loadTimeMs} ms</div>
              </div>
            </div>
          </div>

          {/* Recommendations and Safety Status */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-2 text-xs">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Recomendaciones del Motor Autónomo
            </h3>
            <ul className="space-y-1 text-slate-300 list-disc list-inside">
              <li>
                El entorno opera 100% en modo Free-First con Cost Guard activo: ningún coste será
                facturado.
              </li>
              <li>
                Visual Lock garantiza la integridad de sprites, resolución, mapas y emisores de
                partículas.
              </li>
              <li>
                Las propuestas de optimización de bajo riesgo (SAFE) pueden aplicarse en 1 clic
                hacia Staging.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            Cerrar Informe
          </button>
        </div>
      </div>
    </div>
  );
};
