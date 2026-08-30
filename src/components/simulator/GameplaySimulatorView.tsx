import React, { useState } from 'react';
import { useAurora } from '../../context/AuroraContext';
import { GameplaySimulationResult } from '../../types/aurora';
import { runGameplaySimulation } from '../../lib/gameplaySimulator';
import {
  Swords,
  Play,
  RotateCcw,
  Zap,
  Activity,
  Award,
  AlertTriangle,
  Flame,
  Shield,
  Gauge,
  TrendingUp,
  Clock,
} from 'lucide-react';

export const GameplaySimulatorView: React.FC = () => {
  const { projectContext, showToast } = useAurora();
  const [playerLevel, setPlayerLevel] = useState<number>(10);
  const [sampleBatches, setSampleBatches] = useState<number>(20);
  const [simResult, setSimResult] = useState<GameplaySimulationResult>(() =>
    runGameplaySimulation(projectContext, 10, 20)
  );
  const [selectedCombatIndex, setSelectedCombatIndex] = useState<number>(0);

  const handleRunSimulation = () => {
    const res = runGameplaySimulation(projectContext, playerLevel, sampleBatches);
    setSimResult(res);
    setSelectedCombatIndex(0);
    showToast(`Simulación completada: ${sampleBatches} combates simulados`, 'success');
  };

  const currentCombat = simResult.combatRuns[selectedCombatIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                Gameplay & Combat Simulator 2.0
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
                  ANALYTICAL ENGINE
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Simula cientos de combates por turnos con multiplicadores elementales, velocidad, TTK y detección de picos de dificultad.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunSimulation}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/20 transition"
          >
            <Play className="w-4 h-4" />
            <span>Ejecutar Simulación Monte Carlo</span>
          </button>
        </div>
      </div>

      {/* Parameter Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Nivel del Jugador / Grupo ({playerLevel})
          </label>
          <input
            type="range"
            min={1}
            max={40}
            value={playerLevel}
            onChange={(e) => setPlayerLevel(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Muestra de Combates ({sampleBatches})
          </label>
          <input
            type="range"
            min={10}
            max={100}
            step={10}
            value={sampleBatches}
            onChange={(e) => setSampleBatches(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-400">RATIO DE VICTORIA</span>
          <p className="text-lg font-black text-rose-400">
            {(simResult.playerWinRate * 100).toFixed(0)}%
          </p>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-400">TIEMPO MEDIO DE COMBATE (TTK)</span>
          <p className="text-lg font-black text-amber-400">
            {simResult.averageTurnsToKill} turnos
          </p>
        </div>
      </div>

      {/* Simulation Result Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-cyan-400" /> Clasificación de Dificultad
          </span>
          <h3 className="text-xl font-black text-slate-100">{simResult.difficultyRating}</h3>
          <p className="text-[11px] text-slate-500">
            {simResult.difficultyRating === 'BALANCED'
              ? 'Dificultad óptima para un RPG táctico accesible y desafiante.'
              : 'Se detecta desviación respecto al balance ideal.'}
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Ritmo de Progresión
          </span>
          <h3 className="text-xl font-black text-emerald-400">{simResult.progressionSpeed}</h3>
          <p className="text-[11px] text-slate-500">
            Velocidad de resolución y adquisición de experiencia en parámetros saludables.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Anomalías Detectadas
          </span>
          <h3 className="text-xl font-black text-amber-400">
            {simResult.anomaliesDetected.length}
          </h3>
          <p className="text-[11px] text-slate-500">
            {simResult.anomaliesDetected.length === 0
              ? 'Cero picos de frustración en esta franja.'
              : 'Ver anomalías en la sección inferior.'}
          </p>
        </div>
      </div>

      {/* Anomalies List */}
      {simResult.anomaliesDetected.length > 0 && (
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-5 shadow-lg space-y-3">
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Alertas de Balance de Juego
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {simResult.anomaliesDetected.map((anom, i) => (
              <div
                key={i}
                className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{anom.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">
                    {anom.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{anom.description}</p>
                <p className="text-xs text-emerald-400/90 pt-1">
                  <strong>Recomendación:</strong> {anom.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Combat Runs Inspector */}
      {simResult.combatRuns.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Runs Selector */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Enfrentamientos Simulados ({simResult.combatRuns.length})
            </h3>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {simResult.combatRuns.map((run, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedCombatIndex(idx)}
                  className={`p-3 rounded-xl border transition cursor-pointer text-xs ${
                    selectedCombatIndex === idx
                      ? 'bg-rose-950/30 border-rose-500/60 text-slate-100'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>
                      {run.creatureA} vs {run.creatureB}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {run.totalTurns} turnos
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Ganador: <strong className="text-slate-300">{run.winner}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Turn-by-Turn Combat Log */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            {currentCombat ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-rose-400 font-bold">
                      LOG TURNO A TURNO · ENFRENTAMIENTO #{selectedCombatIndex + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">
                      {currentCombat.creatureA} vs {currentCombat.creatureB}
                    </h3>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    Ganador: {currentCombat.winner}
                  </span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {currentCombat.rounds.map((round, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          T{round.turn}
                        </span>
                        <span className="text-slate-200 font-semibold">{round.attacker}</span>
                        <span className="text-slate-500">usa</span>
                        <span className="text-indigo-300 font-mono">{round.actionUsed}</span>
                        {round.isCrit && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                            CRÍTICO
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-rose-400 font-bold">-{round.damage} HP</span>
                        <span className="text-[10px] text-slate-500 ml-2">
                          (Restante: {round.remainingHpDefender})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
