import { expect, test } from 'vitest';
import { parse, SerializationAdapter, stringify } from '../main/index.js';

test('setAdapter', () => {
  const setAdapter: SerializationAdapter<Set<any>, any[]> = {
    tag: 2222,

    canPack(value) {
      return value instanceof Set;
    },

    pack(value, _options) {
      return Array.from(value);
    },

    unpack(_payload, _options) {
      // Return an empty set, because payload doesn't contain
      // hydrated values at this stage
      return new Set();
    },

    hydrate(value, payload, _options) {
      // Add hydrated items to set
      for (const item of payload) {
        value.add(item);
      }
    },
  };

  const json1 = stringify(new Set(['aaa', 'bbb']), { adapters: [setAdapter] });

  expect(json1).toBe('[2222,["aaa","bbb"]]');
  expect(parse(json1, { adapters: [setAdapter] })).toEqual(new Set(['aaa', 'bbb']));

  const obj = new Set();

  obj.add(obj);

  const json2 = stringify(obj, { adapters: [setAdapter] });

  expect(json2).toBe('[2222,[[0,0]]]');
  expect(parse(json2, { adapters: [setAdapter] })).toEqual(obj);
});
