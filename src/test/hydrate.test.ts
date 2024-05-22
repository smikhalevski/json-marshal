import type { SerializationAdapter } from '../main';
import setAdapter from '../main/adapter/set';
import { hydrate } from '../main/hydrate';
import { Tag } from '../main/Tag';

describe('hydrate', () => {
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
      const value = { aaa: [Tag.UNDEFINED] };

      const xxx = hydrate(value, new Map(), {});

      expect(xxx).toBe(value);
      expect(value.aaa).toBeUndefined();
    });

    test('hydrates references in object properties', () => {
      const value = { aaa: [Tag.REF, 0] };

      const xxx = hydrate(value, new Map(), {});

      expect(xxx).toBe(value);
      expect(xxx.aaa).toBe(xxx);
    });

    test('hydrates sibling references in object properties', () => {
      const value = { aaa: {}, bbb: [Tag.REF, 1] };

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
      const value = ['aaa', [Tag.REF, 0]];

      const xxx = hydrate(value, new Map(), {});

      expect(xxx).toBe(value);
      expect(xxx[1]).toBe(xxx);
      expect(xxx).toStrictEqual(['aaa', xxx]);
    });

    test('hydrates tagged array', () => {
      const value = [Tag.ARRAY, [111, [Tag.UNDEFINED]]];

      const xxx = hydrate(value, new Map(), {});

      expect(xxx).toBe(value[1]);
      expect(xxx).toStrictEqual([111, undefined]);
    });

    test('hydrates item references in tagged array', () => {
      const value = [Tag.ARRAY, [111, [Tag.REF, 0]]];

      const xxx = hydrate(value, new Map(), {});

      expect(xxx).toBe(value[1]);
      expect(xxx[1]).toBe(xxx);
      expect(xxx).toStrictEqual([111, xxx]);
    });
  });

  describe('ref', () => {
    test('hydrates circular references', () => {
      const xxx = hydrate({ aaa: { bbb: [Tag.REF, 1] } }, new Map(), {});

      expect(xxx.aaa.bbb).toBe(xxx.aaa);
    });

    test('hydrates sibling references', () => {
      const xxx = hydrate({ aaa: {}, bbb: [Tag.REF, 1] }, new Map(), {});

      expect(xxx.bbb).toBe(xxx.aaa);
    });

    test('throws if reference is not found', () => {
      expect(() => hydrate({ aaa: [Tag.REF, 1] }, new Map(), {})).toThrow(new Error("Reference isn't hydrated: 1"));
    });
  });

  describe('undefined', () => {
    test('hydrates undefined', () => {
      expect(hydrate([Tag.UNDEFINED], new Map(), {})).toBeUndefined();
    });
  });

  describe('number', () => {
    test('hydrates NaN', () => {
      expect(hydrate([Tag.NAN], new Map(), {})).toBe(NaN);
    });

    test('hydrates Infinity', () => {
      expect(hydrate([Tag.POSITIVE_INFINITY], new Map(), {})).toBe(Infinity);
      expect(hydrate([Tag.NEGATIVE_INFINITY], new Map(), {})).toBe(-Infinity);
    });
  });

  describe('bigint', () => {
    test('hydrates bigint', () => {
      expect(hydrate([Tag.BIGINT, '111'], new Map(), {})).toBe(BigInt(111));
    });
  });

  describe('adapters', () => {
    const getTagMock = jest.fn();
    const serializeMock = jest.fn();
    const getValueMock = jest.fn();

    const adapterMock: SerializationAdapter = {
      getTag: getTagMock,
      getPayload: serializeMock,
      getValue: getValueMock,
    };

    beforeEach(() => {
      getTagMock.mockRestore();
      serializeMock.mockRestore();
      getValueMock.mockRestore();
    });

    test('hydrates tagged value', () => {
      const options = { adapters: [adapterMock] };

      getValueMock.mockReturnValueOnce('bbb');

      expect(hydrate([222, 'aaa'], new Map(), options)).toBe('bbb');
      expect(getTagMock).toHaveBeenCalledTimes(0);
      expect(serializeMock).toHaveBeenCalledTimes(0);
      expect(getValueMock).toHaveBeenCalledTimes(1);
      expect(getValueMock).toHaveBeenNthCalledWith(1, 222, 'aaa', options);
    });

    test('deserializer receives a hydrated value', () => {
      getValueMock.mockReturnValueOnce('bbb');

      const data = { aaa: [222, { bbb: [Tag.REF, 0] }] };

      expect(hydrate(data, new Map(), { adapters: [adapterMock] })).toStrictEqual({ aaa: 'bbb' });
      expect(getTagMock).toHaveBeenCalledTimes(0);
      expect(serializeMock).toHaveBeenCalledTimes(0);
      expect(getValueMock).toHaveBeenCalledTimes(1);

      const arg = getValueMock.mock.calls[0][1];

      expect(arg.bbb).toBe(data);
    });

    test('ignores deserializer if it returns undefined', () => {
      const adapterMock2: SerializationAdapter = {
        getTag: () => -111,
        getPayload: () => undefined,
        getValue: () => 'xxx',
      };

      const data = { aaa: [222, 'bbb'] };

      expect(hydrate(data, new Map(), { adapters: [adapterMock, adapterMock2] })).toStrictEqual({ aaa: 'xxx' });
      expect(getTagMock).toHaveBeenCalledTimes(0);
      expect(serializeMock).toHaveBeenCalledTimes(0);
      expect(getValueMock).toHaveBeenCalledTimes(1);
    });

    test('throws if no adapter deserialized the value', () => {
      expect(() => hydrate({ aaa: [222, 'bbb'] }, new Map(), {})).toThrow(new Error('Unrecognized tag: 222'));
    });
  });
});
