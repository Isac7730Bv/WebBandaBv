import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import ProfileSidebar from "../components/profile/ProfileSidebar";
import { attendanceRepository } from "../repositories/attendanceRepository";
import { authRepository } from "../repositories/authRepository";
import type { AttendanceEntry, AttendanceStatus } from "../types/attendance";
import type { User } from "../types/auth";

import "./ProfilePage.css";

function AdminAttendancePage() {
  const user = authRepository.getCurrentUser();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [members, setMembers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceRepository.getMembers().then(setMembers);
  }, []);

  useEffect(() => {
    setLoading(true);
    attendanceRepository.getAttendanceForDate(selectedDate).then((data) => {
      setAttendance(data);
      setLoading(false);
    });
  }, [selectedDate]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/mi-asistencia" replace />;
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleCreateList = async () => {
    const data = await attendanceRepository.createDailyList(selectedDate);
    setAttendance(data);
  };

  const handleStatusChange = async (memberId: string, status: AttendanceStatus) => {
    const data = await attendanceRepository.updateAttendance(selectedDate, memberId, status);
    setAttendance(data);
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

            {loading ? (
              <p className="attendance__empty">Cargando asistencia...</p>
            ) : (
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
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

export default AdminAttendancePage;
