const JUNK = {
  roblox: true, rblx: true, nick: true, nickname: true,
  avalia: true, avaliar: true, avalie: true,
  me: true, pfv: true, pfvr: true, pls: true, plz: true,
  ola: true, oi: true, oii: true, kkk: true, kkkk: true, kkkkk: true,
};

function cleanToken(value) {
  return String(value || "")
    .trim()
    .replace(/^[@!#./]+/, "")
    .replace(/[^A-Za-z0-9_]/g, "");
}

function isValidRobloxNick(nick) {
  return /^[A-Za-z][A-Za-z0-9_]{2,19}$/.test(nick);
}

function nickFromText(raw) {
  const text = String(raw || "").trim().replace(/\s+/g, " ");
  if (!text) return "";

  const command = text.match(/!\s*roblox\s+@?([A-Za-z][A-Za-z0-9_]{2,19})/i);
  if (command) return command[1];

  const tokens = text.split(" ");
  for (let i = 0; i < tokens.length; i++) {
    const lower = tokens[i].toLowerCase().replace(/^[@!#./]+/, "");
    if (lower === "roblox" || lower === "!roblox") {
      const next = cleanToken(tokens[i + 1] || "");
      if (isValidRobloxNick(next)) return next;
      continue;
    }
    const nick = cleanToken(tokens[i]);
    if (isValidRobloxNick(nick) && !JUNK[nick.toLowerCase()]) return nick;
  }
  return "";
}

function pickNick(req) {
  const body = req.body || {};
  const data = body.data || {};
  const query = req.query || {};
  const candidates = [
    query.commandParams, body.commandParams, data.commandParams,
    query.comment, body.comment, data.comment,
    query.value, body.value, query.message, body.message,
  ];
  for (let i = 0; i < candidates.length; i++) {
    const nick = nickFromText(candidates[i]);
    if (nick) return nick;
  }
  return "";
}
