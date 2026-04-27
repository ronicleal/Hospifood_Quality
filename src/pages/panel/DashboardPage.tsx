import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

// Repositorios e Interfaces
import { createStatsRepository, createHospitalRepository, createTurnoRepository, createParametroRepository, createGestorRepository } from "../../database/repositories";
import type { DashboardData } from "../../interfaces/Estadisticas";
import type { Hospital } from "../../interfaces/Hospital";
import type { Turno } from "../../interfaces/Turnos";
import type { Parametro } from "../../interfaces/Parametro";
import type { GestorData } from "../../database/repositories/GestorRepository";

// Componentes
import { StatsCards } from "../../components/panel/StatsCards";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { DashboardGraficos } from "../../components/dashboard/DashboardGraficos";
import { DashboardDetalles } from "../../components/dashboard/DashboardDetalles";

export const DashboardPage = () => {
    const { profile, isAdmin } = useAuthStore();
    const misHospitales = profile?.hospitales || [];

    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [hospitalesDisponibles, setHospitalesDisponibles] = useState<Hospital[]>([]);
    const [filtroHospitalId, setFiltroHospitalId] = useState<number>(0);
    
    const [detallesGestores, setDetallesGestores] = useState<GestorData[]>([]);
    const [detallesTurnos, setDetallesTurnos] = useState<Turno[]>([]);
    const [detallesParametros, setDetallesParametros] = useState<Parametro[]>([]);

    const statsRepo = createStatsRepository();

    // 1. Cargar lista de hospitales para el Selector
    useEffect(() => {
        if (isAdmin || misHospitales.length > 1) {
            createHospitalRepository().getHospitales().then(({ data }) => {
                if (data) setHospitalesDisponibles(isAdmin ? data : data.filter(h => misHospitales.includes(h.id)));
            });
        }
    }, [isAdmin, misHospitales]);

    // 2. Cargar datos principales y secundarios
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            if (!isAdmin && misHospitales.length === 0) return setLoading(false);

            let idsAConsultar = filtroHospitalId === 0 ? (isAdmin ? [] : misHospitales) : [filtroHospitalId];
            let isGlobal = filtroHospitalId === 0 && isAdmin;

            // Pedimos los datos estadísticos
            const { data: stast } = await statsRepo.getDashboardStats(idsAConsultar, isGlobal);
            if (stast) setData(stast);

            // Detalles de configuración (solo si se selecciona 1 hospital específico)
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
    }, [misHospitales, isAdmin, filtroHospitalId]);

    // Muro de seguridad visual
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
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Cabecera y Filtros */}
            <DashboardHeader 
                isAdmin={isAdmin} 
                misHospitalesLength={misHospitales.length} 
                filtroHospitalId={filtroHospitalId} 
                setFiltroHospitalId={setFiltroHospitalId} 
                hospitalesDisponibles={hospitalesDisponibles} 
            />

            {/* Tarjetas KPI Superiores */}
            <StatsCards resumen={data.resumen} />

            {/* Gráficos Recharts */}
            <DashboardGraficos 
                satisfaccion={data.satisfaccion} 
                evolucion={data.evolucion} 
            />

            {/* Detalles (Gestores, Turnos, Parámetros) */}
            <DashboardDetalles 
                filtroHospitalId={filtroHospitalId}
                detallesGestores={detallesGestores}
                detallesTurnos={detallesTurnos}
                detallesParametros={detallesParametros}
            />
        </div>
    );
};