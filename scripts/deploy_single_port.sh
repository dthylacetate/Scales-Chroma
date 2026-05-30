#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"
SKIP_INSTALL=0
NO_START=0

usage() {
  cat <<'USAGE'
Scales & Chroma 单端口部署脚本

用法:
  ./scripts/deploy_single_port.sh [选项]

选项:
  --host <host>       监听地址，默认 0.0.0.0
  --port <port>       访问端口，默认 8000
  --skip-install      跳过依赖安装，只构建并启动
  --no-start          只安装依赖和构建，不启动服务
  -h, --help          显示帮助

示例:
  ./scripts/deploy_single_port.sh
  ./scripts/deploy_single_port.sh --port 9000
  HOST=0.0.0.0 PORT=9000 ./scripts/deploy_single_port.sh
  ./scripts/deploy_single_port.sh --skip-install --port 9000
  ./scripts/deploy_single_port.sh --no-start
USAGE
}

log() {
  printf "\033[1;36m[deploy]\033[0m %s\n" "$1"
}

fail() {
  printf "\033[1;31m[deploy:error]\033[0m %s\n" "$1" >&2
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --host)
      [[ $# -ge 2 ]] || fail "--host 需要一个值"
      HOST="$2"
      shift 2
      ;;
    --port)
      [[ $# -ge 2 ]] || fail "--port 需要一个值"
      PORT="$2"
      shift 2
      ;;
    --skip-install)
      SKIP_INSTALL=1
      shift
      ;;
    --no-start)
      NO_START=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "未知参数：$1"
      ;;
  esac
done

[[ "$PORT" =~ ^[0-9]+$ ]] || fail "端口必须是数字：$PORT"
if (( PORT < 1 || PORT > 65535 )); then
  fail "端口范围必须在 1-65535：$PORT"
fi

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

detect_python() {
  if command_exists python3; then
    printf "python3"
    return
  fi

  if command_exists python; then
    printf "python"
    return
  fi

  fail "未找到 Python。请先安装 Python 3.11+。Ubuntu 可执行：sudo apt install -y python3 python3-venv python3-pip"
}

version_major() {
  "$1" -c 'import sys; print(sys.version_info.major)'
}

version_minor() {
  "$1" -c 'import sys; print(sys.version_info.minor)'
}

PYTHON_BIN="$(detect_python)"
PYTHON_MAJOR="$(version_major "$PYTHON_BIN")"
PYTHON_MINOR="$(version_minor "$PYTHON_BIN")"

if (( PYTHON_MAJOR < 3 || (PYTHON_MAJOR == 3 && PYTHON_MINOR < 11) )); then
  fail "当前 Python 版本过低：$("$PYTHON_BIN" --version)。项目需要 Python 3.11+"
fi

command_exists node || fail "未找到 Node.js。Ubuntu 可执行：sudo apt install -y nodejs npm，建议 Node 18+"
command_exists npm || fail "未找到 npm。Ubuntu 可执行：sudo apt install -y npm"

NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
if (( NODE_MAJOR < 18 )); then
  fail "当前 Node 版本过低：$(node -v)。建议使用 Node 18+"
fi

log "项目目录：$ROOT_DIR"
log "Python：$("$PYTHON_BIN" --version)"
log "Node：$(node -v)"
log "npm：$(npm -v)"
log "监听地址：$HOST"
log "访问端口：$PORT"

cd "$ROOT_DIR"

if [[ "$SKIP_INSTALL" -eq 0 ]]; then
  log "准备 Python 虚拟环境"
  "$PYTHON_BIN" -m venv "$ROOT_DIR/.venv"
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.venv/bin/activate"

  log "安装后端依赖"
  python -m pip install --upgrade pip
  python -m pip install -e "$ROOT_DIR/backend"

  log "安装前端依赖"
  cd "$ROOT_DIR/frontend"
  if [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi
else
  log "跳过依赖安装"
  if [[ -f "$ROOT_DIR/.venv/bin/activate" ]]; then
    # shellcheck disable=SC1091
    source "$ROOT_DIR/.venv/bin/activate"
  else
    log "未发现 .venv，将直接使用系统 Python 环境"
  fi
fi

log "构建前端"
cd "$ROOT_DIR/frontend"
npm run build

log "检查后端数据库初始化"
cd "$ROOT_DIR/backend"
python - <<'PY'
from app.core.database import init_database

init_database()
print("SQLite 数据库已就绪")
PY

if [[ "$NO_START" -eq 1 ]]; then
  log "构建完成，未启动服务。之后可运行："
  printf "  cd %s/backend && %s -m uvicorn app.main:app --host %s --port %s\n" "$ROOT_DIR" "${VIRTUAL_ENV:+$VIRTUAL_ENV/bin/}python" "$HOST" "$PORT"
  exit 0
fi

log "启动服务"
log "浏览器访问：http://<服务器IP>:$PORT/"
exec python -m uvicorn app.main:app --host "$HOST" --port "$PORT"
