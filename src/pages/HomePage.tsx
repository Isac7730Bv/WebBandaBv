import { useNavigate } from "react-router-dom";


import { authRepository } from "../repositories/authRepository";

import "./HomePage.css";


function HomePage() {
  const navigate = useNavigate();
  const user = authRepository.getCurrentUser();


  const handleLogout = () => {
    authRepository.logout();
    navigate("/login", { replace: true });
  };


  const handleLogin = () => {
    navigate("/login");
  };


  return (
    <main className="home-page">
      <header className="home-page__topbar">
        <button
          className="home-page__login-button"
          type="button"
          onClick={handleLogin}
        >
          Ir al login
        </button>
      </header>

      <section className="home-page__hero" aria-labelledby="home-title">
        <div className="home-page__content">
          <p className="home-page__badge">Banda estudiantil · Ritmo y disciplina</p>
          <h1 className="home-page__title" id="home-title">
            Bienvenido a la <span>Banda Estudiantil</span>
          </h1>
          <p className="home-page__lead">
            Un espacio para crecer con música, compañerismo y orgullo institucional.
            Ensaya, participa y lleva cada presentación con energía azul marino y amarillo.
          </p>

          <div className="home-page__actions">
            <button className="home-page__button home-page__button--primary" type="button">
              Ver actividades
            </button>
            {user && (
              <button
                className="home-page__button home-page__button--secondary"
                type="button"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            )}
          </div>
        </div>

        <aside className="home-page__panel" aria-label="Información del estudiante">
          <div className="home-page__card">
            <h2>{user ? `Hola, ${user.name}` : "Bienvenido a la aplicación"}</h2>
            {user ? (
              <>
                <p>Carnet: {user.carnet}</p>
                <p>Rol: {user.role}</p>
              </>
            ) : (
              <p>Inicia sesión para ver tus datos y próximas actividades.</p>
            )}
          </div>

          <div className="home-page__stats">
            <div className="home-page__stat">
              <strong>12</strong>
              Ensayos
            </div>
            <div className="home-page__stat">
              <strong>4</strong>
              Eventos
            </div>
            <div className="home-page__stat">
              <strong>1</strong>
              Familia musical
            </div>
          </div>
        </aside>

        <span className="home-page__music-note" aria-hidden="true">♪</span>
      </section>
    </main>
  );
}


export default HomePage;
