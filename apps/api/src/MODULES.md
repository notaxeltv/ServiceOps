# Backend modules

| Module | Path | Responsibility |
|--------|------|----------------|
| `auth` | `src/auth/` | JWT login, register, switch organization |
| `organizations` | `src/organizations/` | Tenant settings, create additional orgs |
| `users` | `src/users/` | List members of current organization |
| `crm` | `src/crm/` | Customers, sites, contacts |
| `jobs` | `src/jobs/` | Jobs, line items, economics on read |
| `activities` | `src/activities/` | Labor hours, material usage on jobs |
| `inventory` | `src/inventory/` | Materials, movements, low-stock alerts |
| `billing` | `src/billing/` | Quotes, invoices, Stripe checkout/webhooks |
| `reports` | `src/reports/` | Dashboard KPIs, margins, PDF/CSV export |
| `prisma` | `src/prisma/` | Database client (global module) |

## Adding a module

1. Create folder under `src/<name>/` with `*.module.ts`, `*.service.ts`, `*.controller.ts`
2. Add DTOs with `class-validator` in `dto/`
3. Ensure all Prisma queries filter by `organizationId`
4. Register in `app.module.ts`
5. Add frontend page + TanStack Query hooks
