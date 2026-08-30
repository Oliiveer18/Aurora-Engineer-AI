import { AIUsageMetrics, AIProviderConfig } from '../types/aurora';
import {
  loadFreeAIConfig,
  saveFreeAIConfig,
  loadFreeAIUsage,
  saveFreeAIUsage,
  recordLocalOperation,
  recordCacheHit,
  recordBlockedPaidRequest,
  DEFAULT_FREE_CONFIG,
  DEFAULT_FREE_USAGE,
} from './freeFirstEngine';

export const INITIAL_AI_USAGE: AIUsageMetrics = DEFAULT_FREE_USAGE;
export const INITIAL_PROVIDER_CONFIG: AIProviderConfig = DEFAULT_FREE_CONFIG;

export function loadAIUsageMetrics(): AIUsageMetrics {
  return loadFreeAIUsage();
}

export function saveAIUsageMetrics(metrics: AIUsageMetrics): void {
  saveFreeAIUsage(metrics);
}

export function recordAICall(
  module: keyof AIUsageMetrics['callsBreakdown'],
  promptTokens = 450,
  completionTokens = 250
): void {
  const config = loadFreeAIConfig();

  // If cost guard is active and user tried a paid operation
  if (config.freeMode && config.activeProvider === 'GEMINI_2_5_PRO') {
    recordBlockedPaidRequest();
    console.warn('[Cost Guard] Paid API usage blocked by Free Mode');
    return;
  }

  const current = loadAIUsageMetrics();
  current.totalTokens += promptTokens + completionTokens;
  current.promptTokens += promptTokens;
  current.completionTokens += completionTokens;
  current.totalCalls += 1;
  current.callsBreakdown[module] = (current.callsBreakdown[module] || 0) + 1;
  
  // Under Free Mode & Free Tier: Cost is guaranteed €0.00
  if (config.freeMode) {
    current.estimatedCostUsd = 0.0;
    current.estimatedCostEur = 0.0;
  } else {
    const cost = (promptTokens / 1000000) * 0.075 + (completionTokens / 1000000) * 0.3;
    current.estimatedCostUsd = Number((current.estimatedCostUsd + cost).toFixed(6));
    current.estimatedCostEur = Number((current.estimatedCostUsd * 0.92).toFixed(6));
  }

  saveAIUsageMetrics(current);
}

export function loadAIProviderConfig(): AIProviderConfig {
  return loadFreeAIConfig();
}

export function saveAIProviderConfig(config: AIProviderConfig): void {
  saveFreeAIConfig(config);
}
