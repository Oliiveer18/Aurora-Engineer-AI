import { ProjectContext, WorldExpansionProposal, WorldPOI, WorldSecret } from '../types/aurora';

export function analyzeWorldExpansionNeeds(
  context: ProjectContext,
  regionId?: string
): WorldExpansionProposal[] {
  const targetRegions = regionId
    ? context.regions.filter((r) => r.id === regionId)
    : context.regions.length > 0
    ? context.regions
    : [
        {
          id: 'region_whispering_woods',
          name: 'Bosque Susurrante',
          description: 'Región boscosa ancestral con árboles gigantescos y niebla mística.',
          biomes: ['biome_deep_forest'],
          coordinates: { minX: 0, maxX: 1000, minY: 0, maxY: 1000 },
          elevationRange: [0, 200] as [number, number],
          loreSummary: 'Hogar de espíritus ancestrales y criaturas de naturaleza.',
        },
      ];

  const proposals: WorldExpansionProposal[] = targetRegions.map((reg, idx) => {
    const biomesInRegion = context.biomes.filter((b) => reg.biomes?.includes(b.id));
    const creaturesInRegion = context.creatures.filter((c) =>
      c.habitat.some((h) => reg.biomes?.includes(h))
    );
    const npcsInRegion = context.npcs.filter(
      (n) => n.location === reg.id || reg.biomes?.includes(n.location)
    );

    const pois: WorldPOI[] = [
      {
        id: `poi_${reg.id}_altar`,
        name: `Altar Olvidado de ${reg.name}`,
        type: 'shrine',
        coordinates2D5: { x: 350 + idx * 80, y: 420 + idx * 40, elevation: 1 },
        loreNotes: `Estructura milenaria donde los viajeros pueden descansar y canalizar esencias elementales.`,
        recommendedLevel: 8 + idx * 4,
        linkedEntityIds: creaturesInRegion.slice(0, 2).map((c) => c.id),
      },
      {
        id: `poi_${reg.id}_ruins`,
        name: `Campamento Abandonado de Exploradores`,
        type: 'camp',
        coordinates2D5: { x: 620, y: 780, elevation: 0 },
        loreNotes: `Vestigios de una expedición previa con notas de campo y pistas de criaturas raras.`,
        recommendedLevel: 10 + idx * 4,
        linkedEntityIds: npcsInRegion.slice(0, 1).map((n) => n.id),
      },
      {
        id: `poi_${reg.id}_grove`,
        name: `Enclave Secreto de Cristal`,
        type: 'grove',
        coordinates2D5: { x: 810, y: 190, elevation: 2 },
        loreNotes: `Área densa rica en recursos y apariciones nocturnas poco comunes.`,
        recommendedLevel: 14 + idx * 4,
      },
    ];

    const secrets: WorldSecret[] = [
      {
        id: `sec_${reg.id}_hidden_chest`,
        title: `Cofre Oculto tras la Cascada de ${reg.name}`,
        triggerCondition: 'Resolver acertijo de piedras rúnicas o interactuar de noche',
        rewardDescription: '150 Oro, 2x Esencias Primordiales, 1x Amuleto Antiguo',
        hintNpcId: npcsInRegion[0]?.id,
        secretType: 'puzzle_chest',
      },
      {
        id: `sec_${reg.id}_rare_spawn`,
        title: `Aparición de Criatura Alfa en Luna Llena`,
        triggerCondition: 'Clima despejado + Hora Nocturna en el Altar Olvidado',
        rewardDescription: 'Encuentro con variante Shiny y drop de equipo legendario',
        secretType: 'rare_spawn',
      },
    ];

    return {
      id: `exp_prop_${reg.id}`,
      regionId: reg.id,
      regionName: reg.name,
      theme: `Ampliación de Puntos de Interés y Secretos en ${reg.name}`,
      pois,
      secrets,
      encountersCount: Math.max(3, creaturesInRegion.length + 2),
      explainability: {
        why: `La región ${reg.name} cuenta con ${creaturesInRegion.length} criaturas y ${npcsInRegion.length} NPCs, dejando sectores con baja densidad de actividad lúdica.`,
        context: `Se añaden 3 POIs estratégicos y 2 secretos descubribles sin modificar las colisiones ni los límites del tilemap actual.`,
        impact: `Incrementa el tiempo de exploración estimado en +15-20 minutos por región y añade motivación para revisitar de noche.`,
        effort: 'LOW',
        risk: 'LOW',
      },
      status: 'draft',
    };
  });

  return proposals;
}
