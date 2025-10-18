import { expect, test } from 'vitest';
import dateAdapter from '../../main/adapter/date.js';

const adapter = dateAdapter();

test('packs and unpacks Date', () => {
  const payload = adapter.pack(new Date(111), {});

  expect(adapter.unpack(payload, {})).toStrictEqual(new Date(111));
});
