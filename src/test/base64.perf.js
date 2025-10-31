import { measure, test } from 'toofast';
import { browserEncodeBase64, browserDecodeBase64, encodeBase64, decodeBase64 } from '../../lib/base64.js';

const buffer = new Uint8Array(1024).fill(1024).buffer;
const base64 = browserEncodeBase64(buffer);

test('browserEncodeBase64', () => {
  measure(() => {
    browserEncodeBase64(buffer);
  });
});

test('browserDecodeBase64', () => {
  measure(() => {
    browserDecodeBase64(base64);
  });
});

test('encodeBase64', () => {
  measure(() => {
    encodeBase64(buffer);
  });
});

test('decodeBase64', () => {
  measure(() => {
    decodeBase64(base64);
  });
});
