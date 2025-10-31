import { describe, test, expect, beforeEach, vi } from 'vitest';
import { SerializationAdapter } from '../main/types.js';
import { hydrate } from '../main/hydrate.js';
import {
  TAG_ARRAY,
  TAG_BIGINT,
  TAG_NAN,
  TAG_NEGATIVE_INFINITY,
  TAG_POSITIVE_INFINITY,
  TAG_REF,
  TAG_UNDEFINED,
} from '../main/constants.js';

describe('null', () => {
  test('preserves null as is', () => {
    expect(hydrate(null, new Map(), {})).toBe(null);
  });
});

describe('string', () => {
  test('preserves strings as is', () => {
    expect(hydrate('aaa', new Map(), {})).toBe('aaa');
  });
});

describe('number', () => {
  test('preserves numbers as is', () => {
    expect(hydrate(111, new Map(), {})).toBe(111);
  });
});

describe('boolean', () => {
  test('preserves booleans as is', () => {
    expect(hydrate(true, new Map(), {})).toBe(true);
    expect(hydrate(false, new Map(), {})).toBe(false);
  });
});

describe('object', () => {
  test('hydrates object properties', () => {
    const value = { aaa: [TAG_UNDEFINED] };

    const xxx = hydrate(value, new Map(), {});

    expect(xxx).toBe(value);
    expect(value.aaa).toBeUndefined();
  });

  test('hydrates references in object properties', () => {
    const value = { aaa: [TAG_REF, 0] };

    const xxx = hydrate(value, new Map(), {});

    expect(xxx).toBe(value);
    expect(xxx.aaa).toBe(xxx);
  });

  test('hydrates sibling references in object properties', () => {
    const value = { aaa: {}, bbb: [TAG_REF, 1] };

    const xxx = hydrate(value, new Map(), {});

    expect(xxx).toBe(value);
    expect(xxx.aaa).toBe(xxx.bbb);
  });
});

describe('arrays', () => {
  test('preserves empty array as is', () => {
    const value: any[] = [];

    const xxx = hydrate(value, new Map(), {});

    expect(xxx).toBe(value);
    expect(xxx.length).toBe(0);
  });

  test('preserves non-encoded array as is', () => {
    const value = ['aaa', 'bbb'];

    const xxx = hydrate(value, new Map(), {});

    expect(xxx).toBe(value);
    expect(xxx).toStrictEqual(['aaa', 'bbb']);
  });

  test('hydrates references in array items', () => {
    const value = ['aaa', [TAG_REF, 0]];

    const xxx = hydrate(value, new Map(), {});

    expect(xxx).toBe(value);
    expect(xxx[1]).toBe(xxx);
    expect(xxx).toStrictEqual(['aaa', xxx]);
  });

  test('hydrates tagged array', () => {
    const value = [TAG_ARRAY, [111, [TAG_UNDEFINED]]];

    const xxx = hydrate(value, new Map(), {});

    expect(xxx).toBe(value[1]);
    expect(xxx).toStrictEqual([111, undefined]);
  });

  test('hydrates item references in tagged array', () => {
    const value = [TAG_ARRAY, [111, [TAG_REF, 0]]];

    const xxx = hydrate(value, new Map(), {});

    expect(xxx).toBe(value[1]);
    expect(xxx[1]).toBe(xxx);
    expect(xxx).toStrictEqual([111, xxx]);
  });
});

describe('ref', () => {
  test('hydrates circular references', () => {
    const xxx = hydrate({ aaa: { bbb: [TAG_REF, 1] } }, new Map(), {});

    expect(xxx.aaa.bbb).toBe(xxx.aaa);
  });

  test('hydrates sibling references', () => {
    const xxx = hydrate({ aaa: {}, bbb: [TAG_REF, 1] }, new Map(), {});

    expect(xxx.bbb).toBe(xxx.aaa);
  });

  test('throws if reference is not found', () => {
    expect(() => hydrate({ aaa: [TAG_REF, 1] }, new Map(), {})).toThrow(new ReferenceError('Unresolved reference: 1'));
  });
});

describe('undefined', () => {
  test('hydrates undefined', () => {
    expect(hydrate([TAG_UNDEFINED], new Map(), {})).toBeUndefined();
  });
});

describe('number', () => {
  test('hydrates NaN', () => {
    expect(hydrate([TAG_NAN], new Map(), {})).toBe(NaN);
  });

  test('hydrates Infinity', () => {
    expect(hydrate([TAG_POSITIVE_INFINITY], new Map(), {})).toBe(Infinity);
    expect(hydrate([TAG_NEGATIVE_INFINITY], new Map(), {})).toBe(-Infinity);
  });
});

describe('bigint', () => {
  test('hydrates bigint', () => {
    expect(hydrate([TAG_BIGINT, '111'], new Map(), {})).toBe(BigInt(111));
  });
});

describe('adapters', () => {
  const canPackMock = vi.fn();
  const packMock = vi.fn();
  const unpackMock = vi.fn();

  const adapterMock: SerializationAdapter = {
    tag: 222,
    canPack: canPackMock,
    pack: packMock,
    unpack: unpackMock,
  };

  beforeEach(() => {
    canPackMock.mockRestore();
    packMock.mockRestore();
    unpackMock.mockRestore();
  });

  test('hydrates tagged value', () => {
    const options = { adapters: [adapterMock] };

    unpackMock.mockReturnValueOnce('bbb');

    expect(hydrate([222, 'aaa'], new Map(), options)).toBe('bbb');
    expect(canPackMock).toHaveBeenCalledTimes(0);
    expect(packMock).toHaveBeenCalledTimes(0);
    expect(unpackMock).toHaveBeenCalledTimes(1);
    expect(unpackMock).toHaveBeenNthCalledWith(1, 'aaa', options);
  });

  test('deserializer receives a hydrated value', () => {
    unpackMock.mockReturnValueOnce('bbb');

    const data = { aaa: [222, { bbb: [TAG_REF, 0] }] };

    expect(hydrate(data, new Map(), { adapters: [adapterMock] })).toStrictEqual({ aaa: 'bbb' });
    expect(canPackMock).toHaveBeenCalledTimes(0);
    expect(packMock).toHaveBeenCalledTimes(0);
    expect(unpackMock).toHaveBeenCalledTimes(1);

    const arg = unpackMock.mock.calls[0][0];

    expect(arg.bbb).toBe(data);
  });

  test('ignores deserializer if it returns undefined', () => {
    const adapterMock2: SerializationAdapter = {
      tag: 222,
      canPack: () => true,
      pack: () => undefined,
      unpack: () => 'xxx',
    };

    const data = { aaa: [222, 'bbb'] };

    expect(hydrate(data, new Map(), { adapters: [adapterMock, adapterMock2] })).toStrictEqual({ aaa: 'xxx' });
    expect(canPackMock).toHaveBeenCalledTimes(0);
    expect(packMock).toHaveBeenCalledTimes(0);
    expect(unpackMock).toHaveBeenCalledTimes(1);
  });

  test('throws if no adapter deserialized the value', () => {
    expect(() => hydrate({ aaa: [222, 'bbb'] }, new Map(), {})).toThrow(new Error('No adapter for tag: 222'));
  });
});
