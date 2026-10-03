const express = require("express");
const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

const queue = [];
const MAX = 500;

app.post("/events", (req, res) => {
  console.log("🔥 SINAL RECEBIDO DO TIKFINITY:", JSON.stringify(req.body));

  // Tenta capturar o nick/comentário de qualquer propriedade que o TikFinity envie
  let rawNick = req.query.nick || (req.body && (req.body.nick || req.body.value || req.body.comment));

  let finalNick = "";

  if (rawNick) {
    const str = String(rawNick).trim();
    // Se a mensagem começar com ! (ex: !roblox VINIISHII19), separa e pega só o nick à frente
    if (str.startsWith("!")) {
      const parts = str.split(/\s+/);
      if (parts.length > 1) {
        finalNick = parts[1];
      } else {
        finalNick = str;
      }
    } else {
      finalNick = str;
    }
  }

  if (finalNick) {
    console.log("✅ NICK PROCESSADO:", finalNick);
    queue.push({ nick: finalNick });
  } else {
    // Fallback caso venha outro evento
    const ev = req.body && (req.body.event || req.body);
    if (ev) queue.push(ev);
  }

  if (queue.length > MAX) queue.splice(0, queue.length - MAX);
  res.status(200).json({ ok: true });
});

app.get("/events", (req, res) => {
  const batch = queue.splice(0, queue.length);
  res.json({ events: batch });
});

app.get("/", (_, res) => res.send("Ponte Roblox-TikFinity OK"));

app.listen(process.env.PORT || 3000, () => console.log("Relay online"));
