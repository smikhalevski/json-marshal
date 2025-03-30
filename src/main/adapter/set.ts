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
import { Adapter } from '../types';
import { TAG_SET } from '../Tag';

export default function setAdapter(): Adapter {
  return adapter;
}

const adapter: Adapter<Set<any>, any[]> = {
  tag: TAG_SET,

  isSupported(value) {
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
      const key = dehydrate(item, refs, options);

      if (key !== undefined) {
        items.push([key, item]);
      }
      refs.clear();
    }

    if (items.length === 0) {
      return [];
    }

    items.sort(compareKeys);

    for (let i = 0; i < items.length; ++i) {
      items[i] = items[i][1];
    }

    return items;
  },

  unpack(payload, options) {
    return new Set();
  },

  hydrate(value, payload, options) {
    for (const item of payload) {
      value.add(item);
    }
  },
};
