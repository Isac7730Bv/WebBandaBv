import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import ProfileSidebar from "../components/profile/ProfileSidebar";
import MediaPlayer from "../components/media/MediaPlayer";
import { authRepository } from "../repositories/authRepository";
import { mediaRepository } from "../repositories/mediaRepository";
import type { MediaItem } from "../types/media";

import "./ProfilePage.css";
import "../components/media/MediaPlayer.css";

function MyMediaPage() {
  const user = authRepository.getCurrentUser();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!user || !user.instrumentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");
    mediaRepository
      .getMedia(user.instrumentId)
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setLoadError("No se pudieron cargar tus materiales. Verifica tu conexión con el servidor e intenta de nuevo.");
        setLoading(false);
      });

    // Al entrar a esta página, marcamos como "vistos" todos los audios/videos
    // de su instrumento, para que la campanita se limpie.
    mediaRepository.markSeen(user.id);
  }, [user?.id, user?.instrumentId]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin/multimedia" replace />;

  return (
    <main className="profile-page">
      <div className="profile-layout">
        <ProfileSidebar user={user} />
        <section className="profile-content">
          <header className="profile-content__header">
            <p className="profile-page__eyebrow">Mi instrumento</p>
            <h1 className="profile-page__title">Mis materiales</h1>
            <p className="profile-page__description">
              Audios y videos que el profesor asignó para tu instrumento{user.instrument ? ` (${user.instrument})` : ""}.
            </p>
          </header>

          <section className="attendance" aria-labelledby="my-media-title">
            <h2 id="my-media-title">{items.length} elemento{items.length === 1 ? "" : "s"}</h2>

            {loadError ? (
              <p className="student-form__error" role="alert">{loadError}</p>
            ) : !user.instrumentId ? (
              <p className="attendance__empty">
                Todavía no tienes un instrumento asignado. Pídele al administrador que te asigne uno.
              </p>
            ) : loading ? (
              <p className="attendance__empty">Cargando...</p>
            ) : items.length === 0 ? (
              <p className="attendance__empty">Todavía no hay audios o videos asignados a tu instrumento.</p>
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

export default MyMediaPage;
