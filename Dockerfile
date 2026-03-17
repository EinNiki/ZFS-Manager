# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM rust:1.83-slim AS builder

WORKDIR /app

# Cache dependencies first
COPY Cargo.toml Cargo.lock* ./
RUN mkdir src && echo 'fn main(){}' > src/main.rs
RUN cargo build --release 2>/dev/null || true
RUN rm -rf src

# ARG CACHEBUST: pass a new value (e.g. git commit hash) to force recompile
# Komodo: set build arg CACHEBUST=$(git rev-parse HEAD) in deploy settings
ARG CACHEBUST=1
RUN echo "Cache bust: $CACHEBUST"

# Build the real binary
COPY src ./src
RUN touch src/main.rs && cargo build --release

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM debian:bookworm-slim

# Enable contrib repo (required for zfsutils-linux) and install ZFS tools
RUN echo "deb http://deb.debian.org/debian bookworm main contrib" > /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian bookworm-updates main contrib" >> /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian-security bookworm-security main contrib" >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        zfsutils-linux \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/zfs-manager /usr/local/bin/zfs-manager

# Create data directory
RUN mkdir -p /home/docker/zfs-manager

EXPOSE 3000

ENV ZFS_API_PORT=3000
ENV RUST_LOG=info
ENV ZFS_MANAGER_DATA=/home/docker/zfs-manager

WORKDIR /home/docker/zfs-manager

ENTRYPOINT ["/usr/local/bin/zfs-manager"]
