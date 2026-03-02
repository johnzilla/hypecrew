# HypeCrew Infrastructure

## Architecture

```
                     ┌─────────────────────┐
                     │   DO App Platform    │
    Users ──────────>│   (static SPA)       │
                     │   dist/ from Vite    │
                     └────────┬────────────┘
                              │ API calls
                              v
                     ┌─────────────────────┐
                     │   DO Droplet         │
                     │   Self-hosted        │
                     │   Supabase           │
                     │   (Docker Compose)   │
                     │                      │
                     │  Kong (API gateway)  │
                     │  GoTrue (Auth)       │
                     │  PostgREST (REST)    │
                     │  Realtime            │
                     │  Postgres            │
                     │  Studio (Dashboard)  │
                     └─────────────────────┘
```

## Frontend: DigitalOcean App Platform

The frontend is a static Vite SPA deployed on DO App Platform with auto-deploy on push.

### Setup via Dashboard (no API key needed)

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **Create App** > connect your GitHub repo (`johnzilla/hypecrew`)
3. It will auto-detect the `.do/app.yaml` spec
4. Set the two secret environment variables:
   - `VITE_SUPABASE_URL` -- your self-hosted Supabase URL (e.g., `https://supabase.yourdomain.com`)
   - `VITE_SUPABASE_ANON_KEY` -- the `ANON_KEY` from your Supabase `.env`
5. Deploy. Every push to `main` auto-deploys.

### Setup via CLI (requires API token)

```bash
# Install doctl: https://docs.digitalocean.com/reference/doctl/how-to/install/
doctl auth init
doctl apps create --spec .do/app.yaml
```

Then set the env vars in the DO dashboard or via `doctl apps update`.

## Backend: Self-hosted Supabase on a DO Droplet

Runs the full Supabase stack (Postgres, Auth, REST, Realtime, Studio) on a single droplet using the official Docker Compose setup.

### Requirements

- DigitalOcean Droplet: **4 GB RAM / 2 vCPU** minimum (recommend 8 GB for production)
- Ubuntu 22.04+ or 24.04
- Docker and Docker Compose v2

### Quick Start

SSH into your droplet and run:

```bash
bash <(curl -sSL https://raw.githubusercontent.com/johnzilla/hypecrew/main/infra/setup-supabase.sh)
```

Or clone the repo and run:

```bash
git clone https://github.com/johnzilla/hypecrew.git
cd hypecrew
bash infra/setup-supabase.sh
```

The script will:
1. Install Docker if not present
2. Clone the official Supabase docker setup
3. Generate secure secrets (JWT, API keys, passwords)
4. Prompt you to review `.env` before starting
5. Pull images and start all services

### After Setup

1. Access Studio at `http://<droplet-ip>:8000`
2. Apply your HypeCrew migrations:
   ```bash
   # From your local machine or the droplet
   # Build your connection string from TENANT_ID and POSTGRES_PASSWORD in the Supabase .env
   # Replace placeholders with your actual values from the Supabase .env file
   psql "$YOUR_CONNECTION_STRING" \
     -f supabase/migrations/20250628222920_scarlet_cave.sql \
     -f supabase/migrations/20250628224648_pale_morning.sql \
     -f supabase/migrations/20250628224908_still_shrine.sql \
     -f supabase/migrations/20260301000000_add_messages.sql
   ```
3. Update your frontend `.env` (or DO App Platform env vars):
   ```
   VITE_SUPABASE_URL=http://<droplet-ip>:8000
   VITE_SUPABASE_ANON_KEY=<ANON_KEY from supabase .env>
   ```

### Production Hardening

For production, you should also:

- **Add a domain + HTTPS**: Put Caddy or Nginx in front of Supabase with TLS termination
- **Configure SMTP**: Edit the Supabase `.env` to set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` for auth emails
- **Set up backups**: Schedule `pg_dump` via cron, or use DO Managed Backups if on a managed database
- **Firewall**: Restrict port 8000 access, only expose via your reverse proxy on 443
- **Updates**: Check the [Supabase Docker changelog](https://github.com/supabase/supabase/blob/master/docker/CHANGELOG.md) monthly and pull new images

## CI/CD

GitHub Actions runs on every push/PR to `main`:

- TypeScript type checking
- ESLint
- Vite production build

See `.github/workflows/ci.yml`.
