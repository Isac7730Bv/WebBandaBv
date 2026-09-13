import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import ProfileSidebar from "../components/profile/ProfileSidebar";
import { authRepository } from "../repositories/authRepository";
import type { User } from "../types/auth";

import "./ProfilePage.css";

function AdminStudentsPage() {
  const user = authRepository.getCurrentUser();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authRepository.getMembers().then((members) => {
      setStudents(members);
      setLoading(false);
    });
  }, []);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return students;

    return students.filter((student) =>
      [student.name, student.carnet, student.instrument, student.instrumentCode]
        .some((value) => value?.toLocaleLowerCase().includes(term)),
    );
  }, [search, students]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/perfil-usuario" replace />;

  const handleToggleStatus = async (studentId: string) => {
    const updatedStudent = await authRepository.toggleUserActive(studentId);
    if (!updatedStudent) return;

    setStudents((currentStudents) => currentStudents.map((student) =>
      student.id === studentId ? updatedStudent : student,
    ));
  };

  return (
    <main className="profile-page">
      <div className="profile-layout">
        <ProfileSidebar user={user} />
        <section className="profile-content">
          <header className="students-page__header">
            <div>
              <p className="profile-page__eyebrow">Administración</p>
              <h1 className="profile-page__title">Lista de estudiantes</h1>
              <p className="profile-page__description">Consulta los integrantes registrados y administra su estado de acceso.</p>
            </div>
            <div className="students-page__tools">
              <label className="visually-hidden" htmlFor="student-search">Buscar estudiantes</label>
              <input id="student-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar estudiante" />
              <button className="profile-page__button" type="button" onClick={() => navigate("/admin/estudiantes/nuevo")}>Añadir</button>
            </div>
          </header>

          <section className="attendance students-list" aria-labelledby="students-list-title">
            <h2 id="students-list-title">{filteredStudents.length} estudiante{filteredStudents.length === 1 ? "" : "s"}</h2>
            {loading ? (
              <p className="attendance__empty">Cargando estudiantes...</p>
            ) : filteredStudents.length === 0 ? (
              <p className="attendance__empty">No se encontraron estudiantes que coincidan con la búsqueda.</p>
            ) : (
              <div className="attendance__table-wrap">
                <table className="attendance__table">
                  <thead><tr><th>Estudiante</th><th>Carnet</th><th>Instrumento</th><th>Código</th><th>Estado</th></tr></thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>{student.carnet}</td>
                        <td>{student.instrument || "Sin asignar"}</td>
                        <td>{student.instrumentCode || "Sin código"}</td>
                        <td>
                          <button className={`student-status ${student.isActive === false ? "student-status--inactive" : ""}`} type="button" onClick={() => handleToggleStatus(student.id)}>
                            {student.isActive === false ? "Inactivo" : "Activo"}
                          </button>
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

export default AdminStudentsPage;
