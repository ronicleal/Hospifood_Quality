import { useLocation, useNavigate } from "react-router-dom"

export const BotonFlotante = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Compruebo si estamos en la interfaz del Responsable de Calidad mirando la URL
    const esZonaResponsable = location.pathname.includes('/admin');

    return (
        <button
        onClick={() => navigate(esZonaResponsable ? '/' : '/admin')}
        className="fixed bottom-6 right-6 z-50 bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
        >

        {esZonaResponsable ? '⬅️Encuestas' : 'Panel de Control➡️'}
        <span className="bg-white text-[#A855F7] rounded-full w-6 h-6 flex items-center justify-center text-xs font-black ml-1 group-hover:scale-110 transition-transform">
        ?
        </span>    
        </button>
    );
};