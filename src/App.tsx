import { useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { Toaster } from "sonner"; // 👈 Importamos el componente de Toasts

// Guardias
import { ProtectedRoute } from "./router/ProtectedRoute";
import { AdminRoute } from "./router/AdminRoute";
import { PublicRoute } from "./router/PublicRoute";

// Layouts y Componentes
import { PanelLayout } from "./layouts/PanelLayout";
import { BotonFlotante } from "./components/ui/BotonFlotante";

// Páginas
import { EncuestaPage } from "./pages/EncuestaPage";
import { LoginPage } from "./pages/panel/LoginPage";
import { DashboardPage } from "./pages/panel/DashboardPage";
import { HistorialPage } from "./pages/panel/HistorialPage";
import { ReportesPage } from "./pages/panel/ReportesPage";
import { TurnosPage } from "./pages/gestor/TurnosPage";
import { ParametrosPage } from "./pages/gestor/ParametrosPage";
import { HospitalesPage } from "./pages/admin/HospitalesPage";
import { UsuariosPage } from "./pages/admin/UsuariosPage";
import { PerfilPage } from "./pages/panel/PerfilPage";

// Páginas de recuperación
import { RecuperarPasswordPage } from "./pages/panel/RecuperarPasswordPage";
import { ActualizarPasswordPage } from "./pages/panel/ActualizarPasswordPage";

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      {/* 🚀 Añadimos el Toaster aquí para que esté disponible en toda la app */}
      <Toaster position="top-right" richColors closeButton /> 
      
      <BotonFlotante />

      <Routes>
        <Route path="/" element={<EncuestaPage />} />

        {/* RUTAS DE INVITADO */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar-password" element={<RecuperarPasswordPage />} />
        </Route>

        <Route path="/recuperar-password/confirmar" element={<ActualizarPasswordPage />} />

        {/* ZONA PRIVADA */}
        <Route element={<ProtectedRoute />}>
          <Route element={<PanelLayout />}>
            <Route path="/panel" element={<Navigate to="/panel/dashboard" replace />} />
            <Route path="/panel/dashboard" element={<DashboardPage />} />
            <Route path="/panel/historial" element={<HistorialPage />} />
            <Route path="/panel/reportes" element={<ReportesPage />} />
            <Route path="/panel/turnos" element={<TurnosPage />} />
            <Route path="/panel/parametros" element={<ParametrosPage />} />
            <Route path="/panel/perfil" element={<PerfilPage />} />

            <Route element={<AdminRoute />}>
              <Route path="/panel/hospitales" element={<HospitalesPage />} />
              <Route path="/panel/usuarios" element={<UsuariosPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;