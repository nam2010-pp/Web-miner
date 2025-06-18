const net = require("net");
const WebSocket = require("ws");
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));

wss.on("connection", (ws) => {
  let tcp;
  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    if (data.type === "init") {
      tcp = net.createConnection({ host: "203.86.195.49", port: 2850 }, () => {
        tcp.write(`JOB,${data.username},MEDIUM,${data.key}\n`);
      });
      tcp.on("data", (chunk) => {
        const parts = chunk.toString().trim().split(",");
        ws.send(JSON.stringify({ type: "job", prev: parts[0], target: parts[1], diff: parseInt(parts[2]) }));
      });
    } else if (data.type === "submit") {
      tcp.write(`${data.nonce},WebMiner\n`);
    }
  });
});

server.listen(3000, () => console.log("🚀 Web Miner Server running on http://localhost:3000"));
