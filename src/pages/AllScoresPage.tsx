import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import ProfileSidebar from "../components/profile/ProfileSidebar";
import { authRepository } from "../repositories/authRepository";
import { scoreRepository } from "../repositories/scoreRepository";
import type { Score } from "../types/score";

import "./ProfilePage.css";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-BO", { year: "numeric", month: "short", day: "numeric" });
}

function AllScoresPage() {
  const user = authRepository.getCurrentUser();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    scoreRepository
      .getScores()
      .then((data) => {
        setScores(data);
        setLoading(false);
      })
      .catch(() => {
        setLoadError("No se pudieron cargar las partituras. Verifica tu conexión con el servidor e intenta de nuevo.");
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
            <h1 className="profile-page__title">Todas las partituras</h1>
            <p className="profile-page__description">
              Todo lo que el profesor ha subido, de cualquier instrumento, para tu revisión general.
            </p>
          </header>

          <section className="attendance" aria-labelledby="all-scores-title">
            <h2 id="all-scores-title">{scores.length} partitura{scores.length === 1 ? "" : "s"}</h2>

            {loadError ? (
              <p className="student-form__error" role="alert">{loadError}</p>
            ) : loading ? (
              <p className="attendance__empty">Cargando...</p>
            ) : scores.length === 0 ? (
              <p className="attendance__empty">Todavía no se ha subido ninguna partitura.</p>
            ) : (
              <div className="attendance__table-wrap">
                <table className="attendance__table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Instrumento</th>
                      <th>Fecha</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map((score) => (
                      <tr key={score.id}>
                        <td>{score.title}</td>
                        <td>{score.instrumentName ?? "—"}</td>
                        <td>{formatDate(score.createdAt)}</td>
                        <td>
                          <a
                            className="profile-page__button"
                            style={{ textDecoration: "none" }}
                            href={scoreRepository.downloadUrl(score.id)}
                          >
                            Descargar
                          </a>
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

export default AllScoresPage;
