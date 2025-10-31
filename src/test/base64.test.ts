import { expect, test } from 'vitest';
import { browserDecodeBase64, browserEncodeBase64 } from '../main/base64.js';

export function createRangeBuffer(): ArrayBuffer {
  const bytes = new Uint8Array(256);

  for (let i = 0; i < 256; i++) {
    bytes[i] = i;
  }
  return bytes.buffer;
}

test('browserEncodeBase64', () => {
  expect(browserEncodeBase64(new TextEncoder().encode('Hello world').buffer)).toBe('SGVsbG8gd29ybGQ=');
  expect(browserEncodeBase64(new TextEncoder().encode('Man').buffer)).toBe('TWFu');
  expect(browserEncodeBase64(new TextEncoder().encode('Ma').buffer)).toBe('TWE=');
  expect(browserEncodeBase64(new TextEncoder().encode('Hello worlds!').buffer)).toBe('SGVsbG8gd29ybGRzIQ==');
  expect(browserEncodeBase64(createRangeBuffer())).toBe(
    'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w=='
  );
});

test('browserDecodeBase64', () => {
  expect(browserDecodeBase64('TWFu')).toStrictEqual(new TextEncoder().encode('Man').buffer);
  expect(browserDecodeBase64('TWE=')).toStrictEqual(new TextEncoder().encode('Ma').buffer);
  expect(browserDecodeBase64('SGVsbG8gd29ybGQ=')).toStrictEqual(new TextEncoder().encode('Hello world').buffer);
  expect(browserDecodeBase64('SGVsbG8gd29ybGRzIQ==')).toStrictEqual(new TextEncoder().encode('Hello worlds!').buffer);

  const buffer = browserDecodeBase64(
    'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w=='
  );
  expect(buffer).toStrictEqual(createRangeBuffer());
});
