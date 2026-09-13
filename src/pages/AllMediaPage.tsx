import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import ProfileSidebar from "../components/profile/ProfileSidebar";
import MediaPlayer from "../components/media/MediaPlayer";
import { authRepository } from "../repositories/authRepository";
import { mediaRepository } from "../repositories/mediaRepository";
import type { MediaItem } from "../types/media";

import "./ProfilePage.css";
import "../components/media/MediaPlayer.css";

function AllMediaPage() {
  const user = authRepository.getCurrentUser();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    mediaRepository
      .getMedia()
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setLoadError("No se pudieron cargar los materiales. Verifica tu conexión con el servidor e intenta de nuevo.");
        setLoading(false);
      });
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <main className="profile-page">
      <div className="profile-layout">
        <ProfileSidebar user={user} />
        <section className="profile-content">
          <header className="profile-content__header">
            <p className="profile-page__eyebrow">Biblioteca</p>
            <h1 className="profile-page__title">Todos los materiales</h1>
            <p className="profile-page__description">
              Todos los audios y videos que el profesor ha compartido, de cualquier instrumento, para tu revisión general.
            </p>
          </header>

          <section className="attendance" aria-labelledby="all-media-title">
            <h2 id="all-media-title">{items.length} elemento{items.length === 1 ? "" : "s"}</h2>

            {loadError ? (
              <p className="student-form__error" role="alert">{loadError}</p>
            ) : loading ? (
              <p className="attendance__empty">Cargando...</p>
            ) : items.length === 0 ? (
              <p className="attendance__empty">Todavía no se ha compartido ningún audio o video.</p>
            ) : (
              <div className="media-grid">
                {items.map((item) => (
                  <MediaPlayer key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

export default AllMediaPage;
