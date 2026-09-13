import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import { authRepository } from "../repositories/authRepository";
import { postRepository } from "../repositories/postRepository";
import { statsRepository } from "../repositories/statsRepository";
import PostCard from "../components/posts/PostCard";
import type { Post } from "../types/post";
import type { AppStats } from "../types/stats";

import "./HomePage.css";


function HomePage() {
  const navigate = useNavigate();
  const user = authRepository.getCurrentUser();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState("");

  const [stats, setStats] = useState<AppStats | null>(null);

  useEffect(() => {
    postRepository
      .getPosts()
      .then((data) => {
        setPosts(data);
        setLoadingPosts(false);
      })
      .catch(() => {
        setPostsError("No se pudieron cargar las noticias en este momento.");
        setLoadingPosts(false);
      });

    statsRepository
      .getStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);


  const handleLogout = () => {
    authRepository.logout();
    navigate("/login", { replace: true });
  };


  const handleTopbarClick = () => {
    if (user) {
      navigate(user.role === "ADMIN" ? "/perfil-admin" : "/perfil-usuario");
    } else {
      navigate("/login");
    }
  };


  return (
    <main className="home-page">
      <header className="home-page__topbar">
        <button
          className="home-page__login-button"
          type="button"
          onClick={handleTopbarClick}
        >
          {user ? "Ir a mi página" : "Ir al login"}
        </button>
      </header>

      <section className="home-page__hero" aria-labelledby="home-title">
        <div className="home-page__content">
          <img
            src="/logo-don-bosco.png"
            alt="Logo Colegio Salesianos Don Bosco"
            className="home-page__logo"
          />
          <p className="home-page__badge">Banda estudiantil · Ritmo y disciplina</p>
          <h1 className="home-page__title" id="home-title">
            Bienvenido a la <span>Banda Estudiantil</span>
          </h1>
          <p className="home-page__lead">
            Un espacio para crecer con música, compañerismo y orgullo institucional.
            Ensaya, participa y lleva cada presentación con energía azul marino y amarillo.
          </p>

          {user && (
            <div className="home-page__actions">
              <button
                className="home-page__button home-page__button--secondary"
                type="button"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          )}
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
              <strong>{stats ? stats.instruments : "…"}</strong>
              Instrumentos
            </div>
            <div className="home-page__stat">
              <strong>{stats ? stats.students : "…"}</strong>
              Estudiantes inscritos
            </div>
            <div className="home-page__stat">
              <strong>{stats ? stats.scores : "…"}</strong>
              Partituras publicadas
            </div>
          </div>
        </aside>

        <span className="home-page__music-note" aria-hidden="true">♪</span>
      </section>

      <section className="home-page__news" aria-labelledby="home-news-title">
        <h2 className="home-page__news-title" id="home-news-title">Noticias</h2>

        {postsError ? (
          <p className="home-page__news-empty">{postsError}</p>
        ) : loadingPosts ? (
          <p className="home-page__news-empty">Cargando noticias...</p>
        ) : posts.length === 0 ? (
          <p className="home-page__news-empty">Todavía no se ha publicado ninguna noticia.</p>
        ) : (
          <div className="home-page__news-grid">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}


export default HomePage;
