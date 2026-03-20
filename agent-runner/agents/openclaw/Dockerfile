FROM node:22-slim

LABEL maintainer="textagent"
LABEL agent="openclaw"

WORKDIR /app

# System dependencies (git for skills, curl for health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl && \
    rm -rf /var/lib/apt/lists/*

# Install OpenClaw globally
RUN npm install -g openclaw@latest 2>/dev/null || \
    echo "⚠ openclaw package not yet available — using placeholder"

# Create config directory structure
RUN mkdir -p /root/.openclaw/workspace

# API keys are injected at runtime via docker run -e
# e.g. OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY

# Keep container running for exec
CMD ["tail", "-f", "/dev/null"]
