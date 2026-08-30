import React, { useState } from 'react';
import { GameDesignReport } from '../../types/aurora';
import {
  FileText,
  Download,
  Copy,
  Check,
  X,
  Shield,
  Zap,
  Activity,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface Props {
  report: GameDesignReport;
  onClose: () => void;
}

export const GameDesignReportModal: React.FC<Props> = ({ report, onClose }) => {
  const [copied, setCopied] = useState(false);

  const getMarkdownText = () => {
    return `# 🎮 AURORA RPG 2.5D - INFORME MAESTRO DE GAME DESIGN & AUDITORÍA
**Versión del Proyecto:** ${report.projectVersion}
**Fecha de Generación:** ${new Date(report.generatedAt).toLocaleString()}
**Puntuación de Salud Global:** ${report.healthScores.overall}/100

---

## 📊 1. ÍNDICES DE SALUD DEL PROYECTO (7 PILARES)
- **World Health (Población & Densidad):** ${report.healthScores.worldHealth}/100
- **Content Health (Volumen & Completitud):** ${report.healthScores.contentHealth}/100
- **Balance Health (Curvas BST & Stats):** ${report.healthScores.balanceHealth}/100
- **Quest Health (Misiones & Objetivos):** ${report.healthScores.questHealth}/100
- **Ecosystem Health (Cadena Trófica & Rareza):** ${report.healthScores.ecosystemHealth}/100
- **Technical Health (IDs & Referencias):** ${report.healthScores.technicalHealth}/100
- **Visual Health (Estilo 2.5D & Dimetría):** ${report.healthScores.visualHealth}/100

---

## 📑 2. RESUMEN EJECUTIVO
${report.executiveSummary}

---

## 🌟 3. FORTALEZAS DEL PROYECTO
${report.strengths.map((s) => `- ✅ ${s}`).join('\n')}

---

## ⚠️ 4. DEBILIDADES & OPORTUNIDADES DE MEJORA
${report.weaknesses.map((w) => `- ⚠️ ${w}`).join('\n')}

---

## 🚨 5. RIESGOS CRÍTICOS IDENTIFICADOS
${report.criticalRisks.map((r) => `- ⛔ ${r}`).join('\n')}

---

## 🧩 6. BRECHAS DE CONTENIDO PRIORITARIAS
${report.missingContentGaps
  .map((g) => `- **[${g.urgency.toUpperCase()}] ${g.category}:** ${g.description}`)
  .join('\n')}

---

## ⚖️ 7. DIAGNÓSTICO DE BALANCE & PROGRESIÓN
${report.balanceAndProgressionReport}

---

## 📜 8. DIAGNÓSTICO NARRATIVO & FACCIONES
${report.narrativeDiagnostics}

---

## 🎨 9. VALIDACIÓN TÉCNICA & ARTE 2.5D (PHASER 3)
${report.technicalAndVisualValidation}

---

## 🚀 10. HOJA DE RUTA DE DESARROLLO (TOP ROADMAP)
${report.topPriorityRoadmap
  .map((step) => `### Paso ${step.step}: ${step.title} (${step.impact})\n${step.description}`)
  .join('\n\n')}

---
*Generado automáticamente por AURORA AI DIRECTOR Engine. Fuente de la verdad: Knowledge Base del Proyecto.*
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getMarkdownText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMD = () => {
    const element = document.createElement('a');
    const file = new Blob([getMarkdownText()], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `AURORA_GAME_DESIGN_REPORT_${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadJSON = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `AURORA_GAME_DESIGN_REPORT_${Date.now()}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[90vh] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Informe Maestro de Game Design
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Salud: {report.healthScores.overall}%
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Auditoría holística de mundo, sistemas, progresión, narrativa y balance 2.5D
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '¡Copiado!' : 'Copiar Markdown'}
            </button>
            <button
              onClick={handleDownloadMD}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar .MD
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
            >
              JSON
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          {/* Executive Summary Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Resumen Ejecutivo
            </h3>
            <p className="text-slate-200 leading-relaxed text-sm">{report.executiveSummary}</p>
          </div>

          {/* 7 Health Scores Grid */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Diagnóstico de los 7 Pilares de Salud
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {[
                { label: 'Mundo', score: report.healthScores.worldHealth, color: 'text-amber-400' },
                { label: 'Contenido', score: report.healthScores.contentHealth, color: 'text-cyan-400' },
                { label: 'Balance', score: report.healthScores.balanceHealth, color: 'text-emerald-400' },
                { label: 'Misiones', score: report.healthScores.questHealth, color: 'text-purple-400' },
                { label: 'Ecosistema', score: report.healthScores.ecosystemHealth, color: 'text-lime-400' },
                { label: 'Técnico', score: report.healthScores.technicalHealth, color: 'text-blue-400' },
                { label: 'Visual 2.5D', score: report.healthScores.visualHealth, color: 'text-pink-400' },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-3 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">{item.label}</span>
                  <span className={`text-xl font-bold font-mono ${item.color}`}>{item.score}%</span>
                  <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-current h-full rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Fortalezas Clave del Proyecto
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {report.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-amber-500/20 rounded-xl p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Debilidades & Puntos a Mejorar
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {report.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Critical Risks */}
          {report.criticalRisks.length > 0 && (
            <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Riesgos de Diseño Detectados
              </h4>
              <div className="space-y-1 text-xs text-rose-200">
                {report.criticalRisks.map((risk, i) => (
                  <p key={i} className="flex items-start gap-2">
                    <span className="text-rose-400">⚠️</span> {risk}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Balance & Progression Diagnostic */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> Balance, Progresión & Narrativa
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
              <div className="space-y-1">
                <span className="font-semibold text-slate-200 block">Progresión & BST:</span>
                <p>{report.balanceAndProgressionReport}</p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-slate-200 block">Narrativa & Facciones:</span>
                <p>{report.narrativeDiagnostics}</p>
              </div>
            </div>
          </div>

          {/* Roadmap Steps */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-cyan-400" /> Hoja de Ruta Prioritaria (Roadmap)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.topPriorityRoadmap.map((item) => (
                <div key={item.step} className="bg-slate-800/70 border border-slate-700 rounded-lg p-3.5 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                    {item.step}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-100">{item.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                        {item.impact}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-500">
          <span>Fuente de la verdad: Knowledge Base del Proyecto AURORA</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Cerrar Informe
          </button>
        </div>
      </div>
    </div>
  );
};
