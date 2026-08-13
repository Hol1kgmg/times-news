# BFF Request Rules

Full reference: [docs/layer-architecture-guide.md](../docs/layer-architecture-guide.md)

> **Note**: This file contains only the key rules needed for quick reference.
> Full details and rationale are in the guide above. When in doubt, read the guide.

## Placement and Call Sites

| Type | Define in | Call from |
|---|---|---|
| Read (GET) | `features/xxx/useXxx.ts` (useQuery) | Same feature's components only |
| Mutation (POST/PUT/DELETE) | `features/xxx/useXxx.ts` | Same feature's components only |
| BFF endpoint | `routes/api/xxx.ts` | `features/` via `fetch('/api/xxx')` |
| Response adapter | `adapters.ts` of the slice that owns the converted type | `features/xxx/useXxx.ts` after fetch |

Response adapter placement follows type ownership:
- Type used only by the feature itself and upper layers (via the feature's public surface) → `features/xxx/adapters.ts`
- Type needed by other features or lower layers → `entities/xxx/model/adapters.ts` / `aggregates/xxx/model/adapters.ts`

## Read (useQuery)

```ts
// ✅ features/search-order/useSearchOrder.ts
import { orderKeys } from "#/entities/order";

export const useSearchOrder = (id: OrderId) =>
  useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/order/${id}`);
      if (!res.ok) throw new Error(`BFF error: ${res.status}`);
      return toOrder(await res.json());
    },
  });
```

- Defined in `features/xxx/useXxx.ts` — owned by this feature
- Called only from the same feature's components

```ts
// ❌ Fetching from entities or widgets
// entities/order/ui/OrderCard.tsx に fetch を書いてはいけない
```

## Mutation (fetch)

```ts
// ✅ features/toggle-favorite/useToggleFavorite.ts
export const useToggleFavorite = () => {
  const toggle = async (orderId: OrderId) => {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (!res.ok) throw new Error(`BFF error: ${res.status}`);
  };
  return { toggle };
};
```

- Owned exclusively by the feature that defines it
- Other features must NOT call it — define independently if needed (duplication is acceptable)

## "use client" Boundary

Apply `"use client"` only to the minimum unit that needs state, events, or browser APIs.

```tsx
// ❌ Client-marking the whole block
"use client";
export const OrderPanel = ({ order }: Props) => (
  <section>
    <OrderCard order={order} />    {/* becomes client unnecessarily */}
    <FavoriteButton orderId={order.id} />
  </section>
);

// ✅ Extract only the interactive part
export const OrderPanel = ({ order }: Props) => (
  <section>
    <OrderCard order={order} />
    <FavoriteButton orderId={order.id} />  {/* "use client" inside here only */}
  </section>
);
```
