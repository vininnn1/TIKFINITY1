const express = require("express");
const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

const queue = [];
const MAX = 500;

function pickNick(req) {
  const b = req.body || {};
  const d = b.data || {};
  const q = req.query || {};

  const tiktok = String(
    q.nickname || b.nickname || d.nickname || q.username || b.username || d.uniqueId || ""
  )
    .replace(/^@/, "")
    .trim()
    .toLowerCase();

  const raw = [
    q.commandParams, b.commandParams, d.commandParams,
    q.comment, b.comment, d.comment,
    q.value, b.value, q.message, b.message,
  ]
    .map((v) => (v == null ? "" : String(v).trim()))
    .find(Boolean) || "";

  let nick = raw;
  const m = raw.match(/!\s*roblox\s+@?([A-Za-z][A-Za-z0-9_]{2,19})/i);
  if (m) nick = m[1];
  nick = String(nick).replace(/^@+/, "").trim();

  if (!/^[A-Za-z][A-Za-z0-9_]{2,19}$/.test(nick)) return "";
  if (nick.toLowerCase() === tiktok) return "";
  return nick;
}

function payload(nick) {
  return {
    nickname: nick,
    nick,
    username: nick,
    uniqueId: nick,
    comment: nick,
    value: nick,
    commandParams: nick,
    data: {
      nickname: nick,
      uniqueId: nick,
      comment: nick,
      user: { nickname: nick, uniqueId: nick },
    },
  };
}

function ingest(req, res) {
  console.log("SINAL:", JSON.stringify({ query: req.query, body: req.body }));
  const nick = pickNick(req);
  if (!nick) {
    console.log("IGNORADO — sem nick Roblox (não uses query.nick={nickname})");
    return res.status(200).json({ ok: false, ignored: true });
  }
  console.log("ENFILEIRADO:", nick);
  queue.push(payload(nick));
  if (queue.length > 
