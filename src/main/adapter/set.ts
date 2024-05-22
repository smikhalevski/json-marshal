/**
 * Serializes {@link !Set Set} instances.
 *
 * ```ts
 * import setAdapter from 'json-marshal/adapter/set';
 * ```
 *
 * @module adapter/set
 */
import { dehydrate, DISCARDED } from '../dehydrate';
import { Tag } from '../Tag';
import type { SerializationAdapter } from '../types';

export default function setAdapter(): SerializationAdapter {
  return adapter;
}

const adapter: SerializationAdapter = {
  getTag(value, _options) {
    if (value instanceof Set) {
      return Tag.SET;
    }
  },

  getPayload(_tag, value, options) {
    if (value.size === 0) {
      return undefined;
    }

    if (!options.stable) {
      return Array.from(value);
    }

    const items = [];
    const refs = new Map();

    for (const item of value) {
      const key = dehydrate(item, refs, options);

      if (key !== DISCARDED) {
        items.push([key, item]);
      }
      refs.clear();
    }

    if (items.length === 0) {
      return undefined;
    }

    items.sort(compareKeys);

    for (let i = 0; i < items.length; ++i) {
      items[i] = items[i][1];
    }

    return items;
  },

  getValue(tag, _dehydratedPayload, _options) {
    if (tag === Tag.SET) {
      return new Set();
    }
  },

  hydrateValue(_tag, value, hydratedPayload, _options) {
    if (hydratedPayload === undefined) {
      return;
    }
    for (const item of hydratedPayload) {
      value.add(item);
    }
  },
};

function compareKeys([a]: any[], [b]: any[]): number {
  return a === b ? 0 : a < b ? -1 : 1;
}
