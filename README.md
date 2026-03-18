# PocketPilot

A clean, modern personal finance web app for tracking monthly expenses, managing recurring costs, and working with multiple currencies.

## Features

- **Expense Tracking** — Add, edit, and delete one-time expenses
- **Recurring Expenses** — Manage fixed monthly costs with active/inactive toggle
- **Multi-Currency** — Support for USD, EUR, GBP, UYU, ARS, BRL, JPY, CAD, MXN, CLP
- **Categories** — Organize expenses with color-coded categories
- **Dashboard** — Visual overview with summary cards and charts
- **Filtering** — Filter by month, category, and currency
- **Responsive** — Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: PostgreSQL via Prisma ORM
- **Validation**: Zod
- **Forms**: React Hook Form
- **Charts**: Recharts
- **State**: Zustand

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or use [Prisma Postgres](https://www.prisma.io/postgres))

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/pocketpilot.git
cd pocketpilot

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update DATABASE_URL in .env with your database connection string

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed sample data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Dashboard
│   ├── expenses/           # Expenses page
│   ├── recurring/          # Recurring expenses page
│   ├── categories/         # Categories page
│   └── settings/           # Settings page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Sidebar, mobile nav, page header
│   ├── shared/             # Reusable components (empty state, skeletons, etc.)
│   ├── dashboard/          # Dashboard-specific components
│   ├── expenses/           # Expense-specific components
│   ├── recurring/          # Recurring expense components
│   ├── categories/         # Category components
│   └── settings/           # Settings components
├── lib/
│   ├── db.ts               # Prisma client singleton
│   ├── constants.ts        # Currencies, formatters
│   ├── validations.ts      # Zod schemas
│   ├── queries.ts          # Database queries
│   ├── actions.ts          # Server actions (mutations)
│   ├── store.ts            # Zustand store
│   └── utils.ts            # Utility functions
└── generated/prisma/       # Generated Prisma client
```

## Database Schema

- **User** — User profile and default currency
- **Category** — Expense categories with colors
- **Expense** — Individual expenses with amount, currency, date, category
- **RecurringExpense** — Fixed monthly expenses with active/inactive status

All monetary values use `Decimal(12,2)` for precision.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Application URL (default: http://localhost:3000) |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set `DATABASE_URL` environment variable
4. Deploy

Prisma client generation runs automatically via the `postinstall` script or build step.

### Database Migrations

```bash
# Development: push schema changes directly
npm run db:push

# Production: use migrations
npm run db:migrate
```

## CI/CD

GitHub Actions workflows are included:

- **CI** (`ci.yml`) — Runs on push/PR to main: lint, type-check, format check, build
- **Deploy** (`deploy.yml`) — Deploys to Vercel on push to main

### Required Secrets

| Secret | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `VERCEL_TOKEN` | Vercel deployment token |

## License

MIT
