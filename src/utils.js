import crypto from 'crypto';

export const MAGIC = Buffer.from('f9beb4d9', 'hex');

export const COMMANDS = {
    version: 'version',
    verack: 'verack',
    inv: 'inv',
    getdata: 'getdata',
    block: 'block',
    headers: 'headers',
    getheaders: 'getheaders',
  };
  
  export function buildGetHeadersPayload(startingBlockHash = null) {

    const version = 70016;
    let blockLocatorHashes = [];
  
    if (startingBlockHash) {
      blockLocatorHashes.push(Buffer.from(startingBlockHash, 'hex').reverse());
    } else {
      blockLocatorHashes = [Buffer.alloc(32, 0)];
    }
  
    const count = blockLocatorHashes.length;
    const buffer = Buffer.alloc(4 + 1 + 32 + 32); 
  
    let offset = 0;
    buffer.writeUInt32LE(version, offset);
    offset += 4;
  
    buffer.writeUInt8(count, offset);
    offset += 1;
  
    blockLocatorHashes.forEach(hash => {
      hash.copy(buffer, offset);
      offset += 32;
    });
  
    Buffer.alloc(32, 0).copy(buffer, offset);
    offset += 32;
  
    return buffer.slice(0, offset);
  }
  

export function sha256d(buffer) {
  return crypto.createHash('sha256').update(
    crypto.createHash('sha256').update(buffer).digest()
  ).digest();
}


export function buildMessage(command, payload) {
  const cmdBuf = Buffer.alloc(12);
  cmdBuf.write(command, 'ascii');

  const lengthBuf = Buffer.alloc(4);
  lengthBuf.writeUInt32LE(payload.length, 0);

  const checksum = sha256d(payload).slice(0, 4);

  return Buffer.concat([MAGIC, cmdBuf, lengthBuf, checksum, payload]);
}


export function buildVersionPayload() {
  const buf = Buffer.alloc(85);
  buf.writeUInt32LE(70015, 0);
  return buf;
}


export function parseInvPayload(payload) {
  const count = payload.readUInt8(0);
  let offset = 1;
  const result = [];
  for (let i = 0; i < count; i++) {
    const type = payload.readUInt32LE(offset);
    offset += 4;
    const hash = Buffer.from(payload.slice(offset, offset + 32)).reverse().toString('hex');
    offset += 32;
    result.push({ type, hash });
  }
  return result;
}


export function parseBlockPayload(payload) {
    const buffer = Buffer.from(payload);
    let offset = 0;
  
    const version = buffer.readInt32LE(offset); offset += 4;
    const prevBlock = buffer.subarray(offset, offset + 32).reverse().toString('hex'); offset += 32;
    const merkleRoot = buffer.subarray(offset, offset + 32).reverse().toString('hex'); offset += 32;
    const timestamp = buffer.readUInt32LE(offset); offset += 4;
    const bits = buffer.readUInt32LE(offset); offset += 4;
    const nonce = buffer.readUInt32LE(offset); offset += 4;
  
    const date = new Date(timestamp * 1000).toLocaleString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  
    const txCount = buffer[offset++]; 
  
    const blockHeader = buffer.subarray(0, 80);
    const hash = sha256d(blockHeader).reverse().toString('hex');
  
    console.log(`🧱 Block hash: ${hash}`);
    console.log(`📅 Time mined: ${date}`);
    console.log(`🔁 Nonce: ${nonce}`);
    console.log(`📏 Bits: ${bits.toString(16)}`);
    console.log(`🔢 Transactions in block: ${txCount}`);
  
    return {
      hash,
      date,
      nonce,
      bits: bits.toString(16),
      txCount
    };
  }
  

export function parseVersionPayload(payload) {
  const version = payload.readUInt32LE(0);
  return { version };
}

