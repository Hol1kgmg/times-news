"use client";

import { useCallback, useRef, useState } from "react";

const ESTIMATED_PREVIEW_HEIGHT = 260;

export const usePreviewPlacement = () => {
  const [placement, setPlacement] = useState<"above" | "below">("below");
  const itemRef = useRef<HTMLLIElement>(null);

  const measurePlacement = useCallback(() => {
    const rect = itemRef.current?.getBoundingClientRect();
    if (rect !== undefined) {
      const spaceBelow = window.innerHeight - rect.bottom;
      setPlacement(spaceBelow < ESTIMATED_PREVIEW_HEIGHT ? "above" : "below");
    }
  }, []);

  return { itemRef, placement, measurePlacement };
};
