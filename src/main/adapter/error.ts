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
    if (DOMExceptionConstructor !== undefined && value instanceof DOMExceptionConstructor) {
      return Tag.DOM_EXCEPTION;
    }
    if (!(value instanceof ErrorConstructor)) {
      return undefined;
    }
    if (value instanceof EvalErrorConstructor) {
      return Tag.EVAL_ERROR;
    }
    if (value instanceof RangeErrorConstructor) {
      return Tag.RANGE_ERROR;
    }
    if (value instanceof ReferenceErrorConstructor) {
      return Tag.REFERENCE_ERROR;
    }
    if (value instanceof SyntaxErrorConstructor) {
      return Tag.SYNTAX_ERROR;
    }
    if (value instanceof TypeErrorConstructor) {
      return Tag.TYPE_ERROR;
    }
    if (value instanceof URIErrorConstructor) {
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
        if (DOMExceptionConstructor !== undefined) {
          return new DOMExceptionConstructor(dehydratedPayload[1], dehydratedPayload[0]);
        }
      // fallthrough

      case Tag.ERROR:
        if (typeof dehydratedPayload === 'string') {
          return new ErrorConstructor(dehydratedPayload);
        }

        const error = new ErrorConstructor(dehydratedPayload[1]);
        error.name = dehydratedPayload[0];
        return error;
    }
  },
};

const DOMExceptionConstructor = typeof DOMException !== 'undefined' ? DOMException : undefined;
const EvalErrorConstructor = EvalError;
const RangeErrorConstructor = RangeError;
const ReferenceErrorConstructor = ReferenceError;
const SyntaxErrorConstructor = SyntaxError;
const TypeErrorConstructor = TypeError;
const URIErrorConstructor = URIError;
const ErrorConstructor = Error;

const constructors = {
  [Tag.EVAL_ERROR]: EvalErrorConstructor,
  [Tag.RANGE_ERROR]: RangeErrorConstructor,
  [Tag.REFERENCE_ERROR]: ReferenceErrorConstructor,
  [Tag.SYNTAX_ERROR]: SyntaxErrorConstructor,
  [Tag.TYPE_ERROR]: TypeErrorConstructor,
  [Tag.URI_ERROR]: URIErrorConstructor,
};
