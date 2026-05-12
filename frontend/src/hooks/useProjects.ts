import { useEffect, useState } from "react";

import { extractErrorMessage, fetchProjects } from "@/lib/api";
import type { ProjectListItem } from "@/lib/types";

export function useProjects() {
  const [data, setData] = useState<ProjectListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchProjects()
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setData(null);
          setError(extractErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
