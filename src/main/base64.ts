const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

// Use a lookup table to find the index.
const lookup = new Uint8Array(128);

for (let i = 0; i < chars.length; ++i) {
  lookup[chars[i].charCodeAt(0)] = i;
}

export function encodeBase64(arraybuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arraybuffer);
  const length = bytes.length;

  let base64 = '';

  for (let i = 0; i < length; i += 3) {
    base64 +=
      chars[bytes[i] >> 2] +
      chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)] +
      chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)] +
      chars[bytes[i + 2] & 63];
  }

  if (length % 3 === 2) {
    return base64.substring(0, base64.length - 1) + '=';
  } else if (length % 3 === 1) {
    return base64.substring(0, base64.length - 2) + '==';
  }
  return base64;
}

export function decodeBase64(base64: string): ArrayBuffer {
  let bufferLength = base64.length * 0.75;

  if (base64[base64.length - 1] === '=') {
    bufferLength--;

    if (base64[base64.length - 2] === '=') {
      bufferLength--;
    }
  }

  const bytes = new Uint8Array(bufferLength);
  const length = base64.length;

  for (let i = 0, j = 0, a, b, c, d; i < length; i += 4) {
    a = lookup[base64.charCodeAt(i)];
    b = lookup[base64.charCodeAt(i + 1)];
    c = lookup[base64.charCodeAt(i + 2)];
    d = lookup[base64.charCodeAt(i + 3)];

    bytes[j++] = (a << 2) | (b >> 4);
    bytes[j++] = ((b & 15) << 4) | (c >> 2);
    bytes[j++] = ((c & 3) << 6) | (d & 63);
  }

  return bytes.buffer;
}
