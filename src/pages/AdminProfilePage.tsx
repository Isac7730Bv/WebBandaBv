import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { attendanceRepository } from "../repositories/attendanceRepository";
import { authRepository } from "../repositories/authRepository";
import type { AttendanceStatus } from "../types/attendance";

import "./ProfilePage.css";

function AdminProfilePage() {
  const navigate = useNavigate();
  const user = authRepository.getCurrentUser();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState(() =>
    attendanceRepository.getAttendanceForDate(new Date().toISOString().slice(0, 10)),
  );
  const members = attendanceRepository.getMembers();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/perfil-usuario" replace />;
  }

  const handleLogout = () => {
    authRepository.logout();
    navigate("/login", { replace: true });
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setAttendance(attendanceRepository.getAttendanceForDate(date));
  };

  const handleCreateList = () => {
    setAttendance(attendanceRepository.createDailyList(selectedDate));
  };

  const handleStatusChange = (memberId: string, status: AttendanceStatus) => {
    setAttendance(attendanceRepository.updateAttendance(selectedDate, memberId, status));
  };

  return (
    <main className="profile-page">
      <div className="profile-page__shell">
        <nav className="profile-page__nav" aria-label="Perfil administrador">
          <p className="profile-page__brand">Panel administrador</p>
          <button className="profile-page__button" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </nav>

        <section className="profile-page__hero">
          <article className="profile-page__card">
            <p className="profile-page__eyebrow">Perfil propio</p>
            <h1 className="profile-page__title">Hola, {user.name}</h1>
            <p className="profile-page__description">
              Este es tu espacio de administrador para coordinar integrantes,
              revisar actividades y mantener organizada la banda estudiantil.
            </p>
          </article>

          <aside className="profile-page__panel" aria-label="Datos del administrador">
            <h2>Datos de acceso</h2>
            <ul className="profile-page__list">
              <li>Carnet: {user.carnet}</li>
              <li>Rol: Administrador</li>
              <li>Permisos: Gestión general</li>
            </ul>
          </aside>
        </section>

        <section className="attendance" aria-labelledby="attendance-title">
          <div className="attendance__header">
            <div>
              <p className="profile-page__eyebrow">Control diario</p>
              <h2 id="attendance-title">Lista de asistencia</h2>
              <p>Registra el estado individual de cada integrante para la fecha seleccionada.</p>
            </div>
            <div className="attendance__actions">
              <label htmlFor="attendance-date">Fecha</label>
              <input
                id="attendance-date"
                type="date"
                value={selectedDate}
                onChange={(event) => handleDateChange(event.target.value)}
              />
              <button className="profile-page__button" type="button" onClick={handleCreateList}>
                Crear lista del día
              </button>
            </div>
          </div>

          <div className="attendance__table-wrap">
            <table className="attendance__table">
              <thead>
                <tr><th>Integrante</th><th>Carnet</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const currentStatus = attendance.find((entry) => entry.userId === member.id)?.status ?? "PENDIENTE";

                  return (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.carnet}</td>
                      <td>
                        <div className="attendance__status-options" aria-label={`Asistencia de ${member.name}`}>
                          {(["PRESENTE", "AUSENTE", "LICENCIA"] as AttendanceStatus[]).map((status) => (
                            <button
                              className={`attendance__status attendance__status--${status.toLowerCase()} ${currentStatus === status ? "is-selected" : ""}`}
                              key={status}
                              type="button"
                              aria-pressed={currentStatus === status}
                              onClick={() => handleStatusChange(member.id, status)}
                            >
                              {status[0]}{status.slice(1).toLowerCase()}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminProfilePage;
