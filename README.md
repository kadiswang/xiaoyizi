# VLESS Panel

多协议节点管理面板，基于 Node.js + Express + SQLite。覆盖用户管理、节点部署、订阅分发、流量统计、Telegram 互动和 AI 自动运维。

## 功能

- **多协议**：VLESS Reality / Shadowsocks / Hysteria 2
- **用户系统**：邮箱注册登录、用户分组、流量限额、到期冻结
- **订阅分发**：自动识别客户端、签名防盗链、风控
- **节点部署**：一键部署到任意 VPS，支持 SSH Key / 密码 / SOCKS5 落地
- **AWS 集成**：EC2 / Lightsail 多账号管理、创建实例、换 IP
- **Telegram Bot**：签到、大转盘、翻卡、猜拳、订阅查询、管理总览
- **Agent 上报**：WebSocket 长连接，配置同步、状态监控、远程重启
- **OPS API**：RESTful 运维接口，供 OpenClaw 或外部系统调用
- **AI 运维**：OpenClaw 蜜桃酱每 30 分钟自动巡检，Telegram 汇报

## 快速部署

```bash
bash <(curl -sL https://raw.githubusercontent.com/obaggcom/panel/main/install.sh)
```

脚本自动完成 Node.js / PM2 / Nginx / SSL 安装配置。首个注册用户自动成为管理员。

## 手动部署

```bash
git clone https://github.com/obaggcom/panel.git
cd panel
npm install
cp .env.example .env   # 编辑配置
pm2 start ecosystem.config.js
```

## 配置

最少需要：

| 变量 | 说明 |
|---|---|
| `PANEL_DOMAIN` | 面板域名 |
| `SESSION_SECRET` | 会话密钥（自动生成） |

常用可选：

| 变量 | 说明 |
|---|---|
| `TG_BOT_TOKEN` | Telegram Bot Token |
| `OPS_API_KEY` | OPS API 认证密钥 |
| `SUB_LINK_SIGN_MODE` | 订阅签名模式 (`off` / `hmac`) |
| `TRUST_PROXY` | 反代信任 (`1`) |

## 项目结构

```
src/
├── app.js              # 入口
├── routes/             # 路由（用户面板、管理后台、API）
│   └── admin/          # 管理后台路由
├── services/           # 业务逻辑（部署、健康检查、TG Bot 等）
│   └── repos/          # 数据访问层
├── middleware/          # 认证、限流、CSRF
└── utils/              # 工具函数
openclaw-ops/           # OpenClaw AI 运维模板
node-agent/             # 节点 Agent
templates/              # 部署脚本模板
```

## 文档

- [管理后台指南](./ADMIN-GUIDE.md)
- [API 参考](./README-API.md)
- [部署检查清单](./DEPLOY-CHECKLIST.md)
- [更新日志](./CHANGELOG.md)
- [节点 Agent](./node-agent/README.md)
- [OpenClaw 运维](./openclaw-ops/README.md)
- [时间显示约定](./TIME-DISPLAY-CONVENTION.md)

## 技术栈

Node.js 22 · Express 5 · better-sqlite3 · PM2 · EJS · Tailwind CSS
