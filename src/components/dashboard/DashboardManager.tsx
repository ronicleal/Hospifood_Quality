
import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { 
    createStatsRepository, 
    createHospitalRepository, 
    createTurnoRepository, 
    createParametroRepository, 
    createGestorRepository 
} from "../../database/repositories";
import type { DashboardData } from "../../interfaces/Estadisticas";
import type { Hospital } from "../../interfaces/Hospital";
import type { Turno } from "../../interfaces/Turnos";
import type { Parametro } from "../../interfaces/Parametro";
import type { GestorData } from "../../database/repositories/GestorRepository";

import { StatsCards } from "../panel/StatsCards";
import { ChatbotIA } from "../ui/ChatbotIA";

import { DashboardHeader } from "./DashboardHeader";
import { DashboardGraficos } from "./DashboardGraficos";
import { DashboardDetalles } from "./DashboardDetalles";

export const DashboardManager = () => {
    const { profile, isAdmin } = useAuthStore();
    const misHospitales = profile?.hospitales || [];

    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [hospitalesDisponibles, setHospitalesDisponibles] = useState<Hospital[]>([]);
    const [filtroHospitalId, setFiltroHospitalId] = useState<number>(0);
    
    const [filtroPlanta, setFiltroPlanta] = useState<string>("Todas");
    
    const [detallesGestores, setDetallesGestores] = useState<GestorData[]>([]);
    const [detallesTurnos, setDetallesTurnos] = useState<Turno[]>([]);
    const [detallesParametros, setDetallesParametros] = useState<Parametro[]>([]);

    const statsRepo = createStatsRepository();

    useEffect(() => {
        if (isAdmin || misHospitales.length > 1) {
            createHospitalRepository().getHospitales().then(({ data }) => {
                if (data) setHospitalesDisponibles(isAdmin ? data : data.filter(h => misHospitales.includes(h.id)));
            });
        }
    }, [isAdmin, misHospitales]);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            if (!isAdmin && misHospitales.length === 0) return setLoading(false);

            let idsAConsultar = filtroHospitalId === 0 ? (isAdmin ? [] : misHospitales) : [filtroHospitalId];
            let isGlobal = filtroHospitalId === 0 && isAdmin;

            const plantaParam = filtroPlanta === "Todas" ? null : filtroPlanta;
            const { data: stast } = await statsRepo.getDashboardStats(idsAConsultar, isGlobal, plantaParam);
            
            if (stast) setData(stast);

            if (filtroHospitalId !== 0) {
                const [resTurnos, resParam, resGestores] = await Promise.all([
                    createTurnoRepository().getTurnos([filtroHospitalId], false),
                    createParametroRepository().getParametros([filtroHospitalId], false),
                    createGestorRepository().getGestores()
                ]);

                if (resTurnos.data) setDetallesTurnos(resTurnos.data);
                if (resParam.data) setDetallesParametros(resParam.data);
                if (resGestores.data) setDetallesGestores(resGestores.data.filter(g => g.hospitales?.some(h => h.hospital_id === filtroHospitalId)));
            }
            setLoading(false);
        }
        loadData();
    }, [misHospitales, isAdmin, filtroHospitalId, filtroPlanta]); 

    const hospitalIdParaChatbot = filtroHospitalId !== 0 
        ? filtroHospitalId 
        : (misHospitales.length > 0 ? misHospitales[0] : 0);

    if (!isAdmin && misHospitales.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm"><AlertCircle size={40} /></div>
                <h2 className="text-3xl font-extrabold mb-4">Cuenta Pendiente de Activación</h2>
                <p className="text-lg text-muted-foreground max-w-md">Tu cuenta ha sido creada, pero <b>aún no tienes ningún hospital asignado</b>.</p>
            </div>
        );
    }

    if (loading && !data) return <div className="p-10 text-center font-bold text-slate-400">Cargando datos del panel...</div>;
    if (!data) return <div className="p-10 text-center font-bold text-red-500">Error al cargar los datos del servidor.</div>;

    return (
        <div className="space-y-8 animate-fade-in pb-10 relative">
            <DashboardHeader 
                isAdmin={isAdmin} 
                misHospitalesLength={misHospitales.length} 
                filtroHospitalId={filtroHospitalId} 
                setFiltroHospitalId={setFiltroHospitalId} 
                hospitalesDisponibles={hospitalesDisponibles} 
                filtroPlanta={filtroPlanta}          
                setFiltroPlanta={setFiltroPlanta}    
            />

            <StatsCards resumen={data.resumen} />

            <DashboardGraficos 
                satisfaccion={data.satisfaccion} 
                evolucion={data.evolucion} 
            />

            <DashboardDetalles 
                filtroHospitalId={filtroHospitalId}
                detallesGestores={detallesGestores}
                detallesTurnos={detallesTurnos}
                detallesParametros={detallesParametros}
            />

            {!isAdmin && hospitalIdParaChatbot !== 0 && (
                <ChatbotIA hospitalId={hospitalIdParaChatbot} />
            )}
        </div>
    );
};