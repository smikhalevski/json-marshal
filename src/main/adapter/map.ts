/**
 * Serializes {@link !Map Map} instances.
 *
 * ```ts
 * import mapAdapter from 'json-marshal/adapter/map';
 * ```
 *
 * @module adapter/map
 */
import { dehydrate, DISCARDED } from '../dehydrate';
import { Tag } from '../Tag';
import type { SerializationAdapter } from '../types';

export default function mapAdapter(): SerializationAdapter {
  return adapter;
}

const adapter: SerializationAdapter = {
  getTag(value, _options) {
    if (value instanceof Map) {
      return Tag.MAP;
    }
  },

  getPayload(_tag, value, options) {
    if (value.size === 0) {
      return undefined;
    }

    if (!options.stable) {
      return Array.from(value);
    }

    const entries = [];
    const refs = new Map();

    for (const entry of value) {
      const key = dehydrate(entry[0], refs, options);

      if (key !== DISCARDED) {
        entries.push([key, entry]);
      }
      refs.clear();
    }

    if (entries.length === 0) {
      return undefined;
    }

    entries.sort(compareKeys);

    for (let i = 0; i < entries.length; ++i) {
      entries[i] = entries[i][1];
    }

    return entries;
  },

  getValue(tag, _dehydratedPayload, _options) {
    if (tag === Tag.MAP) {
      return new Map();
    }
  },

  hydrateValue(_tag, value, hydratedPayload, _options) {
    if (hydratedPayload === undefined) {
      return;
    }
    for (const entry of hydratedPayload) {
      if (entry.length === 2) {
        value.set(entry[0], entry[1]);
      }
    }
  },
};

function compareKeys([a]: any[], [b]: any[]): number {
  return a === b ? 0 : a < b ? -1 : 1;
}
