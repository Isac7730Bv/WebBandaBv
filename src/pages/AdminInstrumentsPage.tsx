import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import ProfileSidebar from "../components/profile/ProfileSidebar";
import { authRepository } from "../repositories/authRepository";
import { instrumentRepository } from "../repositories/instrumentRepository";
import type { Instrument } from "../types/instrument";

import "./ProfilePage.css";

const emptyForm = { name: "", code: "" };

function AdminInstrumentsPage() {
  const user = authRepository.getCurrentUser();

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [newInstrument, setNewInstrument] = useState(emptyForm);
  const [createError, setCreateError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editError, setEditError] = useState("");

  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);
  const [loadError, setLoadError] = useState("");

  const loadInstruments = () => {
    setLoading(true);
    setLoadError("");
    instrumentRepository
      .getInstruments()
      .then((data) => {
        setInstruments(data);
        setLoading(false);
      })
      .catch(() => {
        setLoadError("No se pudo cargar la lista de instrumentos. Verifica que el servidor esté actualizado y en ejecución, y vuelve a intentar.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadInstruments();
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/perfil-usuario" replace />;

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError("");

    const result = await instrumentRepository.createInstrument({
      name: newInstrument.name.trim(),
      code: newInstrument.code.trim(),
    });

    if (result.error) {
      setCreateError(result.error);
      return;
    }

    setNewInstrument(emptyForm);
    loadInstruments();
  };

  const startEdit = (instrument: Instrument) => {
    setEditingId(instrument.id);
    setEditForm({ name: instrument.name, code: instrument.code });
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
    setEditError("");
  };

  const saveEdit = async (id: string) => {
    setEditError("");
    const result = await instrumentRepository.updateInstrument(id, {
      name: editForm.name.trim(),
      code: editForm.code.trim(),
    });

    if (result.error) {
      setEditError(result.error);
      return;
    }

    setEditingId(null);
    loadInstruments();
  };

  const handleDelete = async (instrument: Instrument) => {
    setRowError(null);
    const result = await instrumentRepository.deleteInstrument(instrument.id);

    if (result.error) {
      setRowError({ id: instrument.id, message: result.error });
      return;
    }

    loadInstruments();
  };

  return (
    <main className="profile-page">
      <div className="profile-layout">
        <ProfileSidebar user={user} />
        <section className="profile-content">
          <header className="profile-content__header">
            <p className="profile-page__eyebrow">Administración</p>
            <h1 className="profile-page__title">Instrumentos</h1>
            <p className="profile-page__description">
              Crea y gestiona los instrumentos disponibles para asignar a los estudiantes.
            </p>
          </header>

          <form className="student-form" onSubmit={handleCreate} style={{ marginBottom: "1.5rem" }}>
            <label>
              Nombre
              <input
                value={newInstrument.name}
                onChange={(event) => setNewInstrument((current) => ({ ...current, name: event.target.value }))}
                placeholder="Ej: Saxofón"
                required
              />
            </label>
            <label>
              Código
              <input
                value={newInstrument.code}
                onChange={(event) => setNewInstrument((current) => ({ ...current, code: event.target.value }))}
                placeholder="Ej: SAX-001"
                required
              />
            </label>
            {createError && <p className="student-form__error" role="alert">{createError}</p>}
            <div className="student-form__actions">
              <button className="profile-page__button" type="submit">Añadir instrumento</button>
            </div>
          </form>

          <section className="attendance students-list" aria-labelledby="instruments-list-title">
            <h2 id="instruments-list-title">
              {instruments.length} instrumento{instruments.length === 1 ? "" : "s"}
            </h2>

            {loadError ? (
              <p className="student-form__error" role="alert">
                {loadError}{" "}
                <button type="button" className="profile-page__button" onClick={loadInstruments} style={{ marginLeft: "0.5rem" }}>
                  Reintentar
                </button>
              </p>
            ) : loading ? (
              <p className="attendance__empty">Cargando instrumentos...</p>
            ) : instruments.length === 0 ? (
              <p className="attendance__empty">Todavía no hay instrumentos creados.</p>
            ) : (
              <div className="attendance__table-wrap">
                <table className="attendance__table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Código</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instruments.map((instrument) => (
                      <tr key={instrument.id}>
                        {editingId === instrument.id ? (
                          <>
                            <td>
                              <input
                                value={editForm.name}
                                onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                              />
                            </td>
                            <td>
                              <input
                                value={editForm.code}
                                onChange={(event) => setEditForm((current) => ({ ...current, code: event.target.value }))}
                              />
                            </td>
                            <td>
                              <div className="attendance__status-options">
                                <button className="profile-page__button" type="button" onClick={() => saveEdit(instrument.id)}>
                                  Guardar
                                </button>
                                <button className="profile-sidebar__logout" type="button" onClick={cancelEdit}>
                                  Cancelar
                                </button>
                              </div>
                              {editError && <p className="student-form__error" role="alert">{editError}</p>}
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{instrument.name}</td>
                            <td>{instrument.code}</td>
                            <td>
                              <div className="attendance__status-options">
                                <button className="profile-page__button" type="button" onClick={() => startEdit(instrument)}>
                                  Editar
                                </button>
                                <button className="student-status student-status--inactive" type="button" onClick={() => handleDelete(instrument)}>
                                  Eliminar
                                </button>
                              </div>
                              {rowError?.id === instrument.id && (
                                <p className="student-form__error" role="alert">{rowError.message}</p>
                              )}
                            </td>
                          </>
                        )}
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

export default AdminInstrumentsPage;
