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
import { compareKeys } from '../utils.js';
import { dehydrate } from '../dehydrate.js';
import { SerializationAdapter } from '../types.js';
import { TAG_MAP } from '../constants.js';

export default function mapAdapter(): SerializationAdapter {
  return adapter;
}

const adapter: SerializationAdapter<Map<any, any>, readonly any[]> = {
  tag: TAG_MAP,

  canPack(value) {
    return value instanceof Map;
  },

  pack(value, options) {
    if (value.size === 0) {
      return [];
    }

    if (!options.isStable) {
      return Array.from(value);
    }

    const entries = [];
    const refs = new Map();

    for (const entry of value) {
      const keyJSON = dehydrate(entry[0], refs, options);

      if (keyJSON !== undefined) {
        entries.push([keyJSON, entry]);
      }
      refs.clear();
    }

    if (entries.length === 0) {
      return entries;
    }

    entries.sort(compareKeys);

    for (let i = 0; i < entries.length; ++i) {
      entries[i] = entries[i][1];
    }

    return entries;
  },

  unpack(_payload, _options) {
    return new Map();
  },

  hydrate(value, payload, _options) {
    for (const entry of payload) {
      if (entry.length === 2) {
        value.set(entry[0], entry[1]);
      }
    }
  },
};
