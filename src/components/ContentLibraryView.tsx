import React, { useState, useMemo } from 'react';
import { useAurora } from '../context/AuroraContext';
import { AuroraEntityType, ElementType, RarityType } from '../types/aurora';
import {
  Search,
  Plus,
  Filter,
  Trash2,
  Copy,
  Edit3,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Compass,
  Scroll,
  User,
  Box,
  Castle,
  Shield,
  Tag,
  ArrowUpDown,
} from 'lucide-react';

export const ContentLibraryView: React.FC = () => {
  const { projectContext, setSelectedEntity, setActiveTab, duplicateEntity, deleteEntity } = useAurora();

  const [activeCategory, setActiveCategory] = useState<AuroraEntityType>('creature');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedElement, setSelectedElement] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  const categories: { key: AuroraEntityType; label: string; icon: string; count: number }[] = [
    { key: 'creature', label: 'Criaturas', icon: '🐾', count: projectContext.creatures.length },
    { key: 'npc', label: 'NPCs', icon: '🧙', count: projectContext.npcs.length },
    { key: 'quest', label: 'Misiones', icon: '📜', count: projectContext.quests.length },
    { key: 'biome', label: 'Biomas', icon: '🌲', count: projectContext.biomes.length },
    { key: 'item', label: 'Objetos', icon: '💎', count: projectContext.items.length },
    { key: 'ability', label: 'Habilidades', icon: '⚡', count: projectContext.abilities.length },
    { key: 'dungeon', label: 'Mazmorras', icon: '🏰', count: projectContext.dungeons.length },
    { key: 'faction', label: 'Facciones', icon: '🛡️', count: projectContext.factions.length },
    { key: 'region', label: 'Regiones', icon: '🗺️', count: projectContext.regions.length },
  ];

  // Current entity list based on active category
  const rawList = useMemo(() => {
    switch (activeCategory) {
      case 'creature':
        return projectContext.creatures;
      case 'npc':
        return projectContext.npcs;
      case 'quest':
        return projectContext.quests;
      case 'biome':
        return projectContext.biomes;
      case 'item':
        return projectContext.items;
      case 'ability':
        return projectContext.abilities;
      case 'dungeon':
        return projectContext.dungeons;
      case 'faction':
        return projectContext.factions;
      case 'region':
        return projectContext.regions;
      default:
        return [];
    }
  }, [activeCategory, projectContext]);

  // Filtered List
  const filteredList = useMemo(() => {
    return rawList.filter((item: any) => {
      const nameMatch =
        (item.name || item.title || item.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || item.backstory || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      const elementMatch = selectedElement === 'all' || item.type === selectedElement;
      const rarityMatch = selectedRarity === 'all' || item.rarity === selectedRarity;

      return nameMatch && elementMatch && rarityMatch;
    });
  }, [rawList, searchQuery, selectedElement, selectedRarity]);

  const handleEdit = (item: any) => {
    setSelectedEntity({ type: activeCategory, data: item });
    setActiveTab('editor');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header bar */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Biblioteca de Contenido de AURORA
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestiona, inspecciona y edita todas las entidades registradas en el universo de AURORA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ai_creator')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generar Nuevo con IA</span>
          </button>
        </div>
      </div>

      {/* Categories Toolbar */}
      <div className="flex overflow-x-auto border-b border-slate-800 px-6 py-2 bg-slate-950 gap-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              setActiveCategory(cat.key);
              setSelectedElement('all');
              setSelectedRarity('all');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeCategory === cat.key
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-900 text-slate-400">
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="px-6 py-3 bg-slate-900/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar en ${activeCategory}...`}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {activeCategory === 'creature' && (
            <>
              <select
                value={selectedElement}
                onChange={(e) => setSelectedElement(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
              >
                <option value="all">Todos los Elementos</option>
                <option value="nature">Naturaleza</option>
                <option value="fire">Fuego</option>
                <option value="water">Agua</option>
                <option value="electric">Eléctrico</option>
                <option value="ice">Hielo</option>
                <option value="shadow">Sombra</option>
                <option value="light">Luz</option>
                <option value="earth">Tierra</option>
                <option value="wind">Viento</option>
              </select>

              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
              >
                <option value="all">Todas las Rarezas</option>
                <option value="common">Común</option>
                <option value="uncommon">Poco Común</option>
                <option value="rare">Rara</option>
                <option value="epic">Épica</option>
                <option value="legendary">Legendaria</option>
              </select>
            </>
          )}

          <span className="text-slate-500 font-mono text-[11px]">
            {filteredList.length} elementos
          </span>
        </div>
      </div>

      {/* Entity Cards Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <Compass className="w-10 h-10 mb-2 text-slate-700" />
            <p className="text-sm font-medium text-slate-400">No se encontraron elementos en esta categoría</p>
            <p className="text-xs text-slate-600 mt-1">Prueba a ajustar la búsqueda o genera uno nuevo con la IA.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map((item: any) => {
              const name = item.name || item.title || item.id;
              const desc = item.description || item.backstory || item.loreSummary || 'Sin descripción';
              const isCritter = activeCategory === 'creature';

              return (
                <div
                  key={item.id}
                  className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 rounded-2xl transition duration-150 flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    {/* Top Row: Badges & ID */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 truncate max-w-[140px]">
                        {item.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {item.rarity && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {item.rarity}
                          </span>
                        )}
                        {item.type && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {item.type}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Name & Desc */}
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition">
                      {name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{desc}</p>

                    {/* 2.5D & RPG Summary metrics */}
                    {isCritter && item.stats && (
                      <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                        <div>
                          HP: <strong className="text-emerald-400">{item.stats.hp}</strong>
                        </div>
                        <div>
                          ATK: <strong className="text-rose-400">{item.stats.attack}</strong>
                        </div>
                        <div>
                          SPD: <strong className="text-amber-400">{item.stats.speed}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-xs">
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      {item.visual2D5 ? '🎮 2.5D Calibrado' : '📜 Datos RPG'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => duplicateEntity(activeCategory, item.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
                        title="Duplicar"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteEntity(activeCategory, item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg font-semibold transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
