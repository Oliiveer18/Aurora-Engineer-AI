import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import { AITask, TaskPriority, TaskState } from '../../types/aurora';
import { loadAITasks, saveAITasks, createNewTask } from '../../lib/aiTaskAgent';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react';

export const AITaskAgentView: React.FC = () => {
  const { showToast, setStagedPackage } = useAurora();
  const [tasks, setTasks] = useState<AITask[]>(() => loadAITasks());
  const [activeTaskId, setActiveTaskId] = useState<string>(tasks[0]?.id || '');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<AITask['category']>('CONTENT');
  const [newPriority, setNewPriority] = useState<TaskPriority>('HIGH');

  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const task = createNewTask(newTitle, newDesc, newCategory, newPriority);
    const updated = [task, ...tasks];
    setTasks(updated);
    setActiveTaskId(task.id);
    setIsCreatingTask(false);
    setNewTitle('');
    setNewDesc('');
    showToast('Nueva tarea de producción creada y en ejecución', 'success');
  };

  const handleTogglePause = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextState: TaskState = t.state === 'running' ? 'paused' : 'running';
        return { ...t, state: nextState, updatedAt: new Date().toISOString() };
      }
      return t;
    });
    setTasks(updated);
    saveAITasks(updated);
    showToast('Estado de la tarea actualizado', 'info');
  };

  const handleRetryTask = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          state: 'running' as TaskState,
          progressPct: 35,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    setTasks(updated);
    saveAITasks(updated);
    showToast('Tarea reiniciada en modo supervisado', 'info');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                AI Task Agent
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                  AUTONOMOUS DISPATCHER
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Agente de ejecución multietapa para tareas de balance, creación de contenido y optimizaciones 2.5D.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCreatingTask(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Tarea de Desarrollo</span>
        </button>
      </div>

      {/* New Task Modal Form */}
      {isCreatingTask && (
        <div className="bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-slate-100">Crear Tarea para el AI Agent</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Balance de stats en criaturas de Sombra"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="CONTENT">Contenido & Criaturas</option>
                  <option value="BALANCE">Balance & Progresión</option>
                  <option value="QUEST">Misiones & Lore</option>
                  <option value="VISUAL">Visual & 2.5D Specs</option>
                  <option value="SYSTEM">Sistemas & Phaser</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción y Requisitos</label>
              <textarea
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Detalla los objetivos concretos que el agente debe cumplir..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingTask(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white"
              >
                Despachar Tarea
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Tasks List & Step Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Tareas Activas ({tasks.length})
          </h2>
          {tasks.map((task) => {
            const isSelected = activeTaskId === task.id;
            return (
              <div
                key={task.id}
                onClick={() => setActiveTaskId(task.id)}
                className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/60 shadow-lg'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                    {task.category}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      task.state === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : task.state === 'running'
                        ? 'bg-cyan-500/20 text-cyan-400 animate-pulse'
                        : task.state === 'paused'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {task.state.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-200 line-clamp-1">{task.title}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">{task.description}</p>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Progreso</span>
                    <span>{task.progressPct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                      style={{ width: `${task.progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Task Inspector & Terminal Logs */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {activeTask ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-cyan-400">
                    TASK AGENT LOGS · ID: {activeTask.id}
                  </span>
                  <h2 className="text-base font-bold text-slate-100">{activeTask.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">{activeTask.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePause(activeTask.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition"
                    title={activeTask.state === 'running' ? 'Pausar' : 'Reanudar'}
                  >
                    {activeTask.state === 'running' ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Reanudar</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleRetryTask(activeTask.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition"
                    title="Reiniciar ejecución"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Reintentar</span>
                  </button>
                </div>
              </div>

              {/* Steps Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Etapas de Ejecución del Agente
                </h3>
                <div className="space-y-2">
                  {activeTask.steps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2 text-slate-200">
                          {step.state === 'completed' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                          {step.state === 'running' && (
                            <div className="w-4 h-4 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                          )}
                          {step.state === 'pending' && (
                            <Clock className="w-4 h-4 text-slate-600" />
                          )}
                          <span>
                            Etapa {idx + 1}: {step.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          {step.state}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-6">{step.description}</p>

                      {step.log.length > 0 && (
                        <div className="ml-6 mt-2 p-2.5 bg-slate-900/90 rounded-lg border border-slate-800/80 font-mono text-[10px] text-cyan-300/90 space-y-1">
                          {step.log.map((l, li) => (
                            <div key={li} className="flex items-center gap-1.5">
                              <span className="text-slate-600">&gt;</span>
                              <span>{l}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Created Entities & Deliverables */}
              <div className="pt-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Entidades Generadas por el Agente
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeTask.createdEntitiesSummary.map((ent, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      {ent}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Selecciona una tarea de la lista para ver su progreso y logs en tiempo real.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
