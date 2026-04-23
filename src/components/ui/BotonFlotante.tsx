import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "./button";

export const BotonFlotante = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Compruebo si estamos fuera de la encuesta (en el login o en el panel)
    const esZonaResponsable = location.pathname !== '/';

    return (
        <Button
            onClick={() => navigate(esZonaResponsable ? '/' : '/login')}
            // 👇 CAMBIAMOS top-4 por top-20 PARA QUE NO PISE LA CABECERA 👇
            className={`fixed right-4 top-15 md:top-auto md:bottom-6 z-[100] bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold h-auto py-2 px-3 md:py-3 md:px-6 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group`}
        >
            {/* Texto solo visible en PC/Tablet */}
            <span className="hidden sm:inline-block text-sm md:text-base">
                {esZonaResponsable ? '← Encuesta ' : 'Panel Control →'}
            </span>

            {/* En móvil solo mostramos el circulito con el interrogante */}
            <span className="bg-white text-[#A855F7] rounded-full w-6 h-6 flex items-center justify-center text-xs font-black group-hover:scale-110 transition-transform">
                ?
            </span>
        </Button>
    );
};