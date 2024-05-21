import { Tag } from '../Tag';
import type { SerializationAdapter } from '../types';

export default function dateAdapter(): SerializationAdapter {
  return adapter;
}

const adapter: SerializationAdapter = {
  getTag(value) {
    return value instanceof Date ? Tag.DATE : -1;
  },

  serialize(tag, value) {
    return value.getTime();
  },

  deserialize(tag, data) {
    return tag === Tag.DATE ? new Date(data) : undefined;
  },
};
