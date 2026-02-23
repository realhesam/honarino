#!/usr/bin/env bash

MINIO_ALIAS="localminio"
MINIO_URL="http://127.0.0.1:9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="VeryStrongPassword123"

SOURCE_DIR="./local/uploads"
TARGET_PATH="/var/honarino/backups/minio/uploads"

MC_BINARY="$HOME/.local/bin/mc"
MC_DOWNLOAD_URL="https://dl.min.io/client/mc/release/linux-amd64/mc"

set -euo pipefail

echo "Checking for mc ..."

if [[ ! -x "$MC_BINARY" ]]; then
    echo "mc not found → Downloading now ..."
    mkdir -p "$(dirname "$MC_BINARY")"
    curl -L --progress-bar "$MC_DOWNLOAD_URL" -o "$MC_BINARY"
    chmod +x "$MC_BINARY"
    echo "Download completed → $MC_BINARY"
else
    echo "mc is already installed"
fi

"$MC_BINARY" --version

echo "Setting up alias (skips if already exists) ..."

"$MC_BINARY" alias set "$MINIO_ALIAS" "$MINIO_URL" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" || true

echo "Starting live mirror (--watch mode) ..."


"$MC_BINARY" mirror \
    --watch \
    --remove \
    --overwrite \
    "$SOURCE_DIR" \
    "$MINIO_ALIAS$TARGET_PATH"

trap 'echo -e "\n\nMirror stopped.\nRun the script again to resume." EXIT' INT TERM