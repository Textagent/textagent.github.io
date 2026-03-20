#!/usr/bin/env bash
# setup.sh — Runs once when the Codespace is created.
# Installs agent dependencies and starts the exec API server.
set -euo pipefail

echo "🔧 TextAgent Runner — Setting up environment..."

cd /workspaces/agent-runner

# ── Install Node dependencies (exec API server) ──
npm install --production 2>/dev/null || true

# ── Clone & install agents ──
echo "📦 Setting up OpenClaw..."
if [ ! -d "agents/openclaw" ]; then
  git clone --depth 1 https://github.com/openclaw/openclaw.git agents/openclaw 2>/dev/null || echo "⚠ OpenClaw repo not available yet — placeholder"
fi

echo "📦 Setting up OpenFang..."
if [ ! -d "agents/openfang" ]; then
  git clone --depth 1 https://github.com/openfang/openfang.git agents/openfang 2>/dev/null || echo "⚠ OpenFang repo not available yet — placeholder"
fi

# ── Install Python dependencies ──
pip install --quiet --no-cache-dir -r requirements.txt 2>/dev/null || true

# ── Start the exec API server in the background ──
echo "🚀 Starting exec API on port 8080..."
nohup node server.js > /workspaces/agent-runner/server.log 2>&1 &

echo "✅ Setup complete. Exec API running on port 8080."
