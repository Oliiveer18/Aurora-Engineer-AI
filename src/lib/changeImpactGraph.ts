import { ProjectContext, EntityDependencyNode } from '../types/aurora';

export function buildChangeImpactGraph(context: ProjectContext): EntityDependencyNode[] {
  const nodes: EntityDependencyNode[] = [];

  // 1. Biomes
  context.biomes.forEach((b) => {
    nodes.push({
      id: b.id,
      label: b.name,
      type: 'biome',
      group: 'Mundo & Geografía',
      connections: [],
    });
  });

  // 2. Creatures
  context.creatures.forEach((c) => {
    const connections: EntityDependencyNode['connections'] = [];
    c.habitat.forEach((hId) => {
      connections.push({ targetId: hId, label: 'Habita en', type: 'habitat' });
    });
    c.abilities.forEach((abId) => {
      connections.push({ targetId: abId, label: 'Aprende', type: 'ability' });
    });
    c.rewards?.drops?.forEach((d) => {
      connections.push({ targetId: d.itemId, label: 'Droppea', type: 'reward' });
    });
    c.evolution?.forEach((evoId) => {
      connections.push({ targetId: evoId, label: 'Evoluciona a', type: 'evolution' });
    });

    nodes.push({
      id: c.id,
      label: c.name,
      type: 'creature',
      group: 'Fauna & Criaturas',
      connections,
    });
  });

  // 3. NPCs
  context.npcs.forEach((n) => {
    const connections: EntityDependencyNode['connections'] = [];
    if (n.location) {
      connections.push({ targetId: n.location, label: 'Ubicado en', type: 'habitat' });
    }

    nodes.push({
      id: n.id,
      label: n.name,
      type: 'npc',
      group: 'Personajes & NPCs',
      connections,
    });
  });

  // 4. Quests
  context.quests.forEach((q) => {
    const connections: EntityDependencyNode['connections'] = [];
    if (q.relatedNpcId) {
      connections.push({ targetId: q.relatedNpcId, label: 'Otorgada por', type: 'quest_giver' });
    }
    q.objectives.forEach((obj) => {
      if (obj.targetId) {
        connections.push({ targetId: obj.targetId, label: 'Objetivo', type: 'reward' });
      }
    });
    q.rewards.items?.forEach((it) => {
      connections.push({ targetId: it.itemId, label: 'Recompensa', type: 'reward' });
    });

    nodes.push({
      id: q.id,
      label: q.title,
      type: 'quest',
      group: 'Misiones & Lore',
      connections,
    });
  });

  // 5. Abilities
  context.abilities.forEach((ab) => {
    nodes.push({
      id: ab.id,
      label: ab.name,
      type: 'ability',
      group: 'Habilidades & Magia',
      connections: [],
    });
  });

  // 6. Items
  context.items.forEach((it) => {
    nodes.push({
      id: it.id,
      label: it.name,
      type: 'item',
      group: 'Ítems & Recompensas',
      connections: [],
    });
  });

  return nodes;
}
