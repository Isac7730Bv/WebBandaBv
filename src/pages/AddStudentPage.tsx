import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import ProfileSidebar from "../components/profile/ProfileSidebar";
import { authRepository } from "../repositories/authRepository";
import { instrumentRepository } from "../repositories/instrumentRepository";
import type { CreateUserInput } from "../types/auth";
import type { Instrument } from "../types/instrument";

import "./ProfilePage.css";

const initialForm: CreateUserInput = {
  name: "",
  carnet: "",
  password: "123456789",
  instrumentId: "",
};

function AddStudentPage() {
  const user = authRepository.getCurrentUser();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loadingInstruments, setLoadingInstruments] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadInstruments = () => {
    setLoadingInstruments(true);
    setLoadError("");
    instrumentRepository
      .getInstruments()
      .then((data) => {
        setInstruments(data);
        setLoadingInstruments(false);
      })
      .catch(() => {
        setLoadError("No se pudo cargar la lista de instrumentos. Verifica que el servidor esté actualizado y en ejecución, y vuelve a intentar.");
        setLoadingInstruments(false);
      });
  };

  useEffect(() => {
    loadInstruments();
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/perfil-usuario" replace />;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.instrumentId) {
      setError("Selecciona un instrumento.");
      return;
    }

    const result = await authRepository.addUser({
      ...form,
      name: form.name.trim(),
      carnet: form.carnet.trim(),
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    navigate("/admin/estudiantes", { replace: true });
  };

  const handleChange = (field: keyof CreateUserInput, value: string) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  return (
    <main className="profile-page">
      <div className="profile-layout">
        <ProfileSidebar user={user} />
        <section className="profile-content">
          <header className="profile-content__header">
            <p className="profile-page__eyebrow">Administración</p>
            <h1 className="profile-page__title">Añadir estudiante</h1>
            <p className="profile-page__description">Completa los datos para crear una cuenta de integrante con acceso funcional.</p>
          </header>

          {loadError && (
            <p className="student-form__error" role="alert" style={{ marginBottom: "1rem" }}>
              {loadError}{" "}
              <button type="button" className="profile-page__button" onClick={loadInstruments} style={{ marginLeft: "0.5rem" }}>
                Reintentar
              </button>
            </p>
          )}

          {!loadError && !loadingInstruments && instruments.length === 0 ? (
            <p className="attendance__empty">
              Todavía no hay instrumentos creados. Ve a{" "}
              <button
                type="button"
                className="profile-page__button"
                style={{ display: "inline", padding: "0.3rem 0.7rem" }}
                onClick={() => navigate("/admin/instrumentos")}
              >
                Instrumentos
              </button>{" "}
              y crea al menos uno antes de añadir estudiantes.
            </p>
          ) : !loadError && (
            <form className="student-form" onSubmit={handleSubmit}>
              <label>Nombre<input value={form.name} onChange={(event) => handleChange("name", event.target.value)} required /></label>
              <label>Carnet<input value={form.carnet} onChange={(event) => handleChange("carnet", event.target.value)} required /></label>
              <label>Contraseña<input type="password" value={form.password} onChange={(event) => handleChange("password", event.target.value)} required /></label>
              <label>
                Instrumento
                <select
                  value={form.instrumentId}
                  onChange={(event) => handleChange("instrumentId", event.target.value)}
                  required
                >
                  <option value="" disabled>
                    {loadingInstruments ? "Cargando..." : "Selecciona un instrumento"}
                  </option>
                  {instruments.map((instrument) => (
                    <option key={instrument.id} value={instrument.id}>
                      {instrument.name} ({instrument.code})
                    </option>
                  ))}
                </select>
              </label>
              {error && <p className="student-form__error" role="alert">{error}</p>}
              <div className="student-form__actions">
                <button className="profile-sidebar__logout" type="button" onClick={() => navigate("/admin/estudiantes")}>Cancelar</button>
                <button className="profile-page__button" type="submit">Añadir usuario</button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

export default AddStudentPage;
