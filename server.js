import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import apiRoutes from './routes/api.js';
import adminRoutes from './routes/admin.js';
import { loadDB } from './utils.js';
import cookieParser from 'cookie-parser';


const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);
app.use("/", adminRoutes);

wss.on('connection', ws => {
  console.log("WebSocket client connected");
  ws.send(JSON.stringify({ type: "init", data: loadDB() }));
});

export function broadcast(message) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
}

server.listen(3000, () => console.log("Backend running on http://localhost:3000"));
