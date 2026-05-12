import { useEffect, useState } from "react";

import { extractErrorMessage, fetchProject } from "@/lib/api";
import type { ProjectDetail } from "@/lib/types";

export function useProject(projectId: string | undefined) {
  const [data, setData] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(() => Boolean(projectId));
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!projectId) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetchProject(projectId)
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
  }, [projectId, version]);

  const refetch = () => {
    setVersion((v) => v + 1);
  };

  if (!projectId) {
    return { data: null, loading: false, error: null, refetch };
  }

  return { data, loading, error, refetch };
}
