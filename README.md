# Tempora

Fullstack SaaS platform for freelancers and small teams — time tracking, kanban project management, and invoicing with PDF export.

## Tech Stack

| Layer        | Technology                                     |
| ------------ | ---------------------------------------------- |
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend**  | Fastify, Zod, WebSockets                       |
| **Database** | PostgreSQL 16, Prisma ORM                      |
| **Auth**     | NextAuth.js (OAuth + Credentials)              |
| **Testing**  | Jest, React Testing Library, Playwright        |
| **Infra**    | Docker Compose, GitHub Actions, Turborepo      |
| **Deploy**   | Vercel (web), Railway (api), Neon (database)   |

## Architecture

```
tempora/
├── apps/
│   ├── web/              # Next.js frontend (port 3000)
│   └── api/              # Fastify REST API (port 4000)
├── packages/
│   ├── db/               # Prisma schema + client
│   └── types/            # Shared TypeScript types
├── docker-compose.yml    # PostgreSQL + Redis
└── turbo.json            # Turborepo config
```

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose

### Setup

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/tempora.git
cd tempora
pnpm install

# 2. Start databases
docker compose up -d

# 3. Setup environment
cp .env.example .env.local

# 4. Run migrations and seed
pnpm run db:generate
pnpm run db:migrate
pnpm run db:seed

# 5. Start development
pnpm run dev
```

The app will be available at:

- **Web:** http://localhost:3000
- **API:** http://localhost:4000
- **API Docs:** http://localhost:4000/docs

### Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `pnpm dev`        | Start all apps in dev mode   |
| `pnpm build`      | Build all apps               |
| `pnpm test`       | Run unit + integration tests |
| `pnpm test:e2e`   | Run Playwright E2E tests     |
| `pnpm db:studio`  | Open Prisma Studio           |
| `pnpm db:migrate` | Run database migrations      |
| `pnpm db:seed`    | Seed database with demo data |

## Features

### MVP (current)

- [ ] Dashboard with project overview
- [ ] Kanban board with drag & drop (real-time sync)
- [ ] Time tracker (live timer + manual entries)
- [ ] Invoice generation with PDF export
- [ ] Auth (email/password + Google OAuth)

### V2 (planned)

- [ ] Multi-user workspaces with RBAC
- [ ] AI weekly summary (LLM-powered)
- [ ] Stripe subscription billing
- [ ] Dashboard analytics with charts

## License

MIT
