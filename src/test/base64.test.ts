import { decodeBase64, encodeBase64 } from '../main/base64';

function stringArrayBuffer(str: string): ArrayBuffer {
  const bytes = new Uint8Array(str.length);

  for (let i = 0; i < str.length; ++i) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes.buffer;
}

function isEqual(buffer1: ArrayBuffer, buffer2: ArrayBuffer): boolean {
  const view1 = new Uint8Array(buffer1.byteLength);
  const view2 = new Uint8Array(buffer2.byteLength);

  if (view1.length !== view2.length) {
    return false;
  }
  for (let i = 0; i < view1.length; i++) {
    if (view1[i] === undefined || view1[i] !== view2[i]) {
      return false;
    }
  }
  return true;
}

function rangeArrayBuffer(): ArrayBuffer {
  const bytes = new Uint8Array(256);

  for (let i = 0; i < 256; i++) {
    bytes[i] = i;
  }
  return bytes.buffer;
}

describe('encode', () => {
  test('encode "Hello world"', () => {
    expect(encodeBase64(stringArrayBuffer('Hello world'))).toBe('SGVsbG8gd29ybGQ=');
  });

  test('encode "Man"', () => {
    expect(encodeBase64(stringArrayBuffer('Man'))).toBe('TWFu');
  });

  test('encode "Ma"', () => {
    expect(encodeBase64(stringArrayBuffer('Ma'))).toBe('TWE=');
  });

  test('encode "Hello worlds!"', () => {
    expect(encodeBase64(stringArrayBuffer('Hello worlds!'))).toBe('SGVsbG8gd29ybGRzIQ==');
  });

  test('encode all binary characters', () => {
    expect(encodeBase64(rangeArrayBuffer())).toBe(
      'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w=='
    );
  });
});

describe('decode', () => {
  test('decode "Man"', () => {
    expect(isEqual(decodeBase64('TWFu'), stringArrayBuffer('Man'))).toBe(true);
  });

  test('decode "Hello world"', () => {
    expect(isEqual(decodeBase64('SGVsbG8gd29ybGQ='), stringArrayBuffer('Hello world'))).toBe(true);
  });

  test('decode "Hello worlds!"', () => {
    expect(isEqual(decodeBase64('SGVsbG8gd29ybGRzIQ=='), stringArrayBuffer('Hello worlds!'))).toBe(true);
  });

  test('decode all binary characters', () => {
    expect(
      isEqual(
        decodeBase64(
          'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w=='
        ),
        rangeArrayBuffer()
      )
    ).toBe(true);
  });
});
