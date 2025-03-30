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
import { SerializationAdapter } from '../types';
import { TAG_DATE } from '../constants';

export default function dateAdapter(): SerializationAdapter {
  return adapter;
}

const adapter: SerializationAdapter<Date, string> = {
  tag: TAG_DATE,

  canPack(value) {
    return value instanceof Date;
  },

  pack(value, _options) {
    return value.toISOString();
  },

  unpack(payload, _options) {
    return new Date(payload);
  },
};
