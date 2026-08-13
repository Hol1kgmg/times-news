import { Link } from "@tanstack/react-router";

import styles from "./page.module.css";

export const NotFoundPage = () => (
  <main className={styles.main}>
    <h1>404 Not Found</h1>
    <p>お探しのページが見つかりませんでした。</p>
    <p>
      <Link to="/">トップへ戻る</Link>
    </p>
  </main>
);
