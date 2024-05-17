const enum Type {
  TYPE_BASE = 1,

  REFERENCE = TYPE_BASE,
  UNDEFINED,
  NAN,
  POSITIVE_INFINITY,
  NEGATIVE_INFINITY,
  BIGINT,
  DATE,
  REGEXP,
  ARRAY,
  SET,
  MAP,

  TYPE_CUTOFF,
}

export interface StringifyOptions {
  preserveUndefined?: boolean;
  stable?: boolean;
}

const defaultOptions: StringifyOptions = {
  preserveUndefined: false,
  stable: false,
};

export function stringify(value: any, options?: StringifyOptions): string | undefined {
  return dehydrate(value, new Map(), options || defaultOptions);
}

export function parse(json: string | undefined): any {
  if (json === null || json === undefined) {
    return json;
  }
  return hydrate(JSON.parse(json), new Map());
}

function dehydrate(value: any, refs: Map<any, number>, options: StringifyOptions): string | undefined {
  if (value === null) {
    return 'null';
  }

  if (value === undefined) {
    if (options.preserveUndefined) {
      return '[' + Type.UNDEFINED + ']';
    }
    return;
  }

  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  if (typeof value === 'number') {
    if (value !== value) {
      return '[' + Type.NAN + ']';
    }
    if (value === Infinity) {
      return '[' + Type.POSITIVE_INFINITY + ']';
    }
    if (value === -Infinity) {
      return '[' + Type.NEGATIVE_INFINITY + ']';
    }
    return value.toString();
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'bigint') {
    return '[' + Type.BIGINT + ',' + value + ']';
  }

  if (typeof value.toJSON === 'function') {
    return dehydrate(value.toJSON(), refs, options);
  }

  if (typeof value === 'function' || typeof value === 'symbol') {
    return undefined;
  }

  if (
    value instanceof String ||
    value instanceof Number ||
    value instanceof Boolean ||
    (typeof BigInt !== 'undefined' && value instanceof BigInt) ||
    (typeof Symbol !== 'undefined' && value instanceof Symbol)
  ) {
    return dehydrate(value.valueOf(), refs, options);
  }

  const ref = refs.get(value);

  if (ref !== undefined) {
    return '[' + Type.REFERENCE + ',' + ref + ']';
  }

  refs.set(value, refs.size);

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }

    let json = '';

    for (let i = 0; i < value.length; ++i) {
      if (i !== 0) {
        json += ',';
      }
      json += dehydrate(value[i], refs, options) || 'null';
    }

    const item0 = value[0];

    if (typeof item0 !== 'number' || (item0 | 0) !== item0 || item0 < Type.TYPE_BASE || item0 >= Type.TYPE_CUTOFF) {
      return '[' + json + ']';
    }
    return '[' + Type.ARRAY + ',[' + json + ']]';
  }

  if (value instanceof Date) {
    return '[' + Type.DATE + ',' + value.getTime() + ']';
  }

  if (value instanceof RegExp) {
    return '[' + Type.REGEXP + ',' + JSON.stringify(value.source) + ']';
  }

  if (value instanceof Set) {
    if (value.size === 0) {
      return '[' + Type.SET + ']';
    }

    let json = '';
    let separated = false;

    if (options.stable) {
      const items = [];

      for (const item of value) {
        const itemJson = dehydrate(value, refs, options);
        if (itemJson !== undefined) {
          items.push(item);
        }
      }

      separated = items.length !== 0;

      if (separated) {
        items.sort();
        json = items.join(',');
      }
    } else {
      for (const item of value) {
        const itemJson = dehydrate(item, refs, options);
        if (itemJson === undefined) {
          continue;
        }
        if (separated) {
          json += ',';
        }
        separated = true;
        json += itemJson;
      }
    }

    if (separated) {
      return '[' + Type.SET + ',[' + json + ']]';
    }
    return '[' + Type.SET + ']';
  }

  if (value instanceof Map) {
    if (value.size === 0) {
      return '[' + Type.MAP + ']';
    }

    let json = '';
    let separated = false;

    if (options.stable) {
      const items = [];

      for (const key of value.keys()) {
        const keyJson = dehydrate(key, refs, options);
        if (keyJson === undefined) {
          continue;
        }

        const valueJson = dehydrate(value.get(key), refs, options);
        if (valueJson === undefined) {
          continue;
        }

        items.push('[' + keyJson + ',' + valueJson + ']');
      }

      separated = items.length !== 0;

      if (separated) {
        items.sort();
        json = items.join(',');
      }
    } else {
      for (const key of value.keys()) {
        const keyJson = dehydrate(key, refs, options);
        if (keyJson === undefined) {
          continue;
        }

        const valueJson = dehydrate(value.get(key), refs, options);
        if (valueJson === undefined) {
          continue;
        }
        if (separated) {
          json += ',';
        }
        separated = true;
        json += '[' + keyJson + ',' + valueJson + ']';
      }
    }

    if (separated) {
      return '[' + Type.MAP + ',[' + json + ']]';
    }
    return '[' + Type.MAP + ']';
  }

  const keys = Object.keys(value);

  if (keys.length === 0) {
    return '{}';
  }

  if (options.stable) {
    keys.sort();
  }

  let json = '{';
  let separated = false;

  for (let i = 0; i < keys.length; ++i) {
    const valueJson = dehydrate(value[keys[i]], refs, options);
    if (valueJson === undefined) {
      continue;
    }
    if (separated) {
      json += ',';
    }
    separated = true;
    json += dehydrate(keys[i], refs, options) + ':' + valueJson;
  }

  return json + '}';
}

function hydrate(value: any, refs: Map<number, any>): any {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (!Array.isArray(value)) {
    refs.set(refs.size, value);

    for (const key in value) {
      const item = value[key];

      if (item !== null && typeof item === 'object') {
        value[key] = hydrate(item, refs);
      }
    }

    return value;
  }

  if (value.length === 0) {
    refs.set(refs.size, value);
    return value;
  }

  const item0 = value[0];

  if (typeof item0 !== 'number' || (item0 | 0) !== item0 || item0 < Type.TYPE_BASE || item0 >= Type.TYPE_CUTOFF) {
    refs.set(refs.size, value);
    return value;
  }

  switch (item0) {
    case Type.REFERENCE:
      return refs.get(value[1]);

    case Type.UNDEFINED:
      return undefined;

    case Type.NAN:
      return NaN;

    case Type.POSITIVE_INFINITY:
      return Infinity;

    case Type.NEGATIVE_INFINITY:
      return -Infinity;

    case Type.BIGINT:
      return BigInt(value[1]);

    case Type.DATE:
      value = new Date(value[1]);
      refs.set(refs.size, value);
      return value;

    case Type.REGEXP:
      value = new RegExp(value[1]);
      refs.set(refs.size, value);
      return value;

    case Type.ARRAY:
      value = value[1];
      refs.set(refs.size, value);

      for (let i = 0; i < value.length; i++) {
        value[i] = hydrate(value[i], refs);
      }
      return value;

    case Type.SET: {
      if (value.length === 1) {
        value = new Set();
        refs.set(refs.size, value);
        return value;
      }

      const items = value[1];

      value = new Set();
      refs.set(refs.size, value);

      for (const item of items) {
        value.add(hydrate(item, refs));
      }
      return value;
    }

    case Type.MAP: {
      if (value.length === 1) {
        value = new Map();
        refs.set(refs.size, value);
        return value;
      }

      const items = value[1];

      value = new Map();
      refs.set(refs.size, value);

      for (const item of items) {
        value.set(hydrate(item[0], refs), hydrate(item[1], refs));
      }
      return value;
    }
  }
}
