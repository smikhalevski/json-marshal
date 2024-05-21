import { parse, stringify } from '../main';
import testJson from './test.json';
import arrayBufferAdapter from '../main/adapter/arrayBuffer';

describe('stringify', () => {
  test('circular 1', () => {
    const aaa: any = {};
    aaa.bbb = aaa;

    expect(stringify(aaa)).toBe('{"bbb":[0,0]}');
  });

  test('circular 2', () => {
    const aaa: any = {};
    aaa.bbb = {};
    aaa.bbb.ccc = aaa;

    expect(stringify(aaa)).toBe('{"bbb":{"ccc":[0,0]}}');
  });

  test('circular Map', () => {
    const aaa = new Map();

    aaa.set(aaa, aaa);

    expect(stringify(aaa)).toBe('[10,[[[0,0],[0,0]]]]');
  });

  test('circular Set', () => {
    const aaa = new Set();

    aaa.add(aaa);

    expect(stringify(aaa)).toBe('[9,[[0,0]]]');
  });

  test('sibling duplicate', () => {
    const aaa: any = {};
    aaa.bbb = {};
    aaa.ccc = aaa.bbb;

    expect(stringify(aaa)).toBe('{"bbb":{},"ccc":[0,1]}');
  });

  test('array', () => {
    expect(stringify([])).toBe('[]');
    expect(stringify(['aaa'])).toBe('["aaa"]');
    expect(stringify([111])).toBe('[8,[111]]');
    expect(stringify([-222])).toBe('[-222]');
  });

  test('Map', () => {
    expect(stringify(new Map())).toBe('[10]');
    expect(stringify(new Map().set(111, 'aaa').set(222, 'bbb'))).toBe('[10,[[111,"aaa"],[222,"bbb"]]]');
  });

  test('Set', () => {
    expect(stringify(new Set())).toBe('[9]');
    expect(stringify(new Set([111, 222]))).toBe('[9,[111,222]]');
  });

  test('ArrayBuffer', () => {
    expect(stringify(new ArrayBuffer(5), { adapters: [arrayBufferAdapter()] })).toBe('[23,"AAAAAAA="]');
  });

  test('BigUint64Array', () => {
    const aaa = new BigUint64Array([
      BigInt('111111111111111111111111111111'),
      BigInt('222222222222222222222222222222'),
    ]);

    expect(stringify(aaa, { adapters: [arrayBufferAdapter()] })).toBe('[21,"x3EcBxrFfrKO4zgONIr9ZA=="]');
  });
});

describe('parse', () => {
  test('test', () => {
    expect(parse(stringify(testJson))).toEqual(testJson);
  });

  test('string', () => {
    expect(parse(stringify('aaa'))).toBe('aaa');
  });

  test('NaN', () => {
    expect(parse(stringify(NaN))).toBe(NaN);
  });

  test('circular 1', () => {
    const aaa: any = {};
    aaa.bbb = aaa;

    const xxx = parse(stringify(aaa));

    expect(Object.keys(xxx)).toEqual(['bbb']);
    expect(xxx.bbb).toBe(xxx);
  });

  test('circular 2', () => {
    const aaa: any = {};
    aaa.bbb = {};
    aaa.bbb.ccc = aaa;

    const xxx = parse(stringify(aaa));

    expect(xxx.bbb.ccc).toBe(xxx);
  });

  test('circular Map', () => {
    const aaa = new Map();

    aaa.set(aaa, aaa);

    const xxx = parse(stringify(aaa));

    expect(xxx.get(xxx)).toBe(xxx);
  });

  test('circular Set', () => {
    const aaa = new Set();

    aaa.add(aaa);

    const xxx = parse(stringify(aaa));

    expect(xxx.size).toBe(1);
    expect(Array.from(xxx)[0]).toBe(xxx);
  });

  test('ArrayBuffer', () => {
    const aaa = new ArrayBuffer(5);
    const xxx = parse(stringify(aaa, { adapters: [arrayBufferAdapter()] }), {
      adapters: [arrayBufferAdapter()],
    });

    expect(xxx).toBeInstanceOf(ArrayBuffer);
    expect(xxx.byteLength).toBe(aaa.byteLength);
  });

  test('BigUint64Array', () => {
    const aaa = new BigUint64Array([
      BigInt('111111111111111111111111111111'),
      BigInt('222222222222222222222222222222'),
    ]);
    const xxx = parse(stringify(aaa, { adapters: [arrayBufferAdapter()] }), {
      adapters: [arrayBufferAdapter()],
    });

    expect(xxx).toBeInstanceOf(BigUint64Array);
    expect(xxx.length).toBe(2);
    expect(xxx[0]).toBe(aaa[0]);
    expect(xxx[1]).toBe(aaa[1]);
  });
});
