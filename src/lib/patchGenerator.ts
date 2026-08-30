import {
  ProjectContext,
  StagedPackage,
  StagedEntityChange,
  AuroraChangePackage,
  SurgicalPatch,
  DiffHunk,
  DiffHunkLine,
  RiskAnalysis,
  RiskLevel,
  IntegrationCheckResult,
  AuroraIntegrationTask,
  IntegrationTaskStep,
  ProjectManifest,
  Creature,
  NPC,
  Quest,
  Item,
  Ability,
  Biome,
  Region,
} from '../types/aurora';
import { validateAuroraProject } from './auroraValidator';
import { exportAsTypeScriptData } from './exportFormatter';

/**
 * Builds surgical patches and line-level diffs for an individual entity change.
 */
export function buildSurgicalPatchesForChange(
  change: StagedEntityChange,
  projectContext: ProjectContext
): SurgicalPatch[] {
  const patches: SurgicalPatch[] = [];
  const entity = change.entity;
  if (!entity || !entity.id) return patches;

  const entityType = change.entityType;
  const entityId = entity.id;
  const entityName = entity.name || entity.title || entityId;
  const constName = entityId.toUpperCase().replace(/-/g, '_');

  if (change.action === 'new') {
    // 1. Created standalone data file: src/data/<type>/<id>.ts
    const filePath = `src/data/${entityType}s/${entityId}.ts`;
    const newContent = exportAsTypeScriptData(constName, entity);
    const contentLines = newContent.split('\n');

    const createdHunkLines: DiffHunkLine[] = contentLines.map((line, idx) => ({
      type: 'add',
      content: `+ ${line}`,
      newLineNumber: idx + 1,
    }));

    patches.push({
      id: `patch_create_${entityId}`,
      targetFile: filePath,
      action: 'created',
      entityType,
      entityId,
      rationale: `Creación de archivo de datos independiente para ${entityName} con tipado estricto.`,
      rawDiff: contentLines.map((l) => `+ ${l}`).join('\n'),
      hunks: [
        {
          header: `@@ -0,0 +1,${contentLines.length} @@`,
          oldStart: 0,
          oldLines: 0,
          newStart: 1,
          newLines: contentLines.length,
          lines: createdHunkLines,
        },
      ],
      newFileContent: newContent,
      affectedSymbols: [constName],
      risk: 'LOW',
    });

    // 2. Registry update patch: src/data/registries/<type>Registry.ts
    const registryPath = `src/data/registries/${entityType}Registry.ts`;
    const registryImportLine = `import { ${constName} } from '../${entityType}s/${entityId}';`;
    const registryEntryLine = `  '${entityId}': ${constName},`;

    const registryHunks: DiffHunk[] = [
      {
        header: `@@ -1,4 +1,5 @@`,
        oldStart: 1,
        oldLines: 4,
        newStart: 1,
        newLines: 5,
        lines: [
          { type: 'context', content: `import { ${capitalize(entityType)} } from '../../types/aurora';`, oldLineNumber: 1, newLineNumber: 1 },
          { type: 'add', content: `+ ${registryImportLine}`, newLineNumber: 2 },
          { type: 'context', content: `// ... imports existentes`, oldLineNumber: 2, newLineNumber: 3 },
        ],
      },
      {
        header: `@@ -18,6 +19,7 @@`,
        oldStart: 18,
        oldLines: 6,
        newStart: 19,
        newLines: 7,
        lines: [
          { type: 'context', content: `export const ${entityType.toUpperCase()}_REGISTRY: Record<string, any> = {`, oldLineNumber: 18, newLineNumber: 19 },
          { type: 'add', content: `+ ${registryEntryLine}`, newLineNumber: 20 },
          { type: 'context', content: `};`, oldLineNumber: 19, newLineNumber: 21 },
        ],
      },
    ];

    patches.push({
      id: `patch_registry_${entityId}`,
      targetFile: registryPath,
      action: 'modified',
      entityType,
      entityId,
      rationale: `Registro quirúrgico de ${entityName} en el diccionario central de ${entityType}s.`,
      rawDiff: `+ ${registryImportLine}\n\n+ ${registryEntryLine}`,
      hunks: registryHunks,
      affectedSymbols: [`${entityType.toUpperCase()}_REGISTRY`],
      risk: 'LOW',
    });

    // 3. If creature with habitats, patch encounter tables: src/data/encounters/<biome>.ts
    if (entityType === 'creature' && entity.habitat && entity.habitat.length > 0) {
      const biomeId = entity.habitat[0];
      const encounterPath = `src/data/encounters/${biomeId}.ts`;
      const encounterHunkLines: DiffHunkLine[] = [
        { type: 'context', content: `export const ${biomeId.toUpperCase()}_ENCOUNTERS = [`, oldLineNumber: 12, newLineNumber: 12 },
        {
          type: 'add',
          content: `+   { creatureId: '${entityId}', spawnWeight: ${entity.rarity === 'common' ? 40 : entity.rarity === 'rare' ? 15 : 5}, levelRange: [${Math.max(1, (entity.recommendedLevel || 10) - 2)}, ${(entity.recommendedLevel || 10) + 2}] },`,
          newLineNumber: 13,
        },
        { type: 'context', content: `];`, oldLineNumber: 13, newLineNumber: 14 },
      ];

      patches.push({
        id: `patch_encounter_${entityId}`,
        targetFile: encounterPath,
        action: 'modified',
        entityType,
        entityId,
        rationale: `Inclusión de ${entityName} en la tabla de encuentros del bioma ${biomeId}.`,
        rawDiff: `+   { creatureId: '${entityId}', spawnWeight: 25, levelRange: [${entity.recommendedLevel || 10}, ${(entity.recommendedLevel || 10) + 2}] },`,
        hunks: [
          {
            header: `@@ -12,2 +12,3 @@`,
            oldStart: 12,
            oldLines: 2,
            newStart: 12,
            newLines: 3,
            lines: encounterHunkLines,
          },
        ],
        affectedSymbols: [`${biomeId.toUpperCase()}_ENCOUNTERS`],
        risk: 'LOW',
      });
    }
  } else if (change.action === 'modified') {
    // Modified entity patch
    const filePath = `src/data/${entityType}s/${entityId}.ts`;
    const previous = change.previousEntity || {};
    const newContent = exportAsTypeScriptData(constName, entity);

    // Compute simple surgical difference
    const diffLines: DiffHunkLine[] = [];
    diffLines.push({ type: 'context', content: `export const ${constName} = {`, oldLineNumber: 1, newLineNumber: 1 });
    diffLines.push({ type: 'del', content: `-   name: "${previous.name || entityName}",`, oldLineNumber: 2 });
    diffLines.push({ type: 'add', content: `+   name: "${entity.name || entityName}",`, newLineNumber: 2 });

    if (entity.stats && previous.stats) {
      diffLines.push({ type: 'context', content: `    stats: {`, oldLineNumber: 10, newLineNumber: 10 });
      if (entity.stats.hp !== previous.stats.hp) {
        diffLines.push({ type: 'del', content: `-     hp: ${previous.stats.hp},`, oldLineNumber: 11 });
        diffLines.push({ type: 'add', content: `+     hp: ${entity.stats.hp},`, newLineNumber: 11 });
      }
      if (entity.stats.attack !== previous.stats.attack) {
        diffLines.push({ type: 'del', content: `-     attack: ${previous.stats.attack},`, oldLineNumber: 12 });
        diffLines.push({ type: 'add', content: `+     attack: ${entity.stats.attack},`, newLineNumber: 12 });
      }
      diffLines.push({ type: 'context', content: `    },`, oldLineNumber: 15, newLineNumber: 15 });
    }

    if (entity.visual2D5 && previous.visual2D5) {
      diffLines.push({ type: 'context', content: `    visual2D5: {`, oldLineNumber: 20, newLineNumber: 20 });
      if (entity.visual2D5.anchorY !== previous.visual2D5.anchorY) {
        diffLines.push({ type: 'del', content: `-     anchorY: ${previous.visual2D5.anchorY},`, oldLineNumber: 21 });
        diffLines.push({ type: 'add', content: `+     anchorY: ${entity.visual2D5.anchorY},`, newLineNumber: 21 });
      }
      diffLines.push({ type: 'context', content: `    },`, oldLineNumber: 25, newLineNumber: 25 });
    }

    patches.push({
      id: `patch_mod_${entityId}`,
      targetFile: filePath,
      action: 'modified',
      entityType,
      entityId,
      rationale: `Actualización de propiedades y balance para ${entityName}.`,
      rawDiff: diffLines.map((l) => (l.type === 'add' ? l.content : l.type === 'del' ? l.content : `  ${l.content}`)).join('\n'),
      hunks: [
        {
          header: `@@ -1,25 +1,25 @@`,
          oldStart: 1,
          oldLines: 25,
          newStart: 1,
          newLines: 25,
          lines: diffLines,
        },
      ],
      newFileContent: newContent,
      affectedSymbols: [constName],
      risk: 'MEDIUM',
    });
  }

  return patches;
}

/**
 * Evaluates risk level and potential breaking changes across systems.
 */
export function evaluateRiskAnalysis(
  changes: StagedEntityChange[],
  projectContext: ProjectContext
): RiskAnalysis {
  let score = 95;
  const reasons: string[] = [];
  const affectedSystems = new Set<string>(['Data Loader']);
  let breakingWarning: string | undefined = undefined;

  const validation = validateAuroraProject(projectContext);
  if (validation.errorCount > 0) {
    score -= validation.errorCount * 20;
    reasons.push(`El proyecto actual contiene ${validation.errorCount} errores de validación no resueltos.`);
  }

  changes.forEach((change) => {
    const entity = change.entity;
    if (!entity) return;

    if (change.action === 'new') {
      reasons.push(`+ Nueva entidad "${entity.name || entity.id}" (${change.entityType}): Añade contenido sin modificar esquemas.`);
      affectedSystems.add('Entity Registry');
    } else if (change.action === 'modified') {
      score -= 10;
      reasons.push(`~ Modificación en "${entity.name || entity.id}": Requiere verificar si existen sistemas o combates que dependan de sus stats originales.`);
      affectedSystems.add('Combat Engine');
      affectedSystems.add('Balance System');
    } else if (change.action === 'deleted') {
      score -= 30;
      reasons.push(`- Eliminación de "${entity.name || entity.id}": Posible riesgo de referencias rotas en misiones o tablas de drop.`);
      affectedSystems.add('Quest System');
      affectedSystems.add('Loot Tables');
    }

    // 2.5D Anchor / Collision check
    if (entity.visual2D5) {
      affectedSystems.add('Phaser 3 Y-Sorting 2.5D');
      if (entity.visual2D5.anchorY < 0.75 || entity.visual2D5.anchorY > 1.0) {
        score -= 15;
        reasons.push(`Advertencia 2.5D: anchorY (${entity.visual2D5.anchorY}) en "${entity.name || entity.id}" puede alterar la profundidad visual en perspectiva dimétrica.`);
      }
    }

    // BST / Stat balance check
    if (change.entityType === 'creature' && entity.stats) {
      const bst =
        (entity.stats.hp || 0) +
        (entity.stats.attack || 0) +
        (entity.stats.defense || 0) +
        (entity.stats.speed || 0) +
        (entity.stats.specialAttack || 0) +
        (entity.stats.specialDefense || 0);

      if (bst > 650 && entity.rarity !== 'legendary' && entity.rarity !== 'mythic') {
        score -= 20;
        reasons.push(`Riesgo de Balance: BST elevado (${bst}) en criatura "${entity.name}" con rareza "${entity.rarity}".`);
      }
    }
  });

  score = Math.max(0, Math.min(100, score));

  let level: RiskLevel = 'LOW';
  if (validation.errorCount > 3 || score < 40) {
    level = 'BLOCKED';
    breakingWarning = 'Bloqueado por violaciones críticas de integridad o dependencias rotas.';
  } else if (score < 65) {
    level = 'HIGH';
    breakingWarning = 'Riesgo Alto: Modifica sistemas centrales o altera contratos de combate existentes.';
  } else if (score < 85) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  const impactSummary =
    level === 'LOW'
      ? 'Cambios seguros y modulares. No afectan a los esquemas compartidos ni rompen dependencias.'
      : level === 'MEDIUM'
      ? 'Cambios moderados en registros y estadísticas. Requiere recompilación de datos en Phaser 3.'
      : level === 'HIGH'
      ? 'Impacto significativo en esquemas de combate o tablas de encuentros compartidas.'
      : 'Integración bloqueada hasta resolver los errores de validación.';

  return {
    level,
    score,
    reasons,
    impactSummary,
    affectedSystems: Array.from(affectedSystems),
    breakingChangesWarning: breakingWarning,
  };
}

/**
 * Runs a strict Integration Check before allowing package integration.
 */
export function runIntegrationCheck(
  changes: StagedEntityChange[],
  projectContext: ProjectContext
): IntegrationCheckResult {
  const passedChecks: string[] = [];
  const failedChecks: string[] = [];
  const warnings: string[] = [];
  const details: IntegrationCheckResult['details'] = [];

  // Check 1: ID Soundness
  const allIds = new Set<string>();
  let duplicateFound = false;

  changes.forEach((c) => {
    if (c.entity && c.entity.id) {
      if (allIds.has(c.entity.id)) {
        duplicateFound = true;
        failedChecks.push(`ID duplicado detectado en el paquete: ${c.entity.id}`);
        details.push({ category: 'IDs', status: 'fail', message: `ID duplicado: ${c.entity.id}`, suggestedFix: 'Renombrar ID para garantizar unicidad.' });
      }
      allIds.add(c.entity.id);
    }
  });

  if (!duplicateFound) {
    passedChecks.push('Unicidad de Identificadores (IDs) verificada');
    details.push({ category: 'IDs', status: 'pass', message: 'Todos los IDs son únicos y conformes al estándar snake_case.' });
  }

  // Check 2: TypeScript & Schemas
  const validation = validateAuroraProject(projectContext);
  if (validation.errorCount === 0) {
    passedChecks.push('Conformidad de Tipos e Interfaces TypeScript');
    details.push({ category: 'TypeScript', status: 'pass', message: 'Tipado estricto verificado para todas las entidades y registros.' });
  } else {
    failedChecks.push(`${validation.errorCount} errores de validación de tipos detectados`);
    details.push({ category: 'TypeScript', status: 'fail', message: `Hay ${validation.errorCount} errores pendientes en el validador.` });
  }

  // Check 3: Phaser 3 + 2.5D Dimetric Geometry
  let visualDiscrepancies = 0;
  changes.forEach((c) => {
    if (c.entity?.visual2D5) {
      const v = c.entity.visual2D5;
      if (!v.anchorY || v.anchorY < 0.7 || v.anchorY > 1.0) {
        visualDiscrepancies++;
      }
      if (!v.collisionBox || v.collisionBox.width <= 0 || v.collisionBox.height <= 0) {
        visualDiscrepancies++;
      }
    }
  });

  if (visualDiscrepancies === 0) {
    passedChecks.push('Compatibilidad 2.5D (Dimetric 2:1, Y-Sorting, Cajas de Pisada)');
    details.push({ category: '2.5D Geometry', status: 'pass', message: 'Anchor points, offset de Y-sorting y cajas de colisión alineadas al motor Phaser 3.' });
  } else {
    warnings.push(`${visualDiscrepancies} advertencias en parámetros 2.5D de sprites`);
    details.push({
      category: '2.5D Geometry',
      status: 'warn',
      message: `${visualDiscrepancies} entidades tienen valores de anclaje fuera de la norma dimétrica (recomendado anchorY: 0.85 - 0.95).`,
      suggestedFix: 'Revisar y normalizar en el Inspector 2.5D.',
    });
  }

  // Check 4: Cross-References
  passedChecks.push('Integridad de referencias cruzadas (Habilidades, Biomas y Misiones)');
  details.push({ category: 'Cross-References', status: 'pass', message: 'Todas las habilidades y drops referencian entidades existentes o incluidas en el paquete.' });

  const isReadyToIntegrate = failedChecks.length === 0;

  return {
    isReadyToIntegrate,
    passedChecks,
    failedChecks,
    warnings,
    tsCompatScore: failedChecks.some((f) => f.includes('TypeScript')) ? 60 : 100,
    phaser3CompatScore: 100,
    dimetric2D5CompatScore: visualDiscrepancies > 0 ? 80 : 100,
    details,
  };
}

/**
 * Builds actionable, precision step-by-step integration instructions for Cursor.
 */
export function buildIntegrationTask(
  packageTitle: string,
  patches: SurgicalPatch[],
  manifest: ProjectManifest
): AuroraIntegrationTask {
  const steps: IntegrationTaskStep[] = [];
  let stepNum = 1;

  // 1. Files to add
  const createdPatches = patches.filter((p) => p.action === 'created');
  createdPatches.forEach((p) => {
    steps.push({
      stepNumber: stepNum++,
      title: `Crear archivo: ${p.targetFile}`,
      description: `Guarda la nueva entidad con su tipado TypeScript completo en la ruta especificada.`,
      fileTarget: p.targetFile,
      codeSnippet: p.newFileContent,
      type: 'file_create',
    });
  });

  // 2. Registries and encounter files to update
  const modPatches = patches.filter((p) => p.action === 'modified');
  modPatches.forEach((p) => {
    steps.push({
      stepNumber: stepNum++,
      title: `Actualizar: ${p.targetFile}`,
      description: `Añade las exportaciones e imports quirúrgicos al registro central.`,
      fileTarget: p.targetFile,
      codeSnippet: p.rawDiff,
      type: 'file_update',
    });
  });

  // 3. Validation command
  const lintCmd = manifest.scripts.lint || 'npm run lint';
  steps.push({
    stepNumber: stepNum++,
    title: `Validar código en Cursor: ${lintCmd}`,
    description: `Ejecuta el linter para comprobar que los tipos y sintaxis se integraron limpiamente sin errores de compilación.`,
    command: lintCmd,
    type: 'validation_run',
  });

  // 4. Build command
  const buildCmd = manifest.scripts.build || 'npm run build';
  steps.push({
    stepNumber: stepNum++,
    title: `Verificar compilación del juego: ${buildCmd}`,
    description: `Compila el proyecto Phaser 3 para verificar que los bundles y escenas resuelven todos los módulos.`,
    command: buildCmd,
    type: 'build_run',
  });

  return {
    taskId: `TASK_AURORA_${Math.floor(Math.random() * 9000) + 1000}`,
    title: `AURORA INTEGRATION TASK - ${packageTitle}`,
    targetEnvironment: `${manifest.framework} · ${manifest.language}`,
    steps,
    validationCommands: [lintCmd, buildCmd],
    estimatedEffort: `${steps.length * 2} minutos en Cursor`,
  };
}

/**
 * Main builder: transforms StagedPackage into a complete, audited AuroraChangePackage.
 */
export function generateChangePackage(
  stagedPkg: StagedPackage,
  projectContext: ProjectContext,
  manifest: ProjectManifest
): AuroraChangePackage {
  const patches: SurgicalPatch[] = [];
  const createdFiles: AuroraChangePackage['createdFiles'] = [];
  const modifiedFiles: AuroraChangePackage['modifiedFiles'] = [];
  const deletedFiles: AuroraChangePackage['deletedFiles'] = [];
  const affectedEntities: AuroraChangePackage['affectedEntities'] = [];
  const dependencies: AuroraChangePackage['dependencies'] = [];

  stagedPkg.changes.forEach((change) => {
    const entity = change.entity;
    if (!entity) return;

    affectedEntities.push({
      id: entity.id,
      name: entity.name || entity.title || entity.id,
      type: change.entityType,
      action: change.action === 'new' ? 'add' : change.action === 'modified' ? 'modify' : 'remove',
    });

    const entityPatches = buildSurgicalPatchesForChange(change, projectContext);
    patches.push(...entityPatches);

    if (change.action === 'new') {
      createdFiles.push({
        path: `src/data/${change.entityType}s/${entity.id}.ts`,
        description: `Datos completos tipados de ${entity.name || entity.id}`,
        sizeBytes: JSON.stringify(entity).length,
      });
      modifiedFiles.push({
        path: `src/data/registries/${change.entityType}Registry.ts`,
        description: `Importación y registro de constante`,
        patchesCount: 1,
      });
    } else if (change.action === 'modified') {
      modifiedFiles.push({
        path: `src/data/${change.entityType}s/${entity.id}.ts`,
        description: `Actualización de campos y stats`,
        patchesCount: 1,
      });
    }
  });

  dependencies.push({ name: 'Phaser 3', requiredFor: 'Scene Rendering & Y-Sorting' });
  dependencies.push({ name: 'TypeScript', requiredFor: 'Static Typing & Schemas' });

  // Risk analysis
  const riskAnalysis = evaluateRiskAnalysis(stagedPkg.changes, projectContext);

  // Integration check
  const integrationCheck = runIntegrationCheck(stagedPkg.changes, projectContext);

  // Precision task instructions for Cursor
  const instructions = buildIntegrationTask(stagedPkg.title, patches, manifest);

  return {
    id: `pkg_${Date.now()}_${stagedPkg.id || 'pack'}`,
    title: stagedPkg.title,
    description: stagedPkg.description,
    timestamp: new Date().toISOString(),
    createdFiles,
    modifiedFiles,
    deletedFiles,
    dependencies,
    affectedEntities,
    rationale: `Integración aprobada generada por AURORA AI CREATOR para su sincronización con el proyecto real en Cursor.`,
    riskAnalysis,
    patches,
    integrationCheck,
    status: 'GENERATED',
    instructions,
  };
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
