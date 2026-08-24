# ServiceOps — Architettura

## Panoramica

ServiceOps è un SaaS B2B multi-tenant per piccole imprese di servizi. Il repository è un **monorepo pnpm** con:

- `apps/api` — backend NestJS + Prisma + PostgreSQL
- `apps/web` — frontend Next.js 15 (App Router)
- `packages/config` — configurazione TypeScript condivisa

```
┌─────────────┐     REST/JSON      ┌─────────────┐     Prisma      ┌────────────┐
│  Next.js    │ ◄──────────────► │   NestJS    │ ◄────────────► │ PostgreSQL │
│  (web)      │   JWT Bearer     │   (api)     │                │            │
└─────────────┘                  └─────────────┘                └────────────┘
```

## Scelte tecnologiche

### Prisma vs Drizzle

**Scelta: Prisma**

| Criterio | Prisma | Drizzle |
|----------|--------|---------|
| Migrations | Mature, team-friendly | Buone, più manuali |
| Multi-tenant patterns | Ampia documentazione | Flessibile ma più DIY |
| DX | Prisma Studio, generate client | Più leggero |
| Type safety | Client generato | SQL-first types |

Per un prodotto B2B con molte entità correlate e team che evolve, Prisma offre migliore produttività e tooling (migrate, studio, seed).

### REST vs GraphQL

**Scelta: REST**

- API B2B con CRUD prevedibili e report aggregati
- Caching HTTP e integrazioni future (Zapier, export) più semplici
- TanStack Query ottimizzato per REST
- GraphQL può essere aggiunto in un modulo `graphql` se servono query ad hoc complesse

### Auth

- JWT Bearer con `organizationId` e `role` nel payload
- `Membership` collega User ↔ Organization
- Tutte le query di dominio filtrano per `organizationId` (tenant isolation)
- Struttura pronta per SSO enterprise (provider abstraction in `auth` module)

## Moduli backend

| Modulo | Responsabilità |
|--------|------------------|
| `auth` | Register, login, JWT, guard |
| `organizations` | Settings tenant, piano |
| `users` | Lista membri organizzazione |
| `crm` | Customer, Contact, Site |
| `jobs` | Job, JobItem, stati commessa |
| `activities` | Ore lavorate, MaterialUsage |
| `inventory` | Material, InventoryMovement |
| `billing` | Quote, Invoice, Subscription (skeleton) |
| `reports` | KPI dashboard, margini, PDF/CSV export |

## Multi-tenant

- Ogni tabella di dominio ha `organizationId`
- Indici su `(organizationId)` e `(organizationId, foreignKey)`
- JWT include `organizationId` — nessuna query cross-tenant senza switch esplicito
- Feature flags in `Organization.settings` JSON (inventory, billing, ecc.)

## Scalabilità

| Layer | Strategia attuale | Evoluzione |
|-------|-------------------|------------|
| DB | PostgreSQL gestito (Neon/Supabase/Railway) | Read replicas, connection pooling (PgBouncer) |
| API | Stateless NestJS containers | Horizontal scaling, rate limit per tenant |
| Cache | Non implementata | Redis per sessioni/KPI dashboard |
| Jobs async | Sync | BullMQ per report pesanti, email |
| File export | In-process PDF/CSV | S3 + worker per export grandi |
| Observability | stdout logging | Sentry, OpenTelemetry, Prometheus |

## Frontend

- Next.js 15 App Router, TypeScript strict
- Tailwind + componenti UI minimali (pronti per shadcn/ui)
- TanStack Query per stato server
- Zod-ready (validazione form via React Hook Form)
- Layout con sidebar, auth guard, organization context da JWT

## DevOps

- `docker-compose.yml`: web + api + postgres
- GitHub Actions: lint, typecheck, test, docker build
- Dockerfile multi-stage per api e web (standalone Next.js)

## Evoluzione futura

- SSO enterprise (SAML/OIDC)
- OpenTelemetry tracing distribuito
- Billing avanzato (righe dettaglio su preventivi/fatture, pagamenti parziali)
