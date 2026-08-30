import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import { DesignRule, RuleComplianceResult } from '../../types/aurora';
import { loadDesignRules, saveDesignRules, evaluateDesignRules } from '../../lib/designRulesEngine';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Shield,
  RefreshCw,
  Sliders,
  Wrench,
  Info,
} from 'lucide-react';

export const DesignRulesEngineView: React.FC = () => {
  const { projectContext, showToast, applyAllAutoFixes } = useAurora();
  const [rules, setRules] = useState<DesignRule[]>(() => loadDesignRules());
  const [results, setResults] = useState<RuleComplianceResult[]>(() =>
    evaluateDesignRules(projectContext, loadDesignRules())
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const handleToggleRule = (ruleId: string) => {
    const updated = rules.map((r) => (r.id === ruleId ? { ...r, isEnabled: !r.isEnabled } : r));
    setRules(updated);
    saveDesignRules(updated);
    const newResults = evaluateDesignRules(projectContext, updated);
    setResults(newResults);
    showToast('Estado de regla actualizado', 'info');
  };

  const handleReevaluate = () => {
    const newResults = evaluateDesignRules(projectContext, rules);
    setResults(newResults);
    showToast('Evaluación de reglas completada', 'success');
  };

  const totalPassed = results.filter((r) => r.passed).length;
  const totalViolations = results.reduce((acc, r) => acc + r.violationCount, 0);
  const complianceScore = results.length > 0 ? Math.round((totalPassed / results.length) * 100) : 100;

  const filteredResults =
    selectedCategory === 'ALL'
      ? results
      : results.filter((r) => r.category === selectedCategory);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                Design Rules Engine
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                  GUARDIAN OF CONSISTENCY
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Reglas formales de diseño de juego, balance numérico y normas visuales 2.5D aplicadas de forma estricta.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReevaluate}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Reevaluar Proyecto</span>
          </button>
        </div>
      </div>

      {/* Compliance Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400">Índice de Conformidad</span>
            <h3 className="text-2xl font-black text-slate-100 mt-1">{complianceScore}%</h3>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold font-mono text-sm ${
              complianceScore >= 90
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : complianceScore >= 70
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {complianceScore >= 90 ? 'A+' : complianceScore >= 70 ? 'B' : 'C-'}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400">Reglas Cumplidas</span>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              {totalPassed} / {results.length}
            </h3>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400">Violaciones Detectadas</span>
            <h3 className="text-2xl font-black text-amber-400 mt-1">{totalViolations}</h3>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500/40" />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 pt-2">
        {['ALL', 'GAMEPLAY', 'VISUAL', 'BALANCE', 'NARRATIVE', 'WORLD', 'TECHNICAL'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat === 'ALL' ? 'Todas las Reglas' : cat}
          </button>
        ))}
      </div>

      {/* Rules Evaluation Cards */}
      <div className="space-y-4">
        {filteredResults.map((res) => {
          const ruleDef = rules.find((r) => r.id === res.ruleId);
          return (
            <div
              key={res.ruleId}
              className={`p-5 rounded-2xl border transition space-y-3 ${
                res.passed
                  ? 'bg-slate-900/60 border-slate-800/80'
                  : 'bg-slate-900/90 border-amber-500/40 shadow-lg'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {res.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : res.severity === 'critical' ? (
                    <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      {res.ruleName}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {res.category}
                      </span>
                    </h3>
                    {ruleDef && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{ruleDef.ruleText}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                      res.passed
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {res.passed ? 'CONFORME' : `${res.violationCount} VIOLACIONES`}
                  </span>
                  {ruleDef && (
                    <button
                      onClick={() => handleToggleRule(ruleDef.id)}
                      className={`text-[10px] font-mono px-2 py-1 rounded border transition ${
                        ruleDef.isEnabled
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-slate-950 text-slate-600 border-slate-900'
                      }`}
                    >
                      {ruleDef.isEnabled ? 'ACTIVA' : 'DESACTIVADA'}
                    </button>
                  )}
                </div>
              </div>

              {!res.passed && res.details.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-amber-400 tracking-wider">
                    DETALLES DE ELEMENTOS NO CONFORMES:
                  </span>
                  <div className="space-y-1">
                    {res.details.map((d, i) => (
                      <div
                        key={i}
                        className="text-xs text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between"
                      >
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
