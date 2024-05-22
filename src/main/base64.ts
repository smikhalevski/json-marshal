const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const lookup = new Uint8Array(128);

for (let i = 0; i < chars.length; ++i) {
  lookup[chars.charCodeAt(i)] = i;
}

export function manualEncodeBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const bytesLength = bytes.length;

  let base64 = '';

  for (let i = 0, a, b, c = 0; i < bytesLength; ) {
    a = bytes[i++];
    b = bytes[i++];
    c = bytes[i++];

    base64 += chars[a >> 2];
    base64 += chars[((a & 3) << 4) | (b >> 4)];
    base64 += chars[((b & 15) << 2) | (c >> 6)];
    base64 += chars[c & 63];
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

export function encodeBase64(buffer: ArrayBuffer): string {
  return typeof Buffer !== 'undefined' ? Buffer.from(buffer).toString('base64') : manualEncodeBase64(buffer);
}

export function decodeBase64(base64: string): ArrayBuffer {
  if (typeof Buffer !== 'undefined') {
    const { buffer, byteOffset, byteLength } = Buffer.from(base64, 'base64');

    return buffer.slice(byteOffset, byteOffset + byteLength);
  }
  return manualDecodeBase64(base64);
}
