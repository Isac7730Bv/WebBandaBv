import { Navigate } from "react-router-dom";

import ProfileSidebar from "../components/profile/ProfileSidebar";
import { attendanceRepository } from "../repositories/attendanceRepository";
import { authRepository } from "../repositories/authRepository";

import "./ProfilePage.css";

function UserAttendancePage() {
  const user = authRepository.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "ADMIN") {
    return <Navigate to="/admin/asistencia" replace />;
  }

  const attendance = attendanceRepository.getAttendanceForUser(user.id);

  return (
    <main className="profile-page">
      <div className="profile-layout">
        <ProfileSidebar user={user} />
        <section className="profile-content">
          <header className="profile-content__header">
            <p className="profile-page__eyebrow">Mi registro</p>
            <h1 className="profile-page__title">Mi asistencia</h1>
            <p className="profile-page__description">Consulta los estados de asistencia registrados por la administración.</p>
          </header>

          <section className="attendance attendance--history" aria-labelledby="my-attendance-title">
            <h2 id="my-attendance-title">Historial de asistencia</h2>
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
        </section>
      </div>
    </main>
  );
}

export default UserAttendancePage;
