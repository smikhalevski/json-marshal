/**
 * Serializes {@link !RegExp} instances.
 *
 * ```ts
 * import { stringify } from 'json-marshal';
 * import regexpAdapter from 'json-marshal/adapter/regexp';
 *
 * stringify(/Old/g, { adapters: [regexpAdapter()] });
 * ```
 *
 * @module adapter/regexp
 */
import { Tag } from '../Tag';
import { SerializationAdapter } from '../types';

export default function regexpAdapter(): SerializationAdapter {
  return adapter;
}

const adapter: SerializationAdapter = {
  getTag(value, _options) {
    if (value instanceof RegExp) {
      return Tag.REGEXP;
    }
  },

  getPayload(_tag, value, _options) {
    return [value.source, value.flags];
  },

  getValue(tag, dehydratedPayload, _options) {
    if (tag === Tag.REGEXP) {
      return new RegExp(dehydratedPayload[0], dehydratedPayload[1]);
    }
  },
};
