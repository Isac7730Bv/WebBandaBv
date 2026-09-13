import type { AppStats } from "../types/stats";

const API_BASE = "/api";

export const statsRepository = {
  async getStats(): Promise<AppStats> {
    const response = await fetch(`${API_BASE}/stats`);

    if (!response.ok) {
      throw new Error("No se pudieron cargar las estadísticas.");
    }

    return (await response.json()) as AppStats;
  },
};
