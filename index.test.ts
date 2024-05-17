import { parse, stringify } from './index';
import testJson from './test.json';

describe('stringify', () => {
  test('circular 1', () => {
    const aaa: any = {};
    aaa.bbb = aaa;

    expect(stringify(aaa)).toBe('{"bbb":[1,0]}');
  });

  test('circular 2', () => {
    const aaa: any = {};
    aaa.bbb = {};
    aaa.bbb.ccc = aaa;

    expect(stringify(aaa)).toBe('{"bbb":{"ccc":[1,0]}}');
  });

  test('circular MAP', () => {
    const aaa = new Map();

    aaa.set(aaa, aaa);

    expect(stringify(aaa)).toBe('[11,[[[1,0],[1,0]]]]');
  });

  test('circular Set', () => {
    const aaa = new Set();

    aaa.add(aaa);

    expect(stringify(aaa)).toBe('[10,[[1,0]]]');
  });

  test('sibling duplicate', () => {
    const aaa: any = {};
    aaa.bbb = {};
    aaa.ccc = aaa.bbb;

    expect(stringify(aaa)).toBe('{"bbb":{},"ccc":[1,1]}');
  });

  test('array', () => {
    // expect(stringify([])).toBe('[]');
    // expect(stringify([111])).toBe('[111]');
    expect(stringify([1])).toBe('[9,[1]]');
  });

  test('Map', () => {
    expect(stringify(new Map())).toBe('[11]');
    expect(stringify(new Map().set(111, 'aaa').set(222, 'bbb'))).toBe('[11,[[111,"aaa"],[222,"bbb"]]]');
  });

  test('Set', () => {
    expect(stringify(new Set())).toBe('[10]');
    expect(stringify(new Set([111, 222]))).toBe('[10,[111,222]]');
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

  test('circular MAP', () => {
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
});
