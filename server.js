const express = require("express");
const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

const queue = [];
const MAX = 500;

function str(value) {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value).trim();
}

function pickNick(req) {
  const body = req.body || {};
  const data = body.data || {};
  const query = req.query || {};

  const tiktok = str(
    query.nickname ||
      body.nickname ||
      data.nickname ||
      query.username ||
      body.username ||
      data.uniqueId ||
      ""
  )
    .replace(/^@/, "")
    .toLowerCase();

  const candidates = [
    query.commandParams,
    body.commandParams,
    data.commandParams,
    query.comment,
    body.comment,
    data.comment,
    query.value,
    body.value,
    query.message,
    body.message,
  ];

  let raw = "";
  for (let i = 0; i < candidates.length; i += 1) {
    const piece = str(candidates[i]);
    if (piece) {
      raw = piece;
      break;
    }
  }

  let nick = raw;
  const match = raw.match(/!roblox\s+@?([A-Za-z][A-Za-z0-9_]{2,19})/i);
  if (match) {
    nick = match[1];
  }
  nick = str(nick).replace(/^@+/, "");

  if (!/^[A-Za-z][A-Za-z0-9_]{2,19}$/.test(nick)) {
    return "";
  }
  if (tiktok && nick.toLowerCase() === tiktok) {
    return "";
  }
  return nick;
}

function payload(nick) {
  return {
    nickname: nick,
    nick: nick,
    username: nick,
    uniqueId: nick,
    comment: nick,
    value: nick,
    commandParams: nick,
    data: {
      nickname: nick,
      uniqueId: nick,
      comment: nick,
      user: {
        nickname: nick,
        uniqueId: nick,
      },
    },
  };
}

function ingest(req, res) {
  console.log("SINAL:", JSON.stringify({ query: req.query, body: req.body }));
  const nick = pickNick(req);
  if (!nick) {
    console.log("IGNORADO — sem nick Roblox");
    res.status(200).json({ ok: false, ignored: true });
    return;
  }
  console.log("ENFILEIRADO:", nick);
  queue.push(payload(nick));
  if (queue.length > MAX) {
    queue.splice(0, queue.length - MAX);
  }
  res.status(200).json({ ok: true, nick: nick });
}

app.post("/events", ingest);

app.get("/events", function (req, res) {
  if (req.query.commandParams || req.query.comment || req.query.value || req.query.message) {
    ingest(req, res);
    return;
  }
  const batch = queue.splice(0, queue.length);
  res.json({ events: batch });
});

app.get("/", function (_req, res) {
  res.send("Ponte Roblox-TikFinity OK");
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Relay online na porta " + port);
});
