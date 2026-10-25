import { DATA_BASE_URL } from '@/lib/config';
import type { CreativePulse, Edition, Feed, Latest } from '@/types';

export class DataError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = 'DataError';
  }
}

const getJson = async <T>(path: string): Promise<T> => {
  const url = `${DATA_BASE_URL}/${path.replace(/^\//, '')}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) {
    throw new DataError(`Request failed (${res.status})`, res.status);
  }
  return (await res.json()) as T;
};

export const fetchLatest = () => getJson<Latest>('latest.json');
export const fetchEdition = (path: string) => getJson<Edition>(path);
export const fetchFeed = (path: string) => getJson<Feed>(path);
export const fetchPulse = (path: string) => getJson<CreativePulse>(path);
