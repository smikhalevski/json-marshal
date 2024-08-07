import JSONMarshal, { parse, stringify } from '../main';
import arrayBufferAdapter from '../main/adapter/array-buffer';
import dateAdapter from '../main/adapter/date';
import errorAdapter from '../main/adapter/error';
import mapAdapter from '../main/adapter/map';
import regexpAdapter from '../main/adapter/regexp';
import setAdapter from '../main/adapter/set';
import testValue from './test.json';

test('test.json', () => {
  expect(parse(stringify(testValue))).toStrictEqual(testValue);
});

test('circular object 1', () => {
  const aaa: any = {};
  aaa.bbb = aaa;

  expect(stringify(aaa)).toBe('{"bbb":[0,0]}');

  const xxx = parse(stringify(aaa));

  expect(xxx.bbb).toBe(xxx);
});

test('circular object 2', () => {
  const aaa: any = {};
  aaa.bbb = {};
  aaa.bbb.ccc = aaa;

  expect(stringify(aaa)).toBe('{"bbb":{"ccc":[0,0]}}');

  const xxx = parse(stringify(aaa));

  expect(xxx.bbb.ccc).toBe(xxx);
});

test('sibling object reference', () => {
  const aaa: any = {};
  aaa.bbb = {};
  aaa.ccc = aaa.bbb;

  expect(stringify(aaa)).toBe('{"bbb":{},"ccc":[0,1]}');

  const xxx = parse(stringify(aaa));

  expect(xxx.ccc).toBe(xxx.bbb);
});

test('circular Set 1', () => {
  const aaa = new Set();
  aaa.add(aaa);

  const options = { adapters: [setAdapter()] };

  expect(stringify(aaa, options)).toBe('[9,[[0,0]]]');

  const xxx = parse(stringify(aaa, options), options);

  expect(xxx).toStrictEqual(new Set([xxx]));
});

test('circular Set 2', () => {
  const aaa = { bbb: new Set() };
  aaa.bbb.add(aaa);

  const options = { adapters: [setAdapter()] };

  expect(stringify(aaa, options)).toBe('{"bbb":[9,[[0,0]]]}');

  const xxx = parse(stringify(aaa, options), options);

  expect(xxx).toStrictEqual({ bbb: new Set([xxx]) });
});

test('circular Set 3', () => {
  const aaa = { bbb: new Set() };
  aaa.bbb.add(aaa.bbb);

  const options = { adapters: [setAdapter()] };

  expect(stringify(aaa, options)).toBe('{"bbb":[9,[[0,1]]]}');

  const xxx = parse(stringify(aaa, options), options);

  expect(xxx).toStrictEqual({ bbb: new Set([xxx.bbb]) });
});

test('sibling Set', () => {
  const aaa = { bbb: new Set(), ccc: { ddd: 111 } };
  aaa.bbb.add(aaa.ccc);

  const options = { adapters: [setAdapter()] };

  expect(stringify(aaa, options)).toBe('{"bbb":[9,[{"ddd":111}]],"ccc":[0,3]}');

  const xxx = parse(stringify(aaa, options), options);

  expect(xxx).toStrictEqual({ bbb: new Set([xxx.ccc]), ccc: { ddd: 111 } });
});

test('Set payload dehydration', () => {
  const aaa = new Set();
  const bbb = { ccc: new Set([aaa]), ddd: aaa };
  aaa.add(bbb);

  const options = { adapters: [setAdapter()] };

  expect(stringify(bbb, options)).toBe('{"ccc":[9,[[9,[[0,0]]]]],"ddd":[0,3]}');

  const xxx = parse(stringify(bbb, options), options);

  expect(xxx).toStrictEqual({ ccc: new Set([xxx.ddd]), ddd: new Set([xxx]) });
});

test('Set stable serialization', () => {
  const aaa = new Set([{ bbb: 111 }, { aaa: 222 }]);

  expect(stringify(aaa, { adapters: [setAdapter()] })).toBe('[9,[{"bbb":111},{"aaa":222}]]');

  expect(stringify(aaa, { adapters: [setAdapter()], stable: true })).toBe('[9,[{"aaa":222},{"bbb":111}]]');
});

test('Map payload dehydration', () => {
  const aaa = new Map();
  const bbb = { bbb: aaa };
  aaa.set(bbb, { ccc: bbb });

  const options = { adapters: [mapAdapter()] };

  expect(stringify(aaa, options)).toBe('[10,[[{"bbb":[0,0]},{"ccc":[0,3]}]]]');

  const xxx = parse(stringify(aaa, options), options);

  expect(xxx).toBeInstanceOf(Map);
  expect(Array.from(xxx)).toStrictEqual([[{ bbb: xxx }, { ccc: { bbb: xxx } }]]);
});

test('Uint8Array dehydration', () => {
  const aaa = new TextEncoder().encode('aaa bbb ccc').buffer;

  const options = { adapters: [arrayBufferAdapter()] };

  expect(stringify(aaa, options)).toBe('[23,"YWFhIGJiYiBjY2M="]');

  const xxx = parse(stringify(aaa, options), options);

  expect(xxx).toStrictEqual(aaa);
});

test('BigUint64Array dehydration', () => {
  const aaa = new BigUint64Array([BigInt(111), BigInt(222)]);

  const options = { adapters: [arrayBufferAdapter()] };

  expect(stringify(aaa, options)).toBe('[21,"bwAAAAAAAADeAAAAAAAAAA=="]');

  const xxx = parse(stringify(aaa, options), options);

  expect(xxx).toStrictEqual(aaa);
});

test('DOMException dehydration', () => {
  const aaa = new DOMException('aaa', 'AbortError');

  const options = { adapters: [errorAdapter()] };

  expect(stringify(aaa, options)).toBe('[31,["AbortError","aaa"]]');

  const xxx = parse(stringify(aaa, options), options);

  expect(xxx).toBeInstanceOf(DOMException);
  expect(xxx.message).toBe('aaa');
  expect(xxx.name).toBe('AbortError');
});

test('RegExp dehydration', () => {
  const aaa = /aaa/g;

  const options = { adapters: [regexpAdapter()] };

  expect(stringify(aaa, options)).toBe('[7,["aaa","g"]]');

  const xxx = parse(stringify(aaa, options), options);

  expect(xxx).toStrictEqual(aaa);
});

test('Date dehydration', () => {
  const aaa = new Date(20070101);

  const options = { adapters: [dateAdapter()] };

  expect(stringify(aaa, options)).toBe('[6,20070101]');

  const xxx = parse(stringify(aaa, options), options);

  expect(xxx).toStrictEqual(aaa);
});

test('multiple adapters', () => {
  const aaa = /aaa/g;
  const bbb = new Date(20070101);

  const options = { adapters: [regexpAdapter(), dateAdapter()] };

  expect(stringify([aaa, bbb], options)).toBe('[[7,["aaa","g"]],[6,20070101]]');

  const xxx = parse(stringify([aaa, bbb], options), options);

  expect(xxx).toStrictEqual([aaa, bbb]);
});

test('default export', () => {
  expect(JSONMarshal.stringify(new Error('aaa'))).toBe('[24,"aaa"]');

  const error1 = new Error('aaa');
  error1.name = 'Bbb';

  expect(JSONMarshal.stringify(error1)).toBe('[24,["Bbb","aaa"]]');

  const error2 = JSONMarshal.parse(JSONMarshal.stringify(error1));

  expect(error2).toBeInstanceOf(Error);
  expect(error2.name).toBe('Bbb');

  expect(JSONMarshal.stringify(Symbol())).toBe('[1]');
  expect(JSONMarshal.stringify({ aaa: Symbol() })).toBe('{}');
});
