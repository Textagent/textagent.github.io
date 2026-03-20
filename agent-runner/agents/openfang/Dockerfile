FROM node:22-slim

LABEL maintainer="textagent"
LABEL agent="openfang"

WORKDIR /opt/openfang

# System dependencies + CA certs for HTTPS
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl git && \
    rm -rf /var/lib/apt/lists/*

# Install OpenFang directly from GitHub via npm
RUN npm install -g github:openfang/openfang || \
    npm install -g openfang@latest || \
    echo "WARN: openfang not available — using shell fallback"

# Create workspace
RUN mkdir -p /root/.openfang/workspace

WORKDIR /app

# API keys injected at runtime via docker run -e
CMD ["tail", "-f", "/dev/null"]
