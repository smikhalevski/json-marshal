import { test, expect } from 'vitest';
import errorAdapter from '../../main/adapter/error.js';

const adapter = errorAdapter();

test('restores error name', () => {
  class Zzz extends Error {}

  Zzz.prototype.name = 'Zzz';

  const payload = adapter.pack(new Zzz('aaa'), {});
  const value = adapter.unpack(payload, {});

  expect(payload).toStrictEqual(['Zzz', 'aaa', 0]);

  expect(value.name).toBe('Zzz');
  expect(value.message).toBe('aaa');
});
