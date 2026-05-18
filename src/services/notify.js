const db = require('./database');
const logger = require('./logger');
const { formatDateTimeInTimeZone } = require('../utils/time');

function nowShanghaiText() {
  return formatDateTimeInTimeZone(new Date(), 'Asia/Shanghai', true);
}

function getConfig() {
  const token = db.getSetting('tg_bot_token');
  const chatId = db.getSetting('tg_chat_id');
  return (token && chatId) ? { token, chatId } : null;
}

function escTg(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function send(text) {
  const cfg = getConfig();
  if (!cfg) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${cfg.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: cfg.chatId, text, parse_mode: 'HTML' })
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      logger.warn({ status: res.status, body }, 'TG send failed');
    }
  } catch (e) { logger.error({ err: e }, 'TG send error'); }
}

// 通知类型
const notify = {
  nodeDown(nodeName) {
    if (db.getSetting('tg_on_node_down') !== 'true') return Promise.resolve();
    return send(`🔴 <b>节点离线</b>\n节点: ${escTg(nodeName)}\n时间: ${nowShanghaiText()}`).catch(() => {});
  },
  nodeUp(nodeName) {
    // 恢复通知复用 node_down 开关：关心掉线则同时关心恢复
    if (db.getSetting('tg_on_node_down') !== 'true') return Promise.resolve();
    return send(`🟢 <b>节点恢复</b>\n节点: ${escTg(nodeName)}\n时间: ${nowShanghaiText()}`).catch(() => {});
  },
  nodeBlocked(nodeName, action) {
    if (db.getSetting('tg_on_node_blocked') !== 'true') return Promise.resolve();
    return send(`🧱 <b>节点疑似被墙</b>\n节点: ${escTg(nodeName)}\n动作: ${escTg(action || '等待处理')}\n时间: ${nowShanghaiText()}`).catch(() => {});
  },
  rotate(result) {
    if (db.getSetting('tg_on_rotate') !== 'true') return Promise.resolve();
    return send(`🔄 <b>自动轮换完成</b>\n节点同步: ✅${result.success} ❌${result.failed}\nUUID重置: ${result.uuidCount}\n订阅重置: ${result.tokenCount}`).catch(() => {});
  },
  abuse(username, ipCount) {
    if (db.getSetting('tg_on_abuse') !== 'true') return Promise.resolve();
    return send(`⚠️ <b>订阅异常</b>\n用户: ${escTg(username)}\n${ipCount} 个不同 IP 拉取订阅`).catch(() => {});
  },
  trafficExceed(username, bytes) {
    if (db.getSetting('tg_on_traffic') !== 'true') return Promise.resolve();
    const gb = (bytes / 1073741824).toFixed(2);
    return send(`📊 <b>流量超标</b>\n用户: ${escTg(username)}\n今日已用: ${gb} GB`).catch(() => {});
  },
  userRegister(username, profile) {
    if (db.getSetting('tg_on_register') !== 'true') return Promise.resolve();
    const total = db.getUserCount();
    const { getGroupLabel } = require('../utils/userGroup');
    const lv = profile?.trust_level ?? 0;
    let msg = `👤 <b>新用户注册</b>\n`;
    msg += `用户名: ${escTg(username)}\n`;
    if (profile?.name && profile.name !== username) msg += `昵称: ${escTg(profile.name)}\n`;
    msg += `用户组: ${escTg(getGroupLabel(lv))}\n`;
    msg += `总用户: ${total}\n`;
    msg += `时间: ${nowShanghaiText()}`;
    return send(msg).catch(() => {});
  },
  deploy(nodeName, success, detail) {
    if (db.getSetting('tg_on_deploy') !== 'true') return Promise.resolve();
    return send(`${success ? '✅' : '❌'} <b>节点部署${success ? '成功' : '失败'}</b>\n节点: ${escTg(nodeName)}\n${escTg(detail || '')}\n时间: ${nowShanghaiText()}`).catch(() => {});
  },
  ops(msg) {
    if (db.getSetting('tg_on_ops') !== 'true') return Promise.resolve();
    return send(msg).catch(() => {});
  }
};

module.exports = { send, notify };
