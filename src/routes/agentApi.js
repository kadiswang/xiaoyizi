const express = require('express');
const router = express.Router();
const path = require('path');
const logger = require('../services/logger');
const { getDb } = require('../services/database');
const { safeTokenEqual } = require('../utils/securityTokens');
const { agentDownloadLimiter } = require('../middleware/rateLimit');

router.get('/download', agentDownloadLimiter, (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!token) return res.status(401).send('Unauthorized');

    const d = getDb();
    const tokenLength = String(token).length;
    const nodeTokenRows = d.prepare('SELECT agent_token FROM nodes WHERE agent_token IS NOT NULL AND length(agent_token) = ?').all(tokenLength);
    const nodeTokenMatch = nodeTokenRows.some((row) => safeTokenEqual(token, row.agent_token));
    if (!nodeTokenMatch) {
      return res.status(403).send('Forbidden');
    }

    const agentPath = path.join(__dirname, '..', '..', 'node-agent', 'agent.js');
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.sendFile(agentPath);
  } catch (err) {
    logger.error({ err }, 'Agent 下载失败');
    return res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
