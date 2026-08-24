# ServiceOps

**English** · [Italiano](#italiano)

Multi-tenant B2B SaaS for service businesses: customers, jobs, hours, materials, margins, and reports.

---

## English

### Overview

ServiceOps is an operational system for small service companies that manage customers and recurring jobs/projects (workshops, installation and maintenance firms, technical studios with job sites, field service companies, and similar).

It replaces scattered spreadsheets and chat threads with a single platform to:

- Manage customers, sites, and job history
- Track jobs (status, quotes, hours, materials, external costs)
- Optionally manage a parts/materials warehouse
- Calculate revenue, costs, and margins per job and per organization
- View dashboards and reports with PDF/CSV export

### Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, TanStack Query, Zod |
| Backend | NestJS, Prisma ORM, PostgreSQL |
| Auth | JWT with multi-tenant `Organization` isolation |
| Infra | Docker Compose, GitHub Actions |

### Quick start (local)

#### Prerequisites

- Node.js 22+
- pnpm 9+
- PostgreSQL 16 (or Docker)

#### Setup

```bash
pnpm install

# Configure database
cp apps/api/.env.example apps/api/.env
# Edit DATABASE_URL if needed

pnpm db:push          # apply Prisma schema
pnpm dev              # starts api (3001) + web (3000)
```

Open http://localhost:3000 → Register → create your organization → use the MVP.

#### Docker Compose

```bash
docker compose up --build
```

Services: `web` (3000), `api` (3001), `db` (5432).

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev mode for api + web |
| `pnpm build` | Production build |
| `pnpm test` | Run tests |
| `pnpm typecheck` | TypeScript check |
| `pnpm db:push` | Sync database schema |
| `pnpm db:migrate` | Prisma migrate dev |

### Repository structure

```
apps/
  api/          NestJS backend
  web/          Next.js frontend
packages/
  config/       shared TypeScript config
```

### Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — technical choices and scalability
- [DOMAIN.md](./DOMAIN.md) — domain model and use cases

### Graphify

This project includes [Graphify](https://github.com/Graphify-Labs/graphify) for a queryable knowledge graph of the codebase.

```bash
graphify update .                    # refresh graph after code changes
graphify query "how does auth work?"
```

Output lives in `graphify-out/`.

### Adding a backend module

1. Create `apps/api/src/<module>/` with module, service, and controller
2. Add entities in `prisma/schema.prisma` with `organizationId`
3. Register the module in `app.module.ts`
4. Add the corresponding page/API client in the frontend

### Tests

```bash
pnpm --filter @serviceops/api test        # unit tests
pnpm --filter @serviceops/api test:e2e    # e2e (requires DB)
```

### MVP flows

1. Register → creates organization and owner user
2. Create customers and sites
3. Create jobs and line items (revenue)
4. Log hours and material usage (costs)
5. View per-job margins and dashboard KPIs

### License

Proprietary — ServiceOps

---

## Italiano

### Panoramica

ServiceOps è un sistema operativo per piccole imprese di servizi che gestiscono clienti e commesse/lavori ripetitivi (officine, imprese di installazione e manutenzione, studi tecnici con cantieri, aziende di servizi sul campo, ecc.).

Sostituisce Excel, fogli sparsi e chat con una piattaforma unica per:

- Gestire clienti, sedi/impianti e storico lavori
- Seguire commesse (stato, preventivo, ore, materiali, costi esterni)
- Gestire opzionalmente un magazzino materiali/ricambi
- Calcolare ricavi, costi e margini per commessa e per organizzazione
- Offrire dashboard e report con export PDF/CSV

### Stack

| Layer | Tecnologie |
|-------|------------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, TanStack Query, Zod |
| Backend | NestJS, Prisma ORM, PostgreSQL |
| Auth | JWT con isolamento multi-tenant per `Organization` |
| Infra | Docker Compose, GitHub Actions |

### Avvio rapido (locale)

#### Prerequisiti

- Node.js 22+
- pnpm 9+
- PostgreSQL 16 (o Docker)

#### Setup

```bash
pnpm install

# Configura database
cp apps/api/.env.example apps/api/.env
# Modifica DATABASE_URL se necessario

pnpm db:push          # applica schema Prisma
pnpm dev              # avvia api (3001) + web (3000)
```

Apri http://localhost:3000 → Registrati → crea organizzazione → usa il MVP.

#### Docker Compose

```bash
docker compose up --build
```

Servizi: `web` (3000), `api` (3001), `db` (5432).

### Comandi

| Comando | Descrizione |
|---------|-------------|
| `pnpm dev` | Dev mode api + web |
| `pnpm build` | Build produzione |
| `pnpm test` | Test |
| `pnpm typecheck` | Controllo TypeScript |
| `pnpm db:push` | Sync schema database |
| `pnpm db:migrate` | Prisma migrate dev |

### Struttura del repository

```
apps/
  api/          backend NestJS
  web/          frontend Next.js
packages/
  config/       configurazione TypeScript condivisa
```

### Documentazione

- [ARCHITECTURE.md](./ARCHITECTURE.md) — scelte tecnologiche e scalabilità
- [DOMAIN.md](./DOMAIN.md) — modello di dominio e casi d'uso

### Graphify

Il progetto include [Graphify](https://github.com/Graphify-Labs/graphify) per un knowledge graph interrogabile del codebase.

```bash
graphify update .                    # aggiorna grafo dopo modifiche
graphify query "come funziona l'auth?"
```

Output in `graphify-out/`.

### Aggiungere un modulo backend

1. Crea `apps/api/src/<modulo>/` con module, service e controller
2. Aggiungi entità in `prisma/schema.prisma` con `organizationId`
3. Registra il modulo in `app.module.ts`
4. Aggiungi pagina/client API nel frontend

### Test

```bash
pnpm --filter @serviceops/api test        # unit
pnpm --filter @serviceops/api test:e2e    # e2e (richiede DB)
```

### Flussi MVP

1. Registrazione → crea organizzazione e utente owner
2. Crea clienti e sedi
3. Crea commesse e voci (ricavi)
4. Registra ore e materiali (costi)
5. Visualizza margini per commessa e KPI dashboard

### Licenza

Proprietario — ServiceOps
