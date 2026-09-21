const express = require("express");
const app = express();
app.use(express.json({ limit: "1mb" }));

const queue = [];
const MAX = 500;

app.post("/events", (req, res) => {
  const ev = req.body && (req.body.event || req.body);
  if (ev) queue.push(ev);
  if (queue.length > MAX) queue.splice(0, queue.length - MAX);
  res.status(200).json({ ok: true });
});

app.get("/events", (req, res) => {
  const batch = queue.splice(0, queue.length);
  res.json({ events: batch });
});

app.get("/", (_, res) => res.send("Ponte Roblox-TikFinity OK"));

app.listen(process.env.PORT || 3000, () => console.log("Relay online"));
