/**
 * Serializes {@link !DOMException}, {@link !Error}, {@link !EvalError}, {@link !RangeError}, {@link !ReferenceError},
 * {@link !SyntaxError}, {@link !TypeError}, and {@link !URIError}.
 *
 * ```ts
 * import { stringify } from 'json-marshal';
 * import errorAdapter from 'json-marshal/adapter/error';
 *
 * stringify(new Error(), { adapters: [errorAdapter()] });
 * ```
 *
 * @module adapter/error
 */
import { Tag } from '../Tag';
import { SerializationAdapter } from '../types';

export default function errorAdapter(): SerializationAdapter {
  return adapter;
}

const adapter: SerializationAdapter = {
  getTag(value, _options) {
    if (typeof DOMException !== 'undefined' && value instanceof DOMException) {
      return Tag.DOM_EXCEPTION;
    }
    if (!(value instanceof Error)) {
      return undefined;
    }
    if (value instanceof EvalError) {
      return Tag.EVAL_ERROR;
    }
    if (value instanceof RangeError) {
      return Tag.RANGE_ERROR;
    }
    if (value instanceof ReferenceError) {
      return Tag.REFERENCE_ERROR;
    }
    if (value instanceof SyntaxError) {
      return Tag.SYNTAX_ERROR;
    }
    if (value instanceof TypeError) {
      return Tag.TYPE_ERROR;
    }
    if (value instanceof URIError) {
      return Tag.URI_ERROR;
    }
    return Tag.ERROR;
  },

  getPayload(tag, value, _options) {
    if (tag === Tag.DOM_EXCEPTION) {
      return [value.name, value.message];
    }
    if (tag !== Tag.ERROR || value.name === 'Error') {
      return value.message;
    }
    return [value.name, value.message];
  },

  getValue(tag, dehydratedPayload, _options) {
    switch (tag) {
      case Tag.EVAL_ERROR:
      case Tag.RANGE_ERROR:
      case Tag.REFERENCE_ERROR:
      case Tag.SYNTAX_ERROR:
      case Tag.TYPE_ERROR:
      case Tag.URI_ERROR:
        return new constructors[tag](dehydratedPayload);

      case Tag.DOM_EXCEPTION:
        if (typeof DOMException !== 'undefined') {
          return new DOMException(dehydratedPayload[1], dehydratedPayload[0]);
        }
      // fallthrough

      case Tag.ERROR:
        if (typeof dehydratedPayload === 'string') {
          return new Error(dehydratedPayload);
        }

        const error = new Error(dehydratedPayload[1]);
        error.name = dehydratedPayload[0];
        return error;
    }
  },
};

const constructors = {
  [Tag.EVAL_ERROR]: EvalError,
  [Tag.RANGE_ERROR]: RangeError,
  [Tag.REFERENCE_ERROR]: ReferenceError,
  [Tag.SYNTAX_ERROR]: SyntaxError,
  [Tag.TYPE_ERROR]: TypeError,
  [Tag.URI_ERROR]: URIError,
};
