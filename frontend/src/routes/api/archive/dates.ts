import { createFileRoute } from "@tanstack/react-router";

import { mockArchiveItems } from "./-mock-data";

const listDatesDescending = (): string[] => {
  const dates = new Set(mockArchiveItems.map((item) => item.entry_date));
  return Array.from(dates).sort((a, b) => b.localeCompare(a));
};

export const Route = createFileRoute("/api/archive/dates")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(listDatesDescending());
      },
    },
  },
});
