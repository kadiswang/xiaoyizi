#!/usr/bin/env bash
set -euo pipefail

cat <<'EOF'
[deprecated] openclaw-ops 已切换到 OpenClaw 原生 heartbeat。

不要再把 heartbeat.sh 加进系统 crontab。

请改用：
  openclaw config get agents.defaults.heartbeat.every
  openclaw system heartbeat enable
  openclaw system heartbeat last

如果你只是想人工看一眼当前状态，请执行：
  bash /root/panel/openclaw-ops/patrol.sh
EOF
