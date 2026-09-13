import type { Score } from "../types/score";

const API_BASE = "/api";

export const scoreRepository = {
  async getScores(instrumentId?: string): Promise<Score[]> {
    const url = instrumentId
      ? `${API_BASE}/scores?instrumentId=${encodeURIComponent(instrumentId)}`
      : `${API_BASE}/scores`;

    const response = await fetch(url);
    const { scores } = (await response.json()) as { scores: Score[] };
    return scores;
  },

  async uploadScore(
    title: string,
    instrumentId: string,
    file: File,
  ): Promise<{ score?: Score; error?: string }> {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("instrumentId", instrumentId);
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/scores`, {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as { score?: Score; error?: string };

    if (!response.ok) {
      return { error: data.error ?? "No se pudo subir la partitura." };
    }

    return { score: data.score };
  },

  async deleteScore(id: string): Promise<{ ok?: boolean; error?: string }> {
    const response = await fetch(`${API_BASE}/scores/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { ok?: boolean; error?: string };

    if (!response.ok) {
      return { error: data.error ?? "No se pudo eliminar la partitura." };
    }

    return { ok: true };
  },

  downloadUrl(id: string): string {
    return `${API_BASE}/scores/${id}/download`;
  },

  async getUnseenCount(userId: string): Promise<number> {
    const response = await fetch(`${API_BASE}/scores/unseen-count/${userId}`);
    if (!response.ok) return 0;
    const { count } = (await response.json()) as { count: number };
    return count;
  },

  async markSeen(userId: string): Promise<void> {
    await fetch(`${API_BASE}/scores/mark-seen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
  },
};
