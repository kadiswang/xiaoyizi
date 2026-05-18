/**
 * 启动时 .env 环境变量校验
 * - PANEL_DOMAIN 自动派生 AGENT_WS_URL
 * - 缺少必要变量时明确报错并退出
 */
const logger = require('./logger');

const REQUIRED_VARS = [
  'SESSION_SECRET',
];

/**
 * 从 PANEL_DOMAIN 自动派生域名相关变量
 * 如果已手动设置则不覆盖
 */
function deriveDomainVars() {
  const domain = process.env.PANEL_DOMAIN;
  if (!domain) return;

  if (!process.env.AGENT_WS_URL) {
    process.env.AGENT_WS_URL = `wss://${domain}/ws/agent`;
    logger.info({ domain }, 'AGENT_WS_URL 已从 PANEL_DOMAIN 自动派生');
  }
}

function validateEnv() {
  // 先从 PANEL_DOMAIN 派生
  deriveDomainVars();

  const missing = REQUIRED_VARS.filter(v => !process.env[v]);
  if (missing.length > 0) {
    logger.fatal({ missing }, '缺少必要环境变量，请检查 .env 文件');
    process.exit(1);
  }
  // 警告使用默认值的变量
  if (process.env.SESSION_SECRET === 'dev-secret-change-me' || process.env.SESSION_SECRET === 'change-me-to-random-string') {
    logger.warn('SESSION_SECRET 使用了默认值，请更换为安全的随机字符串');
  }
}

module.exports = { validateEnv };
