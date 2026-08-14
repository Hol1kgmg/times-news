import { createFileRoute } from "@tanstack/react-router";

import { mockArchiveItems } from "./-mock-data";

export const Route = createFileRoute("/api/archive/items")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const date = url.searchParams.get("date");
        if (date === null) {
          return new Response("Missing date", { status: 400 });
        }

        const items = mockArchiveItems.filter((item) => item.entry_date === date);
        return Response.json(items);
      },
    },
  },
});
