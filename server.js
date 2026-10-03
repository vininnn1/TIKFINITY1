const express = require("express");
const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

const queue = [];
const MAX = 500;

app.post("/events", (req, res) => {
  // Pega o nick limpo enviado na URL (?nick={value})
  const nick = req.query.nick || (req.body && req.body.nick);
  
  console.log("🔥 SINAL RECEBIDO:", { nick });
  
  if (nick) {
    // Envia o nick exato para a fila do Roblox
    queue.push({ nick: nick });
  } else {
    const ev = req.body && (req.body.event || req.body);
    if (ev) queue.push(ev);
  }
  
  if (queue.length > MAX) queue.splice(0, queue.length - MAX);
  res.status(200).json({ ok: true });
});

app.get("/events", (req, res) => {
  if (req.query.nick) {
    queue.push({ nick: req.query.nick });
  }
  const batch = queue.splice(0, queue.length);
  res.json({ events: batch });
});

app.get("/", (_, res) => res.send("Ponte Roblox-TikFinity OK"));

app.listen(process.env.PORT || 3000, () => console.log("Relay online"));
