/**
 * Serializes {@link !Map} instances.
 *
 * ```ts
 * import { stringify } from 'json-marshal';
 * import mapAdapter from 'json-marshal/adapter/map';
 *
 * stringify(new Map(), { adapters: [mapAdapter()] });
 * ```
 *
 * @module adapter/map
 */
import { compareKeys } from '../utils';
import { dehydrate } from '../dehydrate';
import { Adapter } from '../types';
import { TAG_MAP } from '../Tag';

export default function mapAdapter(): Adapter {
  return adapter;
}

const adapter: Adapter<Map<any, any>, [any, any][]> = {
  tag: TAG_MAP,

  isSupported(value) {
    return value instanceof Map;
  },

  pack(value, options) {
    if (value.size === 0) {
      return [];
    }

    if (!options.isStable) {
      return Array.from(value);
    }

    const entries: [any, any][] = [];
    const refs = new Map();

    for (const entry of value) {
      const key = dehydrate(entry[0], refs, options);

      if (key !== undefined) {
        entries.push([key, entry]);
      }
      refs.clear();
    }

    if (entries.length === 0) {
      return [];
    }

    entries.sort(compareKeys);

    for (let i = 0; i < entries.length; ++i) {
      entries[i] = entries[i][1];
    }

    return entries;
  },

  unpack(payload) {
    return new Map();
  },

  hydrate(value, payload) {
    for (const entry of payload) {
      if (entry.length === 2) {
        value.set(entry[0], entry[1]);
      }
    }
  },
};
