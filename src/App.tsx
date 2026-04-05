import { BrowserRouter, Route, Routes } from "react-router-dom"
import { EncuestaPage } from "./pages/EncuestaPage"
import { BotonFlotante } from "./components/ui/BotonFlotante"
import { LoginPage } from "./pages/admin/LoginPage"
import { AdminLayout } from "./layouts/AdminLayout";
import { DashboardPage } from "./pages/admin/DashboardPage";

// Pantallas temporales (placeholders)
const HistorialTemporal = () => <div className="text-2xl font-bold text-slate-600">Historial (En construcción)</div>;
const ReportesTemporal = () => <div className="text-2xl font-bold text-slate-600">Reportes (En construcción)</div>;
const UsuariosTemporal = () => <div className="text-2xl font-bold text-slate-600">Gestión de Usuarios Admin (En construcción)</div>;

function App() {

  return (
    <BrowserRouter>

      {/* El botón flotante va fuera del Routes para que aparezca siempre */}
      <BotonFlotante />

      <Routes>
        {/* Rutas Públicas (Sin Layout de Gestor) */}
        <Route path="/" element={<EncuestaPage />} />
        <Route path="/admin" element={<LoginPage />} />

        {/* Rutas Privadas (Envuelta en el AdminLayout) */}
        <Route element={<AdminLayout />}>
        {/* Aquí inyectaremos el Dashboard de verdad en el siguiente paso */}
        <Route path="/admin/dashboard" element={<div className="text-2xl font-bold text-blue-600"><DashboardPage /></div>} />

          <Route path="/admin/historial" element={<HistorialTemporal />} />
          <Route path="/admin/reportes" element={<ReportesTemporal />} />
          <Route path="/admin/usuarios" element={<UsuariosTemporal />} />
        </Route>
       

      </Routes>


    </BrowserRouter>

  );
}

export default App
