/**
 * Serializes {@link !Set} instances.
 *
 * ```ts
 * import { stringify } from 'json-marshal';
 * import setAdapter from 'json-marshal/adapter/set';
 *
 * stringify(new Set(), { adapters: [setAdapter()] });
 * ```
 *
 * @module adapter/set
 */
import { compareKeys } from '../utils';
import { dehydrate } from '../dehydrate';
import { SerializationAdapter } from '../types';
import { TAG_SET } from '../constants';
import { qsort } from 'algomatic';

export default function setAdapter(): SerializationAdapter {
  return adapter;
}

const adapter: SerializationAdapter<Set<any>, readonly any[]> = {
  tag: TAG_SET,

  canPack(value) {
    return value instanceof Set;
  },

  pack(value, options) {
    if (value.size === 0) {
      return [];
    }

    if (!options.isStable) {
      return Array.from(value);
    }

    const items = [];
    const refs = new Map();

    for (const item of value) {
      const itemJSON = dehydrate(item, refs, options);

      if (itemJSON !== undefined) {
        items.push([itemJSON, item]);
      }
      refs.clear();
    }

    if (items.length === 0) {
      return items;
    }

    qsort(items, undefined, compareKeys);

    for (let i = 0; i < items.length; ++i) {
      items[i] = items[i][1];
    }

    return items;
  },

  unpack(_payload, _options) {
    return new Set();
  },

  hydrate(value, payload, _options) {
    for (const item of payload) {
      value.add(item);
    }
  },
};
