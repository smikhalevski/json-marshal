export const encodeBase64 = typeof Buffer !== 'undefined' ? bufferEncodeBase64 : browserEncodeBase64;

export const decodeBase64 = typeof Buffer !== 'undefined' ? bufferDecodeBase64 : browserDecodeBase64;

export function browserEncodeBase64(buffer: ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer);
  const bytesLength = bytes.length;

  let str = '';
  let i = 0;

  for (const prefixLength = bytesLength - (bytesLength % 16); i < prefixLength; ) {
    str += String.fromCharCode(
      bytes[i++],
      bytes[i++],
      bytes[i++],
      bytes[i++],
      bytes[i++],
      bytes[i++],
      bytes[i++],
      bytes[i++],
      bytes[i++],
      bytes[i++],
      bytes[i++],
      bytes[i++],
      bytes[i++],
      bytes[i++],
      bytes[i++],
      bytes[i++]
    );
  }

  while (i < bytesLength) {
    str += String.fromCharCode(bytes[i++]);
  }

  return btoa(str);
}

export function browserDecodeBase64(base64: string): ArrayBuffer {
  const str = atob(base64);
  const bytesLength = str.length;
  const bytes = new Uint8Array(bytesLength);

  for (let i = 0; i < bytesLength; ++i) {
    bytes[i] = str.charCodeAt(i);
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
