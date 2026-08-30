import { ProjectMemoryItem, MemoryCategory } from '../types/aurora';

const MEMORY_STORAGE_KEY = 'AURORA_PROJECT_MEMORY_V2';

export const INITIAL_PROJECT_MEMORY: ProjectMemoryItem[] = [
  {
    id: 'mem_world_01',
    category: 'WORLD_RULES',
    title: 'Jerarquía y Distribución de Elementos Primordiales',
    content: 'El mundo de AURORA se rige por 11 afinidades elementales donde la Aether y la Sombra ocupan los extremos de la polaridad cósmica. La Naturaleza y el Fuego nunca coexisten de forma simbiótica en el mismo bioma sin una zona de amortiguamiento de Tierra.',
    tags: ['elementos', 'lore', 'magia'],
    active: true,
    importance: 'high',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem_design_01',
    category: 'DESIGN_DECISIONS',
    title: 'Combate Táctico 2.5D por Turnos y Posicionamiento',
    content: 'El combate se fundamenta en un sistema táctico de 4 habilidades activas por criatura, donde la velocidad determina la iniciativa y la afinidad elemental añade un multiplicador de efectividad x1.5 / x0.5.',
    tags: ['combate', 'habilidades', 'balance'],
    active: true,
    importance: 'high',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem_prog_01',
    category: 'PROGRESSION_RULES',
    title: 'Curva de Nivel y BST Máximo por Región',
    content: 'La progresión regional sigue un escalón estricto: Región 1 (Lv 1-12, BST 280-380), Región 2 (Lv 10-22, BST 360-460), Región 3 (Lv 20-35, BST 440-540), Criaturas Legendarias (BST 580-680 solo en Mazmorras/Ápices).',
    tags: ['nivel', 'bst', 'progresion'],
    active: true,
    importance: 'high',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem_vis_01',
    category: 'VISUAL_RULES',
    title: 'Estándar Dimétrico 2.5D y Punto de Anclaje Y',
    content: 'Todo sprite de criatura o NPC debe tener anchorY entre 0.85 y 0.95 (en la base de los pies) para garantizar el Y-sorting en el motor Phaser 3. Ángulo de proyección dimétrica fija a 26.565° con sombras elípticas al 35% de opacidad.',
    tags: ['sprites', 'phaser3', '2.5D', 'ysort'],
    active: true,
    importance: 'high',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem_tech_01',
    category: 'TECHNICAL_CONVENTIONS',
    title: 'Inmutabilidad de Schemas y Puntos de Registro TypeScript',
    content: 'Los archivos generados deben exportar arrays tipados inmutables y registrarse en src/data/registries/aurora_*.ts. Nunca sobreescribir la lógica de escenas Phaser fuera de los puntos de integración auditados.',
    tags: ['typescript', 'arquitectura', 'cursor'],
    active: true,
    importance: 'medium',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem_rej_01',
    category: 'REJECTED_DECISIONS',
    title: 'Rechazo de Combate en Tiempo Real Hack-and-Slash',
    content: 'Se descartó el combate libre por frames en favor de combate por turnos semi-activo para mantener la profundidad estratégica y la fidelidad con la estética táctica 2.5D.',
    tags: ['combate', 'descartado'],
    active: true,
    importance: 'low',
    createdAt: new Date().toISOString(),
  },
];

export function loadProjectMemory(): ProjectMemoryItem[] {
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!raw) {
      saveProjectMemory(INITIAL_PROJECT_MEMORY);
      return INITIAL_PROJECT_MEMORY;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PROJECT_MEMORY;
  } catch (err) {
    console.warn('[Project Memory] Error loading memory from storage:', err);
    return INITIAL_PROJECT_MEMORY;
  }
}

export function saveProjectMemory(items: ProjectMemoryItem[]): void {
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('[Project Memory] Error saving memory to storage:', err);
  }
}

export function getActiveMemoryContextString(): string {
  const memory = loadProjectMemory().filter((m) => m.active);
  if (memory.length === 0) return '';

  return memory
    .map(
      (m) =>
        `[REGLA DE MEMORIA: ${m.category}] ${m.title}: ${m.content} (Tags: ${m.tags.join(', ')})`
    )
    .join('\n');
}
