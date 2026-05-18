# OpenClaw 原生巡检

`openclaw-ops/` 现在默认走 OpenClaw 原生 `heartbeat`，不再依赖系统 `crontab` 去定时执行 `heartbeat.sh`。

## 目标

- 每 30 分钟由 OpenClaw heartbeat 自动唤醒一次主会话
- 按 workspace 中的 `HEARTBEAT.md` 执行巡检
- 优先通过面板 `OPS API` 做观测、摘要、记录和低风险修复建议

## 这套目录包含什么

- `HEARTBEAT.md`
  OpenClaw 每次 heartbeat 的主检查清单
- `AGENTS.md`
  运维代理的行为边界和执行顺序
- `TOOLS.md`
  常用接口、认证方式和人工排查命令
- `BOOTSTRAP.md`
  新 workspace 的首屏上下文
- `patrol.sh`
  手动快照工具，仅用于人工排查，不参与定时调度

## 不再推荐的方式

- 不再推荐给系统 `crontab` 加 `heartbeat.sh`
- 不再把 `heartbeat.sh` 当作主巡检入口
- 不再依赖 `/tmp/*.sh` 这类临时脚本

## 初始化

```bash
cd /root/panel/openclaw-ops
bash setup.sh --force
```

`setup.sh` 现在会做这些事：

- 检查 `openclaw` 是否已安装
- 检查面板目录是否完整
- 读取 `.env` 中的 `OPS_API_KEY`
- 验证 `healthz` 和 `OPS API`
- 同步 workspace 模板到 `~/.openclaw/workspace`
- 设置 OpenClaw 默认 workspace
- 设置 heartbeat 周期为 `30m`
- 设置 heartbeat `target = last`
- 尝试启用 OpenClaw heartbeat

## 关键命令

```bash
openclaw config get agents.defaults.workspace
openclaw config get agents.defaults.heartbeat.every
openclaw config get agents.defaults.heartbeat.target
openclaw system heartbeat enable
openclaw system heartbeat last
openclaw gateway run
```

## 关键路径

- 面板目录：`/root/panel`
- 健康检查：`http://127.0.0.1:3000/healthz`
- OPS API：`http://127.0.0.1:3000/ops/api`
- OpenClaw 配置：`~/.openclaw/openclaw.json`
- 默认 workspace：`~/.openclaw/workspace`

## 验证

初始化后建议依次确认：

1. `openclaw config get agents.defaults.heartbeat.every`
   期望值：`30m`
2. `openclaw config get agents.defaults.heartbeat.target`
   期望值：`last`
3. `openclaw system heartbeat enable`
4. `openclaw system heartbeat last`
5. 人工需要时再执行：

```bash
bash /root/panel/openclaw-ops/patrol.sh
```

## 相关文档

- [BOOTSTRAP.md](./BOOTSTRAP.md)
- [AGENTS.md](./AGENTS.md)
- [HEARTBEAT.md](./HEARTBEAT.md)
- [TOOLS.md](./TOOLS.md)
- [MEMORY.md](./MEMORY.md)
