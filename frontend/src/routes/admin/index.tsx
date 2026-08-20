import { createFileRoute } from "@tanstack/react-router";

import { requireSession } from "../-auth-guard";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    await requireSession();
  },
  component: () => <div>管理ページ（Step6: ルート保護の動作確認用）</div>,
});
