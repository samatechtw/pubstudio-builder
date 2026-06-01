#!/usr/bin/env bash

# Build the Site API debug binary for the Linux container target and expose it at
# backend/target/dev/debug.
#
# Honors PUBSTUDIO_RUST_TARGET / RUST_TARGET / PUBSTUDIO_RUST_LINKER when set,
# otherwise derives the target from the host architecture.

set -euo pipefail

host_os="$(uname -s)"
host_arch="$(uname -m)"

case "$host_arch" in
  arm64 | aarch64)
    default_target="aarch64-unknown-linux-gnu"
    ;;
  amd64 | x86_64)
    default_target="x86_64-unknown-linux-gnu"
    ;;
  *)
    echo "Unsupported architecture: $host_arch" >&2
    exit 1
    ;;
esac

native_linux_target="$default_target"
rust_target="${PUBSTUDIO_RUST_TARGET:-${RUST_TARGET:-$default_target}}"
linker="${PUBSTUDIO_RUST_LINKER:-}"

linker_env_name="CARGO_TARGET_$(printf '%s' "$rust_target" | tr '[:lower:]-' '[:upper:]_')_LINKER"

if [ -z "$linker" ]; then
  candidate_linker="${rust_target}-gcc"
  if command -v "$candidate_linker" >/dev/null 2>&1; then
    linker="$candidate_linker"
  fi
fi

needs_cross_linker=false
if [ "$host_os" != "Linux" ] || [ "$rust_target" != "$native_linux_target" ]; then
  needs_cross_linker=true
fi

if [ "$needs_cross_linker" = true ] && [ -z "$linker" ]; then
  echo "No linker configured for Rust target $rust_target on $host_os/$host_arch." >&2
  echo "Set PUBSTUDIO_RUST_LINKER or install ${rust_target}-gcc." >&2
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
backend_dir="$(cd "$script_dir/../../backend" && pwd)"

cd "$backend_dir"

if [ -n "$linker" ]; then
  export "$linker_env_name"="$linker"
fi

cargo build --target "$rust_target"
ln -sfn "$rust_target" target/dev
