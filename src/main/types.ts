/**
 * The adapter enables serialization of custom value types.
 */
export interface SerializationAdapter {
  /**
   * Returns the positive integer tag that uniquely identifies the value type.
   *
   * @param value The value that is being serialized.
   */
  getTag(value: any): number;

  /**
   * Returns the serialized object representation.
   *
   * @param tag The tag returned by {@link getTag} for the given value.
   * @param value The value that is being serialized.
   */
  serialize(tag: number, value: any): any;

  /**
   * Returns the deserialized value or `undefined` if value cannot be deserialized.
   *
   * **Note:** This function may receive tags that were produced by a different adapter and must return `undefined` if
   * tag isn't recognized.
   *
   * @param tag The tag that defines the value type.
   * @param data The serialized value.
   */
  deserialize(tag: number, data: any): any;
}

/**
 * Options of {@link stringify}.
 */
export interface StringifyOptions {
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

/**
 * Options of {@link parse}.
 */
export interface ParseOptions {
  /**
   * The array of adapters that are applied during serialization.
   */
  adapters?: SerializationAdapter[];
}
