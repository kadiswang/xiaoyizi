# BOOTSTRAP.md

这个 workspace 用于 `vless-panel` 的运维巡检。

## 当前设计

- 使用 OpenClaw 原生 `heartbeat`
- 不依赖系统 `crontab`
- 巡检优先通过面板 `OPS API`
- `patrol.sh` 只是人工手动快照工具

## 首次进入时先确认

1. `openclaw config get agents.defaults.workspace`
2. `openclaw config get agents.defaults.heartbeat.every`
3. `openclaw system heartbeat last`

## 如果 heartbeat 没工作

- 检查 `openclaw gateway run` 是否在线
- 检查模型 provider 是否可用
- 检查 `OPS_API_KEY` 是否仍然有效
- 再看 `HEARTBEAT.md` 是否已经同步到 workspace
