import { sha256, doubleSha256 } from './utils.js';
import { Buffer } from 'buffer';

export function createMessage(command, payload) {
  const magic = Buffer.from('F9BEB4D9', 'hex');
  const commandBuf = Buffer.alloc(12, 0);
  commandBuf.write(command, 0, 'ascii');
  const lengthBuf = Buffer.alloc(4);
  lengthBuf.writeUInt32LE(payload.length, 0);
  const checksum = doubleSha256(payload).subarray(0, 4);

  return Buffer.concat([magic, commandBuf, lengthBuf, checksum, payload]);
}

export function createVersionPayload() {
  const payload = Buffer.alloc(86);
  let offset = 0;
  payload.writeInt32LE(70015, offset); offset += 4; 
  payload.writeUInt64LE?.(1n, offset); offset += 8; 
  payload.writeBigUInt64LE(BigInt(Math.floor(Date.now() / 1000)), offset); offset += 8;
  payload.fill(0, offset, offset + 26); offset += 26; 
  payload.fill(0, offset, offset + 26); offset += 26; 
  payload.writeUInt64LE?.(1n, offset); offset += 8; 
  const userAgent = Buffer.from([0]); 
  userAgent.copy(payload, offset); offset += userAgent.length;
  payload.writeInt32LE(0, offset); offset += 4; 
  payload.writeUInt8(0, offset); 
  return payload;
}
