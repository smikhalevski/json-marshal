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
import { Adapter } from '../types';
import { TAG_DATE } from '../Tag';

export default function dateAdapter(): Adapter {
  return adapter;
}

const adapter: Adapter<Date, string> = {
  tag: TAG_DATE,

  isSupported(value) {
    return value instanceof Date;
  },

  pack(value) {
    return value.toISOString();
  },

  unpack(payload): Date {
    return new Date(payload);
  },
};
