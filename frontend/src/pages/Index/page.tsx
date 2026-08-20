import { Link } from "@tanstack/react-router";

import styles from "./page.module.css";

export const IndexPage = () => (
  <main className={styles.main}>
    <h1>TanStack Start FSD Template</h1>
    <p>
      <Link to="/login">login</Link>
    </p>
    <p>
      <Link to="/times">Times アーカイブ</Link>
    </p>
  </main>
);
