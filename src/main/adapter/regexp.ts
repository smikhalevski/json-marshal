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
import { Adapter } from '../types';
import { TAG_REGEXP } from '../Tag';

export default function regexpAdapter(): Adapter {
  return adapter;
}

const adapter: Adapter = {
  tag: TAG_REGEXP,

  isSupported(value) {
    return value instanceof RegExp;
  },

  pack(value, options) {
    return [value.source, value.flags];
  },

  unpack(payload, options) {
    return new RegExp(payload[0], payload[1]);
  },
};
