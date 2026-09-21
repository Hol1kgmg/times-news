import { createFileRoute } from "@tanstack/react-router";

import { NewsItemEditor } from "#/widgets/news-item-editor";

import { requireSession } from "../-auth-guard";

export const Route = createFileRoute("/sandbox/news-item-editor-preview")({
  beforeLoad: async () => {
    await requireSession();
  },
  component: NewsItemEditor,
});
