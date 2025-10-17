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
import { SerializationAdapter } from '../types.js';
import { TAG_ERROR } from '../constants.js';

export default function errorAdapter(): SerializationAdapter {
  return adapter;
}

const KIND_ERROR = 0;
const KIND_EVAL_ERROR = 1;
const KIND_RANGE_ERROR = 2;
const KIND_REFERENCE_ERROR = 3;
const KIND_SYNTAX_ERROR = 4;
const KIND_TYPE_ERROR = 5;
const KIND_URI_ERROR = 6;
const KIND_DOM_EXCEPTION = 7;

const adapter: SerializationAdapter<Error, [name: string, message: string, kind: number]> = {
  tag: TAG_ERROR,

  canPack(value) {
    return value instanceof Error || (typeof DOMException !== 'undefined' && value instanceof DOMException);
  },

  pack(value, _options) {
    let kind: number;

    if (value instanceof DOMException) {
      kind = KIND_DOM_EXCEPTION;
    } else if (value instanceof EvalError) {
      kind = KIND_EVAL_ERROR;
    } else if (value instanceof RangeError) {
      kind = KIND_RANGE_ERROR;
    } else if (value instanceof ReferenceError) {
      kind = KIND_REFERENCE_ERROR;
    } else if (value instanceof SyntaxError) {
      kind = KIND_SYNTAX_ERROR;
    } else if (value instanceof TypeError) {
      kind = KIND_TYPE_ERROR;
    } else if (value instanceof URIError) {
      kind = KIND_URI_ERROR;
    } else {
      kind = KIND_ERROR;
    }

    return [value.name, value.message, kind];
  },

  unpack(payload, _options) {
    const name = payload[0];
    const message = payload[1];
    const kind = payload[2];

    if (kind === KIND_DOM_EXCEPTION) {
      return new DOMException(message, name);
    }

    let error;

    if (kind === KIND_EVAL_ERROR) {
      error = new EvalError(message);
    } else if (kind === KIND_RANGE_ERROR) {
      error = new RangeError(message);
    } else if (kind === KIND_REFERENCE_ERROR) {
      error = new ReferenceError(message);
    } else if (kind === KIND_SYNTAX_ERROR) {
      error = new SyntaxError(message);
    } else if (kind === KIND_TYPE_ERROR) {
      error = new TypeError(message);
    } else if (kind === KIND_URI_ERROR) {
      error = new URIError(message);
    } else {
      error = new Error(message);
    }

    if (error.name !== name) {
      error.name = name;
    }

    return error;
  },
};
