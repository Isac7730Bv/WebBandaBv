import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";


import LoginForm from "../../components/auth/LoginForm";
import { authRepository } from "../../repositories/authRepository";


import type { LoginCredentials } from "../../types/auth";


const getProfilePathByRole = (role: string) =>
  role === "ADMIN" ? "/perfil-admin" : "/perfil-usuario";


function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const currentUser = authRepository.getCurrentUser();


  if (currentUser) {
    return <Navigate to={getProfilePathByRole(currentUser.role)} replace />;
  }


  const handleLogin = async (credentials: LoginCredentials) => {
    setError("");


    const user = await authRepository.login(credentials);


    if (!user) {
      setError("El carnet o la contraseña son incorrectos.");
      return;
    }


    navigate(getProfilePathByRole(user.role), { replace: true });
  };


  return (
    <main className="login-page">
      <LoginForm
        error={error}
        onSubmit={handleLogin}
      />
    </main>
  );
}


export default LoginPage;
