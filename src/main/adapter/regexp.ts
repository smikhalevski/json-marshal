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
import { SerializationAdapter } from '../types';
import { TAG_REGEXP } from '../Tag';

export default function regexpAdapter(): SerializationAdapter {
  return adapter;
}

const adapter: SerializationAdapter<RegExp, [source: string, flags: string]> = {
  tag: TAG_REGEXP,

  isSupported(value) {
    return value instanceof RegExp;
  },

  pack(value, _options) {
    return [value.source, value.flags];
  },

  unpack(payload, _options) {
    return new RegExp(payload[0], payload[1]);
  },
};
