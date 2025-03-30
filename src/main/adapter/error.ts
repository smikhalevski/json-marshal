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
import { SerializationAdapter } from '../types';
import { TAG_ERROR } from '../constants';

const enum Kind {
  ERROR,
  EVAL_ERROR,
  RANGE_ERROR,
  REFERENCE_ERROR,
  SYNTAX_ERROR,
  TYPE_ERROR,
  URI_ERROR,
  DOM_EXCEPTION,
}

export default function errorAdapter(): SerializationAdapter {
  return adapter;
}

const adapter: SerializationAdapter<Error, [name: string, message: string, kind: Kind]> = {
  tag: TAG_ERROR,

  isSupported(value) {
    return value instanceof Error || (typeof DOMException !== 'undefined' && value instanceof DOMException);
  },

  pack(value, _options) {
    let kind: Kind;

    if (value instanceof DOMException) {
      kind = Kind.DOM_EXCEPTION;
    } else if (value instanceof EvalError) {
      kind = Kind.EVAL_ERROR;
    } else if (value instanceof RangeError) {
      kind = Kind.RANGE_ERROR;
    } else if (value instanceof ReferenceError) {
      kind = Kind.REFERENCE_ERROR;
    } else if (value instanceof SyntaxError) {
      kind = Kind.SYNTAX_ERROR;
    } else if (value instanceof TypeError) {
      kind = Kind.TYPE_ERROR;
    } else if (value instanceof URIError) {
      kind = Kind.URI_ERROR;
    } else {
      kind = Kind.ERROR;
    }

    return [value.name, value.message, kind];
  },

  unpack(payload, _options) {
    const name = payload[0];
    const message = payload[1];
    const kind = payload[2];

    if (kind === Kind.DOM_EXCEPTION) {
      return new DOMException(message, name);
    }

    let error;

    if (kind === Kind.EVAL_ERROR) {
      error = new EvalError(message);
    } else if (kind === Kind.RANGE_ERROR) {
      error = new RangeError(message);
    } else if (kind === Kind.REFERENCE_ERROR) {
      error = new ReferenceError(message);
    } else if (kind === Kind.SYNTAX_ERROR) {
      error = new SyntaxError(message);
    } else if (kind === Kind.TYPE_ERROR) {
      error = new TypeError(message);
    } else if (kind === Kind.URI_ERROR) {
      error = new URIError(message);
    } else {
      error = new Error(message);
    }

    if (error.name === name) {
      error.name = name;
    }

    return error;
  },
};
