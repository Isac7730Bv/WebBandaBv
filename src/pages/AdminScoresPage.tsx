import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import ProfileSidebar from "../components/profile/ProfileSidebar";
import { authRepository } from "../repositories/authRepository";
import { instrumentRepository } from "../repositories/instrumentRepository";
import { scoreRepository } from "../repositories/scoreRepository";
import type { Instrument } from "../types/instrument";
import type { Score } from "../types/score";

import "./ProfilePage.css";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-BO", { year: "numeric", month: "short", day: "numeric" });
}

function AdminScoresPage() {
  const user = authRepository.getCurrentUser();

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [instrumentId, setInstrumentId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);
  const [loadError, setLoadError] = useState("");

  const loadData = () => {
    setLoading(true);
    setLoadError("");
    Promise.all([instrumentRepository.getInstruments(), scoreRepository.getScores()])
      .then(([instrumentsData, scoresData]) => {
        setInstruments(instrumentsData);
        setScores(scoresData);
        setLoading(false);
      })
      .catch(() => {
        setLoadError(
          "No se pudo cargar la lista de instrumentos ni las partituras. Verifica que el servidor esté actualizado y en ejecución, y vuelve a intentar.",
        );
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/perfil-usuario" replace />;

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError("");

    if (!title.trim() || !instrumentId || !file) {
      setUploadError("Completa el título, el instrumento y elige un archivo PDF.");
      return;
    }

    setUploading(true);
    const result = await scoreRepository.uploadScore(title.trim(), instrumentId, file);
    setUploading(false);

    if (result.error) {
      setUploadError(result.error);
      return;
    }

    setTitle("");
    setInstrumentId("");
    setFile(null);
    (event.target as HTMLFormElement).reset();
    loadData();
  };

  const handleDelete = async (score: Score) => {
    setRowError(null);
    const result = await scoreRepository.deleteScore(score.id);

    if (result.error) {
      setRowError({ id: score.id, message: result.error });
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
            <h1 className="profile-page__title">Partituras</h1>
            <p className="profile-page__description">
              Sube partituras en PDF y asígnalas a un instrumento: todos los estudiantes con ese
              instrumento podrán verlas y descargarlas.
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
            <form className="student-form" onSubmit={handleUpload} style={{ marginBottom: "1.5rem" }}>
              <label>
                Título
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ej: Marcha de exhibición"
                  required
                />
              </label>
              <label>
                Instrumento
                <select value={instrumentId} onChange={(event) => setInstrumentId(event.target.value)} required>
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
                Archivo PDF
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  required
                />
              </label>
              {uploadError && <p className="student-form__error" role="alert">{uploadError}</p>}
              <div className="student-form__actions">
                <button className="profile-page__button" type="submit" disabled={uploading}>
                  {uploading ? "Subiendo..." : "Subir partitura"}
                </button>
              </div>
            </form>
          )}

          <section className="attendance students-list" aria-labelledby="scores-list-title">
            <h2 id="scores-list-title">
              {scores.length} partitura{scores.length === 1 ? "" : "s"}
            </h2>

            {loading ? (
              <p className="attendance__empty">Cargando partituras...</p>
            ) : scores.length === 0 ? (
              <p className="attendance__empty">Todavía no se ha subido ninguna partitura.</p>
            ) : (
              <div className="attendance__table-wrap">
                <table className="attendance__table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Instrumento</th>
                      <th>Archivo</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map((score) => (
                      <tr key={score.id}>
                        <td>{score.title}</td>
                        <td>{score.instrumentName ?? "—"}</td>
                        <td>{score.originalFileName}</td>
                        <td>{formatDate(score.createdAt)}</td>
                        <td>
                          <div className="attendance__status-options">
                            <a
                              className="profile-page__button"
                              style={{ textDecoration: "none" }}
                              href={scoreRepository.downloadUrl(score.id)}
                            >
                              Descargar
                            </a>
                            <button
                              className="student-status student-status--inactive"
                              type="button"
                              onClick={() => handleDelete(score)}
                            >
                              Eliminar
                            </button>
                          </div>
                          {rowError?.id === score.id && (
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

export default AdminScoresPage;
