"use client";

import { useEffect, useState } from "react";
import { fetchComics, fetchPublishedComics } from "@/lib/firebase/firestore";
import type { Comic } from "@/types";

interface UseComicOptions {
  categoryId?: string;
  status?: "draft" | "published" | "archived";
  limitCount?: number;
}

/**
 * Hook untuk mengambil daftar komik dengan filter opsional.
 */
export function useComic(options: UseComicOptions = {}) {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all or published comics based on status
        const fetchFn =
          options.status === "published" ? fetchPublishedComics : fetchComics;
        let data = await fetchFn();

        // Client-side filtering
        if (options.status && options.status !== "published") {
          data = data.filter((c) => c.status === options.status);
        }
        if (options.categoryId) {
          data = data.filter((c) => c.categoryId === options.categoryId);
        }
        if (options.limitCount) {
          data = data.slice(0, options.limitCount);
        }

        if (!cancelled) setComics(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Gagal memuat daftar komik"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [options.categoryId, options.status, options.limitCount]);

  return { comics, loading, error };
}
