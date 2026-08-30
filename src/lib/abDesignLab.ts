import { ABExperiment, ProjectContext } from '../types/aurora';

export function getInitialABExperiments(): ABExperiment[] {
  return [
    {
      id: 'exp_combat_pacing',
      title: 'Pacing y Duración del Combate Táctico',
      targetSystem: 'COMBAT',
      status: 'active',
      variants: [
        {
          id: 'var_fast_combat',
          name: 'Opción A: Combate Dinámico / Ágil',
          hypothesis: 'Aumentar el multiplicador de ataque x1.25 y reducir el HP de criaturas comunes en 15% acelera el ritmo de juego.',
          approach: 'Combates resueltos en 3-4 turnos promedio. Ideal para farmeo y exploración continua.',
          metrics: {
            pacingScore: 92,
            funFactor: 88,
            combatDepth: 70,
            progressionFriction: 20,
            technicalRisk: 'LOW',
          },
          advantages: ['Combates rápidos y fluidos', 'Menor fatiga en sesiones largas', 'Mayor sensación de poder'],
          drawbacks: ['Menor necesidad de usar buffs/debuffs tácticos'],
          changeSummary: ['statScaleFactor: 1.15', 'damageFormula: x1.2', 'commonHpReduction: 15%'],
        },
        {
          id: 'var_tactical_combat',
          name: 'Opción B: Combate Táctico Profundo',
          hypothesis: 'Incrementar la efectividad de estados alterados (veneno, aturdimiento) y mantener HP alto fomenta el uso de habilidades defensivas.',
          approach: 'Combates de 6-8 turnos donde la sinergia de afinidades elementales es indispensable.',
          metrics: {
            pacingScore: 74,
            funFactor: 82,
            combatDepth: 95,
            progressionFriction: 45,
            technicalRisk: 'LOW',
          },
          advantages: ['Alta profundidad estratégica', 'Cada habilidad y tipo elemental importa', 'Jefes memorables'],
          drawbacks: ['Puede resultar lento contra criaturas débiles'],
          changeSummary: ['elementalMultiplier: 1.75', 'statusChance: +15%', 'bossShieldLayers: enabled'],
        },
      ],
      selectedVariantId: 'var_fast_combat',
    },
    {
      id: 'exp_progression_curve',
      title: 'Curva de EXP y Drops de Crafteo',
      targetSystem: 'PROGRESSION',
      status: 'active',
      variants: [
        {
          id: 'var_generous_rewards',
          name: 'Opción A: Economía Generosa y Crafteo Temprano',
          hypothesis: 'Garantizar drops de ítems al 60% en criaturas comunes estimula la experimentación de crafteo.',
          approach: 'El jugador siempre obtiene recompensas útiles tras cada combate.',
          metrics: {
            pacingScore: 88,
            funFactor: 90,
            combatDepth: 80,
            progressionFriction: 15,
            technicalRisk: 'LOW',
          },
          advantages: ['Satisfacción inmediata', 'Cero sensación de tiempo desperdiciado'],
          drawbacks: ['Inflación de inventario si no hay sumideros de oro'],
          changeSummary: ['baseDropRate: 0.60', 'goldMultiplier: 1.25'],
        },
        {
          id: 'var_hardcore_scarcity',
          name: 'Opción B: Escasez Estratégica',
          hypothesis: 'Hacer los drops raros (20%) hace que cada hallazgo se sienta legendario.',
          approach: 'Economía ajustada donde los recursos deben gestionarse con precaución.',
          metrics: {
            pacingScore: 68,
            funFactor: 75,
            combatDepth: 85,
            progressionFriction: 60,
            technicalRisk: 'MEDIUM',
          },
          advantages: ['Sensación de logro alta', 'Mayor valor percibido de los ítems raros'],
          drawbacks: ['Posible frustración en jugadores casuales'],
          changeSummary: ['baseDropRate: 0.20', 'rareDropRate: 0.05'],
        },
      ],
      selectedVariantId: 'var_generous_rewards',
    },
  ];
}
