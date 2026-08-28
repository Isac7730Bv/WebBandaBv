import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";


import AdminProfilePage from "../pages/AdminProfilePage";
import AdminAttendancePage from "../pages/AdminAttendancePage";

import AdminStudentsPage from "../pages/AdminStudentsPage";
import AddStudentPage from "../pages/AddStudentPage";

import HomePage from "../pages/HomePage";
import UserAttendancePage from "../pages/UserAttendancePage";
import UserProfilePage from "../pages/UserProfilePage";
import LoginPage from "../pages/auth/LoginPage";


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/perfil-admin" element={<AdminProfilePage />} />
        <Route path="/admin/asistencia" element={<AdminAttendancePage />} />

        <Route path="/admin/estudiantes" element={<AdminStudentsPage />} />
        <Route path="/admin/estudiantes/nuevo" element={<AddStudentPage />} />


        <Route path="/perfil-usuario" element={<UserProfilePage />} />
        <Route path="/mi-asistencia" element={<UserAttendancePage />} />
      </Routes>
    </BrowserRouter>
  );
}


export default AppRoutes;
