FROM node:22-slim

LABEL maintainer="textagent"
LABEL agent="openclaw"

WORKDIR /opt/openclaw

# System dependencies + CA certs for HTTPS + socat for Ollama bridge
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl git socat && \
    rm -rf /var/lib/apt/lists/*

# Install OpenClaw directly from GitHub via npm
RUN npm install -g github:openclaw/openclaw || \
    npm install -g openclaw@latest || \
    echo "WARN: openclaw not available — using shell fallback"

# Create workspace + config directory
RUN mkdir -p /root/.openclaw/workspace /root/.openclaw/agents/main/agent

# Configure Ollama as the default model provider + set agent default model
RUN echo '{"models":{"providers":{"ollama":{"baseUrl":"http://localhost:11434/v1","apiKey":"ollama","models":[{"id":"qwen3:4b","name":"qwen3:4b"}]}}},"agents":{"defaults":{"model":"ollama/qwen3:4b"}}}' > /root/.openclaw/openclaw.json

WORKDIR /app

# Forward localhost:11434 → host.docker.internal:11434 (OpenClaw uses localhost)
# Then keep container running — commands executed via docker exec
CMD ["sh", "-c", "socat TCP-LISTEN:11434,fork,reuseaddr TCP:host.docker.internal:11434 & tail -f /dev/null"]
