import { NavLink, useNavigate } from "react-router-dom";

import { authRepository } from "../../repositories/authRepository";
import type { User } from "../../types/auth";

interface ProfileSidebarProps {
  user: User;
}

function ProfileSidebar({ user }: ProfileSidebarProps) {
  const navigate = useNavigate();
  const isAdmin = user.role === "ADMIN";
  const profilePath = isAdmin ? "/perfil-admin" : "/perfil-usuario";
  const attendancePath = isAdmin ? "/admin/asistencia" : "/mi-asistencia";

  const handleLogout = () => {
    authRepository.logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="profile-sidebar" aria-label="Navegación del perfil">
      <div>
        <p className="profile-sidebar__brand">Banda estudiantil</p>
        <p className="profile-sidebar__role">{isAdmin ? "Panel administrador" : "Perfil de integrante"}</p>

        <nav className="profile-sidebar__nav" aria-label="Secciones del perfil">
          <NavLink
            className={({ isActive }) => `profile-sidebar__link ${isActive ? "is-active" : ""}`}
            to={profilePath}
          >
            Mi perfil
          </NavLink>
          <NavLink
            className={({ isActive }) => `profile-sidebar__link ${isActive ? "is-active" : ""}`}
            to={attendancePath}
          >
            {isAdmin ? "Lista de asistencia" : "Asistencia"}
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
