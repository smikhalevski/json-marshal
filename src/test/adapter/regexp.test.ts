import { expect, test } from 'vitest';
import regexpAdapter from '../../main/adapter/regexp.js';

const adapter = regexpAdapter();

test('packs and unpacks Regexp', () => {
  const payload = adapter.pack(/aaa/g, {});

  expect(adapter.unpack(payload, {})).toStrictEqual(/aaa/g);
});
