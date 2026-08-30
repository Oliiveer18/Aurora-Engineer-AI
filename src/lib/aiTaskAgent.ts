import { AITask, TaskState, TaskPriority, ProjectContext } from '../types/aurora';

const TASKS_STORAGE_KEY = 'AURORA_AI_TASKS_V2';

export const INITIAL_AI_TASKS: AITask[] = [
  {
    id: 'task_eco_balance_01',
    title: 'Optimización de Cadena Trófica en Bosque Susurrante',
    description: 'Generar criaturas herbívoras adicionales para estabilizar el ratio depredador-presa en el bioma principal.',
    category: 'BALANCE',
    priority: 'HIGH',
    state: 'completed',
    progressPct: 100,
    steps: [
      {
        id: 'step_1',
        title: 'Auditoría de biomas y conteo de presas',
        description: 'Verificación del ratio trófico actual (1.8 presas por depredador).',
        state: 'completed',
        log: ['Ecosistema analizado: Se detectó sobrepoblación de depredadores sombra.', 'Recomendación: Añadir 2 herbívoros comunes.'],
      },
      {
        id: 'step_2',
        title: 'Generación de criaturas herbívoras con stats balanceados',
        description: 'Creación de Sylvyn (Común, Naturaleza) y Sproutling.',
        state: 'completed',
        log: ['Sylvyn generado con BST 310.', 'Sproutling generado con BST 295.'],
      },
      {
        id: 'step_3',
        title: 'Empaquetado en Staging',
        description: 'Creación de Change Package para revisión humana.',
        state: 'completed',
        log: ['Paquete atómico listo para aprobación.'],
      },
    ],
    createdEntitiesSummary: ['Criatura: Sylvyn', 'Criatura: Sproutling', 'Habilidad: Hoja Afilada'],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task_legendary_arc_02',
    title: 'Arco de Criatura Legendaria: Fénix de Aether',
    description: 'Diseñar el encuentro épico, mazmorra de 3 pisos, NPC lore keeper y cadena de misiones para la cima de Cumbres de Cristal.',
    category: 'CONTENT',
    priority: 'CRITICAL',
    state: 'review',
    progressPct: 85,
    steps: [
      {
        id: 'step_1',
        title: 'Definición de Lore y Reglas de Memoria',
        description: 'Comprobación de nivel mínimo (Lv 30) y afinidad cósmica.',
        state: 'completed',
        log: ['Regla de diseño validada: Nivel 32, BST 620.', 'Elementos: Aether / Fuego.'],
      },
      {
        id: 'step_2',
        title: 'Generación de Mazmorra y Puzzles 2.5D',
        description: 'Templo Solar con 3 capas de elevación.',
        state: 'completed',
        log: ['Layout de elevación Z configurado.', '3 encuentros de guardianes creados.'],
      },
      {
        id: 'step_3',
        title: 'Simulación de Combate Jefe',
        description: 'Verificación de win rate del jugador (42% de dificultad desafiante).',
        state: 'completed',
        log: ['Simulación completada: 20 combates.', 'TTK promedio: 7.2 turnos.'],
      },
      {
        id: 'step_4',
        title: 'Revisión final de Staging',
        description: 'Esperando confirmación del usuario para exportación.',
        state: 'running',
        log: ['Listo para confirmación en Staging.'],
      },
    ],
    createdEntitiesSummary: ['Criatura: Aurelion Fénix', 'Mazmorra: Templo Solar', 'Misión: El Despertar del Fuego Eterno', 'NPC: Archimago Vael'],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function loadAITasks(): AITask[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      saveAITasks(INITIAL_AI_TASKS);
      return INITIAL_AI_TASKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_AI_TASKS;
  } catch (err) {
    console.warn('[AI Task Agent] Failed to load tasks:', err);
    return INITIAL_AI_TASKS;
  }
}

export function saveAITasks(tasks: AITask[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('[AI Task Agent] Failed to save tasks:', err);
  }
}

export function createNewTask(
  title: string,
  description: string,
  category: AITask['category'],
  priority: TaskPriority
): AITask {
  const taskId = 'task_' + Date.now();
  const task: AITask = {
    id: taskId,
    title,
    description,
    category,
    priority,
    state: 'running',
    progressPct: 25,
    steps: [
      {
        id: 'step_1',
        title: 'Auditoría del Contexto y Reglas de Memoria',
        description: 'Búsqueda de dependencias y cálculo de parámetros.',
        state: 'completed',
        log: ['Contexto verificado.', 'Reglas de diseño cargadas.'],
      },
      {
        id: 'step_2',
        title: 'Generación de Entidades y Balance Táctico',
        description: 'Creación de esquemas y comprobación de curvas de stats.',
        state: 'running',
        log: ['Generando entidades en memoria...'],
      },
      {
        id: 'step_3',
        title: 'Verificación de Integridad 2.5D y Staging',
        description: 'Comprobación de anclajes Y y preparación del Change Package.',
        state: 'pending',
        log: [],
      },
    ],
    createdEntitiesSummary: ['En proceso de generación...'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const tasks = loadAITasks();
  tasks.unshift(task);
  saveAITasks(tasks);
  return task;
}
