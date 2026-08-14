"use client";

import { useQuery } from "@tanstack/react-query";

import type { Url } from "./model/types";

export type LinkPreview = {
  description: string | null;
  image: string | null;
};

const fetchLinkPreview = async (url: Url): Promise<LinkPreview> => {
  const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error(`link-preview error: ${res.status}`);
  return res.json();
};

export const useLinkPreview = (url: Url, enabled: boolean) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["link-preview", url],
    queryFn: () => fetchLinkPreview(url),
    enabled,
    staleTime: Number.POSITIVE_INFINITY,
  });

  return {
    preview: data ?? null,
    loading: enabled && isPending,
    error: isError || (data !== undefined && data.description === null && data.image === null),
  };
};
