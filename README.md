# Bitcoin Block Viewer

A simple Node.js application that connects to a Bitcoin node, listens for new blocks, and displays them on a web page.

## Features

- Connects to a Bitcoin node.
- Parses block data (hash, timestamp, nonce, difficulty, etc).
- Stores block info in memory.
- Serves block data as JSON through a REST API.
- Basic HTML UI that refreshes block data every minute.

---
## Requirements
Node.js 18+

## Set up

### 1. Clone the repository

```bash
git clone https://github.com/yourname/bitcoin-viewer-node.git
cd bitcoin-viewer-node
```

### 2. Install dependencies
```bash
npm install
```
node src/server.js

### 3. Start the server
```bash
node src/server.js
```

### 4. Server up
```bash
You should see:
🚀 Server running at http://localhost:3000
✅ Connected to Bitcoin node at ...
```

Access the Web
### 4. Access the Web
```bash
Open your browser and go to: http://localhost:3000
```

### 5. Example
![alt text]([http://url/to/img.png](https://github.com/yuriiSY/Bitcoin-node-viewer/blob/main/img/example.PNG))
