import React, { useState } from 'react';
import { useAurora } from '../context/AuroraContext';
import { ValidationError } from '../types/aurora';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sparkles,
  CheckCircle2,
  Wrench,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const ProjectValidatorView: React.FC = () => {
  const { validationReport, applyValidationAutoFix, applyAllAutoFixes, setSelectedEntity, setActiveTab, projectContext } =
    useAurora();

  const [severityFilter, setSeverityFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');

  const filteredErrors = validationReport.errors.filter((err) => {
    if (severityFilter === 'all') return true;
    return err.severity === severityFilter;
  });

  const autoFixableCount = validationReport.errors.filter((e) => !!e.autoFixAction).length;

  const handleOpenEntity = (err: ValidationError) => {
    let target: any = null;
    if (err.entityType === 'creature') target = projectContext.creatures.find((c) => c.id === err.entityId);
    if (err.entityType === 'npc') target = projectContext.npcs.find((n) => n.id === err.entityId);
    if (err.entityType === 'quest') target = projectContext.quests.find((q) => q.id === err.entityId);
    if (err.entityType === 'biome') target = projectContext.biomes.find((b) => b.id === err.entityId);

    if (target) {
      setSelectedEntity({ type: err.entityType, data: target });
      setActiveTab('editor');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider mb-1">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          Motor de Validación e Integridad de Esquemas
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Validador de Integridad AURORA</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Verifica que todos los IDs, referencias cruzadas, límites de estadísticas RPG y especificaciones 2.5D para Phaser 3 sean válidos y coherentes.
            </p>
          </div>

          {autoFixableCount > 0 && (
            <button
              onClick={applyAllAutoFixes}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition whitespace-nowrap"
            >
              <Wrench className="w-4 h-4" />
              <span>Corregir Todo Automáticamente ({autoFixableCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Health Score Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div
            className={`p-3 rounded-xl border ${
              validationReport.healthScore >= 90
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : validationReport.healthScore >= 70
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}
          >
            {validationReport.healthScore >= 90 ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-xs text-slate-400">Salud del Proyecto</span>
            <div className="text-2xl font-bold font-mono text-slate-100">{validationReport.healthScore}%</div>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Errores Críticos</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-0.5">
            {validationReport.summary.criticalErrors}
          </div>
          <span className="text-[11px] text-slate-500">Impiden exportación limpia</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Advertencias</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-0.5">
            {validationReport.summary.warnings}
          </div>
          <span className="text-[11px] text-slate-500">Recomendaciones de balance</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Total Validaciones</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-0.5">
            {validationReport.summary.totalChecks}
          </div>
          <span className="text-[11px] text-slate-500">Reglas evaluadas</span>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <span className="text-xs text-slate-500 mr-2 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filtrar:
        </span>
        <button
          onClick={() => setSeverityFilter('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
            severityFilter === 'all' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Todos ({validationReport.errors.length})
        </button>
        <button
          onClick={() => setSeverityFilter('error')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
            severityFilter === 'error' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Errores ({validationReport.summary.criticalErrors})
        </button>
        <button
          onClick={() => setSeverityFilter('warning')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
            severityFilter === 'warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Advertencias ({validationReport.summary.warnings})
        </button>
        <button
          onClick={() => setSeverityFilter('info')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
            severityFilter === 'info' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Info ({validationReport.summary.info})
        </button>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredErrors.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-100">¡Todo en orden!</h3>
            <p className="text-xs text-slate-400 mt-1">No hay problemas que coincidan con el filtro seleccionado.</p>
          </div>
        ) : (
          filteredErrors.map((err) => (
            <div
              key={err.id}
              className={`p-4 bg-slate-900 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                err.severity === 'error'
                  ? 'border-rose-500/30 hover:border-rose-500/50'
                  : err.severity === 'warning'
                  ? 'border-amber-500/30 hover:border-amber-500/50'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg mt-0.5 ${
                    err.severity === 'error'
                      ? 'bg-rose-500/20 text-rose-400'
                      : err.severity === 'warning'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-sky-500/20 text-sky-400'
                  }`}
                >
                  {err.severity === 'error' ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : err.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {err.entityType}
                    </span>
                    <span className="text-sm font-bold text-slate-200">{err.entityName}</span>
                    <span className="text-xs font-mono text-slate-500">({err.entityId})</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{err.message}</p>
                  {err.recommendation && (
                    <p className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1 font-mono">
                      <span>💡 Recomendación: {err.recommendation}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {err.autoFixAction && (
                  <button
                    onClick={() => applyValidationAutoFix(err)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Auto-Corregir</span>
                  </button>
                )}

                <button
                  onClick={() => handleOpenEntity(err)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
                >
                  <span>Abrir</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
