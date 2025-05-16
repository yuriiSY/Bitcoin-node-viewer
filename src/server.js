import express from 'express';
import { connectToBitcoinNode, getBlocks } from './network.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.get('/blocks', (req, res) => {
  res.json(getBlocks());
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

connectToBitcoinNode();

