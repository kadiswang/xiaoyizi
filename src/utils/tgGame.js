const crypto = require('crypto');

const TG_TIMEZONE = 'Asia/Shanghai';
const TG_INITDATA_MAX_AGE_SEC = 10 * 60;

function getTzDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TG_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  }).formatToParts(date);
  const map = Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    year: Number(map.year), month: Number(map.month), day: Number(map.day),
    weekday: weekdayMap[map.weekday],
    date: `${map.year}-${map.month}-${map.day}`,
  };
}

function shiftIsoDate(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function today(date = new Date()) {
  return getTzDateParts(date).date;
}

function weekKey(date = new Date()) {
  const parts = getTzDateParts(date);
  return shiftIsoDate(parts.date, -((parts.weekday + 6) % 7));
}

function verifyTgInitData(initData, nowMs = Date.now()) {
  const token = process.env.TG_BOT_TOKEN;
  if (!token) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');
  const entries = [...params.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  const computed = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  const authDate = Number(params.get('auth_date'));
  if (!Number.isInteger(authDate)) return null;
  if (Math.abs(Math.floor(nowMs / 1000) - authDate) > TG_INITDATA_MAX_AGE_SEC) return null;
  const expected = Buffer.from(computed, 'hex');
  const actual = Buffer.from(hash, 'hex');
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;
  try { return JSON.parse(params.get('user')); } catch { return null; }
}

function weightedRandom(prizes) {
  const total = prizes.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of prizes) { roll -= item.weight; if (roll <= 0) return item; }
  return prizes[prizes.length - 1];
}

module.exports = {
  TG_TIMEZONE, TG_INITDATA_MAX_AGE_SEC,
  getTzDateParts, shiftIsoDate, today, weekKey,
  verifyTgInitData, weightedRandom,
};
