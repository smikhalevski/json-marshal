import errorAdapter from '../../main/adapter/error';

const adapter = errorAdapter();

test('restores error name', () => {
  class Zzz extends Error {}

  Zzz.prototype.name = 'Zzz';

  const payload = adapter.pack(new Zzz('aaa'), {});
  const value = adapter.unpack(payload, {});

  expect(payload).toStrictEqual(['Zzz', 'aaa', 0]);

  expect(value).toStrictEqual(new Error('aaa'));
  expect(value.name).toBe('Zzz');
});
