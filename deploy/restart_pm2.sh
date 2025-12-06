#!/bin/bash
set -e

DEPLOY_DIR="/home/ec2-user/lovojbackend"
cd "$DEPLOY_DIR" || exit 1

# Read environment marker written by CodeBuild
if [ -f "$DEPLOY_DIR/deploy/env.txt" ]; then
  ENV=$(cat "$DEPLOY_DIR/deploy/env.txt" | tr -d '[:space:]')
else
  echo "deploy/env.txt not found, defaulting to staging"
  ENV="staging"
fi

echo "Deploy environment: $ENV"

# Install production dependencies (run as the deploy user on EC2)
echo "Installing production dependencies..."
if command -v npm >/dev/null 2>&1; then
  npm ci --production || npm install --production
else
  echo "npm not found in PATH. Ensure Node.js and npm are installed on the instance." >&2
fi

ECOSYSTEM_FILE="$DEPLOY_DIR/ecosystem.config.js"
if [ ! -f "$ECOSYSTEM_FILE" ]; then
  echo "ecosystem.config.js not found in $DEPLOY_DIR. Falling back to direct pm2 start."
  if [ "$ENV" = "staging" ]; then
    pm2 stop LovojBackendB2BStaging || true
    NODE_ENV=staging pm2 start server.js --name 'LovojBackendB2BStaging' --update-env || pm2 restart LovojBackendB2BStaging || true
  elif [ "$ENV" = "live" ]; then
    pm2 stop LovojBackendB2BLive || true
    NODE_ENV=live pm2 start server.js --name 'LovojBackendB2BLive' --update-env || pm2 restart LovojBackendB2BLive || true
  else
    echo "Unknown env: $ENV"
    exit 1
  fi
else
  if [ "$ENV" = "staging" ]; then
    echo "Starting/reloading staging via ecosystem..."
    pm2 start "$ECOSYSTEM_FILE" --only LovojBackendB2BStaging --update-env || pm2 restart LovojBackendB2BStaging || true
  elif [ "$ENV" = "live" ]; then
    echo "Starting/reloading live via ecosystem..."
    pm2 start "$ECOSYSTEM_FILE" --only LovojBackendB2BLive --update-env || pm2 restart LovojBackendB2BLive || true
  else
    echo "Unknown env: $ENV"
    exit 1
  fi
fi

# Save PM2 process list to survive restarts (if pm2 startup configured)
pm2 save || true

echo "PM2 restart complete."
exit 0
