# JSON Marshal

JSON serializer that can stringify and parse any data type.

```sh
npm install --save-prod json-marshal
```

- Supports circular references.
- Serialization redundancy is zero: never serializes the same object twice.
- Supports stable serialization.
- [Can serialize anything via adapters.](#serialization-adapters)
- Supports many data types out-of-the-box:
  - `undefined` `NaN` `Infinity` `BigInt` `Date` `RegExp` `Map` and `Set`.
  - [Typed arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects),
    [`DataView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView) and
    [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).
  - [Errors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error), including
    [`DOMException`](https://developer.mozilla.org/en-US/docs/Web/API/DOMException).
  - `Symbol` values are discarded by default, but you can add support with
    a [custom adapter](#authoring-a-serialization-adapter).
- [It is _very_ fast.](#performance)
- [1 kB gzipped.](https://bundlephobia.com/package/json-marshal)
- Zero dependencies.

```ts
import JSONMarshal from 'json-marshal';

const json = JSONMarshal.stringify({ hello: /Old/g });
// ⮕ '{"hello":[7,"Old","g"]}'

JSONMarshal.parse(json)
// ⮕ { hello: /Old/g }
```

# Overview

The default export provides a serializer that can be used as a drop-in replacement for
[`JSON`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON):

```ts
import JSONMarshal from 'json-marshal';

JSONMarshal.stringify('Hello');
// ⮕ '"Hello"'
```

Import [`parse`](https://smikhalevski.github.io/json-marshal/functions/json_marshal.parse.html) and
[`stringify`](https://smikhalevski.github.io/json-marshal/functions/json_marshal.stringify.html) function separately to
have a fine-grained control over serialization:

```ts
import { stringify, parse, SerializationOptions } from 'json-marshal';
import regexpAdapter from 'json-marshal/adapter/regexp';

const options: SerializationOptions = {
  adapters: [regexpAdapter()]
};

const json = serialize({ hello: /Old/g }, options);
// ⮕ '{"hello":[7,"Old","g"]}'

parse(json, options);
// ⮕ { hello: /Old/g }
```

Or create a custom serializer:

```ts
import { createSerializer } from 'json-marshal';

const serializer = createSerializer({ adapters: [regexpAdapter()] });

serializer.stringify(/Old/g);
// ⮕ '[7,"Old","g"]'
```

JSON Marshal supports circular references:

```ts
const gunslinger = {};

// Circular reference
gunslinger.bill = gunslinger;

serialize(hello);
// ⮕ '{"bill":[0,0]}'
```

Out-of-the-box `undefined`, `NaN`, `Infinity`, and `BigInt` can be stringified:

```ts
stringify(undefined);
// ⮕ '[1]'

stringify(1_000_000n);
// ⮕ '[5,"1000000"]'
```

By default, object properties with `undefined` values aren't serialized. Override this with
`undefinedPropertyValuesPreserved` option:

```ts
const gunslinger = { hello: undefined };

stringify(gunslinger);
// ⮕ '{}'

stringify(gunslinger, { undefinedPropertyValuesPreserved: true });
// ⮕ '{"hello":[1]}'
```

All objects are always serialized only once and then referenced if needed, so no excessive serialization is performed.
This results in a smaller output and faster serialization/deserialization times in [comparison to peers](#performance):

```ts
import { stringify } from 'json-marshal';

const gunslinger = { hello: 'bill' };

const gang = [gunslinger, gunslinger, gunslinger];

JSON.stringify(gang);
// ⮕ '[{"hello":"bill"},{"hello":"bill"},{"hello":"bill"}]'

stringify(gang);
// ⮕ [{"hello":"bill"},[0,1],[0,1]]
```

By default, object property keys appear in the serialized string in the same order they were added to the object:

```ts
stringify({ kill: 'Bill', hello: 'Greg' });
// ⮕ '{"kill":"Bill","hello":"Greg"}'
```

Provide `stable` option to sort keys in alphabetical order:

```ts
stringify({ kill: 'Bill', hello: 'Greg' }, { stable: true });
// ⮕ '{"hello":"Greg","kill":"Bill"}'
```

# Serialization adapters

By default, only enumerable object properties are stringified:

```ts
stringify({ hello: 'Bob' });
// ⮕ '{"hello":"Bob"}'

stringify(new ArrayBuffer(10));
// ⮕ '{}'
```

Provide a serialization adapter that supports the required object type to enhance serialization:

```ts
import { stringify } from 'json-marshal';
import arrayBufferAdapter from 'json-marshal/adapter/array-buffer';

const json = stringify(new ArrayBuffer(10), { adapters: [arrayBufferAdapter()] });
// ⮕ '[23,"AAAAAAAAAAAAAA=="]'
```

When deserializing, the same adapters must be provided, or an error would be thrown:

```ts
import { parse } from 'json-marshal';

parse(json);
// ❌ Error: Unrecognized tag: 23

parse(json, { adapters: [arrayBufferAdapter()] });
// ⮕ ArrayBuffer(10)
```

## Built-in adapters

Built-in adapters can be imported as `json-marshal/adapter/*`:

```ts
import arrayBufferAdapter from 'json-marshal/adapter/array-buffer';

stringify(new ArrayBuffer(10), { adapters: [arrayBufferAdapter()] });
```

<dl>
<dt><code>array-buffer</code></dt>
<dd>

Serializes [typed arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects),
[`DataView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView)
and [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)
instances as Base64-encoded string.

</dd>
<dt><code>date</code></dt>
<dd>

Serializes `Date` instances.

</dd>
<dt><code>error</code></dt>
<dd>

Serializes [`DOMException`](https://developer.mozilla.org/en-US/docs/Web/API/DOMException),
[`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error),
[`EvalError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/EvalError),
[`RangeError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RangeError),
[`ReferenceError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ReferenceError),
[`SyntaxError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SyntaxError),
[`TypeError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError), and
[`URIError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/URIError).

</dd>
<dt><code>map</code></dt>
<dd>

Serializes `Map` instances. If `stable` option is provided, `Map` keys are sorted in alphabetical order.

</dd>
<dt><code>regexp</code></dt>
<dd>

Serializes `RegExp` instances.

</dd>
<dt><code>set</code></dt>
<dd>

Serializes `Set` instances. If `stable` option is provided, `Set` items are sorted in alphabetical order.

</dd>
</dl>

## Authoring a serialization adapter

You can create custom adapters for your object types. For example, let's create a `Date` adapter:

```ts
import { SerializationAdapter } from 'json-marshal';

const DATE_TAG = 222;

const dateAdapter: SerializationAdapter = {

  getTag: (value, options) =>
    value instanceof Date ? DATE_TAG : undefined,

  getPayload: (tag, value, options) =>
    value.getTime(),

  getValue: (tag, dehydratedPayload, options) =>
    tag === DATE_TAG ? new Date(dehydratedPayload) : undefined,
};
```

During serialization, each object is passed to the `getTag` method. It must return the unique tag (a positive integer)
of the value type, or `undefined` if the adapter doesn't recognize the type of the given value.

Then the `getPayload` method is used to convert the value into a serializable form. The payload returned from the
`getPayload` method is stringified. During stringification, payloads are dehydrated: circular references and reused
references are replaced with tags. For example, the tag that references the second object during the depth-first
traversal looks kile this: `[0,1]`.

During deserialization, `getValue` method receives the dehydrated payload along with its tag and must return a
deserialized value, or `undefined` if deserialization isn't supported for the given tag. If `getValue` returns a
non-`undefined` value, a `hydrateValue` method is called. It receives a value created by `getValue` and the hydrated
payload that can be used to enrich the original value.

For example, if you're deserializing a `Set` instance, then `new Set()` must be returned from the `getValue`, and in
`hydrateValue` items from the hydrated payload should be added to the set. This approach allows to hydrate cyclic
references in an arbitrary object. If value hydration isn't required (like in the example with `Date` serialization),
`hydrateValue` method can be omitted.

Let's use our `dateAdapter`:

```ts
import { stringify, parse } from 'json-marshal';

const json = stringify({ today: new Date() }, { adapters: [dateAdapter] });
// ⮕ '{"today":[222,1716291110044]}'

parse(json, { adapters: [dateAdapter] });
// ⮕ { today: Date }
```

Return `DISCARDED` from the `getPayload` method to exclude the provided value from being stringified. For example,
lets write an adapter that
serializes [runtime-wide symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/for)
and discards local symbols.

```ts
import { DISCARDED, stringify, SerializationAdapter } from 'json-marshal';

const SYMBOL_TAG = 333;

const symbolAdapter: SerializationAdapter = {

  getTag: (value, options) =>
    typeof value === 'symbol' ? SYMBOL_TAG : undefined,

  // 🟡 Only runtime-wide symbols are serialized
  getPayload: (tag, value, options) =>
    Symbol.for(value.description) === value ? value.description : DISCARDED,

  getValue: (tag, dehydratedPayload, options) =>
    tag === SYMBOL_TAG ? Symbol.for(dehydratedPayload) : undefined,
};
```

Runtime-wide symbols can now be serialized with `symbolAdapter`:

```ts
stringify([Symbol.for('hello')], { adapters: [symbolAdapter] });
// ⮕ '[[333,"hello"]]'

// 🟡 Local symbol is discarded in serialized data
stringify([Symbol('goodbye')], { adapters: [symbolAdapter] });
// ⮕ '[]'
```

# Performance

The chart below showcases the performance comparison of JSON Marshal and its peers, in terms of thousands of operations
per second (greater is better).

<p align="center"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/perf-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="./assets/perf-light.svg" />
  <img alt="Performance comparison chart" src="./assets/perf-light.svg" />
</picture></p>

Tests were conducted using [TooFast](https://github.com/smikhalevski/toofast#readme) on Apple M1 with Node.js v22.2.0.

To reproduce [the performance test suite](./src/test/index.perf.js) results, clone this repo and run:

```shell
npm ci
npm run build
npm run perf
```
