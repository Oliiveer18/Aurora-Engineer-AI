import React, { useRef, useEffect, useState } from 'react';
import { Visual2D5Specs, ElementType } from '../types/aurora';
import { Play, Pause, Layers, Eye, RefreshCw, Sun, Moon, Shield, Sparkles } from 'lucide-react';

interface Isometric2D5CanvasProps {
  visual: Visual2D5Specs;
  entityName: string;
  elementType?: ElementType;
  rarity?: string;
  category?: string;
  ambientColor?: string;
  onChangeVisual?: (updated: Visual2D5Specs) => void;
  interactive?: boolean;
}

export const Isometric2D5Canvas: React.FC<Isometric2D5CanvasProps> = ({
  visual,
  entityName,
  elementType = 'nature',
  rarity = 'uncommon',
  ambientColor = '#76e5a1',
  onChangeVisual,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showCollision, setShowCollision] = useState<boolean>(true);
  const [showDepthLine, setShowDepthLine] = useState<boolean>(true);
  const [showObstacles, setShowObstacles] = useState<boolean>(true);
  const [timeMode, setTimeMode] = useState<'day' | 'night' | 'sunset'>('day');
  const [entityPos, setEntityPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [facingDir, setFacingDir] = useState<number>(0); // 0: SW, 1: SE, 2: NE, 3: NW

  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Element theme colors
  const elementColors: Record<ElementType, string> = {
    nature: '#22c55e',
    fire: '#f97316',
    water: '#38bdf8',
    electric: '#facc15',
    ice: '#a5f3fc',
    shadow: '#818cf8',
    light: '#fde047',
    earth: '#a16207',
    wind: '#2dd4bf',
    neutral: '#94a3b8',
    aether: '#ec4899',
  };

  const primaryColor = visual.tintColor || elementColors[elementType] || '#22c55e';

  // Coordinate conversion: World/Grid to 2.5D Dimetric Screen coordinates
  // Dimetric projection with 2:1 ratio (screenX = (worldX - worldY) * cos(30), screenY = (worldX + worldY) * sin(30))
  const worldToScreen = (wx: number, wy: number, wz: number = 0, centerX: number, centerY: number) => {
    const tileW = 48;
    const tileH = 24;
    const sx = centerX + (wx - wy) * (tileW / 2);
    const sy = centerY + (wx + wy) * (tileH / 2) - wz * 16;
    return { x: sx, y: sy };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;
      if (isPlaying) {
        timeRef.current += 0.04;
      }
      const t = timeRef.current;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2 - 20;

      // Background ambient lighting
      let bgColor = '#0f172a'; // slate-900
      let gridStroke = 'rgba(148, 163, 184, 0.15)';
      if (timeMode === 'night') {
        bgColor = '#020617';
        gridStroke = 'rgba(99, 102, 241, 0.18)';
      } else if (timeMode === 'sunset') {
        bgColor = '#1e1b4b';
        gridStroke = 'rgba(249, 115, 22, 0.2)';
      }

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Dimetric Isometric Grid (5x5 tiles)
      if (showGrid) {
        ctx.strokeStyle = gridStroke;
        ctx.lineWidth = 1;
        const gridRange = 3;

        for (let gx = -gridRange; gx <= gridRange; gx++) {
          for (let gy = -gridRange; gy <= gridRange; gy++) {
            const p1 = worldToScreen(gx, gy, 0, centerX, centerY);
            const p2 = worldToScreen(gx + 1, gy, 0, centerX, centerY);
            const p3 = worldToScreen(gx + 1, gy + 1, 0, centerX, centerY);
            const p4 = worldToScreen(gx, gy + 1, 0, centerX, centerY);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.closePath();

            const isCenter = gx === 0 && gy === 0;
            if (isCenter) {
              ctx.fillStyle = 'rgba(34, 197, 94, 0.08)';
              ctx.fill();
            }
            ctx.stroke();
          }
        }
      }

      // Predefined obstacles on the map to test Y-Sorting / Depth Sorting
      const obstacles = showObstacles
        ? [
            { gx: -1.5, gy: -1.5, type: 'tree', label: 'Árbol 2.5D' },
            { gx: 1.5, gy: 1.5, type: 'rock', label: 'Roca Dimétrica' },
          ]
        : [];

      // Sort items by Y-depth
      const renderQueue: Array<{
        type: 'entity' | 'obstacle';
        depthY: number;
        draw: () => void;
      }> = [];

      // Add Obstacles to queue
      obstacles.forEach((obs) => {
        const p = worldToScreen(obs.gx, obs.gy, 0, centerX, centerY);
        const depthY = p.y; // Standard Y-depth in 2.5D
        renderQueue.push({
          type: 'obstacle',
          depthY,
          draw: () => {
            // Shadow
            ctx.beginPath();
            ctx.ellipse(p.x, p.y + 4, 18, 9, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.fill();

            if (obs.type === 'tree') {
              // Dimetric Stylized Tree
              ctx.fillStyle = '#78350f';
              ctx.fillRect(p.x - 4, p.y - 30, 8, 30);

              ctx.beginPath();
              ctx.arc(p.x, p.y - 45, 22, 0, Math.PI * 2);
              ctx.fillStyle = '#15803d';
              ctx.fill();
              ctx.strokeStyle = '#22c55e';
              ctx.stroke();

              ctx.fillStyle = '#86efac';
              ctx.font = '10px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(obs.label, p.x, p.y - 72);
            } else {
              // Dimetric Rock
              ctx.beginPath();
              ctx.ellipse(p.x, p.y - 12, 18, 14, -0.2, 0, Math.PI * 2);
              ctx.fillStyle = '#64748b';
              ctx.fill();
              ctx.strokeStyle = '#94a3b8';
              ctx.stroke();

              ctx.fillStyle = '#cbd5e1';
              ctx.font = '10px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(obs.label, p.x, p.y - 32);
            }
          },
        });
      });

      // Add Entity to render queue
      const entityScreen = worldToScreen(entityPos.x, entityPos.y, visual.elevationZ || 0, centerX, centerY);
      const entityDepthY = entityScreen.y + (visual.ySortOffset || 8);

      renderQueue.push({
        type: 'entity',
        depthY: entityDepthY,
        draw: () => {
          const ex = entityScreen.x;
          const ey = entityScreen.y;

          // A. Sombra elíptica dimétrica
          if (visual.shadow?.enabled) {
            const sRadX = visual.shadow.radiusX || 18;
            const sRadY = visual.shadow.radiusY || 9;
            const sAlpha = visual.shadow.opacity || 0.5;
            const sOffY = visual.shadow.offsetY || 2;

            ctx.beginPath();
            ctx.ellipse(ex, ey + sOffY, sRadX, sRadY, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${sAlpha})`;
            ctx.fill();
          }

          // B. Idle vertical bobbing
          const bobOffset = isPlaying ? Math.sin(t * 3) * 3 : 0;
          const drawY = ey + bobOffset;

          const sprW = visual.spriteWidth || 64;
          const sprH = visual.spriteHeight || 64;
          const anchX = visual.anchorX !== undefined ? visual.anchorX : 0.5;
          const anchY = visual.anchorY !== undefined ? visual.anchorY : 0.9;

          const sprLeft = ex - sprW * anchX;
          const sprTop = drawY - sprH * anchY;

          // C. Aura / Glow
          const gradient = ctx.createRadialGradient(ex, drawY - sprH * 0.5, 5, ex, drawY - sprH * 0.5, sprW * 0.7);
          gradient.addColorStop(0, `${primaryColor}55`);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(ex, drawY - sprH * 0.5, sprW * 0.7, 0, Math.PI * 2);
          ctx.fill();

          // D. Draw 2.5D Isometric Stylized Character / Creature Sprite
          ctx.save();
          ctx.translate(ex, drawY - sprH * 0.45);

          // Body shape
          ctx.fillStyle = primaryColor;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;

          // Stylized dimetric diamond/orb creature avatar
          ctx.beginPath();
          ctx.roundRect(-sprW * 0.3, -sprH * 0.35, sprW * 0.6, sprH * 0.65, [14, 14, 10, 10]);
          ctx.fill();
          ctx.stroke();

          // Eyes & features based on facing direction
          ctx.fillStyle = '#0f172a';
          const eyeOffX = facingDir === 0 ? -6 : facingDir === 1 ? 6 : 0;
          if (facingDir <= 1) {
            // Front facing
            ctx.beginPath();
            ctx.arc(-8 + eyeOffX, -4, 4, 0, Math.PI * 2);
            ctx.arc(8 + eyeOffX, -4, 4, 0, Math.PI * 2);
            ctx.fill();

            // Eye sparkle
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-9 + eyeOffX, -5, 1.5, 0, Math.PI * 2);
            ctx.arc(7 + eyeOffX, -5, 1.5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Back facing
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(0, -6, 6, 0, Math.PI);
            ctx.fill();
          }

          // Elemental Crest / Horns / Leaves
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(-10, -sprH * 0.35);
          ctx.lineTo(-14, -sprH * 0.48);
          ctx.lineTo(-4, -sprH * 0.38);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(10, -sprH * 0.35);
          ctx.lineTo(14, -sprH * 0.48);
          ctx.lineTo(4, -sprH * 0.38);
          ctx.fill();

          ctx.restore();

          // E. Draw 2.5D Collision Box Indicator
          if (showCollision && visual.collisionBox) {
            const cb = visual.collisionBox;
            const cbX = sprLeft + cb.offsetX;
            const cbY = sprTop + cb.offsetY;

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 3]);
            ctx.strokeRect(cbX, cbY, cb.width, cb.height);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
            ctx.fillRect(cbX, cbY, cb.width, cb.height);
            ctx.setLineDash([]);

            // Collision label
            ctx.fillStyle = '#38bdf8';
            ctx.font = '9px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`BOX: ${cb.width}x${cb.height}`, cbX, cbY - 3);
          }

          // F. Draw Anchor Point & Y-Sorting Guide
          if (showDepthLine) {
            // Anchor point dot
            ctx.beginPath();
            ctx.arc(ex, ey, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Y-sort depth line
            ctx.beginPath();
            ctx.moveTo(ex - 35, ey + visual.ySortOffset);
            ctx.lineTo(ex + 35, ey + visual.ySortOffset);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#f59e0b';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`Y-Sort: ${Math.round(entityDepthY)}px (+${visual.ySortOffset})`, ex, ey + visual.ySortOffset + 14);
          }

          // G. Floating Name & Stats Badge
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(entityName, ex, sprTop - 12);

          ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
          ctx.font = '10px sans-serif';
          ctx.fillText(`[${elementType.toUpperCase()}] ${rarity}`, ex, sprTop - 1);
        },
      });

      // 2. Sort all objects strictly by depthY (Y-Sorting Algorithm in Phaser 3)
      renderQueue.sort((a, b) => a.depthY - b.depthY);

      // 3. Render in proper depth order
      renderQueue.forEach((item) => item.draw());

      // 4. UI Overlay Info
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(10, 10, 210, 68);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.strokeRect(10, 10, 210, 68);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('🎮 MOTOR 2.5D DIMÉTRICO', 18, 26);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px monospace';
      ctx.fillText(`Proyección: 2:1 (26.565°)`, 18, 42);
      ctx.fillText(`Depth Formula: y + ${visual.ySortOffset}`, 18, 56);
      ctx.fillText(`Anchor: (${visual.anchorX}, ${visual.anchorY})`, 18, 70);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [visual, entityName, elementType, rarity, isPlaying, showGrid, showCollision, showDepthLine, showObstacles, timeMode, entityPos, facingDir]);

  // Handle Drag on canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - (rect.height / 2 - 20);

    // Convert screen dx/dy to grid gx/gy
    const gx = (x / 24 + y / 12) / 2;
    const gy = (y / 12 - x / 24) / 2;
    setEntityPos({
      x: Math.max(-2.5, Math.min(2.5, gx)),
      y: Math.max(-2.5, Math.min(2.5, gy)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Visor Dimétrico 2.5D
          </span>
          <span className="text-slate-500">|</span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1.5 rounded transition ${isPlaying ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}
            title={isPlaying ? 'Pausar animación' : 'Reanudar animación'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setFacingDir((prev) => (prev + 1) % 4)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 flex items-center gap-1"
            title="Girar orientación isométrica"
          >
            <RefreshCw className="w-3 h-3" />
            {facingDir === 0 ? 'Sur-Oeste' : facingDir === 1 ? 'Sur-Este' : facingDir === 2 ? 'Nor-Este' : 'Nor-Oeste'}
          </button>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-1 rounded text-xs transition ${showGrid ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Rejilla 2:1
          </button>
          <button
            onClick={() => setShowCollision(!showCollision)}
            className={`px-2 py-1 rounded text-xs transition ${showCollision ? 'bg-slate-800 text-sky-300 border border-sky-500/30' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Hitbox
          </button>
          <button
            onClick={() => setShowDepthLine(!showDepthLine)}
            className={`px-2 py-1 rounded text-xs transition ${showDepthLine ? 'bg-slate-800 text-amber-300 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Y-Sort
          </button>
          <button
            onClick={() => setShowObstacles(!showObstacles)}
            className={`px-2 py-1 rounded text-xs transition ${showObstacles ? 'bg-slate-800 text-emerald-300 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}`}
            title="Mostrar objetos de prueba para comprobar profundidad"
          >
            Obstáculos
          </button>
          <div className="flex items-center bg-slate-800 rounded p-0.5 ml-1">
            <button
              onClick={() => setTimeMode('day')}
              className={`p-1 rounded ${timeMode === 'day' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              title="Iluminación diurna"
            >
              <Sun className="w-3 h-3" />
            </button>
            <button
              onClick={() => setTimeMode('sunset')}
              className={`p-1 rounded ${timeMode === 'sunset' ? 'bg-orange-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              title="Atardecer"
            >
              <Sparkles className="w-3 h-3" />
            </button>
            <button
              onClick={() => setTimeMode('night')}
              className={`p-1 rounded ${timeMode === 'night' ? 'bg-indigo-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              title="Noche bioluminiscente"
            >
              <Moon className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full h-[320px] bg-slate-950 flex items-center justify-center cursor-move">
        <canvas
          ref={canvasRef}
          width={640}
          height={320}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full object-contain"
        />

        {/* Drag Hint */}
        <div className="absolute bottom-2 right-3 pointer-events-none text-[11px] text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
          Arrastra para probar Y-Sorting dinámico
        </div>
      </div>

      {/* 2.5D Depth Adjuster Sliders */}
      {onChangeVisual && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-950/60 border-t border-slate-800 text-xs">
          <div>
            <label className="text-slate-400 font-mono text-[11px] flex justify-between">
              <span>Anchor Y (Base)</span>
              <span className="text-cyan-400 font-bold">{visual.anchorY}</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.01"
              value={visual.anchorY}
              onChange={(e) => onChangeVisual({ ...visual, anchorY: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-mono text-[11px] flex justify-between">
              <span>Y-Sort Offset</span>
              <span className="text-amber-400 font-bold">{visual.ySortOffset}px</span>
            </label>
            <input
              type="range"
              min="-20"
              max="30"
              step="1"
              value={visual.ySortOffset}
              onChange={(e) => onChangeVisual({ ...visual, ySortOffset: parseInt(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-mono text-[11px] flex justify-between">
              <span>Opacidad Sombra</span>
              <span className="text-purple-400 font-bold">{Math.round((visual.shadow?.opacity || 0.5) * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={visual.shadow?.opacity || 0.5}
              onChange={(e) =>
                onChangeVisual({
                  ...visual,
                  shadow: { ...visual.shadow, opacity: parseFloat(e.target.value) },
                })
              }
              className="w-full accent-purple-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-mono text-[11px] flex justify-between">
              <span>Radio Sombra X</span>
              <span className="text-emerald-400 font-bold">{visual.shadow?.radiusX || 18}px</span>
            </label>
            <input
              type="range"
              min="8"
              max="40"
              step="1"
              value={visual.shadow?.radiusX || 18}
              onChange={(e) =>
                onChangeVisual({
                  ...visual,
                  shadow: { ...visual.shadow, radiusX: parseInt(e.target.value) },
                })
              }
              className="w-full accent-emerald-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
