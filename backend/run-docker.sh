#!/bin/bash

set -euo pipefail

BIN_FOLDER="../target/dev/debug"
COPIED_BIN=$BIN_FOLDER/$1
ACTIVE_BIN=$BIN_FOLDER/$1-a

cp "$COPIED_BIN" "$ACTIVE_BIN"

# Kubernetes pods do not need an internal file watcher because Skaffold rebuilds
# and restarts them. Avoid inotify exhaustion inside the cluster.
if [ -n "${KUBERNETES_SERVICE_HOST:-}" ]; then
  exec "$ACTIVE_BIN"
fi

"$ACTIVE_BIN" &

inotifywait -e close_write -m "$BIN_FOLDER" |
while read -r directory events filename; do
  if [ "$filename" = "$1" ]; then
    killall "$1-a"
    rm "$ACTIVE_BIN"
    cp "$COPIED_BIN" "$ACTIVE_BIN"
    "$ACTIVE_BIN" &
  fi
done
