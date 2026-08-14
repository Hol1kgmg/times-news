"use client";

import { useSetAtom } from "jotai";
import { useCallback, useRef } from "react";

import type { Url } from "#/entities/news-item";

import { activePreviewUrlAtom } from "./atoms";

const CLOSE_DELAY_MS = 150;

export const useHoverPreview = () => {
  const setActiveUrl = useSetAtom(activePreviewUrlAtom);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const cancelClose = useCallback(() => {
    clearTimeout(closeTimerRef.current);
  }, []);

  const open = useCallback(
    (url: Url) => {
      cancelClose();
      setActiveUrl(url);
    },
    [cancelClose, setActiveUrl],
  );

  const scheduleClose = useCallback(
    (url: Url) => {
      cancelClose();
      closeTimerRef.current = setTimeout(() => {
        setActiveUrl((current) => (current === url ? null : current));
      }, CLOSE_DELAY_MS);
    },
    [cancelClose, setActiveUrl],
  );

  return { open, scheduleClose, cancelClose };
};
