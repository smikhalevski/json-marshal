import { describe, measure, test } from 'toofast';
import * as testJson from './test.json' with { type: 'json' };
import * as jsonMarshal from '../../lib/index.js';
import * as flatted from 'flatted';
import * as devalue from 'devalue';
import fastJsonStableStringify from 'fast-json-stable-stringify';

describe('stringify', () => {
  test('JSON', () => {
    measure(() => {
      JSON.stringify(testJson);
    });
  });

  test('fast-json-stable-stringify', () => {
    measure(() => {
      fastJsonStableStringify(testJson);
    });
  });

  test('flatted', () => {
    measure(() => {
      flatted.stringify(testJson);
    });
  });

  test('devalue', () => {
    measure(() => {
      devalue.stringify(testJson);
    });
  });

  test('json-marshal (all adapters, stable)', () => {
    const options = { isStable: true };

    measure(() => {
      jsonMarshal.default.stringify(testJson, options);
    });
  });

  test('json-marshal (all adapters, not stable)', () => {
    measure(() => {
      jsonMarshal.default.stringify(testJson);
    });
  });

  test('json-marshal (no adapters, stable)', () => {
    const options = { isStable: true };

    measure(() => {
      jsonMarshal.stringify(testJson, options);
    });
  });

  test('json-marshal (no adapters, not stable)', () => {
    measure(() => {
      jsonMarshal.stringify(testJson);
    });
  });
});

describe('parse', () => {
  test('JSON', () => {
    const json = JSON.stringify(testJson);

    measure(() => {
      JSON.parse(json);
    });
  });

  test('flatted', () => {
    const json = flatted.stringify(testJson);

    measure(() => {
      flatted.parse(json);
    });
  });

  test('devalue', () => {
    const json = devalue.stringify(testJson);

    measure(() => {
      devalue.parse(json);
    });
  });

  test('json-marshal (all adapters)', () => {
    const json = jsonMarshal.default.stringify(testJson);

    measure(() => {
      jsonMarshal.default.parse(json);
    });
  });

  test('json-marshal (no adapters)', () => {
    const json = jsonMarshal.stringify(testJson);

    measure(() => {
      jsonMarshal.parse(json);
    });
  });
});
