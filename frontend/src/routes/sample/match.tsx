import { createFileRoute } from "@tanstack/react-router";

import { SampleMatchPage } from "#/pages/SampleMatch";

export const Route = createFileRoute("/sample/match")({
  component: SampleMatchPage,
});
