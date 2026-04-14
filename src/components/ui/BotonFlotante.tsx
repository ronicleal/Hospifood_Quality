import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "./button"; // Importamos el botón de Shadcn

export const BotonFlotante = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Compruebo si estamos en la interfaz del Responsable de Calidad mirando la URL
    const esZonaResponsable = location.pathname.includes('/admin');

    // LÓGICA RESPONSIVA DINÁMICA
    const posicionBottom = esZonaResponsable ? "bottom-6" : "bottom-24 md:bottom-6";

    return (
        <Button
            onClick={() => navigate(esZonaResponsable ? '/' : '/admin')}
            className={`fixed right-4 md:right-6 z-[100] ${posicionBottom} bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold h-auto py-2 px-4 md:py-3 md:px-6 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group`}
        >
            {/* Texto para pantallas medianas y grandes (PC/Tablet) */}
            <span className="hidden sm:inline-block text-sm md:text-base">
                {esZonaResponsable ? '← Encuesta ' : 'Admin →'}
            </span>

            {/* Texto acortado solo para móviles (Smartphone) */}
            <span className="sm:hidden text-sm">
                {esZonaResponsable ? '← Encuesta ' : 'Admin →'}
            </span>

            <span className="bg-white text-[#A855F7] rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs font-black group-hover:scale-110 transition-transform">
                ?
            </span>
        </Button>
    );
};