import { ProjectContext, ProjectAnalysis, ElementType, RarityType, AuroraEntityType } from '../types/aurora';

export function analyzeAuroraProject(context: ProjectContext): ProjectAnalysis {
  const creatures = context?.creatures || [];
  const npcs = context?.npcs || [];
  const quests = context?.quests || [];
  const biomes = context?.biomes || [];
  const regions = context?.regions || [];
  const items = context?.items || [];
  const abilities = context?.abilities || [];

  const elementDistribution: Record<ElementType, number> = {
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

  const rarityDistribution: Record<RarityType, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  creatures.forEach((c) => {
    if (!c) return;
    if (c.type && elementDistribution[c.type] !== undefined) {
      elementDistribution[c.type]++;
    }
    if (c.secondaryType && elementDistribution[c.secondaryType] !== undefined) {
      elementDistribution[c.secondaryType] += 0.5;
    }
    if (c.rarity && rarityDistribution[c.rarity] !== undefined) {
      rarityDistribution[c.rarity]++;
    }
  });

  // Analyze biomes
  const biomeCoverage = biomes.map((biome) => {
    const creaturesInBiome = creatures.filter((c) => c?.habitat?.includes(biome.id)).length;
    const npcsInBiome = npcs.filter((n) => n?.location === biome.id).length;
    const questsInBiome = quests.filter((q) => q?.location === biome.id).length;

    let status: 'empty' | 'underpopulated' | 'balanced' | 'rich' = 'balanced';
    if (creaturesInBiome === 0 && npcsInBiome === 0) {
      status = 'empty';
    } else if (creaturesInBiome < 2) {
      status = 'underpopulated';
    } else if (creaturesInBiome >= 4 && questsInBiome >= 2) {
      status = 'rich';
    }

    return {
      biomeId: biome.id,
      biomeName: biome.name,
      creatureCount: creaturesInBiome,
      npcCount: npcsInBiome,
      questCount: questsInBiome,
      status,
    };
  });

  // Missing content gaps
  const missingContentGaps: ProjectAnalysis['missingContentGaps'] = [];

  // Check for regions without biomes
  regions.forEach((region) => {
    if (!region) return;
    const biomesInRegion = biomes.filter((b) => b && b.regionId === region.id);
    if (biomesInRegion.length === 0) {
      missingContentGaps.push({
        category: 'biome',
        title: `Bioma faltante en ${region.name || region.id}`,
        description: `La región "${region.name || region.id}" no tiene ningún bioma registrado.`,
        suggestedPrompt: `Genera un bioma temático para la región "${region.name || region.id}" (${region.description || ''}) con especificaciones 2.5D de niebla e iluminación.`,
        targetRegionOrBiome: region.id,
      });
    }
  });

  // Check for underpopulated biomes
  biomeCoverage.forEach((cov) => {
    if (cov.status === 'empty' || cov.status === 'underpopulated') {
      missingContentGaps.push({
        category: 'creature',
        title: `Ecosistema incompleto en ${cov.biomeName}`,
        description: `El bioma "${cov.biomeName}" solo cuenta con ${cov.creatureCount} criaturas registradas.`,
        suggestedPrompt: `Crea una criatura nativa única para ${cov.biomeName} adaptada a su temperatura y perspectiva 2.5D.`,
        targetRegionOrBiome: cov.biomeId,
      });
    }
    if (cov.questCount === 0) {
      missingContentGaps.push({
        category: 'quest',
        title: `Misión faltante en ${cov.biomeName}`,
        description: `No hay misiones activas en el bioma "${cov.biomeName}".`,
        suggestedPrompt: `Crea una misión de exploración o cacería ambientada en ${cov.biomeName} con recompensas temáticas.`,
        targetRegionOrBiome: cov.biomeId,
      });
    }
  });

  // Check for unrepresented elements
  const lowElements = (Object.keys(elementDistribution) as ElementType[]).filter(
    (elem) => elementDistribution[elem] === 0 && elem !== 'aether'
  );
  if (lowElements.length > 0) {
    const targetElem = lowElements[0];
    missingContentGaps.push({
      category: 'creature',
      title: `Vacío elemental: Tipo ${targetElem.toUpperCase()}`,
      description: `Actualmente no hay ninguna criatura de tipo principal ${targetElem} en el proyecto.`,
      suggestedPrompt: `Crea una criatura elemental de tipo ${targetElem} con habilidades exclusivas y especificaciones 2.5D.`,
    });
  }

  // Check for NPCs without quests
  npcs.forEach((npc) => {
    if (!npc) return;
    if (npc.role === 'quest_giver' && (!npc.associatedQuests || npc.associatedQuests.length === 0)) {
      missingContentGaps.push({
        category: 'quest',
        title: `Misión pendiente para ${npc.name || npc.id}`,
        description: `El NPC "${npc.name || npc.id}" tiene rol de dador de misiones pero ninguna misión asignada.`,
        suggestedPrompt: `Crea una misión para el NPC ${npc.name || npc.id} (${npc.title || ''}) acorde a su historia personal.`,
      });
    }
  });

  // Redundancy detector
  const redundancies: ProjectAnalysis['redundancies'] = [];
  const creatureNames = new Map<string, string[]>();
  creatures.forEach((c) => {
    if (!c) return;
    const key = `${c.type}_${c.category}_${c.rarity}`;
    if (!creatureNames.has(key)) creatureNames.set(key, []);
    creatureNames.get(key)!.push(c.name);
  });

  creatureNames.forEach((names, key) => {
    if (names.length >= 3) {
      const [type, cat, rarity] = key.split('_');
      redundancies.push({
        title: `Saturación de nicho: ${type} ${cat} (${rarity})`,
        entityIds: names,
        reason: `Existen ${names.length} criaturas con la misma combinación (${names.join(', ')}). Considera variar roles o elementos secundarios.`,
      });
    }
  });

  // Stat Imbalance Detector
  const imbalances: ProjectAnalysis['imbalances'] = [];
  creatures.forEach((c) => {
    if (!c) return;
    const totalStats =
      (c.stats?.hp || 0) +
      (c.stats?.attack || 0) +
      (c.stats?.defense || 0) +
      (c.stats?.speed || 0) +
      (c.stats?.specialAttack || 0) +
      (c.stats?.specialDefense || 0);

    // Baseline expectations:
    // Common: ~280-340, Uncommon: ~340-420, Rare: ~420-520, Epic: ~520-620, Legendary: ~620-720
    let expectedRange = [260, 360];
    if (c.rarity === 'uncommon') expectedRange = [330, 440];
    if (c.rarity === 'rare') expectedRange = [400, 540];
    if (c.rarity === 'epic') expectedRange = [500, 640];
    if (c.rarity === 'legendary') expectedRange = [600, 750];

    if (totalStats < expectedRange[0] || totalStats > expectedRange[1]) {
      imbalances.push({
        entityId: c.id,
        name: c.name || c.id,
        issue: `Suma total de stats (${totalStats}) fuera del rango esperado [${expectedRange[0]}-${expectedRange[1]}] para rareza "${c.rarity}".`,
        recommendation: `Usa la acción de 'Balancear' para normalizar las estadísticas a nivel competitivo 2.5D.`,
      });
    }
  });

  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalCreatures: creatures.length,
      totalNPCs: npcs.length,
      totalQuests: quests.length,
      totalBiomes: biomes.length,
      totalItems: items.length,
      totalAbilities: abilities.length,
      totalRegions: regions.length,
    },
    elementDistribution,
    rarityDistribution,
    biomeCoverage,
    missingContentGaps,
    redundancies,
    imbalances,
  };
}
