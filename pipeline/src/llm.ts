import { LLM_DEFAULTS } from './config.ts';
import type { FetchLike } from './util.ts';
import { errorMessage, sleep as realSleep, warn } from './util.ts';

export interface ChatMessage { role: 'system' | 'user'; content: string }

export interface LlmConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
  disabled: boolean;
  disabledReason?: string;
  minIntervalMs: number;
  timeoutMs: number;
}

export interface LlmClient {
  readonly enabled: boolean;
  readonly disabledReason?: string;
  /** HTTP requests sent so far (including a single 429 retry). */
  readonly requests: number;
  /** Sends a chat completion in JSON mode. Returns the parsed JSON object, or null on any failure. */
  completeJson(messages: ChatMessage[], label: string): Promise<unknown>;
}

export function llmConfigFromEnv(env: Record<string, string | undefined>): LlmConfig {
  const disabledFlag = /^(1|true|yes)$/i.test((env.LLM_DISABLED ?? '').trim());
  const apiKey = (env.LLM_API_KEY ?? '').trim();
  const config: LlmConfig = {
    baseUrl: (env.LLM_BASE_URL || LLM_DEFAULTS.baseUrl).replace(/\/+$/, ''),
    model: env.LLM_MODEL || LLM_DEFAULTS.model,
    apiKey,
    disabled: disabledFlag || !apiKey,
    minIntervalMs: LLM_DEFAULTS.minIntervalMs,
    timeoutMs: LLM_DEFAULTS.timeoutMs,
  };
  if (disabledFlag) config.disabledReason = 'LLM_DISABLED is set';
  else if (!apiKey) config.disabledReason = 'LLM_API_KEY is not set';
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
 * OpenAI-compatible chat completions client (GitHub Models by default) using plain fetch.
 * Requests are spaced by at least `minIntervalMs` (free tier: 15 requests/min). When disabled,
 * no network call is ever made.
 */
export function createLlmClient(config: LlmConfig, deps: LlmDeps = {}): LlmClient {
  const doFetch: FetchLike = deps.fetch ?? ((input, init) => fetch(input, init));
  const sleep = deps.sleep ?? realSleep;
  const now = deps.now ?? Date.now;
  let lastRequestAt = Number.NEGATIVE_INFINITY;
  let requests = 0;

  async function send(messages: ChatMessage[], label: string): Promise<unknown> {
    for (let attempt = 0; attempt < 2; attempt++) {
      const wait = lastRequestAt + config.minIntervalMs - now();
      if (wait > 0) await sleep(wait);
      lastRequestAt = now();
      requests++;
      let res: Response;
      try {
        res = await doFetch(`${config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${config.apiKey}`,
            'content-type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify({
            model: config.model,
            messages,
            temperature: LLM_DEFAULTS.temperature,
            max_tokens: LLM_DEFAULTS.maxTokens,
            response_format: { type: 'json_object' },
          }),
          signal: AbortSignal.timeout(config.timeoutMs),
        });
      } catch (err) {
        warn('llm', `${label}: request failed: ${errorMessage(err)}`);
        return null;
      }
      if (res.status === 429 && attempt === 0) {
        const retryAfter = Number(res.headers.get('retry-after'));
        if (Number.isFinite(retryAfter) && retryAfter > 0 && retryAfter <= 30) {
          warn('llm', `${label}: HTTP 429, retrying once after ${retryAfter}s`);
          await res.body?.cancel().catch(() => undefined);
          await sleep(retryAfter * 1000);
          continue;
        }
      }
      try {
        if (!res.ok) {
          const body = collapse((await res.text()).slice(0, 200));
          warn('llm', `${label}: HTTP ${res.status} ${body}`);
          return null;
        }
        const data: unknown = await res.json();
        const content = (data as { choices?: { message?: { content?: unknown } }[] })?.choices?.[0]?.message?.content;
        if (typeof content !== 'string') {
          warn('llm', `${label}: response has no message content`);
          return null;
        }
        return JSON.parse(stripCodeFence(content)) as unknown;
      } catch (err) {
        warn('llm', `${label}: invalid response: ${errorMessage(err)}`);
        return null;
      }
    }
    return null;
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
    async completeJson(messages, label) {
      if (config.disabled) return null;
      return send(messages, label);
    },
  };
}

function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}
