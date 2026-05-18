#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PANEL_DIR="$(dirname "$SCRIPT_DIR")"
WORKSPACE="${OPENCLAW_WORKSPACE:-$HOME/.openclaw/workspace}"
API_BASE="http://127.0.0.1:3000"
FORCE=0
OPS_KEY=""

ok()   { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }
err()  { echo "[ERROR] $*" >&2; exit 1; }

usage() {
  cat <<'EOF'
用法:
  bash setup.sh [--force]

参数:
  --force  覆盖已存在的 workspace 模板
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force) FORCE=1 ;;
    -h|--help) usage; exit 0 ;;
    *) err "未知参数: $1" ;;
  esac
  shift
done

echo "OpenClaw 原生 heartbeat 初始化"
echo "PANEL_DIR=$PANEL_DIR"
echo "WORKSPACE=$WORKSPACE"

require_openclaw() {
  command -v openclaw >/dev/null 2>&1 || err "openclaw 未安装，请先安装 OpenClaw"
  ok "openclaw: $(command -v openclaw)"
}

require_panel() {
  [[ -f "$PANEL_DIR/src/app.js" ]] || err "未找到面板代码: $PANEL_DIR/src/app.js"
  ok "面板代码路径正常"
}

load_ops_key() {
  if [[ -n "${OPS_API_KEY:-}" ]]; then
    OPS_KEY="$OPS_API_KEY"
  elif [[ -f "$PANEL_DIR/.env" ]]; then
    OPS_KEY="$(grep '^OPS_API_KEY=' "$PANEL_DIR/.env" 2>/dev/null | cut -d= -f2- || true)"
  fi

  if [[ -z "$OPS_KEY" ]]; then
    warn ".env 中未配置 OPS_API_KEY，后续跳过 OPS API 鉴权验证"
    return 1
  fi

  ok "OPS_API_KEY 已配置 (${OPS_KEY:0:8}...)"
  return 0
}

check_panel_health() {
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "${API_BASE}/healthz" 2>/dev/null || echo 000)"
  if [[ "$code" == "200" ]]; then
    ok "healthz 正常"
    return 0
  fi
  warn "healthz 异常 (HTTP ${code})"
  return 1
}

check_ops_api() {
  [[ -n "$OPS_KEY" ]] || return 1
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 8 -H "Authorization: Bearer $OPS_KEY" "${API_BASE}/ops/api/status" 2>/dev/null || echo 000)"
  if [[ "$code" == "200" ]]; then
    ok "OPS API 鉴权与连通性正常"
    return 0
  fi
  warn "OPS API 验证失败 (HTTP ${code})"
  return 1
}

sync_file() {
  local src="$1" dst="$2"
  if [[ -f "$dst" && "$FORCE" -ne 1 ]]; then
    echo "  skip: $(basename "$dst") 已存在（使用 --force 覆盖）"
  else
    cp "$src" "$dst"
    echo "  updated: $(basename "$dst")"
  fi
}

sync_workspace() {
  mkdir -p "$WORKSPACE" "$WORKSPACE/memory"
  echo "同步 workspace 模板..."
  for f in BOOTSTRAP.md HEARTBEAT.md SOUL.md AGENTS.md IDENTITY.md USER.md TOOLS.md MEMORY.md; do
    [[ -f "$SCRIPT_DIR/$f" ]] && sync_file "$SCRIPT_DIR/$f" "$WORKSPACE/$f"
  done
}

configure_openclaw() {
  node <<'EOF'
const fs = require('fs');
const os = require('os');
const path = require('path');

const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
const workspace = process.env.OPENCLAW_SETUP_WORKSPACE;
const prompt = 'Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.';

const raw = fs.readFileSync(configPath, 'utf8');
const json = JSON.parse(raw);
json.agents ||= {};
json.agents.defaults ||= {};
json.agents.defaults.workspace = workspace;
json.agents.defaults.heartbeat ||= {};
json.agents.defaults.heartbeat.every = '30m';
json.agents.defaults.heartbeat.target = 'last';
json.agents.defaults.heartbeat.lightContext = true;
json.agents.defaults.heartbeat.prompt = prompt;
json.meta ||= {};
json.meta.lastTouchedAt = new Date().toISOString();

fs.writeFileSync(configPath, `${JSON.stringify(json, null, 2)}\n`);
EOF
  ok "已写入 OpenClaw 默认 workspace 与 heartbeat 配置"
}

validate_openclaw_config() {
  if openclaw config validate >/dev/null 2>&1; then
    ok "OpenClaw 配置校验通过"
  else
    warn "OpenClaw 配置校验失败，请手动执行: openclaw config validate"
  fi
}

enable_heartbeat() {
  if openclaw system heartbeat enable >/dev/null 2>&1; then
    ok "OpenClaw heartbeat 已启用"
  else
    warn "heartbeat 未能立即启用，通常是 gateway 尚未运行"
    warn "请稍后执行: openclaw system heartbeat enable"
  fi
}

show_next_steps() {
  echo ""
  echo "完成。"
  echo "下一步:"
  echo "  1) openclaw config get agents.defaults.workspace"
  echo "  2) openclaw config get agents.defaults.heartbeat.every"
  echo "  3) openclaw config get agents.defaults.heartbeat.target"
  echo "  4) openclaw gateway run"
  echo "  5) openclaw system heartbeat enable"
  echo "  6) openclaw system heartbeat last"
  echo "  7) 如需人工快照: bash ${SCRIPT_DIR}/patrol.sh"
}

require_openclaw
require_panel
load_ops_key || true
check_panel_health || true
check_ops_api || true
sync_workspace
OPENCLAW_SETUP_WORKSPACE="$WORKSPACE" configure_openclaw
validate_openclaw_config
enable_heartbeat
show_next_steps
