import { createFileRoute } from "@tanstack/react-router";

import { RegisterNewsItem } from "#/widgets/register-news-item";

import { requireSession } from "../-auth-guard";

const RouteComponent = () => <RegisterNewsItem />;

export const Route = createFileRoute("/admin/register")({
  beforeLoad: async () => {
    await requireSession();
  },
  component: RouteComponent,
});
