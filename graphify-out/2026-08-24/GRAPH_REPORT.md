# Graph Report - workspace  (2026-08-24)

## Corpus Check
- 106 files · ~35,141 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 852 nodes · 1394 edges · 61 communities (45 shown, 16 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `737f3bbd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useAuth
- What You Must Do When Invoked
- What You Must Do When Invoked
- devDependencies
- InventoryService
- ServiceOps — Architettura
- graphify reference: extra exports and benchmark
- graphify reference: extra exports and benchmark
- graphify reference: query, path, explain
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native AGENTS.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native AGENTS.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- .agents/skills/graphify/references/extraction-spec.md
- .cursor/skills/graphify/references/extraction-spec.md
- auth.controller.ts
- dependencies
- JobsService
- CrmService
- @tanstack/react-query
- devDependencies
- AuthUserPayload
- compilerOptions
- compilerOptions
- dependencies
- English
- app.module.ts
- compilerOptions
- scripts
- Param
- IsEmail
- layout.tsx
- config/package.json
- nest-cli.json
- next.config.js
- organizations.controller.ts
- BillingService
- IsEnum
- Italiano
- web/package.json
- ServiceOps — Dominio
- Entità principali
- README.md
- Avvio rapido (locale)
- Quick start (local)
- Backend modules
- lucide-react
- zod
- @types/node

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 31 edges
2. `AuthUserPayload` - 27 edges
3. `CurrentUser` - 25 edges
4. `apiFetch()` - 23 edges
5. `compilerOptions` - 19 edges
6. `CrmService` - 18 edges
7. `PrismaService` - 18 edges
8. `BillingService` - 16 edges
9. `compilerOptions` - 16 edges
10. `CrmController` - 14 edges

## Surprising Connections (you probably didn't know these)
- `LoginPage()` --calls--> `useAuth()`  [EXTRACTED]
  apps/web/src/app/login/page.tsx → apps/web/src/lib/auth-context.tsx
- `RegisterPage()` --calls--> `useAuth()`  [EXTRACTED]
  apps/web/src/app/register/page.tsx → apps/web/src/lib/auth-context.tsx
- `BillingPage()` --calls--> `apiFetch()`  [EXTRACTED]
  apps/web/src/app/billing/page.tsx → apps/web/src/lib/api.ts
- `BillingPage()` --calls--> `useAuth()`  [EXTRACTED]
  apps/web/src/app/billing/page.tsx → apps/web/src/lib/auth-context.tsx
- `CustomerDetailPage()` --calls--> `apiFetch()`  [EXTRACTED]
  apps/web/src/app/customers/[id]/page.tsx → apps/web/src/lib/api.ts

## Import Cycles
- None detected.

## Communities (61 total, 16 thin omitted)

### Community 0 - "useAuth"
Cohesion: 0.10
Nodes (46): ActivitiesPage(), BillingPage(), Invoice, Quote, Contact, CustomerDetailPage(), Customer, CustomersPage() (+38 more)

### Community 1 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native AGENTS.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 2 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native AGENTS.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 3 - "devDependencies"
Cohesion: 0.04
Nodes (48): devDependencies, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, prisma, supertest, ts-jest (+40 more)

### Community 4 - "InventoryService"
Cohesion: 0.12
Nodes (16): CreateInventoryMovementDto, CreateMaterialDto, IsEnum, IsNumber, IsOptional, IsString, MinLength, InventoryController (+8 more)

### Community 5 - "ServiceOps — Architettura"
Cohesion: 0.17
Nodes (12): Auth, DevOps, Evoluzione futura, Frontend, Moduli backend, Multi-tenant, Panoramica, Prisma vs Drizzle (+4 more)

### Community 6 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 7 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 8 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 9 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 10 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 11 - "graphify reference: commit hook and native AGENTS.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native AGENTS.md integration, graphify reference: commit hook and native AGENTS.md integration

### Community 12 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 13 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 14 - "graphify reference: commit hook and native AGENTS.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native AGENTS.md integration, graphify reference: commit hook and native AGENTS.md integration

### Community 15 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 22 - "auth.controller.ts"
Cohesion: 0.07
Nodes (27): AuthController, Body, Controller, CurrentUser, Get, Post, Public, AuthService (+19 more)

### Community 23 - "dependencies"
Cohesion: 0.05
Nodes (39): dependencies, bcrypt, class-transformer, class-validator, csv-stringify, @nestjs/common, @nestjs/config, @nestjs/core (+31 more)

### Community 24 - "JobsService"
Cohesion: 0.14
Nodes (18): CreateJobDto, CreateJobItemDto, IsDateString, IsEnum, IsNumber, IsOptional, IsString, MinLength (+10 more)

### Community 25 - "CrmService"
Cohesion: 0.11
Nodes (20): CrmController, Body, Controller, CurrentUser, Get, Patch, Post, Query (+12 more)

### Community 27 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, autoprefixer, eslint, eslint-config-next, postcss, tailwindcss, @types/react, @types/react-dom (+9 more)

### Community 28 - "AuthUserPayload"
Cohesion: 0.07
Nodes (30): ActivitiesController, Body, Controller, Get, Post, Query, ActivitiesService, Injectable (+22 more)

### Community 29 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+18 more)

### Community 30 - "compilerOptions"
Cohesion: 0.08
Nodes (25): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+17 more)

### Community 31 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, class-variance-authority, clsx, @hookform/resolvers, next, react, react-dom, react-hook-form (+9 more)

### Community 32 - "English"
Cohesion: 0.18
Nodes (11): Adding a backend module, Commands, Documentation, English, Graphify, License, MVP flows, Overview (+3 more)

### Community 33 - "app.module.ts"
Cohesion: 0.06
Nodes (32): ActivitiesModule, Module, AppModule, Module, AuthModule, Module, BillingModule, Module (+24 more)

### Community 34 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module, moduleResolution, noEmit (+8 more)

### Community 35 - "scripts"
Cohesion: 0.12
Nodes (15): devDependencies, typescript, typescript, name, packageManager, private, scripts, build (+7 more)

### Community 38 - "layout.tsx"
Cohesion: 0.40
Nodes (3): inter, metadata, Providers()

### Community 39 - "config/package.json"
Cohesion: 0.29
Nodes (6): files, name, private, version, eslint.base.cjs, tsconfig.base.json

### Community 40 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 48 - "organizations.controller.ts"
Cohesion: 0.14
Nodes (13): slugify(), CreateOrganizationDto, IsString, MinLength, OrganizationsController, Body, Controller, CurrentUser (+5 more)

### Community 49 - "BillingService"
Cohesion: 0.10
Nodes (18): BillingController, Body, Controller, CurrentUser, Get, Post, Public, BillingService (+10 more)

### Community 52 - "Italiano"
Cohesion: 0.18
Nodes (11): Aggiungere un modulo backend, Comandi, Documentazione, Flussi MVP, Graphify, Italiano, Licenza, Panoramica (+3 more)

### Community 53 - "web/package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, start, typecheck (+1 more)

### Community 54 - "ServiceOps — Dominio"
Cohesion: 0.25
Nodes (8): Casi d'uso, Flussi MVP implementati, Impresa installazione, Officina meccanica, Relazioni, ServiceOps — Dominio, Studio tecnico, Visione

### Community 55 - "Entità principali"
Cohesion: 0.29
Nodes (7): Attività e costi, Billing (skeleton), Commesse, CRM, Economia, Entità principali, Organizzazione (tenant)

### Community 57 - "Avvio rapido (locale)"
Cohesion: 0.50
Nodes (4): Avvio rapido (locale), Docker Compose, Prerequisiti, Setup

### Community 58 - "Quick start (local)"
Cohesion: 0.50
Nodes (4): Docker Compose, Prerequisites, Quick start (local), Setup

## Knowledge Gaps
- **311 isolated node(s):** `Panoramica`, `Prisma vs Drizzle`, `REST vs GraphQL`, `Auth`, `Moduli backend` (+306 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthUserPayload` connect `AuthUserPayload` to `app.module.ts`, `InventoryService`, `organizations.controller.ts`, `BillingService`, `auth.controller.ts`, `JobsService`, `CrmService`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `CurrentUser` connect `AuthUserPayload` to `app.module.ts`, `InventoryService`, `organizations.controller.ts`, `BillingService`, `auth.controller.ts`, `JobsService`, `CrmService`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `PrismaService` connect `app.module.ts` to `InventoryService`, `organizations.controller.ts`, `BillingService`, `auth.controller.ts`, `JobsService`, `CrmService`, `AuthUserPayload`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `Panoramica`, `Prisma vs Drizzle`, `REST vs GraphQL` to the rest of the system?**
  _311 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.09931798806479114 - nodes in this community are weakly interconnected._
- **Should `What You Must Do When Invoked` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `What You Must Do When Invoked` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._