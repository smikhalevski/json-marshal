import { expect, test } from 'vitest';
import arrayBufferAdapter from '../../main/adapter/array-buffer.js';

const adapter = arrayBufferAdapter();

test('packs and unpacks BigUint64Array', () => {
  const payload = adapter.pack(new BigUint64Array([111n, 222n]), {});

  expect(adapter.unpack(payload, {})).toStrictEqual(new BigUint64Array([111n, 222n]));
});

test('packs and unpacks Uint32Array', () => {
  const payload = adapter.pack(new Uint32Array([111, 222]), {});

  expect(adapter.unpack(payload, {})).toStrictEqual(new Uint32Array([111, 222]));
});
