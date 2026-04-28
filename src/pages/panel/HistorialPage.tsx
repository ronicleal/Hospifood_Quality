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

    const [filtroPlanta, setFiltroPlanta] = useState("Todas"); // 👈 Nuevo estado
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [turnoFiltro, setTurnoFiltro] = useState("Todos");
    const [searchText, setSearchText] = useState("");

    const historialRepo = createHistorialRepository();

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
            const { data } = await historialRepo.getHistorial(idsAConsultar, filtroHospitalId === 0 && isAdmin); 
            if (data) setEncuestas(data);
            setLoading(false);
        }
        loadData();
    }, [misHospitales, isAdmin, filtroHospitalId]);

    // 👇 Inyectamos el filtro de planta en la memoria 👇
    const encuestasFiltradas = encuestas.filter(e => {
        const matchText = e.sugerencia.toLowerCase().includes(searchText.toLowerCase());
        const matchTurno = turnoFiltro === "Todos" || e.turno === turnoFiltro;
        const matchPlanta = filtroPlanta === "Todas" || e.planta === filtroPlanta; 

        let matchFecha = true;
        if (e.fechaOriginal) {
            const fechaEncuesta = new Date(e.fechaOriginal);
            fechaEncuesta.setHours(0, 0, 0, 0);
            if (fechaInicio && fechaEncuesta < new Date(fechaInicio + "T00:00:00")) matchFecha = false;
            if (fechaFin && fechaEncuesta > new Date(fechaFin + "T00:00:00")) matchFecha = false;
        }
        return matchText && matchTurno && matchFecha && matchPlanta;
    });

    const limpiarFiltros = () => { setFechaInicio(""); setFechaFin(""); setTurnoFiltro("Todos"); setSearchText(""); setFiltroPlanta("Todas"); };

    const exportarPDF = () => {
        const doc = new jsPDF();
        const nombreHospital = filtroHospitalId === 0 ? "Global SES" : hospitalesDisponibles.find(h => h.id === filtroHospitalId)?.nombre;
        
        doc.text(`Reporte de Satisfacción - ${nombreHospital}`, 14, 20);
        doc.setFontSize(10);
        if (filtroPlanta !== "Todas") doc.text(`Unidad/Planta: ${filtroPlanta}`, 14, 26); // 👈 Info en el PDF

        // 👈 Añadimos la columna Planta al PDF
        const tableColumn = ["Fecha", "Planta", "Turno", "Nota Media", "Comentarios"];
        const tableRows = encuestasFiltradas.map(e => [
            e.fecha, e.planta || "-", e.turno, `${e.notaMedia} / 5`, e.sugerencia || "Sin comentarios"
        ]);

        autoTable(doc, {
            head: [tableColumn], body: tableRows, startY: filtroPlanta !== "Todas" ? 32 : 30, theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 }, headStyles: { fillColor: [37, 99, 235] } 
        });

        doc.save(`Historial_${nombreHospital?.replace(/ /g, "_")}.pdf`);
    };

    if (!isAdmin && misHospitales.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm"><AlertCircle size={40} /></div>
                <h2 className="text-3xl font-extrabold mb-4">Cuenta Pendiente de Activación</h2>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <HistorialControles 
                isAdmin={isAdmin} misHospitales={misHospitales} hospitalesDisponibles={hospitalesDisponibles}
                filtroHospitalId={filtroHospitalId} setFiltroHospitalId={setFiltroHospitalId}
                filtroPlanta={filtroPlanta} setFiltroPlanta={setFiltroPlanta} // 👈 Pasamos el prop
                fechaInicio={fechaInicio} setFechaInicio={setFechaInicio}
                fechaFin={fechaFin} setFechaFin={setFechaFin}
                turnoFiltro={turnoFiltro} setTurnoFiltro={setTurnoFiltro}
                searchText={searchText} setSearchText={setSearchText}
                onLimpiarFiltros={limpiarFiltros} onExportarPDF={exportarPDF}
                exportDisabled={loading || encuestasFiltradas.length === 0}
            />
            {loading ? <div className="p-10 text-center text-muted-foreground font-medium">Cargando registros...</div> : <HistorialTabla encuestas={encuestasFiltradas} />}
        </div>
    );
};