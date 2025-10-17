import { test, expect } from 'vitest';
import { dehydrate } from '../../main/dehydrate.js';
import setAdapter from '../../main/adapter/set.js';
import { TAG_SET, TAG_UNDEFINED } from '../../main/constants.js';

test('zero-size Set is stringified as a tag', () => {
  expect(dehydrate(new Set(), new Map(), { adapters: [setAdapter()] })).toBe('[' + TAG_SET + ',[]]');
});

test('Set with all items discarded is stringified as a tag', () => {
  expect(dehydrate(new Set([undefined]), new Map(), { adapters: [setAdapter()] })).toBe(
    '[' + TAG_SET + ',[[' + TAG_UNDEFINED + ']]]'
  );
  expect(dehydrate(new Set(['aaa', undefined, '111']), new Map(), { adapters: [setAdapter()] })).toBe(
    '[' + TAG_SET + ',["aaa",[' + TAG_UNDEFINED + '],"111"]]'
  );
});

test('sorts items if the stable flag is provided', () => {
  expect(dehydrate(new Set(['bbb', 'aaa']), new Map(), { adapters: [setAdapter()] })).toBe(
    '[' + TAG_SET + ',["bbb","aaa"]]'
  );
  expect(dehydrate(new Set(['bbb', 'aaa']), new Map(), { adapters: [setAdapter()], isStable: true })).toBe(
    '[' + TAG_SET + ',["aaa","bbb"]]'
  );
  expect(dehydrate(new Set(['bbb', undefined, '111']), new Map(), { adapters: [setAdapter()], isStable: true })).toBe(
    '[' + TAG_SET + ',["111","bbb",[' + TAG_UNDEFINED + ']]]'
  );
});
