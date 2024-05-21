import { Tag } from '../Tag';
import type { SerializationAdapter } from '../types';

export default function regexpAdapter(): SerializationAdapter {
  return adapter;
}

const adapter: SerializationAdapter = {
  getTag(value) {
    return value instanceof RegExp ? Tag.REGEXP : -1;
  },

  serialize(tag, value) {
    return [value.source, value.flags];
  },

  deserialize(tag, data) {
    return tag === Tag.REGEXP ? new RegExp(data[0], data[1]) : undefined;
  },
};
