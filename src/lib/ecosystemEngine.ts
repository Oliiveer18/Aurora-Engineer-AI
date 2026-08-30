import {
  ProjectContext,
  EcosystemWebResult,
  EcosystemNode,
  TrophicLevel,
  Creature,
} from '../types/aurora';

export function calculateTrophicLevel(creature: Creature): TrophicLevel {
  if (creature.rarity === 'legendary' || creature.rarity === 'mythic') return 'APEX_PREDATOR';
  if (creature.behavior === 'aggressive' || creature.behavior === 'pack_hunter') return 'SECONDARY_PREDATOR';
  if (creature.category === 'flora') return 'PRIMARY_PRODUCER';
  return 'HERBIVORE_PREY';
}

export function buildEcosystemWeb(
  context: ProjectContext,
  biomeId?: string
): EcosystemWebResult {
  const targetBiome = biomeId
    ? context.biomes.find((b) => b.id === biomeId)
    : context.biomes[0];

  const biomeName = targetBiome?.name || 'Bioma Global';
  const currentBiomeId = targetBiome?.id || 'biome_forest';

  // Filter creatures living in this biome
  const biomeCreatures = context.creatures.filter(
    (c) => !biomeId || c.habitat.includes(biomeId)
  );

  const nodes: EcosystemNode[] = [];

  // Add resource nodes
  nodes.push({
    id: `res_${currentBiomeId}_flora`,
    name: `Flora & Frutos de ${biomeName}`,
    category: 'resource',
    trophicLevel: 'RESOURCE',
    rarity: 'common',
    biomeId: currentBiomeId,
    biomassIndex: 100,
    eats: [],
    eatenBy: [],
    timeOfDay: 'any',
    weatherPreference: 'clear',
  });

  biomeCreatures.forEach((c) => {
    const tLevel = calculateTrophicLevel(c);
    nodes.push({
      id: c.id,
      name: c.name,
      category: c.category,
      trophicLevel: tLevel,
      rarity: c.rarity,
      biomeId: currentBiomeId,
      biomassIndex: tLevel === 'HERBIVORE_PREY' ? 60 : tLevel === 'SECONDARY_PREDATOR' ? 30 : 10,
      eats: tLevel === 'HERBIVORE_PREY' ? [`res_${currentBiomeId}_flora`] : [],
      eatenBy: [],
      timeOfDay: c.behavior === 'nocturnal' ? 'night' : 'any',
      weatherPreference: 'clear',
    });
  });

  const apexCount = nodes.filter((n) => n.trophicLevel === 'APEX_PREDATOR').length;
  const predatorCount = nodes.filter((n) => n.trophicLevel === 'SECONDARY_PREDATOR').length;
  const herbivoreCount = nodes.filter((n) => n.trophicLevel === 'HERBIVORE_PREY').length;
  const resourceCount = nodes.filter((n) => n.trophicLevel === 'RESOURCE').length;

  const totalAnimals = apexCount + predatorCount + herbivoreCount;
  const trophicRatio = predatorCount > 0 ? Number((herbivoreCount / predatorCount).toFixed(2)) : herbivoreCount;

  let status: EcosystemWebResult['status'] = 'balanced';
  const extinctionRisks: string[] = [];
  const recommendations: string[] = [];

  if (totalAnimals === 0) {
    status = 'sterile';
    extinctionRisks.push(`El bioma ${biomeName} no tiene fauna asignada.`);
    recommendations.push('Añadir al menos 2 criaturas presa y 1 depredador.');
  } else if (predatorCount > herbivoreCount && predatorCount > 0) {
    status = 'predator_heavy';
    extinctionRisks.push(`Colapso por sobre-depredación: Hay más carnívoros (${predatorCount}) que presas (${herbivoreCount}).`);
    recommendations.push('Añadir 2 criaturas herbívoras/presas para estabilizar la biomasa.');
  } else if (herbivoreCount > 0 && predatorCount === 0 && apexCount === 0) {
    status = 'prey_heavy';
    extinctionRisks.push('Superpoblación de herbívoros sin regulador natural de población.');
    recommendations.push('Introducir un depredador territorial para dinamizar los encuentros.');
  } else {
    recommendations.push('La pirámide trófica mantiene una estabilidad adecuada.');
  }

  const healthScore =
    status === 'balanced'
      ? 95
      : status === 'prey_heavy'
      ? 75
      : status === 'predator_heavy'
      ? 50
      : 20;

  return {
    biomeId: currentBiomeId,
    biomeName,
    healthScore,
    trophicPyramid: {
      apexCount,
      predatorCount,
      herbivoreCount,
      resourceCount,
    },
    trophicRatio,
    status,
    extinctionRisks,
    nodes,
    recommendations,
  };
}
