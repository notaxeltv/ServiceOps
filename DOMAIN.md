# ServiceOps — Dominio

## Visione

ServiceOps modella l'operatività di imprese che eseguono **lavori ripetitivi su clienti e impianti**: officine, installatori, studi tecnici con cantieri, aziende di manutenzione.

## Entità principali

### Organizzazione (tenant)

- `Organization`: tenant root (nome, slug, settings, piano)
- `User`: utente globale (email univoca)
- `Membership`: ruolo nell'organizzazione (OWNER, ADMIN, MEMBER, TECHNICIAN)
- `Subscription`: piano e integrazione Stripe (skeleton)

### CRM

- `Customer`: anagrafica cliente (P.IVA, contatti, indirizzo)
- `Contact`: referenti del cliente
- `Site`: sedi/impianti/cantieri del cliente

### Commesse

- `Job`: commessa/lavoro (stato, cliente, sede, date, reference)
- `JobItem`: voci di ricavo (servizi, parti, quantità, prezzo)

Stati: `DRAFT` → `CONFIRMED` → `IN_PROGRESS` → `COMPLETED` → `INVOICED`

### Attività e costi

- `Activity`: ore lavorate su commessa (tecnico, costo orario)
- `MaterialUsage`: materiali consumati su commessa
- `Material`: anagrafica magazzino
- `InventoryMovement`: movimenti IN/OUT magazzino

### Economia

Ricavi = somma `JobItem.quantity * unitPrice`  
Costi ore = somma `Activity.hours * hourlyCost`  
Costi materiali = somma `MaterialUsage.quantity * unitCost`  
Margine = Ricavi − (Costi ore + Costi materiali)

### Billing (skeleton)

- `Quote`: preventivo collegato a job
- `Invoice`: fattura collegata a job

## Relazioni

```
Organization
 ├── Customer ── Site
 │      └── Job ── JobItem (ricavi)
 │           ├── Activity (ore)
 │           └── MaterialUsage ── Material
 ├── Material ── InventoryMovement
 └── Quote / Invoice
```

## Casi d'uso

### Officina meccanica

1. Registra cliente con targa/referenza veicolo come `Job.reference`
2. Crea commessa "Revisione freni"
3. Aggiunge voci (pastiglie, manodopera)
4. Tecnico registra 2h a €35/h
5. Scarica materiale dal magazzino
6. Visualizza margine commessa e dashboard mensile

### Impresa installazione

1. Cliente con multiple `Site` (impianti)
2. Commesse per cantiere con `dueDate`
3. Report margini per cliente e export CSV per amministrazione

### Studio tecnico

1. Commesse per progetto/cantiere
2. Ore per tecnico su commessa
3. Report PDF commessa per cliente

## Flussi MVP implementati

1. **Onboarding**: register → crea Organization + User OWNER
2. **CRM**: crea Customer, aggiunge Site
3. **Commessa**: crea Job, aggiunge JobItem
4. **Costi**: registra Activity (ore) e MaterialUsage
5. **Report**: margini per job, KPI dashboard, export CSV/PDF
