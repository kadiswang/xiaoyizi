# Changelog

## v4.1.1 (2026-03-17)

### Bug 修复

- 修复登录密码 `.trim()` 与注册不一致导致含空格密码无法登录
- 修复 `emitSyncNode` 传更新前旧对象
- 修复封禁不活跃用户漏掉从未登录的用户
- 修复编辑 AWS 账号时 socks5 配置被意外清空
- 修复 SS 节点部署缺少 `ssh_key_path` 导致 SSH Key 部署后无法回连

### 代码清理

- 新建 `src/utils/regions.js` 统一地区映射
- 新建 `src/utils/tgGame.js` 统一游戏公共函数
- 新建 `src/services/migrations.js` 拆分数据库迁移代码
- 删除 20+ 处未使用的 import 和死代码
- `forgotCodes` 加入定时清理防内存泄漏

### 运维

- 补全 `openclaw-ops/` 目录
- 更新蜜桃酱人设

## v4.1.0 (2026-03-13)

### Telegram

- 重构机器人菜单：签到 / 大转盘 / 翻卡 / 猜拳 / 我的 / 订阅
- 增加 `my` 二级菜单和管理员总览
- 增加 `/adminstats`
- 修复 callback 场景下误判未绑定账号

### TG WebApp

- 猜拳持久化每日限制
- 增加 initData 过期校验
- 新增每日翻卡 WebApp
- 每周抽奖升级为大转盘 WebApp

### 其他

- 签到 / 抽奖流程事务化
- 每周抽奖统一按 Asia/Shanghai 周一边界

## v4.0.0 (2026-03-10)

- 邮箱注册、找回密码、订阅签名、TG 绑定完成整合

## v3.x

- 订阅风控后台配置化
- 端口轮换周期支持配置
- 从旧登录路径收口到邮箱注册 / 登录
