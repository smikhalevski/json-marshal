import { dehydrate } from '../../main/dehydrate';
import mapAdapter from '../../main/adapter/map';
import { TAG_MAP } from '../../main/constants';

describe('Map', () => {
  test('zero-size Map is stringified as a tag', () => {
    expect(dehydrate(new Map(), new Map(), { adapters: [mapAdapter()] })).toBe('[' + TAG_MAP + ',[]]');
  });

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
