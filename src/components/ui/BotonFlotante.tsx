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
            className={`
                fixed z-[100] transition-all flex items-center gap-2 group rounded-full font-bold text-white bg-[#A855F7]
                opacity-60 hover:opacity-100 hover:shadow-xl
                /* MÓVIL*/
                top-15 right-4 h-auto py-2 px-3 shadow-lg
                /* WEB/TABLET */
                md:top-auto md:bottom-8 md:right-8 md:py-3 md:px-6
            `}
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