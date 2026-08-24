# ServiceOps

Sistema operativo multi-tenant per piccole imprese di servizi: clienti, commesse, ore, materiali, margini e report.

## Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind, TanStack Query
- **Backend**: NestJS, Prisma, PostgreSQL
- **Infra**: Docker Compose, GitHub Actions

## Avvio rapido (locale)

### Prerequisiti

- Node.js 22+
- pnpm 9+
- PostgreSQL 16 (o Docker)

### Setup

```bash
pnpm install

# Configura database
cp apps/api/.env.example apps/api/.env
# Modifica DATABASE_URL se necessario

pnpm db:push          # applica schema Prisma
pnpm dev              # avvia api (3001) + web (3000) in parallelo
```

Apri http://localhost:3000 → Registrati → crea organizzazione → usa il MVP.

### Docker Compose

```bash
docker compose up --build
```

Servizi: `web` (3000), `api` (3001), `db` (5432).

## Comandi

| Comando | Descrizione |
|---------|-------------|
| `pnpm dev` | Dev mode api + web |
| `pnpm build` | Build produzione |
| `pnpm test` | Test unitari |
| `pnpm typecheck` | TypeScript check |
| `pnpm db:push` | Sync schema DB |
| `pnpm db:migrate` | Prisma migrate dev |

## Struttura

```
apps/
  api/          NestJS backend
  web/          Next.js frontend
packages/
  config/       tsconfig condiviso
```

## Documentazione

- [ARCHITECTURE.md](./ARCHITECTURE.md) — scelte tecnologiche e scalabilità
- [DOMAIN.md](./DOMAIN.md) — modello di dominio e casi d'uso

## Graphify

Il progetto include [Graphify](https://github.com/Graphify-Labs/graphify) per il knowledge graph del codebase.

```bash
graphify update .     # aggiorna grafo dopo modifiche
graphify query "come funziona l'auth?"
```

Output in `graphify-out/`.

## Aggiungere un modulo backend

1. Crea `apps/api/src/<modulo>/` con module, service, controller
2. Aggiungi entità in `prisma/schema.prisma` con `organizationId`
3. Registra modulo in `app.module.ts`
4. Aggiungi pagina/API client nel frontend

## Test

```bash
pnpm --filter @serviceops/api test        # unit
pnpm --filter @serviceops/api test:e2e    # e2e (richiede DB)
```

## Licenza

Proprietario — ServiceOps
