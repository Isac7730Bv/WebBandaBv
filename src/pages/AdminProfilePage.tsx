import { Navigate, useNavigate } from "react-router-dom";

import { authRepository } from "../repositories/authRepository";

import "./ProfilePage.css";

function AdminProfilePage() {
  const navigate = useNavigate();
  const user = authRepository.getCurrentUser();

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
      </div>
    </main>
  );
}

export default AdminProfilePage;
