# AURORA LIVE PROFILER 2.3 & VERIFIED OPTIMIZATION

AURORA 2.3 marks the evolution from heuristic optimization to an empirical, telemetry-driven pipeline:
```
PROFILE REAL → OPTIMIZE → MEASURE → VERIFY
```

---

## 1. Core Principles

1. **Empirical Ground Truth**: Never claim a performance improvement without a comparable, measured delta.
2. **Reliability Badging**:
   - `VERIFIED`: Measured directly via browser APIs (`requestAnimationFrame`, `performance.now()`, `performance.memory`).
   - `ESTIMATED`: Derived mathematically from render passes and layer pipelines when direct GPU queries are restricted by browser sandbox.
   - `UNAVAILABLE`: Explicitly stated when the underlying platform cannot measure the parameter without synthetic assumptions.
3. **Visual Lock Enforcement (`VISUAL LOCK = ON`)**:
   - Zero resolution downscaling.
   - Zero culling of visible environmental particles or atmospheric effects.
   - Zero simplification of dimetric tilemaps or sprite fidelity.
   - Preservation of 2.5D visual depth hierarchy and anchor points `[0.75 - 1.0]`.
4. **Zero-Cost Operation (0€ API Cost)**:
   - All profiling, sorting benchmarks, baseline comparisons, and stress tests execute locally on the browser/Electron runtime without consuming Gemini API tokens.

---

## 2. Real Telemetry Engine (`src/lib/liveProfilerEngine.ts`)

### Hardware Detection & Runtime Context
- **GPU Renderer**: Auto-probed via WebGL debug unmasked renderer (`WEBGL_debug_renderer_info`).
- **Logical CPU Cores**: Captured via `navigator.hardwareConcurrency`.
- **Device Pixel Ratio (DPR)**: High-DPI calibration.
- **Connection Mode**: Live sampling vs. scenario synthetic runner.

### Real Metrics Captured
- **FPS**: Sampled over a 600–1000ms window with delta aggregation.
- **Frame Time (ms)**: Measured delta between animation frames (budget: 16.6ms for 60 FPS).
- **CPU Time (ms)**: Synchronous execution time of JavaScript game loops.
- **JS Heap Memory (MB)**: Measured via `performance.memory` with safe fallback.
- **Draw Calls**: Estimated dimetric layer passes.
- **Active GameObjects, Tweens, Particles**: Active entities in current project context.

---

## 3. 2.5D Y-Sorting Deep Dive

In AURORA's 2.5D dimetric perspective, entity rendering order depends on the world Y position. The Live Profiler diagnoses:
- **Workload Time (ms)**: Execution duration of sorting calls.
- **O(N log N) Comparisons**: Operation count.
- **Unnecessary Sorts on Static Entities**: Detects scenery objects being re-sorted every frame without translation dirty flags.
- **Offscreen Entities**: Entities processed outside the camera view frustum.

### Verified Optimization Techniques
- **Dirty Flags**: Only sort entities with active velocity or position changes.
- **Spatial Partitioning Grid 64x64**: Bucket sorting by tile chunks.
- **Camera Frustum Culling**: 1-pass AABB check with 64px safety boundary.

---

## 4. 12 Reproducible Performance Scenarios

1. `startup`: Cold start initialization, asset caching, and initial heap allocation.
2. `oakhaven`: Dense NPC town, tilemap layer blending, multi-track audio.
3. `sunken_sanctuary`: Water caustics shaders, transparency passes, 2.5D depth layers.
4. `whispering_forest`: 300+ atmospheric fog particles, dense foliage tilemap, 35+ animated creatures.
5. `combat_encounter`: Turn-based visual VFX, dynamic camera zoom, health bar UI overlays.
6. `boss_battle`: Multi-segment boss entity, particle bursts, screen shake.
7. `weather_rain`: 450 rain drop particles, lightning flash lighting adjustments.
8. `inventory_open`: UI modal draw calls, texture atlas switching, item tooltip rendering.
9. `dialogue_active`: Character portraits, typewriter text rendering, background blur pass.
10. `map_streaming`: Dynamic chunk loading/unloading during player movement.
11. `creature_capture`: Capture circle math, particle vortex, creature scale interpolation.
12. `soundscape_busy`: 12 simultaneous positional audio streams with distance attenuation.

---

## 5. Stress Test Studio (Zero Project Pollution)

Tests runtime resilience under high entity loads:
- **Tiers**: 100, 250, 500, 1000 Simulated Entities.
- **Stress Types**: `entity_flood` (movement & AI), `particle_heavy` (400+ particles), `physics_broadphase`, `draw_call_storm`.
- **Ephemeral**: Discarded immediately after benchmark completion without writing to project database.

---

## 6. Four-Pillar Performance Score

$$\text{Overall Score} = 0.40 \cdot \text{Performance} + 0.20 \cdot \text{Visual Quality} + 0.20 \cdot \text{Gameplay Integrity} + 0.20 \cdot \text{Technical Integrity}$$

- **Performance Score (0-100)**: Evaluates frame time vs. 16.6ms target.
- **Visual Quality (100%)**: Enforced by Visual Lock.
- **Gameplay Integrity (100%)**: Enforced by schema & battle simulation tests.
- **Technical Integrity (0-100)**: TypeScript type health and schema compliance.
