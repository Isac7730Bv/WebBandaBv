import { Navigate } from "react-router-dom";

import ProfileSidebar from "../components/profile/ProfileSidebar";
import { authRepository } from "../repositories/authRepository";

import "./ProfilePage.css";

function AdminProfilePage() {
  const user = authRepository.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/perfil-usuario" replace />;
  }

  return (
    <main className="profile-page">
      <div className="profile-layout">
        <ProfileSidebar user={user} />
        <section className="profile-content">
          <section className="profile-page__hero">
            <article className="profile-page__card">
              <p className="profile-page__eyebrow">Perfil propio</p>
              <h1 className="profile-page__title">Hola, {user.name}</h1>
              <p className="profile-page__description">Este es tu espacio de administrador para coordinar integrantes, revisar actividades y mantener organizada la banda estudiantil.</p>
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
        </section>
      </div>
    </main>
  );
}

export default AdminProfilePage;
