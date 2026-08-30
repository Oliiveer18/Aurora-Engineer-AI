import { AIRoadmapItem, ProjectContext } from '../types/aurora';

export function calculatePriorityScore(
  impact: number, // 1-10
  playerValue: number, // 1-10
  effort: number, // 1-10
  risk: number // 1-10
): number {
  // Higher impact and player value increase score, higher effort and risk decrease it
  const positive = impact * 0.4 + playerValue * 0.4;
  const negative = (10 - effort) * 0.1 + (10 - risk) * 0.1;
  return Math.round((positive + negative) * 10);
}

export function generateAIRoadmap(context: ProjectContext): AIRoadmapItem[] {
  const items: AIRoadmapItem[] = [
    {
      id: 'road_01',
      title: 'Completar Pirámide Trófica en Biomas Secundarios',
      domain: 'BALANCE',
      timeframe: 'NOW',
      priorityScore: 92,
      impactScore: 9,
      effortScore: 3,
      riskScore: 2,
      playerValueScore: 9,
      dependencies: [],
      rationale: 'Varios biomas presentan déficit de criaturas herbívoras, lo que genera desbalance ecológico.',
      suggestedAction: 'Usar el AI Game Builder o Ecosystem Fix para añadir 2 criaturas por bioma.',
      status: 'planned',
    },
    {
      id: 'road_02',
      title: 'Vincular Misiones Huérfanas con NPCs de Facciones',
      domain: 'QUESTS',
      timeframe: 'NOW',
      priorityScore: 88,
      impactScore: 8,
      effortScore: 2,
      riskScore: 1,
      playerValueScore: 8,
      dependencies: [],
      rationale: 'Las misiones sin NPC dador no pueden ser iniciadas por el jugador.',
      suggestedAction: 'Asignar giverNpcId a los vigías de las facciones correspondientes.',
      status: 'planned',
    },
    {
      id: 'road_03',
      title: 'Añadir 3 Mazmorras de Elevación 2.5D con Jefes de Aether',
      domain: 'GAMEPLAY',
      timeframe: 'NEXT',
      priorityScore: 78,
      impactScore: 9,
      effortScore: 6,
      riskScore: 3,
      playerValueScore: 9,
      dependencies: ['road_01'],
      rationale: 'Aporta el clímax de juego y permite obtener criaturas legendarias en el end-game.',
      suggestedAction: 'Generar plantillas de mazmorras de 3 pisos con el AI Director.',
      status: 'planned',
    },
    {
      id: 'road_04',
      title: 'Auditoría y Normalización de Sprites y Sombras Dimétricas',
      domain: 'VISUAL',
      timeframe: 'NEXT',
      priorityScore: 75,
      impactScore: 7,
      effortScore: 3,
      riskScore: 1,
      playerValueScore: 7,
      dependencies: [],
      rationale: 'Garantizar que el 100% de assets cumpla con Y-Anchor 0.85-0.95 en Phaser 3.',
      suggestedAction: 'Ejecutar auto-fix en la pestaña Visual QA.',
      status: 'planned',
    },
    {
      id: 'road_05',
      title: 'Sistema de Eventos Dinámicos de Clima y Día/Noche',
      domain: 'WORLD',
      timeframe: 'LATER',
      priorityScore: 65,
      impactScore: 7,
      effortScore: 6,
      riskScore: 4,
      playerValueScore: 8,
      dependencies: ['road_03'],
      rationale: 'Permite spawns condicionales de criaturas raras bajo lluvia o en noche cerrada.',
      suggestedAction: 'Integrar triggers climáticos con el motor de eventos de Phaser.',
      status: 'planned',
    },
    {
      id: 'road_06',
      title: 'Modo de Desafío Boss Rush Post-Game',
      domain: 'TECH',
      timeframe: 'OPTIONAL',
      priorityScore: 50,
      impactScore: 5,
      effortScore: 5,
      riskScore: 2,
      playerValueScore: 6,
      dependencies: ['road_03'],
      rationale: 'Contenido opcional de alta rejugabilidad para jugadores completistas.',
      suggestedAction: 'Crear escena especial en Phaser para peleas consecutivas.',
      status: 'planned',
    },
  ];

  return items;
}
