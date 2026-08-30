# AURORA AI CREATOR 2.1 — FREE-FIRST AI ARCHITECTURE

## Resumen Ejecutivo

**AURORA AI CREATOR 2.1** introduce una arquitectura pionera **Free-First (€0 Cost Protection)**, diseñada para operar a coste cero de forma nativa e ilimitada. El sistema canaliza el 90%+ de las tareas a través del **Motor Local Determinista** y la **Cache Inteligente de Respuesta**, recurriendo a Gemini únicamente para síntesis creativa de alto nivel dentro del Free Tier y bloqueando proactivamente cualquier endpoint de pago.

---

## 1. Diagrama de Enrutamiento Inteligente

```text
               +-----------------------------+
               |     AURORA CORE ENGINE      |
               | (Captura + Context Minimizer)|
               +--------------+--------------+
                              |
                              v
               +-----------------------------+
               |       SMART AI ROUTER       |
               +--------------+--------------+
                              |
       +----------------------+----------------------+
       |                      |                      |
       v                      v                      v
+--------------+      +--------------+      +------------------+
| LOCAL ENGINE |      | CACHE/MEMORY |      |   GEMINI FREE    |
| (Nivel 0)    |      | (Nivel 1)    |      | (Nivel 2 - Flash)|
|  0 € / 0ms   |      |  0 € / Hash  |      |   0 € Free Tier  |
+--------------+      +--------------+      +------------------+
```

---

## 2. Capacidades del Motor Local Determinista (AI Calls = 0)

Las siguientes operaciones se resuelven en milisegundos sin consumir tokens ni realizar peticiones de red:

1. **Validación de Integridad:** JSON Schema, tipos TypeScript, campos obligatorios.
2. **Detección de Anomalías:** IDs duplicados, referencias rotas entre biomas y criaturas.
3. **Auditoría de Balance BST:** Curvas de nivel, Base Stat Totals (BST), simetría ofensiva/defensiva.
4. **Simulación de Combate Monte Carlo:** 100 a 1000 iteraciones estocásticas con tiradas de daño.
5. **Ecosistema y Red Trófica:** Cálculo de biomasa, productores primarios, presas y depredadores ápice.
6. **Diffs Quirúrgicos y Staging:** Generación de parches sin sobrescribir código procedural.
7. **Verificación 2.5D:** Control de anclajes Y-Sort `[0.85, 0.95]`, bounding boxes y sombras dimétricas.
8. **Análisis de Bundle y 60 FPS:** Detección de memory leaks, draw calls Phaser 3 y listeners no liberados.
9. **Informes Técnicos:** Generación de resúmenes de salud y auditorías para Cursor.

---

## 3. Cost Guard & Bloqueo de Facturación

- **Estado por Defecto:** `FREE MODE: ON`.
- **Cost Guard Activo:** Si una acción intentara comunicarse con una API de pago (como Gemini 2.5 Pro con facturación activada), el Cost Guard aborta la solicitud y devuelve:
  > *"Paid AI usage is disabled by Free Mode."*
- **Aviso de Cuotas:** En lugar de inventar métricas, se reporta el conteo real de operaciones locales, hits de cache y llamadas gratuitas.

---

## 4. Cache Inteligente & Invalidation Engine

- **Clave Compuesta:** `TaskType + PromptHash + ContextHash + MemoryVersion`.
- **Invalidación Automática:** Cuando se modifican entidades en el proyecto, se alteran las Design Rules o se limpian datos de memoria, el hash del contexto cambia automáticamente, evitando alucinaciones con datos obsoletos.
- **Límite de Almacenamiento:** Configurable a 500 MB con política de desalojo **LRU** (Least Recently Used).
- **Deduplicación de Peticiones:** Solicitudes simultáneas idénticas comparten una única promesa en curso.

---

## 5. Minimización de Contexto & Filtro de Privacidad

Antes de transmitir datos al Free Tier de Gemini:
1. **Filtro de Relevancia:** Aísla solo las 5-8 criaturas y 1-2 biomas vinculados a la petición.
2. **Sanitización:** Se eliminan tokens, claves de entorno, binarios de sprites y árboles ajenos.
3. **Reducción de Huella:** Reduce el contexto de ~250 KB a menos de 4 KB (ahorro del 98.5% de tokens).

---

## 6. Diagnóstico de Hardware y Modo Offline

- **Diagnóstico:** Si la memoria del dispositivo es `< 16 GB` o no dispone de GPU dedicada, Aurora muestra:
  > *"LOCAL AI MODEL: NOT RECOMMENDED"*
  El motor determinista local continúa operando al 100% de rendimiento sin sobrecargar la CPU.
- **Modo Offline:** Desconecta los servicios cloud de Gemini permitiendo trabajar completamente en local con cache y motor determinista.

---

*Desarrollado para AURORA AI CREATOR 2.1 — Compatible con Phaser 3, TypeScript y Electron.*
