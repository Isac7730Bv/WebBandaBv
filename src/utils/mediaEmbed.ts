// Detecta enlaces de YouTube o Google Drive y los convierte en una URL
// que se puede incrustar en un <iframe>. Cualquier otro enlace se deja
// como un enlace normal ("Abrir enlace") en vez de intentar incrustarlo.

export type EmbedInfo =
  | { kind: "youtube"; embedUrl: string }
  | { kind: "drive"; embedUrl: string }
  | { kind: "link" };

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return id || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2] ?? null;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/")[2] ?? null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function extractDriveFileId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("drive.google.com")) return null;

    const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    if (fileMatch) return fileMatch[1];

    const openId = parsed.searchParams.get("id");
    if (openId) return openId;

    return null;
  } catch {
    return null;
  }
}

export function getEmbedInfo(url: string): EmbedInfo {
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    return { kind: "youtube", embedUrl: `https://www.youtube.com/embed/${youtubeId}` };
  }

  const driveId = extractDriveFileId(url);
  if (driveId) {
    return { kind: "drive", embedUrl: `https://drive.google.com/file/d/${driveId}/preview` };
  }

  return { kind: "link" };
}
