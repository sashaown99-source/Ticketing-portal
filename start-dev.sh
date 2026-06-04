#!/bin/bash

# Port number to check
PORT=3000

echo "Checking if port $PORT is occupied..."

# 1. Check if occupied by a Docker container
DOCKER_CONTAINER=$(docker ps -q --filter publish=$PORT 2>/dev/null)
if [ -n "$DOCKER_CONTAINER" ]; then
  CONTAINER_NAME=$(docker ps --filter publish=$PORT --format "{{.Names}}")
  echo "Port $PORT is occupied by Docker container: '$CONTAINER_NAME' ($DOCKER_CONTAINER)."
  echo "Stopping Docker container..."
  docker stop "$DOCKER_CONTAINER"
  sleep 1
fi

# 2. Check if occupied by a host process using ss (very reliable on Kali/Linux)
SS_PIDS=$(ss -tulpn 2>/dev/null | grep ":$PORT " | grep -oE "pid=[0-9]+" | cut -d= -f2 | sort -u)
if [ -n "$SS_PIDS" ]; then
  echo "Port $PORT is occupied by host PIDs (from ss): $SS_PIDS."
  echo "Terminating host processes..."
  kill -9 $SS_PIDS
  sleep 1
fi

# 3. Double check and kill using fuser
FUSER_PIDS=$(fuser $PORT/tcp 2>/dev/null)
if [ -n "$FUSER_PIDS" ]; then
  echo "Port $PORT still occupied (fuser PIDs: $FUSER_PIDS). Terminating with fuser..."
  fuser -k $PORT/tcp
  sleep 1
fi

# 4. Check for any other running next dev or next-router-worker processes to prevent locking
NEXT_PIDS=$(pgrep -f "next dev")
WORKER_PIDS=$(pgrep -f "next-router-worker")

if [ -n "$NEXT_PIDS" ]; then
  echo "Found running Next dev server processes (PIDs: $NEXT_PIDS). Terminating..."
  kill -9 $NEXT_PIDS
  sleep 0.5
fi

if [ -n "$WORKER_PIDS" ]; then
  echo "Found running Next router workers (PIDs: $WORKER_PIDS). Terminating..."
  kill -9 $WORKER_PIDS
  sleep 0.5
fi

echo "Port $PORT is free. Starting development server..."
npm run dev
