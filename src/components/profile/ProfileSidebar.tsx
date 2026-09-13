import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { authRepository } from "../../repositories/authRepository";
import { scoreRepository } from "../../repositories/scoreRepository";
import { mediaRepository } from "../../repositories/mediaRepository";
import type { User } from "../../types/auth";

interface ProfileSidebarProps {
  user: User;
}

const POLL_INTERVAL_MS = 20000;

function ProfileSidebar({ user }: ProfileSidebarProps) {
  const navigate = useNavigate();
  const isAdmin = user.role === "ADMIN";
  const profilePath = isAdmin ? "/perfil-admin" : "/perfil-usuario";
  const attendancePath = isAdmin ? "/admin/asistencia" : "/mi-asistencia";

  const [unseenScores, setUnseenScores] = useState(0);
  const [unseenMedia, setUnseenMedia] = useState(0);
  const unseenTotal = unseenScores + unseenMedia;

  useEffect(() => {
    if (isAdmin || !user.instrumentId) return;

    let cancelled = false;

    const checkUnseen = () => {
      scoreRepository.getUnseenCount(user.id).then((count) => {
        if (!cancelled) setUnseenScores(count);
      });
      mediaRepository.getUnseenCount(user.id).then((count) => {
        if (!cancelled) setUnseenMedia(count);
      });
    };

    checkUnseen();
    const interval = setInterval(checkUnseen, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAdmin, user.id, user.instrumentId]);

  const handleLogout = () => {
    authRepository.logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="profile-sidebar" aria-label="Navegación del perfil">
      <div>
        <div className="profile-sidebar__top">
          <div>
            <img
              src="/logo-don-bosco.png"
              alt="Logo Colegio Salesianos Don Bosco"
              className="profile-sidebar__logo"
            />
            <p className="profile-sidebar__brand">Banda estudiantil</p>
            <p className="profile-sidebar__role">{isAdmin ? "Panel administrador" : "Perfil de integrante"}</p>
          </div>

          {!isAdmin && (
            <button
              type="button"
              className="profile-sidebar__bell"
              aria-label={unseenTotal > 0 ? `${unseenTotal} novedades nuevas` : "Sin novedades nuevas"}
              onClick={() => navigate(unseenScores > 0 ? "/mis-partituras" : "/mis-materiales")}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 3a5 5 0 0 0-5 5v3.09c0 .58-.2 1.14-.57 1.59L5 14.5c-.7.86-.1 2.15 1 2.15h12c1.1 0 1.7-1.29 1-2.15l-1.43-1.82a2.5 2.5 0 0 1-.57-1.59V8a5 5 0 0 0-5-5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path d="M9.5 19a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              {unseenTotal > 0 && (
                <span className="profile-sidebar__bell-badge">{unseenTotal > 9 ? "9+" : unseenTotal}</span>
              )}
            </button>
          )}
        </div>

        <nav className="profile-sidebar__nav" aria-label="Secciones del perfil">
          <NavLink
            className={({ isActive }) => `profile-sidebar__link ${isActive ? "is-active" : ""}`}
            to={profilePath}
          >
            Mi perfil
          </NavLink>

          {isAdmin && (
            <NavLink
              className={({ isActive }) => `profile-sidebar__link ${isActive ? "is-active" : ""}`}
              to="/admin/estudiantes"
            >
              Lista de estudiantes
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              className={({ isActive }) => `profile-sidebar__link ${isActive ? "is-active" : ""}`}
              to="/admin/instrumentos"
            >
              Instrumentos
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              className={({ isActive }) => `profile-sidebar__link ${isActive ? "is-active" : ""}`}
              to="/admin/partituras"
            >
              Partituras
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              className={({ isActive }) => `profile-sidebar__link ${isActive ? "is-active" : ""}`}
              to="/admin/multimedia"
            >
              Multimedia
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              className={({ isActive }) => `profile-sidebar__link ${isActive ? "is-active" : ""}`}
              to="/admin/noticias"
            >
              Noticias
            </NavLink>
          )}

          <NavLink
            className={({ isActive }) => `profile-sidebar__link ${isActive ? "is-active" : ""}`}
            to={attendancePath}
          >
            {isAdmin ? "Lista de asistencia" : "Asistencia"}
          </NavLink>

          {!isAdmin && (
            <NavLink
              className={({ isActive }) => `profile-sidebar__link ${isActive ? "is-active" : ""}`}
              to="/mis-partituras"
            >
              Mis partituras
              {unseenScores > 0 && <span className="profile-sidebar__link-badge">{unseenScores}</span>}
            </NavLink>
          )}

          {!isAdmin && (
            <NavLink
              className={({ isActive }) => `profile-sidebar__link ${isActive ? "is-active" : ""}`}
              to="/partituras"
            >
              Todas las partituras
            </NavLink>
          )}

          {!isAdmin && (
            <NavLink
              className={({ isActive }) => `profile-sidebar__link ${isActive ? "is-active" : ""}`}
              to="/mis-materiales"
            >
              Mis materiales
              {unseenMedia > 0 && <span className="profile-sidebar__link-badge">{unseenMedia}</span>}
            </NavLink>
          )}

          {!isAdmin && (
            <NavLink
              className={({ isActive }) => `profile-sidebar__link ${isActive ? "is-active" : ""}`}
              to="/materiales"
            >
              Todos los materiales
            </NavLink>
          )}

          <NavLink
            className={({ isActive }) => `profile-sidebar__link ${isActive ? "is-active" : ""}`}
            to="/"
            end
          >
            Ver noticias
          </NavLink>
        </nav>
      </div>

      <button className="profile-sidebar__logout" type="button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </aside>
  );
}

export default ProfileSidebar;
