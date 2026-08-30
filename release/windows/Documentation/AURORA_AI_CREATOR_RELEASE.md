# NOTAS DE LA VERSIÓN — AURORA AI CREATOR v1.0.0 (WINDOWS RELEASE)

**Versión:** 1.0.0-final (Hardened Production Release)  
**Fecha de Publicación:** 2026-08-30  
**Plataforma Objetivo:** Windows 10 / Windows 11 (x64)  
**Motor de Juego Compatible:** Phaser 3 + TypeScript 2.5D Dimetric RPG (AURORA)  

---

## 🚀 CARACTERÍSTICAS PRINCIPALES

### 1. Cost Guard 0.00 € (Free-First Architecture)
- Bloqueo proactivo de cualquier endpoint o modelo de pago no autorizado.
- 24+ operaciones deterministas locales ejecutadas en 0ms sin consumo de tokens (validación de esquemas, detección de IDs duplicados, balance BST, simulación de combate Monte Carlo, red trófica y Y-sorting).
- Integración opcional con Gemini 2.5 Flash Free Tier con cache LRU y deduplicación context-grounded.

### 2. Live Profiler 2.3 & 2.5D Dimetric Telemetry
- Medición en tiempo real de FPS, Frame Time (ms), CPU Load y JS Heap Memory.
- Diagnóstico específico de sobrecarga de ordenación en profundidad (Y-Sorting) O(N log N) con culling de frustum y dirty flags.
- 12 escenarios de prueba reproducibles (Startup, Oakhaven, Bosque Susurrante, Batalla de Jefes, Lluvia, Vórtice de Captura, etc.).
- Harness de prueba de estrés efímero (100, 250, 500 y 1000 entidades simultáneas).

### 3. Verified Optimizer con Visual & Gameplay Locks
- **Visual Lock = ON:** Protección estricta del 100% de resolución, partículas atmosféricas, capas de tilemaps dimétricos y puntos de anclaje Y-Sort [0.75 - 1.00].
- **Gameplay Lock = ON:** Protección matemática de fórmulas de daño, multiplicadores elementales 18x18 y tablas de botín.
- Canalización estricta: `Profile Real -> Propose -> Patch -> Benchmark -> Regression -> Staging`.

### 4. Flujo Staging -> Diff -> Exportación a Cursor IDE
- Sala de staging con vista previa de diffs unificados (+ ~ -).
- Detección de colisiones de manifiesto y resolución de conflictos.
- Exportación directa a TypeScript (`Phaser.Scene`, clases tipadas) y paquetes JSON validados.

---

## 🔒 SEGURIDAD Y PRIVACIDAD EN WINDOWS

- Entorno de ejecución en caja de arena con aislamiento de contexto.
- Sin recolección de telemetría personal ni envío de secretos del workspace.
- Rutas de almacenamiento sanitizadas en estándares de Windows `%APPDATA%`.

---

## 📦 CONTENIDO DEL PAQUETE

| Archivo | Tipo | Descripción |
| :--- | :--- | :--- |
| `AURORA-AI-CREATOR-Setup.exe` | Instalador NSIS (x64) | Instalador estándar con acceso directo en Escritorio y Menú Inicio. |
| `AURORA-AI-CREATOR-Portable.exe` | Binario Portable (x64) | Ejecutable autónomo sin instalación para uso directo. |
| `README-FIRST.txt` | Documento de Texto | Instrucciones inmediatas de ejecución y requerimientos. |
| `Documentation/WINDOWS_QUICK_START.md` | Guía de Inicio | Tutorial paso a paso para creadores y desarrolladores. |
| `Documentation/AURORA_AI_CREATOR_RELEASE.md` | Notas de Release | Documento técnico de especificaciones v1.0.0. |
