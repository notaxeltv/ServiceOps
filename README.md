# ServiceOps

Piattaforma operativa per la gestione dei servizi.

## Graphify — knowledge graph del progetto

Questo repository include [Graphify](https://github.com/Graphify-Labs/graphify): un knowledge graph interrogabile del codebase, documentazione e configurazioni.

### Cosa fa

- **Parsing locale del codice** con tree-sitter AST (deterministico, senza LLM)
- **Query in linguaggio naturale** invece di grep su file grezzi
- **Collegamenti espliciti** tra simboli, moduli e documentazione
- **Output interattivo**: `graphify-out/graph.html`, `GRAPH_REPORT.md`, `graph.json`

### Setup rapido

```bash
# Installa il CLI (consigliato con uv)
uv tool install graphifyy
graphify install --project --platform agents
graphify cursor install
```

### Comandi principali

```bash
# Costruisci il grafo per l'intero progetto
graphify extract . --code-only          # solo codice, senza API key
graphify extract .                      # include docs/PDF (richiede backend LLM)

# Query sul grafo
graphify query "come funziona l'autenticazione?"
graphify path "UserService" "Database"
graphify explain "RateLimiter"

# Aggiorna dopo modifiche al codice (solo AST, senza costi API)
graphify update .
```

### In Cursor

- La regola `.cursor/rules/graphify.mdc` è attiva su ogni conversazione
- La skill `/graphify` è disponibile in `.cursor/skills/graphify/` e `.agents/skills/graphify/`
- Dopo il primo build, usa `graphify query` prima di esplorare il codebase con Read/Grep

### Output

```
graphify-out/
├── graph.html       # visualizzazione interattiva nel browser
├── GRAPH_REPORT.md  # panoramica architetturale
└── graph.json       # grafo completo per query CLI/MCP
```

### Hook Git

Gli hook post-commit aggiornano automaticamente il grafo dopo ogni commit. Il merge driver in `.gitattributes` unisce `graph.json` senza conflitti quando più sviluppatori committano in parallelo.

### Documentazione

- [Graphify README](https://github.com/Graphify-Labs/graphify)
- [Come funziona](https://github.com/Graphify-Labs/graphify/blob/main/docs/how-it-works.md)
