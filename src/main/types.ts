/**
 * Dehydrated value, where references aren't yet resolved.
 */
export type Dehydrated<T> = { [K in keyof T]: T[K] extends object ? unknown : T[K] };

/**
 * Adapter that serializes/deserializes {@link Value} as a {@link Payload}.
 *
 * @template Value The value to serialize.
 * @template Payload The payload that describes {@link Value}.
 */
export interface SerializationAdapter<Value = any, Payload = any> {
  /**
   * The integer tag of the value type.
   *
   * Tags must be unique among adapters that participate in serialization.
   */
  tag: number;

  /**
   * Returns `true` if the adapter can {@link pack} the {@link value}.
   *
   * @param value The value to get the type tag of.
   * @param options Serialization options.
   */
  isSupported(value: any, options: Readonly<SerializationOptions>): boolean;

  /**
   * Converts value into a serializable payload.
   *
   * The returned payload is dehydrated before serialization, so it can contain complex data structures and cyclic
   * references. If the value itself is returned from this method, then the serialization would proceed as if adapter
   * wasn't applied.
   *
   * If `undefined` is returned then {@link value} isn't serialized.
   *
   * @param value The value for which a payload must be produced.
   * @param options Serialization options.
   * @returns The payload that is dehydrated and serialized.
   */
  pack(value: Value, options: Readonly<SerializationOptions>): Payload | undefined;

  /**
   * Returns the shallow value to which circular references from the payload may point.
   *
   * @param payload The payload that isn't hydrated yet (references aren't resolved yet).
   * @param options Serialization options.
   */
  unpack(payload: Dehydrated<Payload>, options: Readonly<SerializationOptions>): Value;

  /**
   * Hydrates the value that was previously returned from the {@link unpack} method.
   *
   * @param value The value returned from the {@link unpack} method.
   * @param payload The hydrated payload.
   * @param options Serialization options.
   */
  hydrate?(value: Value, payload: Payload, options: Readonly<SerializationOptions>): void;
}

export interface SerializationOptions {
  /**
   * The array of adapters that are applied during serialization.
   */
  adapters?: SerializationAdapter[];

  /**
   * If `true` then keys are sorted during serialization.
   *
   * @default false
   */
  isStable?: boolean;

  /**
   * If `true` then object properties that have an `undefined` value are serialized.
   *
   * @default false
   */
  isUndefinedPropertyValuesPreserved?: boolean;
}
