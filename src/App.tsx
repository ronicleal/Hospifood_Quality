import { BrowserRouter, Route, Routes } from "react-router-dom"
import { EncuestaPage } from "./pages/EncuestaPage"
import { BotonFlotante } from "./components/ui/BotonFlotante"
import { LoginPage } from "./pages/admin/LoginPage"


function App() {


  return (
    <BrowserRouter>

      {/* El botón flotante va fuera del Routes para que aparezca siempre */}
      <BotonFlotante />

      <Routes>
        {/* Ruta principal: El paciente */}
        <Route path="/" element={<EncuestaPage />} />

        {/* Rutas de administración */}
        <Route path="/admin" element={<LoginPage />} />

      </Routes>


    </BrowserRouter>

  );
}

export default App
