const crypto = require('crypto');
const { safeTokenEqual } = require('../utils/securityTokens');

// 生成 CSRF token 并存入 session
function generateToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}

// 检查 Origin/Referer 是否匹配当前主机
function isOriginAllowed(req) {
  const origin = req.headers['origin'];
  const referer = req.headers['referer'];
  const host = req.headers['host'];
  if (!host) return false;

  // 优先检查 Origin
  if (origin) {
    try {
      const url = new URL(origin);
      return url.host === host;
    } catch {
      return false;
    }
  }

  // 回退到 Referer
  if (referer) {
    try {
      const url = new URL(referer);
      return url.host === host;
    } catch {
      return false;
    }
  }

  // 都没有则拒绝
  return false;
}

// 验证 CSRF（POST/PUT/DELETE 请求）
function csrfProtection(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  // JSON API：检查 Origin/Referer + CSRF Token
  if (req.is('json')) {
    // 同源请求仍需验证 CSRF token，防止 DNS rebinding 攻击
    const token = req.headers['x-csrf-token'];
    if (token && req.session.csrfToken && safeTokenEqual(token, req.session.csrfToken)) {
      return next();
    }
    // 同源 + 无 token 的场景：首次会话尚未生成 CSRF token 时放行，
    // 正常流程会先 GET 页面（csrfLocals 生成 token），此分支仅覆盖
    // 极端情况（如 session 刚创建即发 JSON POST）。
    if (isOriginAllowed(req) && !req.session.csrfToken) {
      generateToken(req); // 立即生成 token，后续请求必须携带
      return next();
    }
    return res.status(403).json({ error: 'CSRF 校验失败：请刷新页面重试' });
  }

  // 表单提交：检查 CSRF token
  if (!req.session.csrfToken) {
    return res.status(403).json({ error: 'CSRF 会话未初始化，请刷新页面' });
  }
  const token = req.body?._csrf || req.headers['x-csrf-token'];
  if (!token || !safeTokenEqual(token, req.session.csrfToken)) {
    return res.status(403).json({ error: 'CSRF token 无效，请刷新页面重试' });
  }
  next();
}

// 模板中间件：自动注入 csrfToken 到 res.locals
function csrfLocals(req, res, next) {
  res.locals.csrfToken = generateToken(req);
  next();
}

module.exports = { csrfProtection, csrfLocals };
