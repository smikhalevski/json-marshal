import { SerializationAdapter } from '../main';
import mapAdapter from '../main/adapter/map';
import setAdapter from '../main/adapter/set';
import { dehydrate, DISCARDED } from '../main/dehydrate';

describe('stringify', () => {
  describe('discarded', () => {
    test('stringified as undefined', () => {
      expect(dehydrate(DISCARDED, new Map(), {})).toBe(DISCARDED);
    });
  });

  describe('null', () => {
    test('stringified as null', () => {
      expect(dehydrate(null, new Map(), {})).toBe('null');
    });
  });

  describe('undefined', () => {
    test('stringified as tag', () => {
      expect(dehydrate(undefined, new Map(), {})).toBe('[1]');
    });
  });

  describe('string', () => {
    test('stringified as JSON', () => {
      expect(dehydrate('aaa', new Map(), {})).toBe('"aaa"');
      expect(dehydrate('\n\t', new Map(), {})).toBe('"\\n\\t"');
    });

    test('boxed value is unwrapped', () => {
      expect(dehydrate(new String('aaa'), new Map(), {})).toBe('"aaa"');
    });
  });

  describe('number', () => {
    test('NaN', () => {
      expect(dehydrate(NaN, new Map(), {})).toBe('[2]');
    });

    test('Infinity', () => {
      expect(dehydrate(Infinity, new Map(), {})).toBe('[3]');
      expect(dehydrate(-Infinity, new Map(), {})).toBe('[4]');
    });

    test('stringifies String', () => {
      expect(dehydrate(111, new Map(), {})).toBe('111');
      expect(dehydrate(1e10, new Map(), {})).toBe('10000000000');
      expect(dehydrate(1e50, new Map(), {})).toBe('1e+50');
    });

    test('boxed value is unwrapped', () => {
      expect(dehydrate(new Number(111), new Map(), {})).toBe('111');
    });
  });

  describe('boolean', () => {
    test('stringifies as boolean', () => {
      expect(dehydrate(true, new Map(), {})).toBe('true');
      expect(dehydrate(false, new Map(), {})).toBe('false');
    });

    test('boxed value is unwrapped', () => {
      expect(dehydrate(new Boolean(true), new Map(), {})).toBe('true');
    });
  });

  describe('bigint', () => {
    test('stringifies as tag', () => {
      expect(dehydrate(BigInt(111), new Map(), {})).toBe('[5,"111"]');
    });

    test('boxed value is unwrapped', () => {
      expect(dehydrate(Object(BigInt(111)), new Map(), {})).toBe('[5,"111"]');
    });
  });

  describe('function', () => {
    test('discarded', () => {
      expect(dehydrate(() => undefined, new Map(), {})).toBe(DISCARDED);
    });
  });

  describe('arrays', () => {
    test('zero-length array is stringified as is', () => {
      expect(dehydrate([], new Map(), {})).toBe('[]');
    });

    test('array with all items discarded is stringified as is', () => {
      expect(dehydrate([DISCARDED], new Map(), {})).toBe('[]');
      expect(dehydrate(['aaa', DISCARDED, '111'], new Map(), {})).toBe('["aaa","111"]');
    });

    test('arrays with tag-like first item is tagged', () => {
      expect(dehydrate([-111], new Map(), {})).toBe('[8,[-111]]');
      expect(dehydrate([111.222], new Map(), {})).toBe('[8,[111.222]]');
      expect(dehydrate([111], new Map(), {})).toBe('[8,[111]]');
      expect(dehydrate(['aaa'], new Map(), {})).toBe('["aaa"]');
    });

    test('ignores the stable flag', () => {
      expect(dehydrate(['bbb', 'aaa'], new Map(), { stable: true })).toBe('["bbb","aaa"]');
    });
  });

  describe('Set', () => {
    test('zero-size Set is stringified as a tag', () => {
      expect(dehydrate(new Set(), new Map(), { adapters: [setAdapter()] })).toBe('[9]');
    });

    test('Set with all items discarded is stringified as a tag', () => {
      expect(dehydrate(new Set([DISCARDED]), new Map(), { adapters: [setAdapter()] })).toBe('[9,[]]');
      expect(dehydrate(new Set(['aaa', DISCARDED, '111']), new Map(), { adapters: [setAdapter()] })).toBe(
        '[9,["aaa","111"]]'
      );
    });

    test('sorts items if the stable flag is provided', () => {
      expect(dehydrate(new Set(['bbb', 'aaa']), new Map(), { adapters: [setAdapter()] })).toBe('[9,["bbb","aaa"]]');
      expect(dehydrate(new Set(['bbb', 'aaa']), new Map(), { adapters: [setAdapter()], stable: true })).toBe(
        '[9,["aaa","bbb"]]'
      );
      expect(dehydrate(new Set(['bbb', DISCARDED, '111']), new Map(), { adapters: [setAdapter()], stable: true })).toBe(
        '[9,["111","bbb"]]'
      );
    });
  });

  describe('Map', () => {
    test('zero-size Map is stringified as a tag', () => {
      expect(dehydrate(new Map(), new Map(), { adapters: [mapAdapter()] })).toBe('[10]');
    });

    // test('entries with discarded keys are discarded', () => {
    //   expect(dehydrate(new Map([[DISCARDED, 'aaa']]), new Map(), { adapters: [mapAdapter()] })).toBe('[10]');
    // });
    //
    // test('entries with discarded values are discarded', () => {
    //   expect(dehydrate(new Map([['aaa', DISCARDED]]), new Map(), { adapters: [mapAdapter()] })).toBe('[10]');
    // });

    test('stringifies entries', () => {
      expect(dehydrate(new Map([['aaa', 'bbb']]), new Map(), { adapters: [mapAdapter()] })).toBe(
        '[10,[["aaa","bbb"]]]'
      );
    });

    test('sorts entries by key if the stable flag is provided', () => {
      const value = new Map([
        ['bbb', 111],
        ['aaa', 222],
      ]);

      expect(dehydrate(value, new Map(), { adapters: [mapAdapter()] })).toBe('[10,[["bbb",111],["aaa",222]]]');
      expect(dehydrate(value, new Map(), { adapters: [mapAdapter()], stable: true })).toBe(
        '[10,[["aaa",222],["bbb",111]]]'
      );
    });
  });

  describe('object', () => {
    test('stringifies empty object as is', () => {
      expect(dehydrate({}, new Map(), {})).toBe('{}');
    });

    test('stringifies object properties', () => {
      expect(dehydrate({ aaa: 111, bbb: 222 }, new Map(), {})).toBe('{"aaa":111,"bbb":222}');
    });

    test('discards properties with discarded values', () => {
      expect(dehydrate({ aaa: DISCARDED, bbb: 222 }, new Map(), {})).toBe('{"bbb":222}');
    });

    test('discards properties with undefined value', () => {
      expect(dehydrate({ aaa: undefined, bbb: 222 }, new Map(), {})).toBe('{"bbb":222}');
    });

    test('preserves properties with undefined value', () => {
      expect(dehydrate({ aaa: undefined, bbb: 222 }, new Map(), { undefinedPropertyValuesPreserved: true })).toBe(
        '{"aaa":[1],"bbb":222}'
      );
    });

    test('sorts properties by key if the stable flag is provided', () => {
      expect(dehydrate({ bbb: 222, aaa: 111 }, new Map(), {})).toBe('{"bbb":222,"aaa":111}');
      expect(dehydrate({ bbb: 222, aaa: 111 }, new Map(), { stable: true })).toBe('{"aaa":111,"bbb":222}');
    });
  });

  describe('adapter', () => {
    const getTagMock = jest.fn();
    const getPayloadMock = jest.fn();
    const getValueMock = jest.fn();

    const adapterMock: SerializationAdapter = {
      getTag: getTagMock,
      getPayload: getPayloadMock,
      getValue: getValueMock,
    };

    beforeEach(() => {
      getTagMock.mockRestore();
      getPayloadMock.mockRestore();
      getValueMock.mockRestore();
    });

    test('throws if adapter returns non-number tag', () => {
      getTagMock.mockReturnValueOnce('bbb');

      expect(() => dehydrate({}, new Map(), { adapters: [adapterMock] })).toThrow(new Error('Illegal tag: bbb'));
    });

    test('throws if adapter returns non-integer tag', () => {
      getTagMock.mockReturnValueOnce(111.222);

      expect(() => dehydrate({}, new Map(), { adapters: [adapterMock] })).toThrow(new Error('Illegal tag: 111.222'));
    });

    test('calls a serializer', () => {
      const value = {};
      const options = { adapters: [adapterMock] };

      getTagMock.mockReturnValueOnce(111);
      getPayloadMock.mockReturnValueOnce('aaa');

      expect(dehydrate(value, new Map(), options)).toBe('[111,"aaa"]');
      expect(getTagMock).toHaveBeenCalledTimes(1);
      expect(getPayloadMock).toHaveBeenCalledTimes(1);
      expect(getPayloadMock).toHaveBeenNthCalledWith(1, 111, value, options);
    });

    test('discards value is serializer returns DISCARDED', () => {
      const value = {};
      const options = { adapters: [adapterMock] };

      getTagMock.mockReturnValueOnce(111);
      getPayloadMock.mockReturnValueOnce(DISCARDED);

      expect(dehydrate(value, new Map(), options)).toBe(DISCARDED);
      expect(getTagMock).toHaveBeenCalledTimes(1);
      expect(getPayloadMock).toHaveBeenCalledTimes(1);
      expect(getPayloadMock).toHaveBeenNthCalledWith(1, 111, value, options);
    });

    test('proceeds with serialization if value is returned as is', () => {
      const value = { aaa: 111 };
      const options = { adapters: [adapterMock] };

      getTagMock.mockReturnValueOnce(111);
      getPayloadMock.mockReturnValueOnce(value);

      expect(dehydrate(value, new Map(), options)).toBe('{"aaa":111}');
      expect(getTagMock).toHaveBeenCalledTimes(1);
      expect(getPayloadMock).toHaveBeenCalledTimes(1);
      expect(getPayloadMock).toHaveBeenNthCalledWith(1, 111, value, options);
    });

    test('ignores serializer if a undefined is returned', () => {
      const adapterMock2: SerializationAdapter = {
        getTag: () => 333,
        getPayload: () => 'bbb',
        getValue: () => undefined,
      };

      const value = { aaa: 111 };

      getTagMock.mockReturnValueOnce(undefined);
      getPayloadMock.mockReturnValueOnce(value);

      expect(dehydrate(value, new Map(), { adapters: [adapterMock, adapterMock2] })).toBe('[333,"bbb"]');
      expect(getTagMock).toHaveBeenCalledTimes(1);
      expect(getPayloadMock).toHaveBeenCalledTimes(0);
    });

    test('serializer receives an object wrapper', () => {
      const value = new String();
      const options = { adapters: [adapterMock] };

      getTagMock.mockReturnValue(111);

      expect(dehydrate(value, new Map(), options)).toBe('[111]');

      expect(getPayloadMock).toHaveBeenCalledTimes(1);
      expect(getPayloadMock).toHaveBeenNthCalledWith(1, 111, value, options);
    });

    test('serializer receives a function', () => {
      const value = () => undefined;
      const options = { adapters: [adapterMock] };

      getTagMock.mockReturnValue(111);

      expect(dehydrate(value, new Map(), options)).toBe('[111]');

      expect(getPayloadMock).toHaveBeenCalledTimes(1);
      expect(getPayloadMock).toHaveBeenNthCalledWith(1, 111, value, options);
    });

    test('serializer receives a symbol', () => {
      const value = Symbol();
      const options = { adapters: [adapterMock] };

      getTagMock.mockReturnValue(111);

      expect(dehydrate(value, new Map(), options)).toBe('[111]');

      expect(getPayloadMock).toHaveBeenCalledTimes(1);
      expect(getPayloadMock).toHaveBeenNthCalledWith(1, 111, value, options);
    });

    test('adapter is called before toJSON', () => {
      const value = {
        toJSON: () => 'aaa',
      };
      const options = { adapters: [adapterMock] };

      getTagMock.mockReturnValue(111);

      expect(dehydrate(value, new Map(), options)).toBe('[111]');
      expect(getPayloadMock).toHaveBeenCalledTimes(1);
      expect(getPayloadMock).toHaveBeenNthCalledWith(1, 111, value, options);
    });
  });

  describe('toJSON', () => {
    test('calls to JSON', () => {
      const value = {
        toJSON: () => 'aaa',
      };

      expect(dehydrate(value, new Map(), {})).toBe('"aaa"');
    });
  });

  describe('ref', () => {
    test('dehydrates cyclic reference 1', () => {
      const aaa: any = {};
      aaa.aaa = aaa;

      expect(dehydrate(aaa, new Map(), {})).toBe('{"aaa":[0,0]}');
    });

    test('dehydrates cyclic reference 2', () => {
      const aaa: any = {};
      aaa.bbb = {};
      aaa.bbb.ccc = aaa;

      expect(dehydrate(aaa, new Map(), {})).toBe('{"bbb":{"ccc":[0,0]}}');
    });

    test('dehydrates same object only once', () => {
      const aaa: any = {};
      aaa.bbb = {};
      aaa.ccc = aaa.bbb;
      aaa.ddd = aaa.bbb;

      expect(dehydrate(aaa, new Map(), {})).toBe('{"bbb":{},"ccc":[0,1],"ddd":[0,1]}');
    });

    test('dehydrates objects as Map keys and values', () => {
      const aaa = {};
      const bbb = new Map().set(aaa, aaa);

      expect(dehydrate(bbb, new Map(), { adapters: [mapAdapter()] })).toBe('[10,[[{},[0,3]]]]');
    });

    test('offsets ref in siblings', () => {
      const aaa: any = {};
      aaa.bbb = {};
      aaa.ccc = {};
      aaa.ddd = aaa.ccc;

      expect(dehydrate(aaa, new Map(), {})).toBe('{"bbb":{},"ccc":{},"ddd":[0,2]}');
    });
  });
});
