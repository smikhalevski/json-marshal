import { SerializationAdapter } from './types.js';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const lookup = new Uint8Array(128);

for (let i = 0; i < BASE64_CHARS.length; ++i) {
  lookup[BASE64_CHARS.charCodeAt(i)] = i;
}

export function manualEncodeBase64(buffer: ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer);
  const bytesLength = bytes.length;

  let base64 = '';

  for (let i = 0, a, b, c = 0; i < bytesLength; ) {
    a = bytes[i++];
    b = bytes[i++];
    c = bytes[i++];

    base64 += BASE64_CHARS[a >> 2];
    base64 += BASE64_CHARS[((a & 3) << 4) | (b >> 4)];
    base64 += BASE64_CHARS[((b & 15) << 2) | (c >> 6)];
    base64 += BASE64_CHARS[c & 63];
  }

  if (bytesLength % 3 === 2) {
    return base64.substring(0, base64.length - 1) + '=';
  }
  if (bytesLength % 3 === 1) {
    return base64.substring(0, base64.length - 2) + '==';
  }
  return base64;
}

export function manualDecodeBase64(base64: string): ArrayBuffer {
  let bufferLength = base64.length * 0.75;

  if (base64[base64.length - 1] === '=') {
    bufferLength--;
  }
  if (base64[base64.length - 2] === '=') {
    bufferLength--;
  }

  const bytes = new Uint8Array(bufferLength);

  for (let i = 0, j = 0, a, b, c, d; i < base64.length; ) {
    a = lookup[base64.charCodeAt(i++)];
    b = lookup[base64.charCodeAt(i++)];
    c = lookup[base64.charCodeAt(i++)];
    d = lookup[base64.charCodeAt(i++)];

    bytes[j++] = (a << 2) | (b >> 4);
    bytes[j++] = ((b & 15) << 4) | (c >> 2);
    bytes[j++] = ((c & 3) << 6) | (d & 63);
  }

  return bytes.buffer;
}

function bufferEncodeBase64(buffer: ArrayBufferLike): string {
  return Buffer.from(buffer).toString('base64');
}

function bufferDecodeBase64(base64: string): ArrayBuffer {
  const { buffer, byteOffset, byteLength } = Buffer.from(base64, 'base64');

  return buffer.slice(byteOffset, byteOffset + byteLength);
}

export const encodeBase64 = typeof Buffer !== 'undefined' ? bufferEncodeBase64 : manualEncodeBase64;

export const decodeBase64 = typeof Buffer !== 'undefined' ? bufferDecodeBase64 : manualDecodeBase64;

export function compareKeys([a]: any[], [b]: any[]): number {
  return a === b ? 0 : a < b ? -1 : 1;
}

const { isInteger } = Number;

export function checkAdapterTypes(adapters: readonly SerializationAdapter[] | undefined): void {
  if (adapters === undefined) {
    return;
  }

  for (let i = 0; i < adapters.length; ++i) {
    const { tag } = adapters[i];

    if (!isInteger(tag) || (tag >= 0 && tag < 100)) {
      throw new Error('Illegal tag: ' + tag);
    }

    for (let j = i + 1; j < adapters.length; ++j) {
      if (adapters[j].tag === tag && adapters[j] !== adapters[i]) {
        throw new Error('Tags are not unique: ' + tag);
      }
    }
  }
}
