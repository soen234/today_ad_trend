import Anthropic from '@anthropic-ai/sdk';
import { LLM_DEFAULTS } from './config.ts';
import type { FetchLike } from './util.ts';
import { errorMessage, sleep as realSleep, warn } from './util.ts';

export interface ChatMessage { role: 'system' | 'user'; content: string }

export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export interface LlmConfig {
  model: string;
  apiKey: string;
  effort: Effort;
  disabled: boolean;
  disabledReason?: string;
  minIntervalMs: number;
  timeoutMs: number;
  /** SDK-level retries for 408/409/429/5xx and connection errors. */
  maxRetries: number;
}

export interface LlmClient {
  readonly enabled: boolean;
  readonly disabledReason?: string;
  /** Requests sent so far (SDK retries not counted). */
  readonly requests: number;
  /** Sends one request and parses the reply as a JSON object. Returns null on any failure. */
  completeJson(messages: ChatMessage[], label: string): Promise<unknown>;
}

const EFFORTS: readonly Effort[] = ['low', 'medium', 'high', 'xhigh', 'max'];

export function llmConfigFromEnv(env: Record<string, string | undefined>): LlmConfig {
  const disabledFlag = /^(1|true|yes)$/i.test((env.LLM_DISABLED ?? '').trim());
  const apiKey = (env.ANTHROPIC_API_KEY ?? '').trim();
  const effortEnv = (env.LLM_EFFORT ?? '').trim() as Effort;
  const config: LlmConfig = {
    model: (env.LLM_MODEL ?? '').trim() || LLM_DEFAULTS.model,
    apiKey,
    effort: EFFORTS.includes(effortEnv) ? effortEnv : LLM_DEFAULTS.effort,
    disabled: disabledFlag || !apiKey,
    minIntervalMs: LLM_DEFAULTS.minIntervalMs,
    timeoutMs: LLM_DEFAULTS.timeoutMs,
    maxRetries: LLM_DEFAULTS.maxRetries,
  };
  if (disabledFlag) config.disabledReason = 'LLM_DISABLED is set';
  else if (!apiKey) config.disabledReason = 'ANTHROPIC_API_KEY is not set';
  return config;
}

export interface LlmDeps {
  fetch?: FetchLike;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

function stripCodeFence(text: string): string {
  const fenced = /^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/i.exec(text);
  return fenced ? (fenced[1] ?? '') : text;
}

/**
 * Claude client (Anthropic SDK). The system message carries the instructions; the single user message
 * carries the untrusted data. Requests are spaced by at least `minIntervalMs`. When disabled, no
 * network call is ever made. Refusals are handled server-side with the default fallback chain and, if
 * the whole chain refuses, treated like any other failure (callers fall back deterministically).
 */
export function createLlmClient(config: LlmConfig, deps: LlmDeps = {}): LlmClient {
  const sleep = deps.sleep ?? realSleep;
  const now = deps.now ?? Date.now;
  let lastRequestAt = Number.NEGATIVE_INFINITY;
  let requests = 0;
  const client = config.disabled
    ? null
    : new Anthropic({
        apiKey: config.apiKey,
        maxRetries: config.maxRetries,
        timeout: config.timeoutMs,
        ...(deps.fetch ? { fetch: deps.fetch as unknown as typeof fetch } : {}),
      });

  async function send(messages: ChatMessage[], label: string): Promise<unknown> {
    if (!client) return null;
    const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
    const user = messages.filter((m) => m.role === 'user').map((m) => m.content).join('\n\n');
    const wait = lastRequestAt + config.minIntervalMs - now();
    if (wait > 0) await sleep(wait);
    lastRequestAt = now();
    requests++;
    let response: Anthropic.Beta.BetaMessage;
    try {
      response = await client.beta.messages.create({
        model: config.model,
        max_tokens: LLM_DEFAULTS.maxTokens,
        output_config: { effort: config.effort },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        ...(system ? { system } : {}),
        messages: [{ role: 'user', content: user }],
      });
    } catch (err) {
      if (err instanceof Anthropic.APIError) {
        warn('llm', `${label}: API error ${err.status ?? 'connection'}: ${collapse(err.message).slice(0, 200)}`);
      } else {
        warn('llm', `${label}: request failed: ${errorMessage(err)}`);
      }
      return null;
    }
    if (response.stop_reason === 'refusal') {
      warn('llm', `${label}: refused (${response.stop_details?.category ?? 'unknown category'})`);
      return null;
    }
    if (response.stop_reason === 'max_tokens') {
      warn('llm', `${label}: reply hit max_tokens`);
      return null;
    }
    const text = response.content
      .flatMap((block) => (block.type === 'text' ? [block.text] : []))
      .join('')
      .trim();
    if (!text) {
      warn('llm', `${label}: reply has no text`);
      return null;
    }
    try {
      return JSON.parse(stripCodeFence(text)) as unknown;
    } catch {
      warn('llm', `${label}: model reply is not JSON: ${collapse(text.slice(0, 160))}`);
      return null;
    }
  }

  return {
    get enabled() {
      return !config.disabled;
    },
    get disabledReason() {
      return config.disabledReason;
    },
    get requests() {
      return requests;
    },
    completeJson: send,
  };
}

function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}
