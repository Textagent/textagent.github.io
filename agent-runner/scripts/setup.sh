#!/usr/bin/env bash
# setup.sh — Runs once when the Codespace is created.
# Installs agent dependencies and starts the exec API server.
set -euo pipefail

echo "🔧 TextAgent Runner — Setting up environment..."

cd /workspaces/agent-runner

# ── Install Node dependencies (exec API server) ──
npm install --production 2>/dev/null || true

# ── Agent images are built on first use ──
# OpenClaw and OpenFang are installed inside their Docker images
# via npm (see agents/openclaw/Dockerfile and agents/openfang/Dockerfile).
# No manual cloning or pip install needed.

echo "📋 Available agents:"
for agent_dir in agents/*/; do
  agent_name=$(basename "$agent_dir")
  if [ -f "$agent_dir/Dockerfile" ]; then
    echo "   ✅ $agent_name"
  fi
done

# ── Remind about API keys ──
echo ""
echo "💡 To use agent execution, set your API key(s):"
echo "   export OPENAI_API_KEY=sk-..."
echo "   (or ANTHROPIC_API_KEY, GOOGLE_API_KEY, etc.)"
echo ""

# ── Start the exec API server in the background ──
echo "🚀 Starting exec API on port 8080..."
nohup node server.js > /workspaces/agent-runner/server.log 2>&1 &

echo "✅ Setup complete. Exec API running on port 8080."
