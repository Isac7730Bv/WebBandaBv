export type MediaType = "AUDIO" | "VIDEO";

export interface MediaItem {
  id: string;
  title: string;
  instrumentId: string;
  instrumentName?: string;
  instrumentCode?: string;
  mediaType: MediaType;
  url: string;
  createdAt: string;
}

export interface CreateMediaInput {
  title: string;
  instrumentId: string;
  mediaType: MediaType;
  url: string;
}
