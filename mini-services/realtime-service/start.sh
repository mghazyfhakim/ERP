#!/usr/bin/env bash
# Watchdog launcher for the Nexus ERP realtime service.
# Restarts the socket.io service if it exits, so it survives the sandbox
# background-process reaping.
cd /home/z/my-project/mini-services/realtime-service || exit 1
while true; do
  echo "[watchdog] starting realtime service..."
  bun --hot index.ts
  code=$?
  echo "[watchdog] service exited (code=$code) — restarting in 2s"
  sleep 2
done
