#!/usr/bin/env bash
#
# Self-hosted Supabase setup script for a fresh Ubuntu droplet.
#
# Usage:
#   1. Create a DigitalOcean droplet (4 GB RAM / 2 vCPU minimum)
#   2. SSH in and run:
#        curl -sSL https://raw.githubusercontent.com/johnzilla/hypecrew/main/infra/setup-supabase.sh | bash
#      Or clone the repo and run:
#        bash infra/setup-supabase.sh
#
# What this does:
#   - Installs Docker and Docker Compose (if missing)
#   - Clones the official Supabase docker setup
#   - Generates secure secrets
#   - Starts all services
#
# After running, configure your domain/IP in the .env file and
# set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for the frontend.

set -euo pipefail

SUPABASE_DIR="$HOME/supabase-selfhost"

echo "==> Installing Docker (if needed)..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  echo "    Docker installed. You may need to log out and back in for group changes."
fi

if ! docker compose version &>/dev/null; then
  echo "ERROR: docker compose plugin not found. Install Docker Compose v2."
  exit 1
fi

echo "==> Cloning official Supabase docker setup..."
if [ -d "$SUPABASE_DIR" ]; then
  echo "    $SUPABASE_DIR already exists, skipping clone."
else
  git clone --depth 1 https://github.com/supabase/supabase /tmp/supabase-src
  mkdir -p "$SUPABASE_DIR"
  cp -rf /tmp/supabase-src/docker/* "$SUPABASE_DIR/"
  cp /tmp/supabase-src/docker/.env.example "$SUPABASE_DIR/.env"
  rm -rf /tmp/supabase-src
fi

cd "$SUPABASE_DIR"

echo "==> Generating secrets..."
if [ -f ./utils/generate-keys.sh ]; then
  sh ./utils/generate-keys.sh
else
  echo "    generate-keys.sh not found -- you must manually edit .env"
  echo "    See: https://supabase.com/docs/guides/self-hosting/docker"
fi

echo ""
echo "==> IMPORTANT: Before starting, edit $SUPABASE_DIR/.env and set:"
echo "    - POSTGRES_PASSWORD (secure password, letters + numbers only)"
echo "    - DASHBOARD_PASSWORD (for Studio access)"
echo "    - SUPABASE_PUBLIC_URL (your droplet IP or domain, e.g. http://YOUR_IP:8000)"
echo "    - API_EXTERNAL_URL (same as SUPABASE_PUBLIC_URL)"
echo "    - SITE_URL (your frontend URL, e.g. https://hypecrew.example.com)"
echo ""
echo "    The generate-keys.sh script may have already set JWT_SECRET, ANON_KEY,"
echo "    and SERVICE_ROLE_KEY. Verify them in .env."
echo ""

read -rp "Edit .env now and press Enter when ready to start (or Ctrl-C to abort)..."

echo "==> Pulling images..."
docker compose pull

echo "==> Starting Supabase..."
docker compose up -d

echo ""
echo "==> Waiting for services to start..."
sleep 15
docker compose ps

echo ""
echo "============================================"
echo " Supabase is running!"
echo ""
echo " Studio:   http://$(hostname -I | awk '{print $1}'):8000"
echo " REST API: http://$(hostname -I | awk '{print $1}'):8000/rest/v1/"
echo " Auth API: http://$(hostname -I | awk '{print $1}'):8000/auth/v1/"
echo ""
echo " For HypeCrew, set these in your frontend .env:"
echo "   VITE_SUPABASE_URL=http://$(hostname -I | awk '{print $1}'):8000"
echo "   VITE_SUPABASE_ANON_KEY=<your ANON_KEY from $SUPABASE_DIR/.env>"
echo ""
echo " Then apply your migrations (replace placeholders with values from .env):"
echo "   psql '\$YOUR_CONNECTION_STRING' < supabase/migrations/*.sql"
echo "   See Supabase docs for connection string format using TENANT_ID and POSTGRES_PASSWORD"
echo ""
echo " Docs: https://supabase.com/docs/guides/self-hosting/docker"
echo "============================================"
