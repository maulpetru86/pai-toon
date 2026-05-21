"use client";

import { useCallback, useEffect, useState } from "react";
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

  const fetchComics = useCallback(async () => {
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
      setComics(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat daftar komik"
      );
    } finally {
      setLoading(false);
    }
  }, [options.categoryId, options.status]);

  useEffect(() => {
    fetchComics();
  }, [fetchComics]);

  return { comics, loading, error, refetch: fetchComics };
}
