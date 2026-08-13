import { createFileRoute } from "@tanstack/react-router";

type SampleItemRecord = {
  id: number;
  name: string;
  nameJa: string;
};

const SAMPLE_ITEMS: SampleItemRecord[] = Array.from({ length: 12 }, (_, i) => {
  const id = i + 1;
  const label = String(id).padStart(2, "0");
  return {
    id,
    name: `Sample Item ${label}`,
    nameJa: `サンプルアイテム${label}`,
  };
});

export const Route = createFileRoute("/api/sample/items")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const offset = Number(url.searchParams.get("offset") ?? "0");
        const limit = Number(url.searchParams.get("limit") ?? String(SAMPLE_ITEMS.length));
        return Response.json(SAMPLE_ITEMS.slice(offset, offset + limit));
      },
    },
  },
});
