# AURORA PERFORMANCE ENGINE 2.3

## Overview
AURORA Performance Engine 2.3 provides real-time profiling, automated bottleneck detection, verified surgical patches, and visual/gameplay regression guards for the AURORA 2.5D RPG project.

## Architecture

```
[LIVE PROFILER] ──────────► [VERIFIED OPTIMIZER] ──────────► [STAGING & ROLLBACK]
      │                             │                                 │
  Telemetry &                   Bottleneck                        Delta Diff &
  Real Metrics                   Detection                        Visual Lock Guard
      │                             │                                 │
  - FPS & Frame Time            - Y-Sorting Workload              - Before / After
  - CPU & JS Heap               - Allocation / GC                 - 4-Pillar Score
  - 2.5D Y-Sort Lab             - Spatial Partitioning            - Zero-Cost Export
```

## Triage & Bottleneck Classification

1. **Y-Sorting & 2.5D Depth**:
   - Solved via Spatial Partitioning (64x64 grid), translation dirty flags, and 1-pass camera frustum culling.
2. **CPU & Allocations**:
   - Solved via Static Object Pools (128 particles), avoiding garbage collector pauses during high-density encounters.
3. **Repeated Calculations**:
   - Precomputed Look-Up Tables (LUTs) for elemental type multipliers and BST stat growth curves.
4. **Memory Retention**:
   - Sliding window snapshot history pruning (max 15 snapshots).
5. **Draw Calls**:
   - Dimetric tilemap texture atlas grouping.

## Safety & Regression
- **Visual Lock**: Active by default. Rejects any patch that alters resolution, culls visible atmospheric effects, or simplifies asset meshes.
- **Gameplay Lock**: Protects creature stats, combat damage formulas, and AI behavior trees.
- **Safety Snapshots**: Automatic in-memory rollback snapshots before every optimization step.
