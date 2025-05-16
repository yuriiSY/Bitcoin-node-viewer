import net from 'net';
import dns from 'dns';
import { buildMessage, buildVersionPayload, parseInvPayload, parseBlockPayload, MAGIC, COMMANDS, sha256d, parseVersionPayload } from './utils.js';

let blockCallback = null;
let array = [];

export function connectToBitcoinNode(host = '212.87.158.134', port = 8333) {
  dns.lookup(host, (err, address) => {
    if (err) return console.error('❌ DNS lookup failed for', host, ':', err);

    const client = new net.Socket();

    client.connect(port, address, () => {
      console.log(`✅ Connected to Bitcoin node at ${address}:${port}`);
      const versionMsg = buildMessage(COMMANDS.version, buildVersionPayload());
      client.write(versionMsg);
      console.log('Sent version message');
    });

    let buffer = Buffer.alloc(0);

    client.on('data', (chunk) => {
      console.log('📥 Raw data received :', chunk.toString('hex'));  

      buffer = Buffer.concat([buffer, chunk]);

      while (buffer.length >= 24) {
        const magic = buffer.subarray(0, 4);
        if (!magic.equals(MAGIC)) {
          buffer = buffer.slice(1);
          continue;
        }


        const cmd = buffer.subarray(4, 16).toString('ascii').replace(/\u0000/g, '');
        
        const length = buffer.readUInt32LE(16);
        const checksum = buffer.subarray(20, 24);

        if (buffer.length < 24 + length) break;

        const payload = buffer.subarray(24, 24 + length);
        const calcChecksum = sha256d(payload).subarray(0, 4);

        if (!checksum.equals(calcChecksum)) {
          console.error('❌ Invalid checksum for', cmd);
          buffer = buffer.slice(24 + length);
          continue;
        }

        if (cmd === COMMANDS.version) {
          const ver = parseVersionPayload(payload);
          console.log('🛠 Received version message:', ver);
          const verackMsg = buildMessage(COMMANDS.verack, Buffer.alloc(0));
          client.write(verackMsg);
          console.log('🖐️ Sent verack message');
        } else if (cmd === COMMANDS.verack) {
          console.log('🖐️ Received verack');
        } else if (cmd === COMMANDS.inv) {
          const inv = parseInvPayload(payload);
          if (blockCallback) blockCallback(inv);
          inv.filter(i => i.type === 2).forEach(block => {
            console.log(`📦 New block announced: ${block.hash}`);
            const getDataPayload = Buffer.alloc(37);
            getDataPayload.writeUInt8(1, 0);
            getDataPayload.writeUInt32LE(2, 1); 
            Buffer.from(block.hash, 'hex').reverse().copy(getDataPayload, 5);
            client.write(buildMessage(COMMANDS.getdata, getDataPayload));
          });
        } else if (cmd === COMMANDS.block) {
          const block = parseBlockPayload(payload);
          array.push(block);
        } else {
          console.log('ℹ️ Unknown command:', cmd);
        }

        buffer = buffer.slice(24 + length);
      }
    });

    client.on('close', () => {
      console.log('❎ Connection closed. Reconnecting...');
      setTimeout(() => connectToBitcoinNode(onBlock), 5000);
    });
    client.on('error', (err) => console.error('❌ Socket error:', err));
  });
}

export function getBlocks() {
  return array;
}

export function onNewBlock(cb) {
  blockCallback = cb;
}
