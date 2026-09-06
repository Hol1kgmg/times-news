import { createFileRoute } from "@tanstack/react-router";

import { RegisterNewsItem } from "#/widgets/register-news-item";

import { requireSession } from "../-auth-guard";

export const Route = createFileRoute("/admin/register")({
  beforeLoad: async () => {
    await requireSession();
  },
  component: RegisterNewsItem,
});
