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

function MyScoresPage() {
  const user = authRepository.getCurrentUser();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!user || !user.instrumentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");
    scoreRepository
      .getScores(user.instrumentId)
      .then((data) => {
        setScores(data);
        setLoading(false);
      })
      .catch(() => {
        setLoadError("No se pudieron cargar tus partituras. Verifica tu conexión con el servidor e intenta de nuevo.");
        setLoading(false);
      });

    // Al entrar a esta página, marcamos como "vistas" todas las partituras
    // de su instrumento, para que la campanita se limpie.
    scoreRepository.markSeen(user.id);
  }, [user?.id, user?.instrumentId]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin/partituras" replace />;

  return (
    <main className="profile-page">
      <div className="profile-layout">
        <ProfileSidebar user={user} />
        <section className="profile-content">
          <header className="profile-content__header">
            <p className="profile-page__eyebrow">Mi instrumento</p>
            <h1 className="profile-page__title">Mis partituras</h1>
            <p className="profile-page__description">
              Partituras que el profesor asignó para tu instrumento{user.instrument ? ` (${user.instrument})` : ""}.
            </p>
          </header>

          <section className="attendance" aria-labelledby="my-scores-title">
            <h2 id="my-scores-title">{scores.length} partitura{scores.length === 1 ? "" : "s"}</h2>

            {loadError ? (
              <p className="student-form__error" role="alert">{loadError}</p>
            ) : !user.instrumentId ? (
              <p className="attendance__empty">
                Todavía no tienes un instrumento asignado. Pídele al administrador que te asigne uno.
              </p>
            ) : loading ? (
              <p className="attendance__empty">Cargando...</p>
            ) : scores.length === 0 ? (
              <p className="attendance__empty">Todavía no hay partituras asignadas a tu instrumento.</p>
            ) : (
              <div className="attendance__table-wrap">
                <table className="attendance__table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Fecha</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map((score) => (
                      <tr key={score.id}>
                        <td>{score.title}</td>
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

export default MyScoresPage;
