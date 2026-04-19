import { useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

// 1. Importamos nuestros 3 nuevos guardias
import { ProtectedRoute } from "./router/ProtectedRoute";
import { AdminRoute } from "./router/AdminRoute";
import { PublicRoute } from "./router/PublicRoute";

// 2. Importamos el Layout (con el nombre nuevo)
import { PanelLayout } from "./layouts/PanelLayout";

// 3. Importamos las páginas
import { EncuestaPage } from "./pages/EncuestaPage";
import { LoginPage } from "./pages/panel/LoginPage"; 
import { DashboardPage } from "./pages/panel/DashboardPage"; 
import { HistorialPage } from "./pages/panel/HistorialPage"; 
import { ReportesPage } from "./pages/panel/ReportesPage"; 
import { BotonFlotante } from "./components/ui/BotonFlotante";
import { TurnosPage } from "./pages/gestor/TurnosPage";

// Placeholders para los CRUDs que haremos luego
const UsuariosCRUD = () => <div className="p-8 text-2xl font-bold">CRUD de Usuarios (Zona Admin)</div>;


function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <BotonFlotante />

      <Routes>
        {/* RUTA PÚBLICA DEL PACIENTE */}
        <Route path="/" element={<EncuestaPage />} />

        {/* RUTAS DE INVITADO (Protegidas por PublicRoute) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* ZONA PRIVADA (Protegida por ProtectedRoute) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<PanelLayout />}>
            
            <Route path="/panel" element={<Navigate to="/panel/dashboard" replace />} />
            
            <Route path="/panel/dashboard" element={<DashboardPage />} />
            <Route path="/panel/historial" element={<HistorialPage />} />
            <Route path="/panel/reportes" element={<ReportesPage />} />
            <Route path="/panel/turnos" element={<TurnosPage />} />

            {/* ZONA VIP (Protegida por AdminRoute) */}
            <Route element={<AdminRoute />}>
              <Route path="/panel/usuarios" element={<UsuariosCRUD />} />
            </Route>

          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;