import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";


import AdminProfilePage from "../pages/AdminProfilePage";
import HomePage from "../pages/HomePage";
import UserProfilePage from "../pages/UserProfilePage";
import LoginPage from "../pages/auth/LoginPage";


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/perfil-admin" element={<AdminProfilePage />} />
        <Route path="/perfil-usuario" element={<UserProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}


export default AppRoutes;
