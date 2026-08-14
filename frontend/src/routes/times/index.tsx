import { createFileRoute } from "@tanstack/react-router";

import { archiveQueryOptions } from "#/aggregates/archive";
import { archiveDatesQueryOptions } from "#/entities/archive-date";
import { TimesPage } from "#/pages/Times";

export const Route = createFileRoute("/times/")({
  loader: async ({ context: { queryClient } }) => {
    const dates = await queryClient.ensureQueryData(archiveDatesQueryOptions());
    const latestDate = dates[0];
    if (latestDate !== undefined) {
      await queryClient.ensureQueryData(archiveQueryOptions(latestDate));
    }
  },
  component: TimesPage,
});
