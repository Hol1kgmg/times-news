import { createFileRoute } from "@tanstack/react-router";

type SampleItemAttributes = {
  id: number;
  name: string;
  category: string;
  tag: string;
  color: string;
};

const SAMPLE_ITEM_ATTRIBUTES: SampleItemAttributes[] = [
  { id: 1, name: "Sample Item 01", category: "alpha", tag: "swift", color: "#e63f3f" },
  { id: 2, name: "Sample Item 02", category: "beta", tag: "calm", color: "#3f5fe6" },
  { id: 3, name: "Sample Item 03", category: "alpha", tag: "bold", color: "#3fe68f" },
  { id: 4, name: "Sample Item 04", category: "gamma", tag: "calm", color: "#e6c93f" },
  { id: 5, name: "Sample Item 05", category: "beta", tag: "swift", color: "#a63fe6" },
  { id: 6, name: "Sample Item 06", category: "gamma", tag: "bold", color: "#e63f9f" },
  { id: 7, name: "Sample Item 07", category: "alpha", tag: "calm", color: "#3fc9e6" },
  { id: 8, name: "Sample Item 08", category: "beta", tag: "bold", color: "#8fe63f" },
  { id: 9, name: "Sample Item 09", category: "gamma", tag: "swift", color: "#e6763f" },
  { id: 10, name: "Sample Item 10", category: "alpha", tag: "swift", color: "#5f3fe6" },
  { id: 11, name: "Sample Item 11", category: "beta", tag: "calm", color: "#3fe6d9" },
  { id: 12, name: "Sample Item 12", category: "gamma", tag: "bold", color: "#e63f5f" },
];

type CompareResponse = {
  score: number;
  name_a: string;
  name_b: string;
  color_a: string;
  color_b: string;
};

const findItem = (id: number): SampleItemAttributes | undefined =>
  SAMPLE_ITEM_ATTRIBUTES.find((item) => item.id === id);

const calcScore = async (
  itemA: SampleItemAttributes,
  itemB: SampleItemAttributes,
): Promise<number> => {
  const [first, second] = itemA.id < itemB.id ? [itemA, itemB] : [itemB, itemA];
  const str = [first.category, first.tag, first.color, second.category, second.tag, second.color].join("|");
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Math.round((new Uint8Array(hashBuffer)[0] / 255) * 100);
};

export const Route = createFileRoute("/api/sample/match")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { id_a, id_b } = (await request.json()) as { id_a: number; id_b: number };

          const itemA = findItem(id_a);
          const itemB = findItem(id_b);
          if (itemA === undefined || itemB === undefined) {
            return new Response("Invalid sample item id", { status: 404 });
          }

          const score = await calcScore(itemA, itemB);

          const result: CompareResponse = {
            score,
            name_a: itemA.name,
            name_b: itemB.name,
            color_a: itemA.color,
            color_b: itemB.color,
          };

          return Response.json(result);
        } catch (e) {
          const message = e instanceof Error ? e.message : "Internal error";
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});
