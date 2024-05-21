import { dehydrate, DISCARDED } from './dehydrate';
import { hydrate } from './hydrate';
import { Tag } from './Tag';
import type { ParseOptions, StringifyOptions } from './types';

export { DISCARDED } from './dehydrate';
export type { StringifyOptions, ParseOptions, SerializationAdapter } from './types';

const serializationOptions: StringifyOptions = {
  adapters: undefined,
  stable: false,
  undefinedPropertyValuesPreserved: false,
};

export function stringify(value: any, options?: StringifyOptions): string {
  const valueStr = dehydrate(value, new Map(), options || serializationOptions);

  return valueStr !== DISCARDED ? valueStr : '[' + Tag.UNDEFINED + ']';
}

export function parse(str: string, options?: ParseOptions): any {
  return hydrate(JSON.parse(str), new Map(), options || serializationOptions);
}
