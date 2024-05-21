# json-marshal

JSON serializer that can stringify and parse any data structure.

- Supports circular references.
- Supports `undefined`, `NaN`, `Infinity`, `BigInt`, `Map` and `Set` out-of-the-box.
- Doesn't serialize same object twice, no redundancy.
- Supports stable serialization.
- [Can serialize anything via adapters.](#serialization-adapters)
- [It is _very_ fast.](#performance)
- [1.2 kB gzipped.](https://bundlephobia.com/package/json-marshal)
- Zero dependencies.

```ts
import { stringify, parse, StringifyOptions } from 'json-marshal';
import regexpAdapter from 'json-marshal/adapter/regexp';

const options: StringifyOptions = {
  adapters: [regexpAdapter()]
};

const json = serialize({ hello: /Old/g }, options);
// ⮕ '{"hello":[7,"Old","g"]}'

parse(json, options);
// ⮕ { hello: /Old/g }
```

# Overview

Circular references:

```ts
const gunslinger = {};

// Circular reference
gunslinger.bill = gunslinger;

serialize(hello);
// ⮕ '{"bill":[0,0]}'
```

Out-of-the-box `undefined`, `NaN`, `Infinity`, `BigInt`, `Map` and `Set` can be stringified:

```ts
stringify(undefined);
// ⮕ '[1]'

stringify(new Map().add('hello', 'Bill'));
// ⮕ '[10,[["hello","Bill"]]]'
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

By default, object property keys, `Map` keys, and `Set` items appear in the serialized string in the same order they
were added:

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

By default, if a provided object isn't a `Map` or a `Set`, it is serialized as a regular object:

```ts
stringify(new ArrayBuffer(10));
// ⮕ '{}'
```

Provide a serialization adapter that supports the required object type:

```ts
import { stringify } from 'json-marshal';
import arrayBufferAdapter from 'json-marshal/adapter/arrayBuffer';

const json = stringify(new ArrayBuffer(10), { adapters: [arrayBufferAdapter()] });
// ⮕ '[23,"AAAAAAAAAAAAAA=="]'
```

When deserializing, the same adapters must be provided, or an error is thrown:

```ts
import { parse } from 'json-marshal';

parse(json);
// ❌ Error: Unrecognized tag: 23

parse(json, { adapters: [arrayBufferAdapter()] });
// ⮕ ArrayBuffer(10)
```

## Built-in adapters

Built-in adapters are imported like this:

```ts
import arrayBufferAdapter from 'json-marshal/adapter/arrayBuffer';

stringify(new ArrayBuffer(10), { adapters: [arrayBufferAdapter()] });
```

<dl>
<dt><code>arrayBuffer</code></dt>
<dd>

Serializes [typed arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects),
[`DataView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView)
and [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)
instances as Base64-encoded string.

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
<dt><code>date</code></dt>
<dd>

Serializes `Date` instances.

</dd>
<dt><code>regexp</code></dt>
<dd>

Serializes `RegExp` instances.

</dd>
</dl>

## Authoring a serialization adapter

You can create custom adapters for your object types. For example, let's create a `Date` adapter:

```ts
import { SerializationAdapter } from 'json-marshal';

const DATE_TAG = 222;

const dateAdapter: SerializationAdapter = {

  getTag: value => value instanceof Date ? DATE_TAG : -1,

  serialize: (tag, value) => value.getTime(),

  deserialize: (tag, data) => tag === DATE_TAG ? new Date(data) : undefined,
};
```

During serialization, each object is passed to the `getTag` method. If it returns a positive integer value then a
`serialize` method is used to serialize the object. The value returned from the `serialize` method is further
stringified.

During deserialization, `deserialize` method receives serialized data along with its tag and must return a
deserialized value, or `undefined` if deserialization isn't supported for the given tag.

```ts
import { stringify, parse } from 'json-marshal';

const json = stringify({ today: new Date() }, { adapters: [dateAdapter] });
// ⮕ '{"today":[222,1716291110044]}'

parse(json, { adapters: [dateAdapter] });
// ⮕ { today: Date }
```

Return `DISCARDED` from the `serialize` method to exclude the provided value from being stringified. For example,
lets write an adapter that
serializes [runtime-wide symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/for)
and discards local symbols.

```ts
import { DISCARDED, stringify, SerializationAdapter } from 'json-marshal';

const SYMBOL_TAG = 333;

const symbolAdapter: SerializationAdapter = {

  getTag: value => typeof value === 'symbol' ? SYMBOL_TAG : -1,

  // 🟡 Only runtime-wide symbols are serialized
  serialize: (tag, value) =>
    Symbol.for(value.description) === value ? value.description : DISCARDED,

  deserialize: (tag, data) =>
    tag === SYMBOL_TAG ? Symbol.for(data) : undefined,
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

The chart below showcases the performance comparison of JSON Marshal and its peers, in terms of millions of operations
per second (greater is better).

<p align="center"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/perf-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="./assets/perf-light.svg" />
  <img alt="Performance comparison chart" src="./assets/perf-light.svg" />
</picture></p>

Tests were conducted using [TooFast](https://github.com/smikhalevski/toofast#readme) on Apple M1 with Node.js v20.4.0.

To reproduce [the performance test suite](./src/test/index.perf.js) results, clone this repo and run:

```shell
npm ci
npm run build
npm run perf
```
