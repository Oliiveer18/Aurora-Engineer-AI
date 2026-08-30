import React, { useState } from 'react';
import { useAurora } from '../context/AuroraContext';
import {
  X,
  Settings,
  Upload,
  Download,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Code2,
} from 'lucide-react';
import { exportAsJSON } from '../lib/exportFormatter';

export const ProjectSettingsModal: React.FC = () => {
  const { activeModal, setActiveModal, projectContext, importProjectJSON, resetToInitialProject, showToast } =
    useAurora();

  const [jsonInput, setJsonInput] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'rules' | 'import_export'>('rules');

  if (activeModal !== 'settings') return null;

  const handleImport = () => {
    if (!jsonInput.trim()) return;
    const ok = importProjectJSON(jsonInput);
    if (ok) {
      setActiveModal(null);
    }
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportAsJSON(projectContext);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aurora_project_context.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Archivo JSON del proyecto descargado', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-800 rounded-lg text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Ajustes & Sincronización del Proyecto</h2>
              <p className="text-xs text-slate-400">Configuración de reglas del motor 2.5D y sincronización con Cursor.</p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            onClick={() => setActiveSubTab('rules')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeSubTab === 'rules' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Reglas del Juego 2.5D
          </button>
          <button
            onClick={() => setActiveSubTab('import_export')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeSubTab === 'import_export'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Importar / Exportar JSON
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeSubTab === 'rules' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 block text-sm">Parámetros del Motor Phaser 3</span>
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <label className="text-slate-500 block mb-1">Proyección Isométrica</label>
                    <div className="font-mono text-cyan-400 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
                      Dimétrica 2:1 (26.565°)
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Algoritmo de Profundidad</label>
                    <div className="font-mono text-cyan-400 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
                      Y-Sorting (y + ySortOffset)
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 block text-sm">Reglas RPG de AURORA</span>
                <div className="grid grid-cols-3 gap-3 text-slate-300">
                  <div>
                    <label className="text-slate-500 block mb-1">Nivel Máximo</label>
                    <div className="font-mono text-slate-100 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
                      {projectContext.gameRules.maxLevel}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Habilidades por Criatura</label>
                    <div className="font-mono text-slate-100 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
                      {projectContext.gameRules.maxAbilitiesPerCreature}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Total Elementos</label>
                    <div className="font-mono text-slate-100 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
                      {projectContext.gameRules.elements.length}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <span className="text-slate-500">¿Deseas restaurar la plantilla inicial?</span>
                <button
                  onClick={() => {
                    if (confirm('¿Restablecer el proyecto a los datos de ejemplo iniciales?')) {
                      resetToInitialProject();
                      setActiveModal(null);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg font-semibold transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer Proyecto</span>
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'import_export' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">
                  Importar Proyecto desde Cursor (Pega tu JSON aquí):
                </label>
                <textarea
                  rows={8}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='{"regions": [...], "creatures": [...], "biomes": [...]}'
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleDownloadJSON}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Descargar JSON Actual</span>
                </button>

                <button
                  onClick={handleImport}
                  disabled={!jsonInput.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg shadow-lg shadow-cyan-500/30 transition disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Cargar JSON</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
