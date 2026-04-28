import { useEffect, useRef, useState } from "react";
import { AlertCircle, Building2, CheckCircle2, Clock, Download, FileText, Mail, BedDouble } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { createHistorialRepository, createHospitalRepository } from "../../database/repositories";
import type { EncuestaHistorial } from "../../database/repositories/HistorialRepository";
import type { Hospital } from "../../interfaces/Hospital";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

import { generarReportePDF } from "../../utils/pdfGenerator";
import { ReportesOpciones, TIPOS_REPORTE } from "../../components/reportes/ReportesOpciones";
import { ReportesGraficosOcultos } from "../../components/reportes/ReportesGraficosOcultos";
import { PLANTAS_HOSPITALARIAS } from "../../utils/constants";

export const ReportesPage = () => {
    const { profile, isAdmin } = useAuthStore();
    const misHospitales = profile?.hospitales || [];

    const [tipoSeleccionado, setTipoSeleccionado] = useState<"diario" | "semanal" | "mensual">("semanal");
    const [encuestas, setEncuestas] = useState<EncuestaHistorial[]>([]);
    const [loading, setLoading] = useState(true);

    const [hospitalesDisponibles, setHospitalesDisponibles] = useState<Hospital[]>([]);
    const [filtroHospitalId, setFiltroHospitalId] = useState<number>(0);
    const [filtroPlanta, setFiltroPlanta] = useState<string>("Todas"); // 👈 Nuevo estado

    const chartPieRef = useRef<HTMLDivElement>(null);
    const chartBarRef = useRef<HTMLDivElement>(null);

    const historialRepo = createHistorialRepository();

    useEffect(() => {
        if (isAdmin || misHospitales.length > 1) {
            createHospitalRepository().getHospitales().then(({ data }) => {
                if (data) setHospitalesDisponibles(isAdmin ? data : data.filter(h => misHospitales.includes(h.id)));
            });
        }
    }, [isAdmin, misHospitales]);

    useEffect(() => {
        async function load() {
            setLoading(true);
            if (!isAdmin && misHospitales.length === 0) return setLoading(false);
            let idsAConsultar = filtroHospitalId === 0 ? (isAdmin ? [] : misHospitales) : [filtroHospitalId];
            const { data } = await historialRepo.getHistorial(idsAConsultar, filtroHospitalId === 0 && isAdmin);
            if (data) setEncuestas(data);
            setLoading(false);
        }
        load();
    }, [misHospitales, isAdmin, filtroHospitalId]);

    const hospitalSeleccionado = hospitalesDisponibles.find(h => h.id === filtroHospitalId);
    const NOMBRE_HOSPITAL = filtroHospitalId === 0 ? (isAdmin ? "Múltiples Centros (Global SES)" : "Mis Centros Asignados") : (hospitalSeleccionado?.nombre || "Hospital Seleccionado");

    // Lógica de filtrado en memoria
    const encuestasFiltradas = encuestas.filter(e => {
        if (!e.fechaOriginal) return false;
        
        // Filtro de Planta
        if (filtroPlanta !== "Todas" && e.planta !== filtroPlanta) return false;

        const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
        const fechaEnc = new Date(e.fechaOriginal); fechaEnc.setHours(0, 0, 0, 0);

        if (tipoSeleccionado === "diario") return fechaEnc.getTime() === hoy.getTime();
        if (tipoSeleccionado === "semanal") {
            const hace7 = new Date(hoy); hace7.setDate(hoy.getDate() - 7);
            return fechaEnc >= hace7 && fechaEnc <= hoy;
        }
        if (tipoSeleccionado === "mensual") return fechaEnc.getMonth() === hoy.getMonth() && fechaEnc.getFullYear() === hoy.getFullYear();
        return false;
    });

    const dataSatisfaccion = [
        { name: "Excelente", value: encuestasFiltradas.filter(e => e.notaMedia >= 4.5).length, color: "#22c55e" },
        { name: "Bueno", value: encuestasFiltradas.filter(e => e.notaMedia >= 3.5 && e.notaMedia < 4.5).length, color: "#84cc16" },
        { name: "Regular", value: encuestasFiltradas.filter(e => e.notaMedia >= 2.5 && e.notaMedia < 3.5).length, color: "#eab308" },
        { name: "Malo", value: encuestasFiltradas.filter(e => e.notaMedia < 2.5).length, color: "#ef4444" },
    ].filter(d => d.value > 0);

    const dataTurnos = ["Desayuno", "Comida", "Cena"].map(t => {
        const encuestasTurno = encuestasFiltradas.filter(e => e.turno === t);
        const media = encuestasTurno.length > 0 ? encuestasTurno.reduce((acc, curr) => acc + curr.notaMedia, 0) / encuestasTurno.length : 0;
        return { name: t, nota: parseFloat(media.toFixed(1)) };
    });

    const totalEncuestas = encuestasFiltradas.length;
    const reporteData = TIPOS_REPORTE.find(r => r.id === tipoSeleccionado);

    const handleGenerarPDF = () => {
        generarReportePDF({
            tituloReporte: reporteData?.titulo || "Reporte", 
            nombreHospital: NOMBRE_HOSPITAL,
            nombrePlanta: filtroPlanta, // 👈 Pasamos la planta al PDF
            totalEncuestas, encuestasFiltradas, dataTurnos, chartPieRef, chartBarRef
        });
    };

    const enviarEmail = () => {
        const subject = encodeURIComponent(`Informe de Calidad: ${reporteData?.titulo} - Hospifood`);
        const body = encodeURIComponent(
            `Estimada Directiva,\n\nAdjunto remitimos el ${reporteData?.titulo} correspondiente al ${NOMBRE_HOSPITAL} (${filtroPlanta === 'Todas' ? 'Todas las plantas' : 'Planta: ' + filtroPlanta}).\n\n` +
            `Resumen de Datos:\n• Muestra analizada: ${totalEncuestas} encuestas de pacientes.\n\n` +
            `Por favor, revisen el PDF adjunto para consultar el desglose gráfico.\n\nAtentamente,\nDepartamento de Calidad - Hospifood SES.`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    if (!isAdmin && misHospitales.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm"><AlertCircle size={40} /></div>
                <h2 className="text-3xl font-extrabold mb-4">Cuenta Pendiente de Activación</h2>
            </div>
        );
    }

    if (loading) return <div className="p-10 text-center font-bold text-muted-foreground">Cargando reportes...</div>;

    return (
        <div className="space-y-6 animate-fade-in pb-10 relative">
            <ReportesGraficosOcultos chartPieRef={chartPieRef} chartBarRef={chartBarRef} dataSatisfaccion={dataSatisfaccion} dataTurnos={dataTurnos} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
                <div className="pl-1">
                    <h1 className="text-3xl font-extrabold tracking-tight">Reportes y Análisis</h1>
                    <p className="text-muted-foreground mt-1">Genera informes ejecutivos detallados para la directiva</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {/* 👇 Selector de Planta en Reportes 👇 */}
                    <div className="w-full sm:w-48 space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2 text-primary">
                            <BedDouble size={16} /> Unidad / Planta:
                        </label>
                        <select 
                            value={filtroPlanta}
                            onChange={(e) => setFiltroPlanta(e.target.value)}
                            className="w-full h-11 px-4 rounded-lg border border-input bg-card text-foreground font-medium shadow-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
                        >
                            <option value="Todas">Todas las plantas</option>
                            {PLANTAS_HOSPITALARIAS.map(planta => (
                                <option key={planta} value={planta}>{planta}</option>
                            ))}
                        </select>
                    </div>

                    {(isAdmin || misHospitales.length > 1) && (
                        <div className="w-full sm:w-64 space-y-2">
                            <label className="text-sm font-bold flex items-center gap-2 text-primary">
                                <Building2 size={16} /> Filtrar por Centro:
                            </label>
                            <select 
                                value={filtroHospitalId} onChange={(e) => setFiltroHospitalId(Number(e.target.value))}
                                className="w-full h-11 px-4 rounded-lg border border-input bg-card text-foreground font-medium shadow-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
                            >
                                <option value={0}>{isAdmin ? "TODOS LOS CENTROS" : "MIS CENTROS ASIGNADOS"}</option>
                                {hospitalesDisponibles.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-1">
                <ReportesOpciones tipoSeleccionado={tipoSeleccionado} setTipoSeleccionado={setTipoSeleccionado} />

                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-xl font-bold mb-4">2. Detalles de los datos</h2>
                    <Card className="border-border shadow-sm h-[calc(100%-2.5rem)]">
                        <CardHeader className="bg-muted/30 border-b border-border pb-4">
                            <CardTitle className="text-primary">{reporteData?.titulo}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Building2 className="text-muted-foreground shrink-0" size={18} />
                                    <span className="font-medium truncate" title={NOMBRE_HOSPITAL}>{NOMBRE_HOSPITAL}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <BedDouble className="text-muted-foreground shrink-0" size={18} />
                                    <span className="font-medium text-foreground">{filtroPlanta}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="text-muted-foreground" size={18} />
                                    <span className="font-bold capitalize">{tipoSeleccionado}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <FileText className="text-muted-foreground" size={18} />
                                    <Badge variant={totalEncuestas > 0 ? "default" : "destructive"}>{totalEncuestas} encuestas</Badge>
                                </div>
                            </div>
                            <div className="h-px w-full bg-border" />
                            <div>
                                <p className="text-sm font-bold mb-3 text-foreground">El PDF incluirá:</p>
                                <ul className="space-y-3">
                                    {["Estadísticas de satisfacción", "Gráficos de evolución", "Comentarios de pacientes"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                                            <CheckCircle2 size={16} className="text-green-500 shrink-0" /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3 mt-4">
                    <Card className="bg-primary/5 border-dashed border-2 border-primary/20">
                        <CardContent className="p-8">
                            <div className="max-w-2xl mx-auto text-center space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold">3. Exportar y Compartir</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Genera el documento para guardarlo o envíalo por correo electrónico.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Button onClick={handleGenerarPDF} size="lg" disabled={totalEncuestas === 0 || loading} className="gap-2 bg-primary hover:bg-primary/90 text-white min-w-[200px]">
                                        <Download size={20} /> Generar Reporte PDF
                                    </Button>
                                    <Button variant="outline" size="lg" onClick={enviarEmail} disabled={totalEncuestas === 0 || loading} className="gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors min-w-[200px]">
                                        <Mail size={20} /> Enviar por Email
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};