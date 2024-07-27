/**
 * Serializes {@link !Date} instances.
 *
 * ```ts
 * import { stringify } from 'json-marshal';
 * import dateAdapter from 'json-marshal/adapter/date';
 *
 * stringify(new Date(), { adapters: [dateAdapter()] });
 * ```
 *
 * @module adapter/date
 */
import { Tag } from '../Tag';
import { SerializationAdapter } from '../types';

export default function dateAdapter(): SerializationAdapter {
  return adapter;
}

const adapter: SerializationAdapter = {
  getTag(value, _options) {
    if (value instanceof Date) {
      return Tag.DATE;
    }
  },

  getPayload(_tag, value, _options) {
    return value.getTime();
  },

  getValue(tag, dehydratedPayload, _options) {
    if (tag === Tag.DATE) {
      return new Date(dehydratedPayload);
    }
  },
};
