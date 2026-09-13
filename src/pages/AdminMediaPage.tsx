import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import ProfileSidebar from "../components/profile/ProfileSidebar";
import { authRepository } from "../repositories/authRepository";
import { instrumentRepository } from "../repositories/instrumentRepository";
import { mediaRepository } from "../repositories/mediaRepository";
import type { Instrument } from "../types/instrument";
import type { MediaItem, MediaType } from "../types/media";

import "./ProfilePage.css";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-BO", { year: "numeric", month: "short", day: "numeric" });
}

const emptyForm = { title: "", instrumentId: "", mediaType: "VIDEO" as MediaType, url: "" };

function AdminMediaPage() {
  const user = authRepository.getCurrentUser();

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);
  const [loadError, setLoadError] = useState("");

  const loadData = () => {
    setLoading(true);
    setLoadError("");
    Promise.all([instrumentRepository.getInstruments(), mediaRepository.getMedia()])
      .then(([instrumentsData, mediaData]) => {
        setInstruments(instrumentsData);
        setItems(mediaData);
        setLoading(false);
      })
      .catch(() => {
        setLoadError(
          "No se pudo cargar la lista de instrumentos ni el multimedia. Verifica que el servidor esté actualizado y en ejecución, y vuelve a intentar.",
        );
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/perfil-usuario" replace />;

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!form.title.trim() || !form.instrumentId || !form.url.trim()) {
      setFormError("Completa el título, el instrumento y el enlace.");
      return;
    }

    setSaving(true);
    const result = await mediaRepository.createMedia({
      title: form.title.trim(),
      instrumentId: form.instrumentId,
      mediaType: form.mediaType,
      url: form.url.trim(),
    });
    setSaving(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    setForm(emptyForm);
    loadData();
  };

  const handleDelete = async (item: MediaItem) => {
    setRowError(null);
    const result = await mediaRepository.deleteMedia(item.id);

    if (result.error) {
      setRowError({ id: item.id, message: result.error });
      return;
    }

    loadData();
  };

  return (
    <main className="profile-page">
      <div className="profile-layout">
        <ProfileSidebar user={user} />
        <section className="profile-content">
          <header className="profile-content__header">
            <p className="profile-page__eyebrow">Administración</p>
            <h1 className="profile-page__title">Multimedia</h1>
            <p className="profile-page__description">
              Comparte audios o videos por enlace (YouTube o Google Drive) y asígnalos a un
              instrumento: los estudiantes con ese instrumento podrán verlos.
            </p>
          </header>

          {loadError && (
            <p className="student-form__error" role="alert" style={{ marginBottom: "1rem" }}>
              {loadError}{" "}
              <button type="button" className="profile-page__button" onClick={loadData} style={{ marginLeft: "0.5rem" }}>
                Reintentar
              </button>
            </p>
          )}

          {!loadError && instruments.length === 0 && !loading ? (
            <p className="attendance__empty">
              Todavía no hay instrumentos creados. Crea uno primero en la sección "Instrumentos".
            </p>
          ) : !loadError && (
            <form className="student-form" onSubmit={handleCreate} style={{ marginBottom: "1.5rem" }}>
              <label>
                Título
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Ej: Ensayo del himno"
                  required
                />
              </label>
              <label>
                Instrumento
                <select
                  value={form.instrumentId}
                  onChange={(event) => setForm((current) => ({ ...current, instrumentId: event.target.value }))}
                  required
                >
                  <option value="" disabled>
                    Selecciona un instrumento
                  </option>
                  {instruments.map((instrument) => (
                    <option key={instrument.id} value={instrument.id}>
                      {instrument.name} ({instrument.code})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tipo
                <select
                  value={form.mediaType}
                  onChange={(event) => setForm((current) => ({ ...current, mediaType: event.target.value as MediaType }))}
                >
                  <option value="VIDEO">Video</option>
                  <option value="AUDIO">Audio</option>
                </select>
              </label>
              <label>
                Enlace (YouTube o Google Drive)
                <input
                  value={form.url}
                  onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
                  placeholder="https://youtube.com/... o https://drive.google.com/..."
                  required
                />
              </label>
              {formError && <p className="student-form__error" role="alert">{formError}</p>}
              <div className="student-form__actions">
                <button className="profile-page__button" type="submit" disabled={saving}>
                  {saving ? "Guardando..." : "Añadir enlace"}
                </button>
              </div>
            </form>
          )}

          <section className="attendance students-list" aria-labelledby="media-list-title">
            <h2 id="media-list-title">
              {items.length} elemento{items.length === 1 ? "" : "s"}
            </h2>

            {loading ? (
              <p className="attendance__empty">Cargando...</p>
            ) : items.length === 0 ? (
              <p className="attendance__empty">Todavía no se ha agregado ningún audio o video.</p>
            ) : (
              <div className="attendance__table-wrap">
                <table className="attendance__table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Instrumento</th>
                      <th>Tipo</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.instrumentName ?? "—"}</td>
                        <td>{item.mediaType === "AUDIO" ? "Audio" : "Video"}</td>
                        <td>{formatDate(item.createdAt)}</td>
                        <td>
                          <div className="attendance__status-options">
                            <a
                              className="profile-page__button"
                              style={{ textDecoration: "none" }}
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Abrir
                            </a>
                            <button
                              className="student-status student-status--inactive"
                              type="button"
                              onClick={() => handleDelete(item)}
                            >
                              Eliminar
                            </button>
                          </div>
                          {rowError?.id === item.id && (
                            <p className="student-form__error" role="alert">{rowError.message}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

export default AdminMediaPage;
