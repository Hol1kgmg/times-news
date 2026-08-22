# Implementation Workflow Rules (2-Phase)

Full reference: [docs/implementation-workflow-guide.md](../docs/implementation-workflow-guide.md)

> **Note**: This file contains only the key rules needed for quick reference.
> Full details and rationale are in the guide above. When in doubt, read the guide.

## 2-Phase Structure

```
Phase 1: Implement new features in widgets/ (defer layer placement)
   ↓  (only when instructed)
Phase 2: Distribute to proper layers (satisfy architecture guide criteria)
```

- Phase 1 and Phase 2 are **separate, independent tasks** — not tied to commit granularity or merge timing
- Phase 2 runs **only when the user instructs it**. Never distribute proactively during Phase 1 work
- The architecture guide ([architecture.md](./architecture.md)) defines the **final acceptance criteria**, checked during Phase 2

## Phase 1: Provisional Implementation in widgets/

- Create new features as a single slice in `widgets/` (noun, kebab-case naming)
- Files normally belonging to `features/` / `aggregates/` / `entities/` (types.ts, adapters.ts, atoms.ts, useXxx.ts) **may coexist** in the slice
- Add a greppable marker at the top of the slice's `index.ts`:

```ts
/* PHASE1: 未振り分け */
```

### Rules deferred vs. always applied

| Rule | Phase 1 |
|---|---|
| Placement decision flowcharts (UI / BFF request / atom) | Deferred |
| Prohibited pattern 7 (placing higher than necessary) | Deferred |
| widgets internal constraints (no atoms/types, 3 data-fetching conditions) | Deferred |
| Layer dependency direction (no lower→upper, no same-layer imports) | **Always applied** |
| BFF principle (prohibited patterns 5, 8 — never bypass `routes/api/`) | **Always applied** |
| shared purity (prohibited patterns 3, 4) | **Always applied** |
| Coding standards (Branded Types, naming, arrow functions, CSS Modules) | **Always applied** |

## Phase 2: Distribution Task (Instruction-Driven)

1. Identify targets — search for `PHASE1` markers (or use the slice specified in the instruction)
2. Decide final placement via the architecture guide's decision flowcharts
3. Propose the distribution plan and wait for approval
4. Move / split files into proper layers
5. Verify with the completion checklist in the workflow guide (the `/arch-review` skill automates this check)
6. Remove the `PHASE1` marker, then run `just typecheck` / `just lint` / `just test`
