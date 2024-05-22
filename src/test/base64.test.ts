import { manualDecodeBase64, manualEncodeBase64 } from '../main/base64';

export function createRangeBuffer(): ArrayBuffer {
  const bytes = new Uint8Array(256);

  for (let i = 0; i < 256; i++) {
    bytes[i] = i;
  }
  return bytes.buffer;
}

test('manualEncodeBase64', () => {
  expect(manualEncodeBase64(new TextEncoder().encode('Hello world'))).toBe('SGVsbG8gd29ybGQ=');
  expect(manualEncodeBase64(new TextEncoder().encode('Man'))).toBe('TWFu');
  expect(manualEncodeBase64(new TextEncoder().encode('Ma'))).toBe('TWE=');
  expect(manualEncodeBase64(new TextEncoder().encode('Hello worlds!'))).toBe('SGVsbG8gd29ybGRzIQ==');
  expect(manualEncodeBase64(createRangeBuffer())).toBe(
    'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w=='
  );
});

describe('manualDecodeBase64', () => {
  expect(manualDecodeBase64('TWFu')).toStrictEqual(new TextEncoder().encode('Man').buffer);
  expect(manualDecodeBase64('TWE=')).toStrictEqual(new TextEncoder().encode('Ma').buffer);
  expect(manualDecodeBase64('SGVsbG8gd29ybGQ=')).toStrictEqual(new TextEncoder().encode('Hello world').buffer);
  expect(manualDecodeBase64('SGVsbG8gd29ybGRzIQ==')).toStrictEqual(new TextEncoder().encode('Hello worlds!').buffer);

  const buffer = manualDecodeBase64(
    'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w=='
  );
  expect(buffer).toStrictEqual(createRangeBuffer());
});
