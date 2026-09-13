import { Navigate } from "react-router-dom";

import ProfileSidebar from "../components/profile/ProfileSidebar";
import { authRepository } from "../repositories/authRepository";

import "./ProfilePage.css";

function UserProfilePage() {
  const user = authRepository.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "ADMIN") {
    return <Navigate to="/perfil-admin" replace />;
  }

  return (
    <main className="profile-page">
      <div className="profile-layout">
        <ProfileSidebar user={user} />
        <section className="profile-content">
          <section className="profile-page__hero">
            <article className="profile-page__card">
              <p className="profile-page__eyebrow">Mi perfil</p>
              <h1 className="profile-page__title">Bienvenido, {user.name}</h1>
              <p className="profile-page__description">Este es tu perfil de integrante para consultar tus datos, prepararte para ensayos y seguir las actividades de la banda.</p>
            </article>

            <aside className="profile-page__panel" aria-label="Datos del integrante">
              <h2>Información personal</h2>
              <ul className="profile-page__list">
                <li>Carnet: {user.carnet}</li>
                <li>Rol: Usuario</li>
                <li>Estado: Integrante activo</li>
              </ul>
            </aside>
          </section>
        </section>
      </div>
    </main>
  );
}

export default UserProfilePage;
