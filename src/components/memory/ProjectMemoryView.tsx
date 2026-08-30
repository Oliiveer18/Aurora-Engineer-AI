import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import { ProjectMemoryItem, MemoryCategory } from '../../types/aurora';
import { loadProjectMemory, saveProjectMemory } from '../../lib/projectMemory';
import {
  Brain,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Tag,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

const CATEGORIES: { key: MemoryCategory; label: string }[] = [
  { key: 'WORLD_RULES', label: 'Reglas del Mundo' },
  { key: 'DESIGN_DECISIONS', label: 'Decisiones de Diseño' },
  { key: 'PROGRESSION_RULES', label: 'Reglas de Progresión' },
  { key: 'VISUAL_RULES', label: 'Normas Visuales 2.5D' },
  { key: 'TECHNICAL_CONVENTIONS', label: 'Convenciones Técnicas' },
  { key: 'REJECTED_DECISIONS', label: 'Decisiones Descartadas' },
];

export const ProjectMemoryView: React.FC = () => {
  const { showToast } = useAurora();
  const [memoryItems, setMemoryItems] = useState<ProjectMemoryItem[]>(() => loadProjectMemory());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [newCategory, setNewCategory] = useState<MemoryCategory>('WORLD_RULES');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newImportance, setNewImportance] = useState<'low' | 'medium' | 'high'>('high');

  const filteredItems = memoryItems.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleToggleActive = (id: string) => {
    const updated = memoryItems.map((item) =>
      item.id === id ? { ...item, active: !item.active } : item
    );
    setMemoryItems(updated);
    saveProjectMemory(updated);
    showToast('Regla de memoria actualizada', 'info');
  };

  const handleDelete = (id: string) => {
    const updated = memoryItems.filter((item) => item.id !== id);
    setMemoryItems(updated);
    saveProjectMemory(updated);
    showToast('Entrada de memoria eliminada', 'info');
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newItem: ProjectMemoryItem = {
      id: 'mem_' + Date.now(),
      category: newCategory,
      title: newTitle,
      content: newContent,
      tags: newTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      active: true,
      importance: newImportance,
      createdAt: new Date().toISOString(),
    };

    const updated = [newItem, ...memoryItems];
    setMemoryItems(updated);
    saveProjectMemory(updated);
    setIsAdding(false);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    showToast('Nueva directriz de memoria guardada', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                Aurora Project Memory 2.0
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                  PERSISTENT CONTEXT
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Memoria a largo plazo del proyecto inyectada automáticamente en las generaciones del AI Creator y AI Director.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-purple-600/20 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Regla de Memoria</span>
        </button>
      </div>

      {/* Add Form Modal */}
      {isAdding && (
        <div className="bg-slate-900/95 border border-purple-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-slate-100">Nueva Directriz de Memoria del Proyecto</h2>
          <form onSubmit={handleAddMemory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Importancia</label>
                <select
                  value={newImportance}
                  onChange={(e) => setNewImportance(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="high">Alta (Prioridad Máxima)</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (separados por coma)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="ej: combate, turnos, phaser"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Título de la Regla</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej: Límite de 4 habilidades activas por criatura"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contenido / Directriz Detallada</label>
              <textarea
                rows={3}
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Describe la decisión tomada, restricciones o directrices que la IA debe obedecer sin excepción..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white"
              >
                Guardar en Memoria
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por regla, contenido o tag..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
        >
          <option value="ALL">Todas las Categorías ({memoryItems.length})</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label} ({memoryItems.filter((m) => m.category === c.key).length})
            </option>
          ))}
        </select>
      </div>

      {/* Memory Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border transition space-y-3 ${
              item.active
                ? 'bg-slate-900/80 border-slate-800 hover:border-purple-500/50'
                : 'bg-slate-950/40 border-slate-900 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase">
                  {item.category.replace('_', ' ')}
                </span>
                <h3 className="text-xs font-bold text-slate-100">{item.title}</h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleToggleActive(item.id)}
                  className={`p-1.5 rounded-lg border transition ${
                    item.active
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                  title={item.active ? 'Activo en IA Grounding' : 'Desactivado'}
                >
                  {item.active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 border border-slate-800 transition"
                  title="Eliminar regla"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
              {item.content}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {item.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 font-mono flex items-center gap-1"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
