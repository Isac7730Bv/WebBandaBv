import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import ProfileSidebar from "../components/profile/ProfileSidebar";
import { authRepository } from "../repositories/authRepository";
import type { CreateUserInput } from "../types/auth";

import "./ProfilePage.css";

const initialForm: CreateUserInput = {
  name: "",
  carnet: "",
  password: "123456789",
  instrument: "",
  instrumentCode: "",
};

function AddStudentPage() {
  const user = authRepository.getCurrentUser();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/perfil-usuario" replace />;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const result = authRepository.addUser({
      ...form,
      name: form.name.trim(),
      carnet: form.carnet.trim(),
      instrument: form.instrument.trim(),
      instrumentCode: form.instrumentCode.trim(),
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

          <form className="student-form" onSubmit={handleSubmit}>
            <label>Nombre<input value={form.name} onChange={(event) => handleChange("name", event.target.value)} required /></label>
            <label>Carnet<input value={form.carnet} onChange={(event) => handleChange("carnet", event.target.value)} required /></label>
            <label>Contraseña<input type="password" value={form.password} onChange={(event) => handleChange("password", event.target.value)} required /></label>
            <label>Instrumento<input value={form.instrument} onChange={(event) => handleChange("instrument", event.target.value)} required /></label>
            <label>Código del instrumento<input value={form.instrumentCode} onChange={(event) => handleChange("instrumentCode", event.target.value)} required /></label>
            {error && <p className="student-form__error" role="alert">{error}</p>}
            <div className="student-form__actions">
              <button className="profile-sidebar__logout" type="button" onClick={() => navigate("/admin/estudiantes")}>Cancelar</button>
              <button className="profile-page__button" type="submit">Añadir usuario</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default AddStudentPage;
