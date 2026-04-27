import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useAuthStore } from "../../store/authStore";
import { createHistorialRepository, createHospitalRepository } from "../../database/repositories";
import type { EncuestaHistorial } from "../../database/repositories/HistorialRepository";
import type { Hospital } from "../../interfaces/Hospital";

import { HistorialControles } from "../../components/historial/HistorialControles";
import { HistorialTabla } from "../../components/historial/HistorialTabla";

export const HistorialPage = () => {
    const { profile, isAdmin } = useAuthStore();
    const misHospitales = profile?.hospitales || [];
    
    const [encuestas, setEncuestas] = useState<EncuestaHistorial[]>([]);
    const [loading, setLoading] = useState(true);

    const [hospitalesDisponibles, setHospitalesDisponibles] = useState<Hospital[]>([]);
    const [filtroHospitalId, setFiltroHospitalId] = useState<number>(0);

    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [turnoFiltro, setTurnoFiltro] = useState("Todos");
    const [searchText, setSearchText] = useState("");

    const historialRepo = createHistorialRepository();

    // Cargar hospitales
    useEffect(() => {
        if (isAdmin || misHospitales.length > 1) {
            const fetchHospitals = async () => {
                const hRepo = createHospitalRepository();
                const { data } = await hRepo.getHospitales();
                if (data) {
                    if (isAdmin) setHospitalesDisponibles(data);
                    else setHospitalesDisponibles(data.filter(h => misHospitales.includes(h.id)));
                }
            };
            fetchHospitals();
        }
    }, [isAdmin, misHospitales]);

    // Cargar historial
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            if (!isAdmin && misHospitales.length === 0) {
                setLoading(false);
                return;
            }

            let idsAConsultar: number[] = [];
            let isGlobal = false;

            if (filtroHospitalId === 0) {
                if (isAdmin) {
                    idsAConsultar = []; 
                    isGlobal = true;
                } else {
                    idsAConsultar = misHospitales; 
                    isGlobal = false;
                }
            } else {
                idsAConsultar = [filtroHospitalId];
                isGlobal = false;
            }

            const { data } = await historialRepo.getHistorial(idsAConsultar, isGlobal); 
            if (data) setEncuestas(data);
            setLoading(false);
        }
        loadData();
    }, [misHospitales, isAdmin, filtroHospitalId]);

    // Lógica de filtrado en memoria
    const encuestasFiltradas = encuestas.filter(e => {
        const matchText = e.sugerencia.toLowerCase().includes(searchText.toLowerCase());
        const matchTurno = turnoFiltro === "Todos" || e.turno === turnoFiltro;

        let matchFecha = true;
        if (e.fechaOriginal) {
            const fechaEncuesta = new Date(e.fechaOriginal);
            fechaEncuesta.setHours(0, 0, 0, 0);

            if (fechaInicio) {
                const fInicio = new Date(fechaInicio);
                fInicio.setHours(0, 0, 0, 0);
                if (fechaEncuesta < fInicio) matchFecha = false;
            }
            if (fechaFin) {
                const fFin = new Date(fechaFin);
                fFin.setHours(0, 0, 0, 0);
                if (fechaEncuesta > fFin) matchFecha = false;
            }
        }
        return matchText && matchTurno && matchFecha;
    });

    const limpiarFiltros = () => {
        setFechaInicio(""); setFechaFin(""); setTurnoFiltro("Todos"); setSearchText("");
    };

    // Lógica del PDF
    const exportarPDF = () => {
        const doc = new jsPDF();
        const nombreHospital = filtroHospitalId === 0 ? "Global SES" : hospitalesDisponibles.find(h => h.id === filtroHospitalId)?.nombre;
        
        doc.text(`Reporte de Satisfacción - ${nombreHospital}`, 14, 20);

        const tableColumn = ["Fecha", "Turno", "Nota Media", "Sugerencias / Comentarios"];
        const tableRows = encuestasFiltradas.map(e => [
            e.fecha, e.turno, `${e.notaMedia} / 5`, e.sugerencia || "Sin comentarios"
        ]);

        autoTable(doc, {
            head: [tableColumn], body: tableRows, startY: 30, theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 }, headStyles: { fillColor: [37, 99, 235] } 
        });

        doc.save(`Historial_Hospifood_${nombreHospital?.replace(/ /g, "_")}.pdf`);
    };

    // Vista de Error / Pendiente
    if (!isAdmin && misHospitales.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm"><AlertCircle size={40} /></div>
                <h2 className="text-3xl font-extrabold mb-4">Cuenta Pendiente de Activación</h2>
                <p className="text-lg text-muted-foreground max-w-md">Tu cuenta ha sido creada, pero <b>aún no tienes ningún hospital asignado</b>.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Controles: Cabecera, Selectores, Exportar y Filtros */}
            <HistorialControles 
                isAdmin={isAdmin}
                misHospitales={misHospitales}
                hospitalesDisponibles={hospitalesDisponibles}
                filtroHospitalId={filtroHospitalId}
                setFiltroHospitalId={setFiltroHospitalId}
                fechaInicio={fechaInicio} setFechaInicio={setFechaInicio}
                fechaFin={fechaFin} setFechaFin={setFechaFin}
                turnoFiltro={turnoFiltro} setTurnoFiltro={setTurnoFiltro}
                searchText={searchText} setSearchText={setSearchText}
                onLimpiarFiltros={limpiarFiltros}
                onExportarPDF={exportarPDF}
                exportDisabled={loading || encuestasFiltradas.length === 0}
            />

            {/* Tabla de Datos */}
            {loading ? (
                <div className="p-10 text-center text-muted-foreground font-medium">Cargando registros...</div>
            ) : (
                <HistorialTabla encuestas={encuestasFiltradas} />
            )}
        </div>
    );
};