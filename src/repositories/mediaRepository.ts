import type { CreateMediaInput, MediaItem } from "../types/media";

const API_BASE = "/api";

export const mediaRepository = {
  async getMedia(instrumentId?: string): Promise<MediaItem[]> {
    const url = instrumentId
      ? `${API_BASE}/media?instrumentId=${encodeURIComponent(instrumentId)}`
      : `${API_BASE}/media`;

    const response = await fetch(url);
    const { media } = (await response.json()) as { media: MediaItem[] };
    return media;
  },

  async createMedia(input: CreateMediaInput): Promise<{ media?: MediaItem; error?: string }> {
    const response = await fetch(`${API_BASE}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = (await response.json()) as { media?: MediaItem; error?: string };

    if (!response.ok) {
      return { error: data.error ?? "No se pudo guardar el enlace." };
    }

    return { media: data.media };
  },

  async deleteMedia(id: string): Promise<{ ok?: boolean; error?: string }> {
    const response = await fetch(`${API_BASE}/media/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { ok?: boolean; error?: string };

    if (!response.ok) {
      return { error: data.error ?? "No se pudo eliminar." };
    }

    return { ok: true };
  },

  async getUnseenCount(userId: string): Promise<number> {
    const response = await fetch(`${API_BASE}/media/unseen-count/${userId}`);
    if (!response.ok) return 0;
    const { count } = (await response.json()) as { count: number };
    return count;
  },

  async markSeen(userId: string): Promise<void> {
    await fetch(`${API_BASE}/media/mark-seen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
  },
};
