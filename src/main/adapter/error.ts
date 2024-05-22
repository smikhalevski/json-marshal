/**
 * Serializes {@link !DOMException DOMException}, {@link !Error Error}, {@link !EvalError EvalError},
 * {@link !RangeError RangeError}, {@link !ReferenceError ReferenceError}, {@link !SyntaxError SyntaxError},
 * {@link !TypeError TypeError}, and {@link !URIError URIError}.
 *
 * ```ts
 * import errorAdapter from 'json-marshal/adapter/error';
 * ```
 *
 * @module adapter/error
 */
import { Tag } from '../Tag';
import type { SerializationAdapter } from '../types';

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
    } else if (value instanceof RangeError) {
      return Tag.RANGE_ERROR;
    } else if (value instanceof ReferenceError) {
      return Tag.REFERENCE_ERROR;
    } else if (value instanceof SyntaxError) {
      return Tag.SYNTAX_ERROR;
    } else if (value instanceof TypeError) {
      return Tag.TYPE_ERROR;
    } else if (value instanceof URIError) {
      return Tag.URI_ERROR;
    } else {
      return Tag.ERROR;
    }
  },

  getPayload(tag, value, _options) {
    return tag === Tag.DOM_EXCEPTION ? [value.name, value.message] : value.message;
  },

  getValue(tag, dehydratedPayload, _options) {
    switch (tag) {
      case Tag.DOM_EXCEPTION:
        return new DOMException(dehydratedPayload[1], dehydratedPayload[0]);

      case Tag.EVAL_ERROR:
      case Tag.RANGE_ERROR:
      case Tag.REFERENCE_ERROR:
      case Tag.SYNTAX_ERROR:
      case Tag.TYPE_ERROR:
      case Tag.URI_ERROR:
      case Tag.ERROR:
        return new constructors[tag](dehydratedPayload[0]);
    }
  },
};

const constructors = {
  [Tag.ERROR]: Error,
  [Tag.EVAL_ERROR]: EvalError,
  [Tag.RANGE_ERROR]: RangeError,
  [Tag.REFERENCE_ERROR]: ReferenceError,
  [Tag.SYNTAX_ERROR]: SyntaxError,
  [Tag.TYPE_ERROR]: TypeError,
  [Tag.URI_ERROR]: URIError,
};
