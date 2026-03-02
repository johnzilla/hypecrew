# HypeCrew

A two-sided marketplace connecting people who need hype talent (solo performers or crews) for events with professional hype artists. Think Airtasker meets TaskRabbit, but for entertainment and energy services.

## What is HypeCrew?

HypeCrew bridges the gap between event organizers and professional hype performers. Whether you need energy for a wedding, gaming tournament, birthday party, or corporate event, HypeCrew connects you with verified talent who specialize in bringing the hype.

### Sample Use Cases

- "Hype person needed for birthday party - $120"
- "Wedding entrance energy crew - $300"
- "Gaming tournament host/hype - $80/hour"
- "Corporate team building energizer - $200"

## Features

### For Clients

- **Post gigs** with event details, requirements, budgets, and desired hype styles
- **Browse and filter gigs** by event type, hype style, and keyword search
- **Review applications** from performers and accept/reject them
- **Manage your profile** and account settings
- **Real-time messaging** with performers

### For Performers

- **Create a performer profile** with bio, hourly rate, specialties, location, and hype styles
- **Browse available gigs** with server-side filtering
- **Apply to gigs** with a message and optional proposed rate
- **Track application status** (pending, accepted, rejected)
- **Real-time messaging** with clients

### Hype Style Categories

**Energy Types**: High Energy, Smooth Vibes, Comedy Hype, Motivational
**Event Specialties**: Wedding, Workout/Fitness, Gaming/Esports, Social Media, Corporate, Birthday/Celebration

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 with TypeScript 5.9 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Icons | Lucide React |
| Date Formatting | date-fns 4 |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase backend -- either [Supabase Cloud](https://supabase.com) or [self-hosted](#deployment) on your own server

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/johnzilla/hypecrew.git
   cd hypecrew
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment file:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase project URL and anon key in `.env`.

4. Run the Supabase migrations against your project (the SQL files in `supabase/migrations/`).

5. Start the dev server:
   ```bash
   npm run dev
   ```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
  components/
    auth/           # AuthModal
    gigs/           # GigCard, GigList, ApplyModal
    layout/         # Header, Footer, BottomNavigation, AppLayout
    ui/             # Button, Card, Input (reusable primitives)
    ErrorBoundary.tsx
  contexts/
    AuthContext.tsx  # Shared auth state provider
  hooks/
    useAuth.ts      # Auth context consumer hook
  lib/
    format.ts       # Currency formatting
    supabase.ts     # Typed Supabase client + Database types
    types.ts        # Domain types (Profile, Gig, GigApplication, etc.)
  pages/
    BrowseGigs.tsx  # Gig listing with search/filter
    GigDetail.tsx   # Full gig view + apply + manage applications
    Landing.tsx     # Unauthenticated landing page
    MessagesPage.tsx # Real-time conversations
    PostGig.tsx     # Gig creation form with validation
    ProfilePage.tsx # Account settings + performer onboarding
  App.tsx           # Router configuration
  main.tsx          # Entry point (ErrorBoundary + AuthProvider)
supabase/
  migrations/       # Database schema, RLS policies, triggers
infra/              # Deployment and infrastructure configs
  README.md         # Detailed infrastructure documentation
  setup-supabase.sh # Self-hosted Supabase provisioning script
.do/
  app.yaml          # DigitalOcean App Platform spec
.github/
  workflows/
    ci.yml          # GitHub Actions CI pipeline
```

## Database Schema

- **profiles** -- User accounts (linked to Supabase Auth), with `user_type` (performer or client)
- **performer_profiles** -- Extended profile for performers (bio, rate, specialties, hype styles)
- **gigs** -- Event listings posted by clients
- **gig_applications** -- Performer applications to gigs (unique per gig+performer)
- **messages** -- Real-time messaging between users

All tables use Row Level Security (RLS). Profile creation is handled automatically via a database trigger on `auth.users` insert.

## Deployment

### CI/CD

GitHub Actions runs typecheck, lint, and build on every push and pull request to `main`. See `.github/workflows/ci.yml`.

### Frontend -- DigitalOcean App Platform

The frontend deploys as a static site on DO App Platform with auto-deploy on push to `main`.

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps) and connect this GitHub repo
2. It will auto-detect the `.do/app.yaml` spec
3. Set the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables
4. Deploy -- every subsequent push to `main` auto-deploys

### Backend -- Self-hosted Supabase

The backend runs the full Supabase stack (Postgres, Auth, REST API, Realtime, Studio dashboard) on a single DigitalOcean droplet via Docker Compose.

**Requirements**: 4 GB RAM / 2 vCPU minimum, Ubuntu 22.04+

**Quick start** -- SSH into your droplet and run:

```bash
bash <(curl -sSL https://raw.githubusercontent.com/johnzilla/hypecrew/main/infra/setup-supabase.sh)
```

The script installs Docker, clones the official Supabase docker setup, generates secure secrets, and starts all services. After setup, apply the HypeCrew database migrations and point the frontend env vars at your droplet.

See [infra/README.md](infra/README.md) for the full architecture diagram, step-by-step instructions, and production hardening checklist.

## Future Enhancements

- [ ] Payment processing with escrow system
- [ ] Push notifications for new gig matches
- [ ] Video portfolio uploads
- [ ] Calendar integration
- [ ] Multi-performer team booking
- [ ] Performance analytics dashboard
- [ ] Gig recommendation algorithm
- [ ] Performer verification system

## Author

- LinkedIn: [@johnturner313](https://www.linkedin.com/in/johnturner313)
- GitHub: [@johnzilla](https://github.com/johnzilla)
- Portfolio: [johnturner.com](https://johnturner.com)
