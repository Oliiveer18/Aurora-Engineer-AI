import {
  ProjectContext,
  Creature,
  Ability,
  ElementType,
  GameplaySimulationResult,
  CombatSimulationRun,
  CombatSimulationRound,
} from '../types/aurora';

// Elemental effectiveness chart (Attacker -> Defender)
const ELEMENT_ADVANTAGE: Record<ElementType, ElementType[]> = {
  fire: ['nature', 'ice'],
  water: ['fire', 'earth'],
  nature: ['water', 'earth'],
  electric: ['water', 'wind'],
  ice: ['nature', 'wind', 'dragon' as any],
  earth: ['fire', 'electric'],
  wind: ['nature', 'earth'],
  shadow: ['light', 'neutral'],
  light: ['shadow', 'undead' as any],
  neutral: [],
  aether: ['shadow', 'fire', 'water', 'nature'],
};

export function getElementalMultiplier(attackerType: ElementType, defenderType: ElementType): number {
  if (attackerType === 'aether') return 1.35;
  if (ELEMENT_ADVANTAGE[attackerType]?.includes(defenderType)) return 1.5;
  if (ELEMENT_ADVANTAGE[defenderType]?.includes(attackerType)) return 0.75;
  return 1.0;
}

export function simulateSingleCombat(
  attacker: Creature,
  defender: Creature,
  abilitiesMap: Map<string, Ability>
): CombatSimulationRun {
  let hpA = attacker.stats.hp;
  let hpB = defender.stats.hp;
  const rounds: CombatSimulationRound[] = [];
  let currentTurn = 1;
  const maxTurns = 30;

  // Determine turn order based on speed
  const speedA = attacker.stats.speed;
  const speedB = defender.stats.speed;

  while (hpA > 0 && hpB > 0 && currentTurn <= maxTurns) {
    const isAttackerFirst = speedA >= speedB || Math.random() > 0.45;
    const first = isAttackerFirst ? attacker : defender;
    const second = isAttackerFirst ? defender : attacker;

    // First fighter strikes
    const ability1Id = first.abilities[Math.floor(Math.random() * (first.abilities.length || 1))] || 'basic_strike';
    const ability1 = abilitiesMap.get(ability1Id);
    const power1 = ability1?.power || 40;
    const elemMult1 = getElementalMultiplier(first.type, second.type);
    const isCrit1 = Math.random() < 0.12;
    const rawDmg1 = Math.max(
      4,
      Math.floor(((first.stats.attack * power1) / (second.stats.defense * 2.5)) * elemMult1 * (isCrit1 ? 1.5 : 1.0))
    );

    if (isAttackerFirst) {
      hpB = Math.max(0, hpB - rawDmg1);
    } else {
      hpA = Math.max(0, hpA - rawDmg1);
    }

    rounds.push({
      turn: currentTurn,
      attacker: first.name,
      defender: second.name,
      actionUsed: ability1?.name || 'Ataque Básico',
      damage: rawDmg1,
      remainingHpDefender: isAttackerFirst ? hpB : hpA,
      isCrit: isCrit1,
    });

    if (hpA <= 0 || hpB <= 0) break;

    // Second fighter strikes back
    const ability2Id = second.abilities[Math.floor(Math.random() * (second.abilities.length || 1))] || 'basic_strike';
    const ability2 = abilitiesMap.get(ability2Id);
    const power2 = ability2?.power || 40;
    const elemMult2 = getElementalMultiplier(second.type, first.type);
    const isCrit2 = Math.random() < 0.12;
    const rawDmg2 = Math.max(
      4,
      Math.floor(((second.stats.attack * power2) / (first.stats.defense * 2.5)) * elemMult2 * (isCrit2 ? 1.5 : 1.0))
    );

    if (isAttackerFirst) {
      hpA = Math.max(0, hpA - rawDmg2);
    } else {
      hpB = Math.max(0, hpB - rawDmg2);
    }

    rounds.push({
      turn: currentTurn,
      attacker: second.name,
      defender: first.name,
      actionUsed: ability2?.name || 'Ataque Básico',
      damage: rawDmg2,
      remainingHpDefender: isAttackerFirst ? hpA : hpB,
      isCrit: isCrit2,
    });

    currentTurn++;
  }

  const winner = hpA > 0 ? attacker.name : defender.name;

  return {
    creatureA: attacker.name,
    creatureB: defender.name,
    winner,
    totalTurns: rounds.length,
    damageDealtA: attacker.stats.hp - hpA,
    damageDealtB: defender.stats.hp - hpB,
    rounds,
  };
}

/**
 * Runs a comprehensive analytical gameplay simulation across sample battles and level progression.
 */
export function runGameplaySimulation(
  context: ProjectContext,
  playerLevel = 10,
  sampleBatches = 20
): GameplaySimulationResult {
  const abilitiesMap = new Map<string, Ability>();
  (context.abilities || []).forEach((ab) => abilitiesMap.set(ab.id, ab));

  const creatures = context.creatures || [];
  if (creatures.length < 2) {
    return {
      simulatedAt: new Date().toISOString(),
      sampleCount: 0,
      playerLevel,
      averageTurnsToKill: 4.5,
      playerWinRate: 0.75,
      difficultyRating: 'BALANCED',
      progressionSpeed: 'HEALTHY',
      dominantAbilities: [],
      underperformingAbilities: [],
      anomaliesDetected: [
        {
          title: 'Muestra Insuficiente de Criaturas',
          severity: 'warning',
          description: 'Se requieren al menos 2 criaturas en el proyecto para simular combates estadísticos.',
          recommendation: 'Añadir criaturas mediante el Creador de IA o Packs de Producción.',
        },
      ],
      combatRuns: [],
    };
  }

  // Filter creatures matching proximity to player level
  const validOpponents = creatures.filter((c) => Math.abs(c.recommendedLevel - playerLevel) <= 8);
  const pool = validOpponents.length >= 2 ? validOpponents : creatures;

  const combatRuns: CombatSimulationRun[] = [];
  let totalTurns = 0;
  let playerWins = 0;
  const abilityUsageWinCount: Record<string, { used: number; wins: number }> = {};

  for (let i = 0; i < sampleBatches; i++) {
    const creatureA = pool[Math.floor(Math.random() * pool.length)];
    let creatureB = pool[Math.floor(Math.random() * pool.length)];
    while (creatureB.id === creatureA.id && pool.length > 1) {
      creatureB = pool[Math.floor(Math.random() * pool.length)];
    }

    const run = simulateSingleCombat(creatureA, creatureB, abilitiesMap);
    combatRuns.push(run);
    totalTurns += run.totalTurns;
    if (run.winner === creatureA.name) {
      playerWins++;
    }

    creatureA.abilities.forEach((abId) => {
      if (!abilityUsageWinCount[abId]) abilityUsageWinCount[abId] = { used: 0, wins: 0 };
      abilityUsageWinCount[abId].used++;
      if (run.winner === creatureA.name) abilityUsageWinCount[abId].wins++;
    });
  }

  const avgTTK = combatRuns.length > 0 ? Number((totalTurns / combatRuns.length / 2).toFixed(1)) : 4;
  const winRate = combatRuns.length > 0 ? Number((playerWins / combatRuns.length).toFixed(2)) : 0.7;

  // Dominant vs underperforming abilities
  const dominantAbilities: string[] = [];
  const underperformingAbilities: string[] = [];
  Object.entries(abilityUsageWinCount).forEach(([abId, data]) => {
    const ab = abilitiesMap.get(abId);
    const abName = ab?.name || abId;
    const rate = data.used > 0 ? data.wins / data.used : 0;
    if (rate > 0.8 && data.used >= 3) dominantAbilities.push(abName);
    if (rate < 0.25 && data.used >= 3) underperformingAbilities.push(abName);
  });

  // Anomalies
  const anomalies: GameplaySimulationResult['anomaliesDetected'] = [];
  if (winRate < 0.35) {
    anomalies.push({
      title: 'Pico de Dificultad Crítico para Nivel ' + playerLevel,
      severity: 'critical',
      description: `El win rate de los combatientes es de solo ${(winRate * 100).toFixed(0)}%, lo que provocará frustración en el jugador.`,
      recommendation: 'Revisar la defensa base y el poder de las habilidades de los oponentes en esta franja.',
    });
  } else if (winRate > 0.9) {
    anomalies.push({
      title: 'Combate Demasiado Trivial',
      severity: 'warning',
      description: `Los enfrentamientos se resuelven con ${(winRate * 100).toFixed(0)}% de victorias casi sin daño recibido.`,
      recommendation: 'Incrementar la agresividad de stats en criaturas salvajes o añadir mecánicas de estado.',
    });
  }

  if (avgTTK > 8) {
    anomalies.push({
      title: 'Ritmo de Combate Lento (TTK Alto)',
      severity: 'warning',
      description: `Los combates tardan un promedio de ${avgTTK} turnos en resolverse.`,
      recommendation: 'Aumentar ligeramente el stat de ataque o reducir el HP de criaturas comunes.',
    });
  }

  const difficultyRating =
    winRate > 0.85
      ? 'CASUAL'
      : winRate >= 0.65
      ? 'BALANCED'
      : winRate >= 0.45
      ? 'CHALLENGING'
      : 'PUNISHING';

  return {
    simulatedAt: new Date().toISOString(),
    sampleCount: sampleBatches,
    playerLevel,
    averageTurnsToKill: avgTTK,
    playerWinRate: winRate,
    difficultyRating,
    progressionSpeed: avgTTK > 6 ? 'SLUGGISH' : 'HEALTHY',
    dominantAbilities,
    underperformingAbilities,
    anomaliesDetected: anomalies,
    combatRuns,
  };
}
