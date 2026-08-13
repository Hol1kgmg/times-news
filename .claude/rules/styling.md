# Styling Rules

Full reference: [docs/styling-guide.md](../docs/styling-guide.md)

> **Note**: This file contains only the key rules needed for quick reference.
> Full details and rationale are in the guide above. When in doubt, read the guide.

## CSS Modules

- Place `.module.css` in the **same directory with the same name** as its component
- Components with no styles do not need a `.module.css` file
- Global styles (reset, base) go only in `src/styles.css` — keep additions minimal

```
widgets/order-panel/
  OrderPanel.tsx
  OrderPanel.module.css    ← same name, same directory
  OrderCard.tsx
  OrderCard.module.css
```

```tsx
// OrderCard.tsx
import styles from './OrderCard.module.css'

export const OrderCard = ({ order }: Props) => (
  <div className={styles.card}>{order.name}</div>
)
```
