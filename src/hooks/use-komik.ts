"use client";

import { useEffect, useState } from "react";
import { getDocuments, where, orderBy } from "@/lib/firebase/firestore";
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

        const constraints = [
          where("status", "==", options.status ?? "published"),
          orderBy("updatedAt", "desc"),
        ];

        if (options.categoryId) {
          constraints.push(where("categoryId", "==", options.categoryId));
        }

        const data = await getDocuments<Comic>("comics", constraints);
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
  }, [options.categoryId, options.status]);

  return { comics, loading, error };
}
