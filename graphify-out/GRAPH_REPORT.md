# Graph Report - workspace  (2026-08-24)

## Corpus Check
- 99 files · ~32,492 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 771 nodes · 1229 edges · 46 communities (39 shown, 7 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5e3792d4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useAuth
- What You Must Do When Invoked
- What You Must Do When Invoked
- devDependencies
- CurrentUser
- Italiano
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
- auth.decorator.ts
- dependencies
- AuthUserPayload
- CrmService
- ActivitiesService
- devDependencies
- ReportsService
- compilerOptions
- compilerOptions
- dependencies
- English
- app.module.ts
- compilerOptions
- scripts
- layout.tsx
- config/package.json
- nest-cli.json
- next.config.js
- BillingService

## God Nodes (most connected - your core abstractions)
1. `AuthUserPayload` - 43 edges
2. `CurrentUser` - 41 edges
3. `useAuth()` - 27 edges
4. `PrismaService` - 24 edges
5. `apiFetch()` - 20 edges
6. `compilerOptions` - 19 edges
7. `compilerOptions` - 16 edges
8. `compilerOptions` - 14 edges
9. `CrmService` - 13 edges
10. `Card()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `LoginPage()` --calls--> `useAuth()`  [EXTRACTED]
  apps/web/src/app/login/page.tsx → apps/web/src/lib/auth-context.tsx
- `RegisterPage()` --calls--> `useAuth()`  [EXTRACTED]
  apps/web/src/app/register/page.tsx → apps/web/src/lib/auth-context.tsx
- `ActivitiesPage()` --calls--> `apiFetch()`  [EXTRACTED]
  apps/web/src/app/activities/page.tsx → apps/web/src/lib/api.ts
- `ActivitiesPage()` --calls--> `useAuth()`  [EXTRACTED]
  apps/web/src/app/activities/page.tsx → apps/web/src/lib/auth-context.tsx
- `CustomerDetailPage()` --calls--> `apiFetch()`  [EXTRACTED]
  apps/web/src/app/customers/[id]/page.tsx → apps/web/src/lib/api.ts

## Import Cycles
- None detected.

## Communities (46 total, 7 thin omitted)

### Community 0 - "useAuth"
Cohesion: 0.14
Nodes (32): ActivitiesPage(), CustomerDetailPage(), Customer, CustomersPage(), DashboardKpis, DashboardPage(), InventoryPage(), JobDetail (+24 more)

### Community 1 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native AGENTS.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 2 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native AGENTS.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 3 - "devDependencies"
Cohesion: 0.04
Nodes (48): devDependencies, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, prisma, supertest, ts-jest (+40 more)

### Community 4 - "CurrentUser"
Cohesion: 0.13
Nodes (16): CurrentUser, CreateInventoryMovementDto, CreateMaterialDto, IsEnum, IsNumber, IsOptional, IsString, MinLength (+8 more)

### Community 5 - "Italiano"
Cohesion: 0.04
Nodes (43): Auth, DevOps, Frontend, Moduli backend, Multi-tenant, Panoramica, Prisma vs Drizzle, REST vs GraphQL (+35 more)

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

### Community 22 - "auth.decorator.ts"
Cohesion: 0.09
Nodes (23): AuthController, Body, Controller, Get, Post, AuthService, Injectable, LoginDto (+15 more)

### Community 23 - "dependencies"
Cohesion: 0.05
Nodes (37): dependencies, bcrypt, class-transformer, class-validator, csv-stringify, @nestjs/common, @nestjs/config, @nestjs/core (+29 more)

### Community 24 - "AuthUserPayload"
Cohesion: 0.09
Nodes (25): Get, Query, AuthUserPayload, CreateJobDto, CreateJobItemDto, IsDateString, IsEnum, IsNumber (+17 more)

### Community 25 - "CrmService"
Cohesion: 0.11
Nodes (16): CrmController, Body, Controller, Get, Param, Patch, Post, Query (+8 more)

### Community 26 - "ActivitiesService"
Cohesion: 0.13
Nodes (15): ActivitiesController, Body, Controller, Post, ActivitiesModule, Module, ActivitiesService, Injectable (+7 more)

### Community 27 - "devDependencies"
Cohesion: 0.07
Nodes (28): devDependencies, autoprefixer, eslint, eslint-config-next, postcss, tailwindcss, @types/node, @types/react (+20 more)

### Community 28 - "ReportsService"
Cohesion: 0.13
Nodes (13): computeJobEconomics(), decimalToNumber(), JobEconomics, ReportsController, Controller, Get, Param, ReportsModule (+5 more)

### Community 29 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+18 more)

### Community 30 - "compilerOptions"
Cohesion: 0.08
Nodes (25): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+17 more)

### Community 31 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, class-variance-authority, clsx, @hookform/resolvers, lucide-react, next, react, react-dom (+15 more)

### Community 32 - "English"
Cohesion: 0.13
Nodes (15): Adding a backend module, Commands, Docker Compose, Documentation, English, Graphify, License, MVP flows (+7 more)

### Community 33 - "app.module.ts"
Cohesion: 0.05
Nodes (31): AppModule, Module, AuthModule, Module, GlobalExceptionFilter, CrmModule, Module, InventoryModule (+23 more)

### Community 34 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module, moduleResolution, noEmit (+8 more)

### Community 35 - "scripts"
Cohesion: 0.12
Nodes (15): devDependencies, typescript, typescript, name, packageManager, private, scripts, build (+7 more)

### Community 38 - "layout.tsx"
Cohesion: 0.33
Nodes (4): inter, metadata, Providers(), AuthProvider()

### Community 39 - "config/package.json"
Cohesion: 0.29
Nodes (6): files, name, private, version, eslint.base.cjs, tsconfig.base.json

### Community 40 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 49 - "BillingService"
Cohesion: 0.18
Nodes (7): BillingController, Controller, Get, BillingModule, Module, BillingService, Injectable

## Knowledge Gaps
- **301 isolated node(s):** `Overview`, `Stack`, `Prerequisites`, `Setup`, `Docker Compose` (+296 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthUserPayload` connect `AuthUserPayload` to `app.module.ts`, `CurrentUser`, `BillingService`, `auth.decorator.ts`, `CrmService`, `ActivitiesService`, `ReportsService`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `CurrentUser` connect `CurrentUser` to `app.module.ts`, `BillingService`, `auth.decorator.ts`, `AuthUserPayload`, `CrmService`, `ActivitiesService`, `ReportsService`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `PrismaService` connect `app.module.ts` to `CurrentUser`, `BillingService`, `auth.decorator.ts`, `AuthUserPayload`, `CrmService`, `ActivitiesService`, `ReportsService`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `Overview`, `Stack`, `Prerequisites` to the rest of the system?**
  _301 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.14404223227752638 - nodes in this community are weakly interconnected._
- **Should `What You Must Do When Invoked` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `What You Must Do When Invoked` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._