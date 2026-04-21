import { useEffect, useState } from "react";
import type { DashboardData } from "../../interfaces/Estadisticas";
import type { Hospital } from "../../interfaces/Hospital";
import type { Turno } from "../../interfaces/Turnos";
import type { Parametro } from "../../interfaces/Parametro";
import type { GestorData } from "../../database/repositories/GestorRepository";

import { 
    createStatsRepository, createHospitalRepository, 
    createTurnoRepository, createParametroRepository, createGestorRepository 
} from "../../database/repositories";

import { StatsCards } from "../../components/panel/StatsCards";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuthStore } from "../../store/authStore";
import { AlertCircle, Building2, Users, Clock, ListChecks } from "lucide-react";
import { Badge } from "../../components/ui/badge";

export const DashboardPage = () => {
    const { profile, isAdmin } = useAuthStore();
    const misHospitales = profile?.hospitales || [];

    // Estados principales
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Estado unificado del Selector de Hospitales
    const [hospitalesDisponibles, setHospitalesDisponibles] = useState<Hospital[]>([]);
    const [filtroHospitalId, setFiltroHospitalId] = useState<number>(0); // 0 = Todos los permitidos
    
    // Estados para los detalles adicionales
    const [detallesGestores, setDetallesGestores] = useState<GestorData[]>([]);
    const [detallesTurnos, setDetallesTurnos] = useState<Turno[]>([]);
    const [detallesParametros, setDetallesParametros] = useState<Parametro[]>([]);

    const statsRepo = createStatsRepository();

    // 1. Cargar lista de hospitales para el Selector
    useEffect(() => {
        // Solo cargamos la lista si es Admin o si el Gestor tiene más de 1 hospital
        if (isAdmin || misHospitales.length > 1) {
            const fetchHospitals = async () => {
                const hRepo = createHospitalRepository();
                const { data } = await hRepo.getHospitales();
                if (data) {
                    if (isAdmin) {
                        setHospitalesDisponibles(data);
                    } else {
                        // Si es gestor, filtramos la lista para que solo vea sus centros
                        setHospitalesDisponibles(data.filter(h => misHospitales.includes(h.id)));
                    }
                }
            };
            fetchHospitals();
        }
    }, [isAdmin, misHospitales]);

    // 2. Cargar datos principales y secundarios
    useEffect(() => {
        async function loadData() {
            setLoading(true);

            if (!isAdmin && misHospitales.length === 0) {
                setLoading(false);
                return;
            }

            // LÓGICA UNIFICADA DE FILTRADO
            let idsAConsultar: number[] = [];
            let isGlobal = false;

            if (filtroHospitalId === 0) {
                // Ha elegido "Todos"
                if (isAdmin) {
                    idsAConsultar = []; // Vacío + isGlobal = Todos los de Extremadura
                    isGlobal = true;
                } else {
                    idsAConsultar = misHospitales; // Todos los suyos
                    isGlobal = false;
                }
            } else {
                // Ha elegido un hospital específico (sea Admin o Gestor)
                idsAConsultar = [filtroHospitalId];
                isGlobal = false;
            }

            // Pedimos los datos estadísticos
            const { data: stast } = await statsRepo.getDashboardStats(idsAConsultar, isGlobal);
            if (stast) setData(stast);

            // Si se ha filtrado por 1 solo hospital, cargamos sus detalles de configuración
            if (filtroHospitalId !== 0) {
                const tRepo = createTurnoRepository();
                const pRepo = createParametroRepository();
                const gRepo = createGestorRepository();

                const [resTurnos, resParam, resGestores] = await Promise.all([
                    tRepo.getTurnos([filtroHospitalId], false),
                    pRepo.getParametros([filtroHospitalId], false),
                    gRepo.getGestores()
                ]);

                if (resTurnos.data) setDetallesTurnos(resTurnos.data);
                if (resParam.data) setDetallesParametros(resParam.data);
                
                if (resGestores.data) {
                    const gestoresAsignados = resGestores.data.filter(g => 
                        g.hospitales?.some(h => h.hospital_id === filtroHospitalId)
                    );
                    setDetallesGestores(gestoresAsignados);
                }
            }
            
            setLoading(false);
        }
        
        loadData();
    }, [misHospitales, isAdmin, filtroHospitalId]);

    // Muro de seguridad visual
    if (!isAdmin && misHospitales.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <AlertCircle size={40} />
                </div>
                <h2 className="text-3xl font-extrabold text-foreground mb-4">Cuenta Pendiente de Activación</h2>
                <p className="text-lg text-muted-foreground max-w-md">
                    Tu cuenta ha sido creada correctamente, pero <b>aún no tienes ningún hospital asignado</b>. 
                    <br/><br/>
                    Por favor, contacta con el Administrador del SES para que te asigne a tu centro correspondiente.
                </p>
            </div>
        );
    }

    if (loading && !data) return <div className="p-10 text-center font-bold text-slate-400">Cargando datos del panel...</div>;
    if (!data) return <div className="p-10 text-center font-bold text-red-500">Error al cargar los datos del servidor.</div>;

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">
                        {isAdmin ? "Visión Global" : "Mi Panel de Control"}
                    </h1>
                    <p className="text-muted-foreground mt-1">Resumen general de satisfacción de pacientes</p>
                </div>
                
                {/* EL SELECTOR APARECE SI ERES ADMIN O SI TIENES > 1 HOSPITAL */}
                {(isAdmin || misHospitales.length > 1) && (
                    <div className="w-full md:w-80 space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2 text-primary">
                            <Building2 size={16} /> Filtrar por Centro:
                        </label>
                        <select 
                            value={filtroHospitalId}
                            onChange={(e) => setFiltroHospitalId(Number(e.target.value))}
                            className="w-full h-11 px-4 rounded-lg border border-input bg-card text-foreground font-medium shadow-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
                        >
                            <option value={0}>
                                {isAdmin ? "TODOS LOS CENTROS (Global)" : "MIS CENTROS ASIGNADOS"}
                            </option>
                            {hospitalesDisponibles.map(h => (
                                <option key={h.id} value={h.id}>{h.nombre} ({h.localidad || h.provincia})</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <StatsCards resumen={data.resumen} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="bg-card p-8 rounded-3xl shadow-sm border border-border max-w-2xl">
                    <h3 className="text-xl font-bold text-card-foreground mb-6">Satisfacción del Paciente</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data.satisfaccion} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                                    {data.satisfaccion.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {data.satisfaccion.map(s => (
                            <div key={s.name} className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                                {s.name} ({s.value})
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-card p-6 rounded-2xl shadow-sm border border-border lg:col-span-2">
                    <h3 className="text-lg font-bold text-card-foreground mb-6">Evolución Semanal (Nota Media)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.evolucion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="nota" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* SECCIÓN DETALLES (Se muestra si Admin O Gestor seleccionan 1 hospital concreto) */}
            {filtroHospitalId !== 0 && (
                <div className="pt-8 border-t border-border animate-fade-in mt-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Configuración del Centro Seleccionado</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-primary">
                                <Users size={18} />
                                <h3 className="font-semibold">Responsables (Gestores)</h3>
                            </div>
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                {detallesGestores.length > 0 ? (
                                    detallesGestores.map(g => (
                                        <div key={g.id} className="p-3 bg-muted/50 rounded-lg border border-border text-sm">
                                            <p className="font-bold text-foreground">{g.nombre_completo}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-destructive font-medium italic">Sin responsable asignado</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-primary">
                                <Clock size={18} />
                                <h3 className="font-semibold">Turnos Configurados</h3>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {detallesTurnos.length > 0 ? (
                                    detallesTurnos.map(t => (
                                        <div key={t.id} className="flex justify-between items-center p-2.5 bg-muted/50 rounded-lg border border-border text-sm">
                                            <span className="font-medium">{t.nombre}</span>
                                            <Badge variant={t.activo ? "default" : "secondary"}>{t.activo ? 'Activo' : 'Inactivo'}</Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No hay turnos creados</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-primary">
                                <ListChecks size={18} />
                                <h3 className="font-semibold">Parámetros Evaluados</h3>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {detallesParametros.length > 0 ? (
                                    detallesParametros.map(p => (
                                        <div key={p.id} className="p-2.5 bg-muted/50 rounded-lg border border-border text-sm flex flex-col gap-1">
                                            <div className="flex justify-between items-start">
                                                <span className="font-bold">{p.titulo}</span>
                                                <Badge variant={p.activo ? "default" : "secondary"} className="text-[10px] h-4 px-1">{p.activo ? 'ON' : 'OFF'}</Badge>
                                            </div>
                                            <span className="text-xs text-muted-foreground truncate" title={p.descripcion}>{p.descripcion}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No hay parámetros creados</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};