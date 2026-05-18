# API 参考

## 约定

- 用户页面：会话认证
- 管理 API (`/admin/api/*`)：管理员会话 + CSRF
- OPS API (`/ops/api/*`)：`Authorization: Bearer <OPS_API_KEY>`
- 错误格式：`{ "error": "message" }` 或 `{ "ok": false, "error": "message" }`

## 健康检查

```
GET /healthz
→ { "status": "ok", "timestamp": "..." }
```

## 认证

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/auth/email-login` | 邮箱密码登录 |
| POST | `/auth/email-register` | 邮箱注册 |
| POST | `/auth/send-email-code` | 发送验证码 |
| POST | `/auth/forgot-send-code` | 找回密码验证码 |
| POST | `/auth/forgot-reset` | 重置密码 |
| GET | `/auth/logout` | 登出 |

## 订阅

| 路径 | 说明 |
|---|---|
| `GET /sub/:token` | VLESS 订阅 |
| `GET /sub6/:token` | VLESS IPv6 订阅 |
| `GET /subhy2/:token` | Hysteria 2 订阅 |
| `GET /suball/:token` | 全协议订阅 |

自动按 UA 返回对应客户端格式。启用签名时需附带 `?sig=...`。

## TG WebApp

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/rps-profile` | 猜拳档案 |
| POST | `/api/rps-play` | 猜拳出招 |
| POST | `/api/flip-profile` | 翻卡档案 |
| POST | `/api/flip-draw` | 翻卡抽取 |
| POST | `/api/lucky-profile` | 大转盘档案 |
| POST | `/api/lucky-spin` | 大转盘抽奖 |

## OPS API

认证：`Authorization: Bearer <OPS_API_KEY>`

### 查询

| 方法 | 路径 |
|---|---|
| GET | `/ops/api/status` |
| GET | `/ops/api/nodes` |
| GET | `/ops/api/nodes/:id` |
| GET | `/ops/api/users` |
| GET | `/ops/api/audit-log` |
| GET | `/ops/api/health-summary` |
| GET | `/ops/api/agents` |
| GET | `/ops/api/diary` |
| GET | `/ops/api/security/multi-node-overview` |

### 操作

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/ops/api/nodes/:id/restart-xray` | 重启服务 |
| POST | `/ops/api/nodes/:id/swap-ip` | 换 IP |
| POST | `/ops/api/nodes/:id/sync-config` | 同步配置 |
| POST | `/ops/api/deploy` | 部署节点 |
| POST | `/ops/api/rotate` | 轮换 |
| POST | `/ops/api/users/:id/freeze` | 冻结用户 |
| POST | `/ops/api/users/:id/unfreeze` | 解冻用户 |
| POST | `/ops/api/backup` | 创建备份 |
| POST | `/ops/api/agents/update-all` | 批量更新 Agent |
| POST | `/ops/api/diary` | 写运营日记 |

## 管理 API

前缀 `/admin/api`，需管理员会话 + CSRF。

主要功能：用户 CRUD、节点 CRUD、部署、AWS 管理、备份恢复、设置、流量统计、安全分析。

## 调试

```bash
# 健康检查
curl -i http://127.0.0.1:3000/healthz

# OPS API
source /root/panel/.env
curl -s -H "Authorization: Bearer $OPS_API_KEY" http://127.0.0.1:3000/ops/api/status
```
