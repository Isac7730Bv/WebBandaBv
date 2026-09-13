import { getEmbedInfo } from "../../utils/mediaEmbed";
import type { MediaItem } from "../../types/media";

import "./MediaPlayer.css";

interface MediaPlayerProps {
  item: MediaItem;
}

function MediaPlayer({ item }: MediaPlayerProps) {
  const embed = getEmbedInfo(item.url);

  return (
    <article className="media-card">
      <header className="media-card__header">
        <span className={`media-card__badge media-card__badge--${item.mediaType.toLowerCase()}`}>
          {item.mediaType === "AUDIO" ? "Audio" : "Video"}
        </span>
        <h3 className="media-card__title">{item.title}</h3>
        {item.instrumentName && <p className="media-card__instrument">{item.instrumentName}</p>}
      </header>

      {embed.kind === "youtube" || embed.kind === "drive" ? (
        <div className="media-card__frame-wrap">
          <iframe
            className="media-card__frame"
            src={embed.embedUrl}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <a className="profile-page__button media-card__link" href={item.url} target="_blank" rel="noreferrer">
          Abrir enlace
        </a>
      )}
    </article>
  );
}

export default MediaPlayer;
