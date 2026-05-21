import { useCallback, useEffect, useState } from "react";
import { fetchDashboard, type DashboardResponse } from "./endpoints";

export function useProjectDashboard(projectId: string | undefined) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboard(projectId);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
