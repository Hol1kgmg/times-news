"use client";

import { useState } from "react";

import styles from "./UrlInputPreview.module.css";

type SubmittedUrl = {
  id: string;
  value: string;
};

export const UrlInputPreview = () => {
  const [url, setUrl] = useState("");
  const [submittedUrls, setSubmittedUrls] = useState<SubmittedUrl[]>([]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (url === "") return;

    setSubmittedUrls((prev) => [{ id: crypto.randomUUID(), value: url }, ...prev]);
    setUrl("");
  };

  return (
    <div className={styles.wrap}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          placeholder="https://example.com/article"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
        <button type="submit" className={styles.button}>
          送信
        </button>
      </form>
      <ul className={styles.output}>
        {submittedUrls.map((submittedUrl) => (
          <li key={submittedUrl.id}>{submittedUrl.value}</li>
        ))}
      </ul>
    </div>
  );
};
