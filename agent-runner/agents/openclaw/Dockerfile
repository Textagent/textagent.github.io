FROM node:22-slim

LABEL maintainer="textagent"
LABEL agent="openclaw"

WORKDIR /opt/openclaw

# System dependencies + CA certs for HTTPS
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl git && \
    rm -rf /var/lib/apt/lists/*

# Install OpenClaw directly from GitHub via npm
RUN npm install -g github:openclaw/openclaw || \
    npm install -g openclaw@latest || \
    echo "WARN: openclaw not available — using shell fallback"

# Create workspace
RUN mkdir -p /root/.openclaw/workspace

WORKDIR /app

# API keys injected at runtime via docker run -e
CMD ["tail", "-f", "/dev/null"]
