import { createFileRoute } from "@tanstack/react-router";

type LinkPreviewResponse = {
  description: string | null;
  image: string | null;
};

const extractMetaContent = (html: string, patterns: RegExp[]): string | null => {
  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match?.[1] !== undefined) return match[1];
  }
  return null;
};

const parseMeta = (html: string): LinkPreviewResponse => ({
  description: extractMetaContent(html, [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["']/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i,
  ]),
  image: extractMetaContent(html, [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:image["']/i,
  ]),
});

export const Route = createFileRoute("/api/link-preview")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const target = url.searchParams.get("url");
        if (target === null) {
          return new Response("Missing url", { status: 400 });
        }

        try {
          const res = await fetch(target, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; LinkPreviewBot/1.0)" },
          });
          if (!res.ok) {
            return Response.json({ description: null, image: null } satisfies LinkPreviewResponse);
          }
          const html = await res.text();
          return Response.json(parseMeta(html));
        } catch {
          return Response.json({ description: null, image: null } satisfies LinkPreviewResponse);
        }
      },
    },
  },
});
