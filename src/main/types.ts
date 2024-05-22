export interface SerializationAdapter {
  /**
   * Returns the unique tag of the value type, or `undefined` if the adapter doesn't recognize the type of the given
   * value.
   *
   * @param value The value to get the type tag of.
   * @param options Serialization options.
   */
  getTag(value: any, options: SerializationOptions): number | undefined;

  /**
   * Converts value into a serializable payload.
   *
   * The returned payload is dehydrated before serialization, so it can contain complex data structures and cyclic
   * references. The payload is dehydrated during serialization. If the value itself is returned from this method, then
   * the serialization would proceed as if no adapters were applied.
   *
   * @param tag The tag returned by {@link getTag} for value.
   * @param value The value for which payload must be produced.
   * @param options Serialization options.
   * @returns The payload that is dehydrated and serialized.
   */
  getPayload(tag: number, value: any, options: SerializationOptions): any;

  /**
   * Returns the shallow value to which circular references from the payload may point. Otherwise, returns `undefined`
   * if the adapter doesn't recognize the given tag.
   *
   * @param tag The tag of the value type.
   * @param dehydratedPayload The payload that isn't hydrated yet.
   * @param options Serialization options.
   */
  getValue(tag: number, dehydratedPayload: any, options: SerializationOptions): any;

  /**
   * Hydrates the value that was previously returned from the {@link getValue} method.
   *
   * @param tag The tag of the value type.
   * @param value The value returned from the {@link getValue} method.
   * @param hydratedPayload The hydrated payload.
   * @param options Serialization options.
   */
  hydrateValue?(tag: number, value: any, hydratedPayload: any, options: SerializationOptions): void;
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
  stable?: boolean;

  /**
   * If `true` then object properties that have an `undefined` value are serialized.
   *
   * @default false
   */
  undefinedPropertyValuesPreserved?: boolean;
}
