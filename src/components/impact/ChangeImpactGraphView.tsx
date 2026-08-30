import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import { EntityDependencyNode } from '../../types/aurora';
import { buildChangeImpactGraph } from '../../lib/changeImpactGraph';
import {
  Network,
  Layers,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const ChangeImpactGraphView: React.FC = () => {
  const { projectContext } = useAurora();
  const [nodes] = useState<EntityDependencyNode[]>(() =>
    buildChangeImpactGraph(projectContext)
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    nodes[0]?.id || 'creature_ignis_fox'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');

  const groups = ['ALL', 'Fauna & Criaturas', 'Misiones & Lore', 'Personajes & NPCs', 'Mundo & Geografía'];

  const filteredNodes = nodes.filter((n) => {
    const matchesGroup = selectedGroup === 'ALL' || n.group === selectedGroup;
    const matchesSearch =
      n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const currentNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  // Inverted references: What references this current node?
  const incomingReferences = nodes.filter((n) =>
    n.connections.some((c) => c.targetId === currentNode?.id)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                Change Impact Graph
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono border border-violet-500/30">
                  DEPENDENCY EXPLORER
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Visualiza el grafo de conexiones bidireccionales entre criaturas, biomas, misiones, NPCs y tablas de drops.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar entidad en el grafo..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
        </div>

        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
        >
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Main Grid: Node Selector & Impact Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nodes List */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Nodos Registrados ({filteredNodes.length})
          </h3>
          {filteredNodes.map((n) => {
            const isSelected = selectedNodeId === n.id;
            return (
              <div
                key={n.id}
                onClick={() => setSelectedNodeId(n.id)}
                className={`p-3 rounded-xl border transition cursor-pointer space-y-1 ${
                  isSelected
                    ? 'bg-violet-950/40 border-violet-500/60 text-slate-100 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{n.label}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {n.type}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-between font-mono">
                  <span>{n.group}</span>
                  <span>{n.connections.length} enlaces salientes</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Impact Inspector & Visual Graph Card */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {currentNode ? (
            <>
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-mono font-bold text-violet-400 uppercase">
                  {currentNode.group} · ID: {currentNode.id}
                </span>
                <h2 className="text-lg font-bold text-slate-100 mt-1">{currentNode.label}</h2>
              </div>

              {/* Outgoing Connections */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Enlaces Salientes ({currentNode.connections.length})
                </h3>
                {currentNode.connections.length === 0 ? (
                  <p className="text-xs text-slate-500">Este nodo no tiene dependencias hijas directas.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentNode.connections.map((c, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <span className="text-[10px] text-violet-400 font-mono font-semibold">
                            {c.label}
                          </span>
                          <p className="text-xs font-bold text-slate-200">{c.targetId}</p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {c.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Incoming References (Impact Area) */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Área de Impacto / Referencias Entrantes ({incomingReferences.length})
                </h3>
                {incomingReferences.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Ninguna otra entidad depende directamente de este nodo. Modificación de bajo riesgo.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {incomingReferences.map((inc) => (
                      <div
                        key={inc.id}
                        onClick={() => setSelectedNodeId(inc.id)}
                        className="p-3 bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl cursor-pointer transition flex items-center justify-between"
                      >
                        <div>
                          <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                            Depende de este nodo:
                          </span>
                          <p className="text-xs font-bold text-slate-200">{inc.label}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
