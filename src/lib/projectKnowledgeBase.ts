import {
  ProjectContext,
  AuroraEntityType,
  ElementType,
  RarityType,
  Creature,
  NPC,
  Quest,
  Biome,
  Item,
  Ability,
  Region,
} from '../types/aurora';

export interface EntityIndexEntry {
  id: string;
  name: string;
  type: AuroraEntityType;
  parentOrLocation?: string;
  tags?: string[];
  summary: string;
}

export interface ProjectKnowledgeBase {
  timestamp: string;
  totalEntities: number;
  idRegistry: Map<string, EntityIndexEntry>;
  occupiedIds: string[];
  
  // Element Analysis
  elementCounts: Record<ElementType, number>;
  underrepresentedElements: ElementType[];
  overrepresentedElements: ElementType[];
  
  // Level & BST Curve
  averageBstByRarity: Record<RarityType, number>;
  levelDistribution: { min: number; max: number; avg: number };
  
  // Cross-reference graphs
  creaturesByBiome: Record<string, string[]>;
  npcsByLocation: Record<string, string[]>;
  questsByNpc: Record<string, string[]>;
  itemsByDropSource: Record<string, string[]>;
  abilitiesByCreature: Record<string, string[]>;
  
  // World geography anchor (Existing map preservation)
  existingRegions: { id: string; name: string; biomes: string[] }[];
  existingBiomes: { id: string; name: string; regionId: string; temperature: string; atmosphere: string }[];
  
  // Gaps & Insights
  orphanedEntities: {
    npcsWithoutQuests: string[];
    questsWithoutNpc: string[];
    abilitiesWithoutUsers: string[];
    itemsWithoutSources: string[];
    biomesWithoutCreatures: string[];
  };
}

export function buildProjectKnowledgeBase(context: ProjectContext): ProjectKnowledgeBase {
  const idRegistry = new Map<string, EntityIndexEntry>();
  const occupiedIds: string[] = [];

  const regions = context?.regions || [];
  const biomes = context?.biomes || [];
  const creatures = context?.creatures || [];
  const npcs = context?.npcs || [];
  const quests = context?.quests || [];
  const items = context?.items || [];
  const abilities = context?.abilities || [];
  const dungeons = context?.dungeons || [];
  const factions = context?.factions || [];
  const shops = context?.shops || [];

  const register = (id: string, name: string, type: AuroraEntityType, summary: string, parentOrLocation?: string, tags?: string[]) => {
    if (id) {
      idRegistry.set(id, { id, name, type, parentOrLocation, tags, summary });
      occupiedIds.push(id);
    }
  };

  regions.forEach((r) => r && register(r.id, r.name, 'region', r.description));
  biomes.forEach((b) => b && register(b.id, b.name, 'biome', `${b.temperature || ''}, ${b.atmosphere || ''}`, b.regionId));
  creatures.forEach((c) => c && register(c.id, c.name, 'creature', `${c.type} ${c.category} (BST: ${getCreatureBST(c)})`, c.habitat?.join(', '), c.tags));
  npcs.forEach((n) => n && register(n.id, n.name, 'npc', `${n.role} - ${n.title}`, n.location, n.tags));
  quests.forEach((q) => q && register(q.id, q.title, 'quest', `${q.type} - Nivel ${q.requirements?.minLevel || 1}`, q.location, q.tags));
  items.forEach((i) => i && register(i.id, i.name, 'item', `${i.type} (${i.category}) - ${i.value}g`));
  abilities.forEach((a) => a && register(a.id, a.name, 'ability', `${a.type} ${a.category} - Pow: ${a.power}`));
  dungeons.forEach((d) => d && register(d.id, d.name, 'dungeon', `Lv ${d.recommendedLevel} (${d.floorsCount} pisos)`, d.regionId));
  factions.forEach((f) => f && register(f.id, f.name, 'faction', f.beliefs));
  shops.forEach((s) => s && register(s.id, s.name, 'shop', `Merchant: ${s.merchantNpcId}`, s.location));

  // Element analysis
  const elementCounts: Record<ElementType, number> = {
    nature: 0,
    fire: 0,
    water: 0,
    electric: 0,
    ice: 0,
    shadow: 0,
    light: 0,
    earth: 0,
    wind: 0,
    neutral: 0,
    aether: 0,
  };

  creatures.forEach((c) => {
    if (!c) return;
    if (c.type && elementCounts[c.type] !== undefined) elementCounts[c.type]++;
    if (c.secondaryType && elementCounts[c.secondaryType] !== undefined) elementCounts[c.secondaryType] += 0.5;
  });

  const allElements = Object.keys(elementCounts) as ElementType[];
  const underrepresentedElements = allElements.filter((e) => elementCounts[e] <= 1 && e !== 'aether');
  const maxElemCount = Math.max(...Object.values(elementCounts), 1);
  const overrepresentedElements = allElements.filter((e) => elementCounts[e] >= 4 || (elementCounts[e] > 2 && elementCounts[e] === maxElemCount));

  // BST averages
  const bstByRarityAcc: Record<RarityType, { sum: number; count: number }> = {
    common: { sum: 0, count: 0 },
    uncommon: { sum: 0, count: 0 },
    rare: { sum: 0, count: 0 },
    epic: { sum: 0, count: 0 },
    legendary: { sum: 0, count: 0 },
    mythic: { sum: 0, count: 0 },
  };

  let totalLevel = 0;
  let minLevel = 999;
  let maxLevel = 1;

  creatures.forEach((c) => {
    if (!c) return;
    const bst = getCreatureBST(c);
    if (c.rarity && bstByRarityAcc[c.rarity]) {
      bstByRarityAcc[c.rarity].sum += bst;
      bstByRarityAcc[c.rarity].count++;
    }
    const lvl = c.recommendedLevel || 1;
    totalLevel += lvl;
    if (lvl < minLevel) minLevel = lvl;
    if (lvl > maxLevel) maxLevel = lvl;
  });

  const averageBstByRarity: Record<RarityType, number> = {
    common: bstByRarityAcc.common.count ? Math.round(bstByRarityAcc.common.sum / bstByRarityAcc.common.count) : 310,
    uncommon: bstByRarityAcc.uncommon.count ? Math.round(bstByRarityAcc.uncommon.sum / bstByRarityAcc.uncommon.count) : 380,
    rare: bstByRarityAcc.rare.count ? Math.round(bstByRarityAcc.rare.sum / bstByRarityAcc.rare.count) : 480,
    epic: bstByRarityAcc.epic.count ? Math.round(bstByRarityAcc.epic.sum / bstByRarityAcc.epic.count) : 560,
    legendary: bstByRarityAcc.legendary.count ? Math.round(bstByRarityAcc.legendary.sum / bstByRarityAcc.legendary.count) : 660,
    mythic: bstByRarityAcc.mythic.count ? Math.round(bstByRarityAcc.mythic.sum / bstByRarityAcc.mythic.count) : 720,
  };

  const levelDistribution = {
    min: minLevel === 999 ? 1 : minLevel,
    max: maxLevel,
    avg: creatures.length ? Math.round(totalLevel / creatures.length) : 10,
  };

  // Cross-references
  const creaturesByBiome: Record<string, string[]> = {};
  biomes.forEach((b) => b && (creaturesByBiome[b.id] = []));
  creatures.forEach((c) => {
    if (!c) return;
    c.habitat?.forEach((bId) => {
      if (!creaturesByBiome[bId]) creaturesByBiome[bId] = [];
      creaturesByBiome[bId].push(c.id);
    });
  });

  const npcsByLocation: Record<string, string[]> = {};
  npcs.forEach((n) => {
    if (!n) return;
    const loc = n.location || 'unassigned';
    if (!npcsByLocation[loc]) npcsByLocation[loc] = [];
    npcsByLocation[loc].push(n.id);
  });

  const questsByNpc: Record<string, string[]> = {};
  quests.forEach((q) => {
    if (!q) return;
    if (q.relatedNpcId) {
      if (!questsByNpc[q.relatedNpcId]) questsByNpc[q.relatedNpcId] = [];
      questsByNpc[q.relatedNpcId].push(q.id);
    }
  });

  const itemsByDropSource: Record<string, string[]> = {};
  items.forEach((i) => {
    if (!i) return;
    i.dropSources?.forEach((src) => {
      if (!itemsByDropSource[src]) itemsByDropSource[src] = [];
      itemsByDropSource[src].push(i.id);
    });
  });

  const abilitiesByCreature: Record<string, string[]> = {};
  creatures.forEach((c) => {
    if (!c) return;
    c.abilities?.forEach((abId) => {
      if (!abilitiesByCreature[abId]) abilitiesByCreature[abId] = [];
      abilitiesByCreature[abId].push(c.id);
    });
  });

  // Orphaned
  const npcIdsWithQuests = new Set(quests.map((q) => q?.relatedNpcId).filter(Boolean));
  const npcsWithoutQuests = npcs
    .filter((n) => n && n.role === 'quest_giver' && !npcIdsWithQuests.has(n.id))
    .map((n) => n.id);

  const existingNpcIds = new Set(npcs.map((n) => n?.id).filter(Boolean));
  const questsWithoutNpc = quests.filter((q) => q && q.relatedNpcId && !existingNpcIds.has(q.relatedNpcId)).map((q) => q.id);

  const usedAbilities = new Set(creatures.flatMap((c) => c?.abilities || []));
  const abilitiesWithoutUsers = abilities.filter((a) => a && !usedAbilities.has(a.id)).map((a) => a.id);

  const itemsDropped = new Set<string>();
  creatures.forEach((c) => c?.rewards?.drops?.forEach((d) => d?.itemId && itemsDropped.add(d.itemId)));
  biomes.forEach((b) => b?.gatherableResources?.forEach((r) => r && itemsDropped.add(r)));
  const itemsWithoutSources = items.filter((i) => i && i.type === 'material' && !itemsDropped.has(i.id)).map((i) => i.id);

  const biomesWithoutCreatures = biomes.filter((b) => b && (creaturesByBiome[b.id] || []).length === 0).map((b) => b.id);

  return {
    timestamp: new Date().toISOString(),
    totalEntities: idRegistry.size,
    idRegistry,
    occupiedIds,
    elementCounts,
    underrepresentedElements,
    overrepresentedElements,
    averageBstByRarity,
    levelDistribution,
    creaturesByBiome,
    npcsByLocation,
    questsByNpc,
    itemsByDropSource,
    abilitiesByCreature,
    existingRegions: regions.map((r) => ({ id: r.id, name: r.name, biomes: r.biomes || [] })),
    existingBiomes: biomes.map((b) => ({
      id: b.id,
      name: b.name,
      regionId: b.regionId,
      temperature: b.temperature,
      atmosphere: b.atmosphere,
    })),
    orphanedEntities: {
      npcsWithoutQuests,
      questsWithoutNpc,
      abilitiesWithoutUsers,
      itemsWithoutSources,
      biomesWithoutCreatures,
    },
  };
}

export function getCreatureBST(c: Creature): number {
  if (!c.stats) return 0;
  return (
    (c.stats.hp || 0) +
    (c.stats.attack || 0) +
    (c.stats.defense || 0) +
    (c.stats.speed || 0) +
    (c.stats.specialAttack || 0) +
    (c.stats.specialDefense || 0)
  );
}

/**
 * Generates rich grounding context for Gemini to guarantee no collisions, lore coherence,
 * and anchoring to existing maps/regions.
 */
export function buildGroundingContext(
  context: ProjectContext,
  category: AuroraEntityType,
  targetBiomeOrRegionId?: string
): {
  contextSummary: string;
  existingIds: string[];
  groundingMetrics: {
    targetLocationName?: string;
    existingEntitiesInLocation: string[];
    suggestedElementTypes: string[];
    recommendedBstRange: [number, number];
    occupiedIdsCount: number;
  };
} {
  const kb = buildProjectKnowledgeBase(context);
  
  let targetLocationName: string | undefined;
  const existingEntitiesInLocation: string[] = [];

  if (targetBiomeOrRegionId) {
    const biome = context.biomes.find((b) => b.id === targetBiomeOrRegionId);
    if (biome) {
      targetLocationName = `Bioma: "${biome.name}" (Región: ${biome.regionId}, Clima: ${biome.temperature}, Atmósfera: ${biome.atmosphere})`;
      const creatures = context.creatures.filter((c) => c.habitat?.includes(biome.id));
      creatures.forEach((c) => existingEntitiesInLocation.push(`${c.name} (${c.type}/${c.rarity})`));
      const npcs = context.npcs.filter((n) => n.location === biome.id);
      npcs.forEach((n) => existingEntitiesInLocation.push(`NPC: ${n.name} (${n.role})`));
    } else {
      const region = context.regions.find((r) => r.id === targetBiomeOrRegionId);
      if (region) {
        targetLocationName = `Región: "${region.name}" (${region.loreSummary})`;
      }
    }
  }

  const contextSummary = `
PROYECTO AURORA EXISTENTE (Cursor + Phaser 3 + TypeScript):
- Regiones Activas: ${context.regions.map((r) => `${r.name} (${r.id})`).join(', ')}
- Biomas Registrados: ${context.biomes.map((b) => `${b.name} (${b.id})`).join(', ')}
- Tipos Poco Representados: ${kb.underrepresentedElements.join(', ') || 'Equilibrado'}
- Tipos Muy Representados (Evitar sobre-saturar): ${kb.overrepresentedElements.join(', ') || 'Ninguno'}
- Rango de Niveles del Proyecto: Lv ${kb.levelDistribution.min} - ${kb.levelDistribution.max} (Promedio: Lv ${kb.levelDistribution.avg})
- Anclaje de Ubicación Actual: ${targetLocationName || 'Cualquier bioma existente del mapa'}
- Entidades ya presentes en este espacio: ${existingEntitiesInLocation.length ? existingEntitiesInLocation.join(', ') : 'Espacio nuevo o despoblado'}
- IMPORTANTE: No modificar mapas existentes; los IDs deben ser únicos en snake_case y compatibles con motor dimétrico 2.5D (depth = y + ySortOffset).
`;

  return {
    contextSummary,
    existingIds: kb.occupiedIds,
    groundingMetrics: {
      targetLocationName,
      existingEntitiesInLocation,
      suggestedElementTypes: kb.underrepresentedElements,
      recommendedBstRange: [kb.averageBstByRarity.uncommon - 30, kb.averageBstByRarity.rare + 30],
      occupiedIdsCount: kb.occupiedIds.length,
    },
  };
}
