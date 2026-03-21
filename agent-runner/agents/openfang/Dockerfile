FROM ubuntu:18.04

LABEL maintainer="textagent"
LABEL agent="openfang"

# System dependencies (Ubuntu 18.04 ships OpenSSL 1.0.x needed by OpenFang)
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl libssl1.0.0 socat && \
    rm -rf /var/lib/apt/lists/*

# Install OpenFang (Rust binary via official installer)
RUN curl -fsSL https://openfang.sh/install | sh || \
    echo "WARN: openfang install script failed"

# Add OpenFang to PATH
ENV PATH="/root/.openfang/bin:${PATH}"

# Initialize OpenFang (creates default config)
RUN openfang init --quick

# Configure Ollama as the default model provider
RUN printf '[default_model]\nprovider = "ollama"\nmodel = "qwen3:4b"\napi_key_env = "OLLAMA_API_KEY"\n\n[memory]\ndecay_rate = 0.05\n\napi_listen = "0.0.0.0:4200"\n' > /root/.openfang/config.toml

# Set Ollama env (dummy key, Ollama doesn't need one)
ENV OLLAMA_API_KEY=ollama

WORKDIR /app

# Forward localhost:11434 → host.docker.internal:11434 (OpenFang hardcodes localhost)
# Then start the OpenFang daemon
CMD ["sh", "-c", "socat TCP-LISTEN:11434,fork,reuseaddr TCP:host.docker.internal:11434 & sleep 1 && openfang start && tail -f /dev/null"]
