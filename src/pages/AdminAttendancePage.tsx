import { useState } from "react";
import { Navigate } from "react-router-dom";

import ProfileSidebar from "../components/profile/ProfileSidebar";
import { attendanceRepository } from "../repositories/attendanceRepository";
import { authRepository } from "../repositories/authRepository";
import type { AttendanceStatus } from "../types/attendance";

import "./ProfilePage.css";

function AdminAttendancePage() {
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
    return <Navigate to="/mi-asistencia" replace />;
  }

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
      <div className="profile-layout">
        <ProfileSidebar user={user} />
        <section className="profile-content">
          <header className="profile-content__header">
            <p className="profile-page__eyebrow">Control diario</p>
            <h1 className="profile-page__title">Lista de asistencia</h1>
            <p className="profile-page__description">Registra y edita la asistencia de todos los integrantes.</p>
          </header>

          <section className="attendance" aria-labelledby="attendance-title">
            <div className="attendance__header">
              <div>
                <h2 id="attendance-title">Asistencia por fecha</h2>
                <p>Selecciona una fecha para crear o actualizar su lista.</p>
              </div>
              <div className="attendance__actions">
                <label htmlFor="attendance-date">Fecha</label>
                <input id="attendance-date" type="date" value={selectedDate} onChange={(event) => handleDateChange(event.target.value)} />
                <button className="profile-page__button" type="button" onClick={handleCreateList}>Crear lista del día</button>
              </div>
            </div>

            <div className="attendance__table-wrap">
              <table className="attendance__table">
                <thead><tr><th>Integrante</th><th>Carnet</th><th>Estado</th></tr></thead>
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
                              <button className={`attendance__status attendance__status--${status.toLowerCase()} ${currentStatus === status ? "is-selected" : ""}`} key={status} type="button" aria-pressed={currentStatus === status} onClick={() => handleStatusChange(member.id, status)}>
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
        </section>
      </div>
    </main>
  );
}

export default AdminAttendancePage;
