export type Deflated<T> = { [K in keyof T]: T[K] extends object ? unknown : T[K] };

export interface SerializationAdapter<Value = any, Payload = any> {
  /**
   * The unique integer tag of the value type.
   */
  tag: number;

  /**
   * Returns `true` if the adapter can pack the {@link value}.
   *
   * @param value The value to get the type tag of.
   * @param options Serialization options.
   */
  isSupported(value: any, options: SerializationOptions): boolean;

  /**
   * Converts value into a serializable payload.
   *
   * The returned payload is dehydrated before serialization, so it can contain complex data structures and cyclic
   * references. The payload is dehydrated during serialization. If the value itself is returned from this method, then
   * the serialization would proceed as if no adapters were applied.
   *
   * @param value The value for which payload must be produced.
   * @param options Serialization options.
   * @returns The payload that is dehydrated and serialized.
   */
  pack(value: Value, options: SerializationOptions): Payload | undefined;

  /**
   * Returns the shallow value to which circular references from the payload may point. Otherwise, returns `undefined`
   * if the adapter doesn't recognize the given tag.
   *
   * @param payload The payload that isn't hydrated yet.
   * @param options Serialization options.
   */
  unpack(payload: Deflated<Payload>, options: SerializationOptions): Value;

  /**
   * Hydrates the value that was previously returned from the {@link unpack} method.
   *
   * @param value The value returned from the {@link unpack} method.
   * @param payload The hydrated payload.
   * @param options Serialization options.
   */
  hydrate?(value: Value, payload: Payload, options: SerializationOptions): void;
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
