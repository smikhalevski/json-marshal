const testJson = require('../../test.json');
const jsonMarshal = require('json-marshal');
const fastJsonStableStringify = require('fast-json-stable-stringify');

describe('stringify', () => {
  test('JSON', measure => {
    measure(() => {
      JSON.stringify(testJson);
    });
  });

  test('fast-json-stable-stringify', measure => {
    measure(() => {
      fastJsonStableStringify(testJson);
    });
  });

  test('json-marshal / stable', measure => {
    const options = { stable: true };

    measure(() => {
      jsonMarshal.stringify(testJson, options);
    });
  });

  test('json-marshal / unstable', measure => {
    measure(() => {
      jsonMarshal.stringify(testJson);
    });
  });
});

describe('parse', () => {
  test('JSON', measure => {
    const json = JSON.stringify(testJson);

    measure(() => {
      JSON.parse(json);
    });
  });

  test('json-marshal', measure => {
    const json = jsonMarshal.stringify(testJson);

    measure(() => {
      jsonMarshal.parse(json);
    });
  });
});
