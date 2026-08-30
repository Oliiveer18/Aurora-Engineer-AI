import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Database,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  HardDrive,
  History,
  Play,
  RotateCcw,
  Sparkles,
  Search,
} from 'lucide-react';
import { useAurora } from '../../context/AuroraContext';
import { MaintenanceTask, MaintenanceReport, SafetySnapshot } from '../../types/aurora';
import {
  getInitialMaintenanceTasks,
  executeMaintenanceTask,
  executeAllMaintenanceTasks,
  loadLastMaintenanceReport,
} from '../../lib/maintenanceEngine';
import { evaluateStorageHealth, loadFreeAIUsage } from '../../lib/freeFirstEngine';
import { loadSafetySnapshots } from '../../lib/autoOptimizerEngine';

export const SystemMaintenanceView: React.FC = () => {
  const { projectContext } = useAurora();
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [lastReport, setLastReport] = useState<MaintenanceReport | null>(null);
  const [snapshots, setSnapshots] = useState<SafetySnapshot[]>([]);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setTasks(getInitialMaintenanceTasks());
    setLastReport(loadLastMaintenanceReport());
    setSnapshots(loadSafetySnapshots());
  }, [projectContext]);

  const storage = evaluateStorageHealth();
  const aiStats = loadFreeAIUsage();

  const handleRunTask = (taskId: string) => {
    setActiveTaskId(taskId);
    setTimeout(() => {
      const res = executeMaintenanceTask(taskId, projectContext);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.task : t)));
      setActiveTaskId(null);
      showToast(`Tarea "${res.task.name}" completada: ${res.task.notes}`);
    }, 300);
  };

  const handleRunAllTasks = () => {
    setIsRunningAll(true);
    setTimeout(() => {
      const report = executeAllMaintenanceTasks(projectContext);
      setLastReport(report);
      setTasks((prev) =>
        prev.map((t) => ({
          ...t,
          status: 'COMPLETED',
          lastRun: new Date().toISOString(),
          notes: 'Mantenimiento ejecutado con éxito.',
        }))
      );
      setIsRunningAll(false);
      showToast(
        `Mantenimiento global completado. ${(report.totalBytesFreed / 1024).toFixed(1)} KB liberados. Datos de juego 100% protegidos.`
      );
    }, 450);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const isStorageSafe = storage.status === 'healthy' || storage.totalBytes < 80 * 1024 * 1024;
  const storageStatusColor =
    isStorageSafe
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : storage.status === 'warning'
      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
      : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6 space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-fade-in text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/30 to-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400">
              <HardDrive className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  System Maintenance & Storage Guard 2.2
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300">
                  AUTO-HEALING & HEALTH
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Limpieza periódica de caches efímeras, rotación de logs y validación de esquemas sin
                borrar contenido.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Maintenance Trigger */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleRunAllTasks}
            disabled={isRunningAll}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-5 py-2.5 rounded-lg transition shadow-lg shadow-teal-900/30 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRunningAll ? 'animate-spin' : ''}`} />
            {isRunningAll ? 'Ejecutando Mantenimiento...' : 'Ejecutar Todo el Mantenimiento'}
          </button>
        </div>
      </div>

      {/* Storage Health & AI Health Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Storage Guard */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-teal-400" />
              Protección de Almacenamiento Local
            </h3>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${storageStatusColor}`}>
              STATUS: {storage.status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Espacio Ocupado (Cache + Logs + Snapshots)</span>
              <span className="font-mono text-slate-200">
                {(storage.totalBytes / (1024 * 1024)).toFixed(1)} MB /{' '}
                {(storage.limitBytes / (1024 * 1024)).toFixed(0)} MB
              </span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  isStorageSafe
                    ? 'bg-teal-500'
                    : storage.status === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{
                  width: `${Math.min(100, (storage.totalBytes / storage.limitBytes) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>SAFE: &lt;80MB</span>
              <span>WARNING: 80-250MB</span>
              <span>CRITICAL: &gt;250MB</span>
            </div>
          </div>
        </div>

        {/* AI Router & Quota Health */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Estado de Salud del AI Router (0€ Guard)
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
              COST GUARD: ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/70 border border-slate-900 rounded-lg p-2.5">
              <span className="text-slate-400">Operaciones Locales</span>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                {aiStats.localOperationsCount} ops
              </div>
            </div>
            <div className="bg-slate-950/70 border border-slate-900 rounded-lg p-2.5">
              <span className="text-slate-400">Peticiones de Pago Bloqueadas</span>
              <div className="text-base font-bold text-indigo-400 mt-0.5">
                {aiStats.blockedPaidRequestsCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Tasks Catalog */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          Rutinas de Mantenimiento Autónomo ({tasks.length} Tareas)
        </h2>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold text-slate-100">{task.name}</span>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {task.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{task.description}</p>
                {task.notes && (
                  <p className="text-xs text-teal-300/90 italic font-mono pt-1">→ {task.notes}</p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleRunTask(task.id)}
                  disabled={activeTaskId === task.id || isRunningAll}
                  className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer disabled:opacity-50"
                >
                  <Play
                    className={`w-3.5 h-3.5 ${
                      activeTaskId === task.id ? 'animate-spin text-teal-400' : ''
                    }`}
                  />
                  {activeTaskId === task.id ? 'Ejecutando...' : 'Ejecutar Tarea'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Snapshots History */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Safety Snapshots Registrados ({snapshots.length})
          </h2>
          <span className="text-xs text-slate-400">
            Puntos de restauración automáticos antes de cada parche
          </span>
        </div>

        {snapshots.length === 0 ? (
          <div className="text-xs text-slate-500 py-4 text-center">
            No hay snapshots registrados todavía. Se generarán automáticamente antes de optimizar.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="bg-slate-950/70 border border-slate-850 rounded-lg p-3 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-200">{snap.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(snap.timestamp).toLocaleString()} • {snap.entitiesCount} Entidades •
                    Checksum: <span className="font-mono text-indigo-400">{snap.stateChecksum}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
                  ROLLBACK READY
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
