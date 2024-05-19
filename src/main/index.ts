import { dehydrate } from './dehydrate';
import { hydrate } from './hydrate';

export interface StringifyOptions {
  /**
   * If `true` then `undefined` values are encoded during serialization.
   *
   * @default false
   */
  preserveUndefined?: boolean;

  /**
   * If `true` then object keys, `Set` items, and `Map` entries are sorted during serialization.
   *
   * @default false
   */
  stable?: boolean;
}

export function stringify(value: any, options?: StringifyOptions): string {
  return dehydrate(value, new Map(), options || stringifyOptions)!;
}

export function parse(json: string | undefined): any {
  if (json === null || json === undefined) {
    return json;
  }
  return hydrate(JSON.parse(json), new Map());
}

const stringifyOptions: StringifyOptions = {
  preserveUndefined: false,
  stable: false,
};
