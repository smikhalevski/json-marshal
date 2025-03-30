import { SerializationAdapter } from '../main';
import mapAdapter from '../main/adapter/map';
import setAdapter from '../main/adapter/set';
import { dehydrate } from '../main/dehydrate';
import {
  TAG_ARRAY,
  TAG_BIGINT,
  TAG_MAP,
  TAG_NAN,
  TAG_NEGATIVE_INFINITY,
  TAG_POSITIVE_INFINITY,
  TAG_REF,
  TAG_SET,
  TAG_UNDEFINED,
} from '../main/constants';

describe('stringify', () => {
  // describe('discarded', () => {
  //   test('stringified as undefined', () => {
  //     expect(dehydrate(undefined, new Map(), {})).toBe(undefined);
  //   });
  // });

  describe('null', () => {
    test('stringified as null', () => {
      expect(dehydrate(null, new Map(), {})).toBe('null');
    });
  });

  describe('undefined', () => {
    test('stringified as tag', () => {
      expect(dehydrate(undefined, new Map(), {})).toBe('[' + TAG_UNDEFINED + ']');
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
      expect(dehydrate(NaN, new Map(), {})).toBe('[' + TAG_NAN + ']');
    });

    test('Infinity', () => {
      expect(dehydrate(Infinity, new Map(), {})).toBe('[' + TAG_POSITIVE_INFINITY + ']');
      expect(dehydrate(-Infinity, new Map(), {})).toBe('[' + TAG_NEGATIVE_INFINITY + ']');
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
      expect(dehydrate(BigInt(111), new Map(), {})).toBe('[' + TAG_BIGINT + ',"111"]');
    });

    test('boxed value is unwrapped', () => {
      expect(dehydrate(Object(BigInt(111)), new Map(), {})).toBe('[' + TAG_BIGINT + ',"111"]');
    });
  });

  describe('function', () => {
    test('discarded', () => {
      expect(dehydrate(() => undefined, new Map(), {})).toBe(undefined);
    });
  });

  describe('arrays', () => {
    test('zero-length array is stringified as is', () => {
      expect(dehydrate([], new Map(), {})).toBe('[]');
    });

    test('array with all items discarded is stringified as is', () => {
      expect(dehydrate([undefined], new Map(), {})).toBe('[[' + TAG_UNDEFINED + ']]');
      expect(dehydrate(['aaa', undefined, '111'], new Map(), {})).toBe('["aaa",[' + TAG_UNDEFINED + '],"111"]');
    });

    test('arrays with tag-like first item is tagged', () => {
      expect(dehydrate([-111], new Map(), {})).toBe('[' + TAG_ARRAY + ',[-111]]');
      expect(dehydrate([111.222], new Map(), {})).toBe('[' + TAG_ARRAY + ',[111.222]]');
      expect(dehydrate([111], new Map(), {})).toBe('[' + TAG_ARRAY + ',[111]]');
      expect(dehydrate(['aaa'], new Map(), {})).toBe('["aaa"]');
    });

    test('ignores the stable flag', () => {
      expect(dehydrate(['bbb', 'aaa'], new Map(), { isStable: true })).toBe('["bbb","aaa"]');
    });
  });

  describe('Set', () => {
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
      expect(
        dehydrate(new Set(['bbb', undefined, '111']), new Map(), { adapters: [setAdapter()], isStable: true })
      ).toBe('[' + TAG_SET + ',["111","bbb",[' + TAG_UNDEFINED + ']]]');
    });
  });

  describe('Map', () => {
    test('zero-size Map is stringified as a tag', () => {
      expect(dehydrate(new Map(), new Map(), { adapters: [mapAdapter()] })).toBe('[' + TAG_MAP + ',[]]');
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
        '[' + TAG_MAP + ',[["aaa","bbb"]]]'
      );
    });

    test('sorts entries by key if the stable flag is provided', () => {
      const value = new Map([
        ['bbb', 111],
        ['aaa', 222],
      ]);

      expect(dehydrate(value, new Map(), { adapters: [mapAdapter()] })).toBe(
        '[' + TAG_MAP + ',[["bbb",111],["aaa",222]]]'
      );
      expect(dehydrate(value, new Map(), { adapters: [mapAdapter()], isStable: true })).toBe(
        '[' + TAG_MAP + ',[["aaa",222],["bbb",111]]]'
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
      expect(dehydrate({ aaa: undefined, bbb: 222 }, new Map(), {})).toBe('{"bbb":222}');
    });

    test('discards properties with undefined value', () => {
      expect(dehydrate({ aaa: undefined, bbb: 222 }, new Map(), {})).toBe('{"bbb":222}');
    });

    test('preserves properties with undefined value', () => {
      expect(dehydrate({ aaa: undefined, bbb: 222 }, new Map(), { isUndefinedPropertyValuesPreserved: true })).toBe(
        '{"aaa":[' + TAG_UNDEFINED + '],"bbb":222}'
      );
    });

    test('sorts properties by key if the stable flag is provided', () => {
      expect(dehydrate({ bbb: 222, aaa: 111 }, new Map(), {})).toBe('{"bbb":222,"aaa":111}');
      expect(dehydrate({ bbb: 222, aaa: 111 }, new Map(), { isStable: true })).toBe('{"aaa":111,"bbb":222}');
    });
  });

  describe('adapter', () => {
    const canPackMock = jest.fn();
    const packMock = jest.fn();
    const unpackMock = jest.fn();

    const adapterMock: SerializationAdapter = {
      tag: 111,
      canPack: canPackMock,
      pack: packMock,
      unpack: unpackMock,
    };

    beforeEach(() => {
      canPackMock.mockRestore();
      packMock.mockRestore();
      unpackMock.mockRestore();
    });

    test('calls a serializer', () => {
      const value = {};
      const options = { adapters: [adapterMock] };

      canPackMock.mockReturnValueOnce(111);
      packMock.mockReturnValueOnce('aaa');

      expect(dehydrate(value, new Map(), options)).toBe('[111,"aaa"]');
      expect(canPackMock).toHaveBeenCalledTimes(1);
      expect(packMock).toHaveBeenCalledTimes(1);
      expect(packMock).toHaveBeenNthCalledWith(1, value, options);
    });

    test('discards value is serializer returns DISCARDED', () => {
      const value = {};
      const options = { adapters: [adapterMock] };

      canPackMock.mockReturnValueOnce(111);
      packMock.mockReturnValueOnce(undefined);

      expect(dehydrate(value, new Map(), options)).toBe(undefined);
      expect(canPackMock).toHaveBeenCalledTimes(1);
      expect(packMock).toHaveBeenCalledTimes(1);
      expect(packMock).toHaveBeenNthCalledWith(1, value, options);
    });

    test('proceeds with serialization if value is returned as is', () => {
      const value = { aaa: 111 };
      const options = { adapters: [adapterMock] };

      canPackMock.mockReturnValueOnce(111);
      packMock.mockReturnValueOnce(value);

      expect(dehydrate(value, new Map(), options)).toBe('{"aaa":111}');
      expect(canPackMock).toHaveBeenCalledTimes(1);
      expect(packMock).toHaveBeenCalledTimes(1);
      expect(packMock).toHaveBeenNthCalledWith(1, value, options);
    });

    test('ignores serializer if a undefined is returned', () => {
      const adapterMock2: SerializationAdapter = {
        tag: 333,
        canPack: () => true,
        pack: () => 'bbb',
        unpack: () => undefined,
      };

      const value = { aaa: 111 };

      canPackMock.mockReturnValueOnce(undefined);
      packMock.mockReturnValueOnce(value);

      expect(dehydrate(value, new Map(), { adapters: [adapterMock, adapterMock2] })).toBe('[333,"bbb"]');
      expect(canPackMock).toHaveBeenCalledTimes(1);
      expect(packMock).toHaveBeenCalledTimes(0);
    });

    test('serializer receives an object wrapper', () => {
      const value = new String();
      const options = { adapters: [adapterMock] };

      canPackMock.mockReturnValue(true);
      packMock.mockReturnValue('xxx');

      expect(dehydrate(value, new Map(), options)).toBe('[111,"xxx"]');

      expect(packMock).toHaveBeenCalledTimes(1);
      expect(packMock).toHaveBeenNthCalledWith(1, value, options);
    });

    test('serializer receives a function', () => {
      const value = () => undefined;
      const options = { adapters: [adapterMock] };

      canPackMock.mockReturnValue(111);
      packMock.mockReturnValue('xxx');

      expect(dehydrate(value, new Map(), options)).toBe('[111,"xxx"]');

      expect(packMock).toHaveBeenCalledTimes(1);
      expect(packMock).toHaveBeenNthCalledWith(1, value, options);
    });

    test('serializer receives a symbol', () => {
      const value = Symbol();
      const options = { adapters: [adapterMock] };

      canPackMock.mockReturnValue(111);
      packMock.mockReturnValue('xxx');

      expect(dehydrate(value, new Map(), options)).toBe('[111,"xxx"]');

      expect(packMock).toHaveBeenCalledTimes(1);
      expect(packMock).toHaveBeenNthCalledWith(1, value, options);
    });

    test('adapter is called before toJSON', () => {
      const value = {
        toJSON: () => 'aaa',
      };
      const options = { adapters: [adapterMock] };

      canPackMock.mockReturnValue(111);
      packMock.mockReturnValue('xxx');

      expect(dehydrate(value, new Map(), options)).toBe('[111,"xxx"]');
      expect(packMock).toHaveBeenCalledTimes(1);
      expect(packMock).toHaveBeenNthCalledWith(1, value, options);
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

      expect(dehydrate(aaa, new Map(), {})).toBe('{"aaa":[' + TAG_REF + ',0]}');
    });

    test('dehydrates cyclic reference 2', () => {
      const aaa: any = {};
      aaa.bbb = {};
      aaa.bbb.ccc = aaa;

      expect(dehydrate(aaa, new Map(), {})).toBe('{"bbb":{"ccc":[' + TAG_REF + ',0]}}');
    });

    test('dehydrates same object only once', () => {
      const aaa: any = {};
      aaa.bbb = {};
      aaa.ccc = aaa.bbb;
      aaa.ddd = aaa.bbb;

      expect(dehydrate(aaa, new Map(), {})).toBe('{"bbb":{},"ccc":[' + TAG_REF + ',1],"ddd":[' + TAG_REF + ',1]}');
    });

    test('dehydrates objects as Map keys and values', () => {
      const aaa = {};
      const bbb = new Map().set(aaa, aaa);

      expect(dehydrate(bbb, new Map(), { adapters: [mapAdapter()] })).toBe(
        '[' + TAG_MAP + ',[[{},[' + TAG_REF + ',3]]]]'
      );
    });

    test('offsets ref in siblings', () => {
      const aaa: any = {};
      aaa.bbb = {};
      aaa.ccc = {};
      aaa.ddd = aaa.ccc;

      expect(dehydrate(aaa, new Map(), {})).toBe('{"bbb":{},"ccc":{},"ddd":[' + TAG_REF + ',2]}');
    });
  });
});
