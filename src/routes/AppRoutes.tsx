import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";


import AdminProfilePage from "../pages/AdminProfilePage";
import AdminAttendancePage from "../pages/AdminAttendancePage";

import AdminStudentsPage from "../pages/AdminStudentsPage";
import AddStudentPage from "../pages/AddStudentPage";
import AdminInstrumentsPage from "../pages/AdminInstrumentsPage";
import AdminScoresPage from "../pages/AdminScoresPage";
import AdminMediaPage from "../pages/AdminMediaPage";
import AdminPostsPage from "../pages/AdminPostsPage";

import HomePage from "../pages/HomePage";
import UserAttendancePage from "../pages/UserAttendancePage";
import UserProfilePage from "../pages/UserProfilePage";
import MyScoresPage from "../pages/MyScoresPage";
import AllScoresPage from "../pages/AllScoresPage";
import MyMediaPage from "../pages/MyMediaPage";
import AllMediaPage from "../pages/AllMediaPage";
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
        <Route path="/admin/instrumentos" element={<AdminInstrumentsPage />} />
        <Route path="/admin/partituras" element={<AdminScoresPage />} />
        <Route path="/admin/multimedia" element={<AdminMediaPage />} />
        <Route path="/admin/noticias" element={<AdminPostsPage />} />


        <Route path="/perfil-usuario" element={<UserProfilePage />} />
        <Route path="/mi-asistencia" element={<UserAttendancePage />} />
        <Route path="/mis-partituras" element={<MyScoresPage />} />
        <Route path="/partituras" element={<AllScoresPage />} />
        <Route path="/mis-materiales" element={<MyMediaPage />} />
        <Route path="/materiales" element={<AllMediaPage />} />
      </Routes>
    </BrowserRouter>
  );
}


export default AppRoutes;
