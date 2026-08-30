import React, { useState } from 'react';
import {
  History,
  RotateCcw,
  Download,
  Upload,
  PlusCircle,
  X,
  Clock,
  ShieldCheck,
  FileCode,
  ArrowRight,
  Database,
} from 'lucide-react';
import { useAurora } from '../context/AuroraContext';
import { exportAsJSON } from '../lib/exportFormatter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionHistoryDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    versionHistory,
    rollbackToVersion,
    createManualSnapshot,
    projectContext,
    importProjectJSON,
    showToast,
  } = useAurora();

  const [newSnapshotTitle, setNewSnapshotTitle] = useState('');
  const [newSnapshotDesc, setNewSnapshotDesc] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (!isOpen) return null;

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapshotTitle.trim()) return;
    createManualSnapshot(newSnapshotTitle.trim(), newSnapshotDesc.trim() || 'Punto de restauración manual');
    setNewSnapshotTitle('');
    setNewSnapshotDesc('');
    setShowCreateForm(false);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportAsJSON(projectContext);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurora_workspace_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Copia de seguridad descargada exitosamente (.json).', 'success');
  };

  const handleRestoreFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importProjectJSON(content);
        if (success) {
          onClose();
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">Historial & Seguridad</h2>
              <p className="text-xs text-slate-400">Snapshots automáticos y reversión</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Nuevo Snapshot
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBackup}
              title="Descargar Backup JSON"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
            >
              <Download className="w-4 h-4 text-cyan-400" />
            </button>
            <label
              title="Restaurar Archivo Backup"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 cursor-pointer transition-colors flex items-center gap-1"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <input type="file" accept=".json" onChange={handleRestoreFromFile} className="hidden" />
            </label>
          </div>
        </div>

        {/* Create Snapshot Form (Collapsible) */}
        {showCreateForm && (
          <form onSubmit={handleCreateSnapshot} className="p-4 bg-slate-950 border-b border-slate-800 space-y-3 text-xs animate-fade-in">
            <span className="font-bold text-slate-200 block">Guardar Punto de Restauración</span>
            <input
              type="text"
              required
              placeholder="Título del snapshot (ej. Pre-Balance de Bosses)"
              value={newSnapshotTitle}
              onChange={(e) => setNewSnapshotTitle(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              placeholder="Descripción opcional"
              value={newSnapshotDesc}
              onChange={(e) => setNewSnapshotDesc(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-1 bg-slate-800 text-slate-300 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded"
              >
                Guardar
              </button>
            </div>
          </form>
        )}

        {/* Timeline of Snapshots */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Línea de Tiempo ({versionHistory.length})
          </div>

          {versionHistory.map((snap, idx) => {
            const isCurrent = idx === 0;
            const dateStr = new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            return (
              <div
                key={snap.id}
                className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                  isCurrent
                    ? 'bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 truncate">{snap.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {dateStr}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{snap.description}</p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-500 font-mono">{snap.entityCount} entidades</span>

                  {isCurrent ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Estado Actual
                    </span>
                  ) : (
                    <button
                      onClick={() => rollbackToVersion(snap.id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 rounded text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Revertir
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
