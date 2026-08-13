import { Link } from "@tanstack/react-router";

import styles from "./page.module.css";

export const IndexPage = () => (
  <main className={styles.main}>
    <h1>TanStack Start FSD Template</h1>
    <p>
      <Link to="/sample/match">サンプル実装（サンプル相性診断）</Link>
    </p>
  </main>
);
