# 管理后台指南

## 首次使用

1. 部署面板并配置 HTTPS
2. 注册首个账号（自动成为管理员）
3. 进入 `/admin` → 设置 → 配置 SMTP
4. 配置完成后其他用户即可注册

## 功能模块

### 节点管理

- 智能部署 VLESS / SS / Hy2（SSH 密码或 Key）
- 编辑节点信息、流量倍率、等级限制
- 重启 Xray / Hysteria 2
- 同步配置到节点
- AWS 绑定与换 IP

### 用户管理

- 搜索、分页、排序
- 设置用户组 / 流量限额 / 到期时间
- 封禁 / 解封 / 删除
- 重置订阅 Token
- 一键封禁不活跃用户
- 查看流量来源与风险统计

### 流量统计

- 用户 / 节点流量排行
- 时间范围切换
- 7 天趋势与来源分析

### 安全与运维

- 审计日志
- 订阅访问统计与风控
- 并发多节点观察
- 节点健康汇总
- Agent 状态监控
- 运维诊断与 AI 运营日记

### AWS

- 多账号管理（EC2 / Lightsail）
- 一键创建实例并部署
- 节点绑定实例
- 实例换 IP

### 设置

- SMTP 邮件
- Telegram 通知
- 公告管理
- 注册控制与默认流量
- 自动化巡检 / 冻结
- 风控阈值
- 订阅参数

### 备份

- 创建 / 下载数据库备份
- 从备份恢复（会覆盖当前数据）

## Telegram Bot

需配置 `TG_BOT_TOKEN`。

| 命令 | 功能 |
|---|---|
| `/start` | 打开菜单 |
| `/checkin` | 每日签到 |
| `/lucky` | 每周大转盘 |
| `/flip` | 每日翻卡 |
| `/rps` | 猜拳 |
| `/me` | 个人信息 |
| `/sub` | 获取订阅 |
| `/adminstats` | 管理员总览 |

## 常用排查

```bash
pm2 list                          # 进程状态
pm2 logs vless-panel --lines 200  # 查看日志
nginx -t && systemctl reload nginx # Nginx
sqlite3 /root/panel/data/panel.db  # 数据库
journalctl -u vless-agent -f       # Agent 日志
```

## 风险提示

- 数据库恢复会覆盖当前数据，操作前先备份
- AWS 换 IP、自动冻结属于有副作用的操作
- OPS API 使用独立 Bearer Token，不要暴露公网
