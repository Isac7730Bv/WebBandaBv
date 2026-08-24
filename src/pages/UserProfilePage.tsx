import { Navigate, useNavigate } from "react-router-dom";

import { attendanceRepository } from "../repositories/attendanceRepository";
import { authRepository } from "../repositories/authRepository";

import "./ProfilePage.css";

function UserProfilePage() {
  const navigate = useNavigate();
  const user = authRepository.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "ADMIN") {
    return <Navigate to="/perfil-admin" replace />;
  }

  const handleLogout = () => {
    authRepository.logout();
    navigate("/login", { replace: true });
  };

  const attendance = attendanceRepository.getAttendanceForUser(user.id);

  return (
    <main className="profile-page">
      <div className="profile-page__shell">
        <nav className="profile-page__nav" aria-label="Perfil usuario">
          <p className="profile-page__brand">Perfil de integrante</p>
          <button className="profile-page__button" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </nav>

        <section className="profile-page__hero">
          <article className="profile-page__card">
            <p className="profile-page__eyebrow">Mi perfil</p>
            <h1 className="profile-page__title">Bienvenido, {user.name}</h1>
            <p className="profile-page__description">
              Este es tu perfil de integrante para consultar tus datos,
              prepararte para ensayos y seguir las actividades de la banda.
            </p>
          </article>

          <aside className="profile-page__panel" aria-label="Datos del integrante">
            <h2>Información personal</h2>
            <ul className="profile-page__list">
              <li>Carnet: {user.carnet}</li>
              <li>Rol: Usuario</li>
              <li>Estado: Integrante activo</li>
            </ul>
          </aside>
        </section>

        <section className="attendance attendance--history" aria-labelledby="my-attendance-title">
          <div className="attendance__header">
            <div>
              <p className="profile-page__eyebrow">Mi registro</p>
              <h2 id="my-attendance-title">Mi asistencia</h2>
              <p>Consulta los estados que el administrador ha registrado para ti.</p>
            </div>
          </div>

          {attendance.length === 0 ? (
            <p className="attendance__empty">Aún no hay asistencias registradas para tu perfil.</p>
          ) : (
            <div className="attendance__table-wrap">
              <table className="attendance__table">
                <thead><tr><th>Fecha</th><th>Estado</th></tr></thead>
                <tbody>
                  {attendance.map((entry) => (
                    <tr key={`${entry.date}-${entry.userId}`}>
                      <td>{entry.date}</td>
                      <td><span className={`attendance__badge attendance__badge--${entry.status.toLowerCase()}`}>{entry.status[0]}{entry.status.slice(1).toLowerCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default UserProfilePage;
