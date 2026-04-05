import { BrowserRouter, Route, Routes } from "react-router-dom"
import { EncuestaPage } from "./pages/EncuestaPage"
import { BotonFlotante } from "./components/ui/BotonFlotante"
import { LoginPage } from "./pages/admin/LoginPage"

// Pantallas temporales para probar que las rutas funcionan
const DashboardGestor = () => <div className="p-10 text-2xl font-bold text-blue-600 bg-slate-100 min-h-screen">📊 Bienvenido al Panel de Control (GESTOR)</div>;
const DashboardAdmin = () => <div className="p-10 text-2xl font-bold text-purple-600 bg-slate-100 min-h-screen">⚙️ Bienvenido al Panel de Usuarios (ADMIN)</div>;

function App() {

  return (
    <BrowserRouter>

      {/* El botón flotante va fuera del Routes para que aparezca siempre */}
      <BotonFlotante />

      <Routes>
        {/* Ruta principal: El paciente */}
        <Route path="/" element={<EncuestaPage />} />

        {/* Acceso Gestores/Admins */}
        <Route path="/admin" element={<LoginPage />} />

        {/* Zonas Privadas (Fase 3 y 4) */}
        <Route path="/admin/dashboard" element={<DashboardGestor />} /> 
        <Route path="/admin/usuarios" element={<DashboardAdmin />} />

      </Routes>


    </BrowserRouter>

  );
}

export default App
