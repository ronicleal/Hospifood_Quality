import { useEffect, useState } from "react";
import type { EncuestaHistorial } from "../../database/repositories/HistorialRepository";
import { createHistorialRepository } from "../../database/repositories";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { AlertCircle, Download, FilterX, Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardContent } from "../../components/ui/card";
import { Label } from "recharts";
import { useAuthStore } from "../../store/authStore";

export const HistorialPage = () => {
    // 1. TODOS LOS HOOKS ARRIBA
    const { profile, isAdmin } = useAuthStore();
    const misHospitales = profile?.hospitales || [];
    
    const [encuestas, setEncuestas] = useState<EncuestaHistorial[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados de los Filtros
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [turnoFiltro, setTurnoFiltro] = useState("Todos");
    const [searchText, setSearchText] = useState("");

    const historialRepo = createHistorialRepository();

    useEffect(() => {
        async function loadData() {
            // Validamos que el gestor tenga hospitales antes de consultar
            if (!isAdmin && misHospitales.length === 0) {
                setLoading(false);
                return;
            }

            // Pasamos los hospitales y el rol a la consulta
            const { data } = await historialRepo.getHistorial(misHospitales, isAdmin); 
            if (data) setEncuestas(data);
            setLoading(false);
        }

        loadData();
    }, [misHospitales, isAdmin]);

    // 2. EL MURO DE SEGURIDAD
    if (!isAdmin && misHospitales.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
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

    // 3. MOTOR DE FILTRADO MÚLTIPLE
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
        setFechaInicio("");
        setFechaFin("");
        setTurnoFiltro("Todos");
        setSearchText("");
    };

    const exportarPDF = () => {
        const doc = new jsPDF();
        doc.text("Reporte de Satisfacción - SES Hospifood", 14, 20);

        const tableColumn = ["Fecha", "Turno", "Nota Media", "Sugerencias / Comentarios"];
        const tableRows = encuestasFiltradas.map(e => [
            e.fecha,
            e.turno,
            `${e.notaMedia} / 5`,
            e.sugerencia
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [37, 99, 235] } 
        });

        doc.save("Reporte_Hospifood_SES.pdf");
    };

    const getBadgeVariant = (nota: number) => {
        if (nota >= 4.5) return "default"; 
        if (nota >= 3.0) return "secondary"; 
        return "destructive"; 
    };

    if (loading) return <div className="p-10 text-center text-muted-foreground font-medium">Cargando registros...</div>;

    // 4. EL RENDERIZADO
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Historial de Encuestas</h1>
                    <p className="text-muted-foreground mt-1">Filtra y analiza los datos recopilados</p>
                </div>
                <Button onClick={exportarPDF} className="gap-2 bg-[#2563EB] hover:bg-blue-700 text-white">
                    <Download size={18} /> Exportar PDF
                </Button>
            </div>

            <Card className="border-border shadow-sm">
                <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="space-y-2">
                        <Label>Fecha Inicio</Label>
                        <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label>Fecha Fin</Label>
                        <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label>Turno</Label>
                        <select
                            value={turnoFiltro}
                            onChange={(e) => setTurnoFiltro(e.target.value)}
                            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="Todos">Todos los turnos</option>
                            <option value="Desayuno">Desayuno</option>
                            <option value="Comida">Comida</option>
                            <option value="Cena">Cena</option>
                        </select>
                    </div>

                    <div className="space-y-2 lg:col-span-1">
                        <Label>Buscar (Sugerencias)</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <Input
                                placeholder="Ej. Frío..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={limpiarFiltros} className="w-full gap-2 text-muted-foreground hover:text-foreground">
                            <FilterX size={16} /> Limpiar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Hora</th>
                                <th className="px-6 py-4">Turno</th>
                                <th className="px-6 py-4">Nota media</th>
                                <th className="px-6 py-4 w-1/3">Sugerencias</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {encuestasFiltradas.length > 0 ? (
                                encuestasFiltradas.map((encuesta) => (
                                    <tr key={encuesta.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium">{encuesta.fecha}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{encuesta.hora}</td>
                                        <td className="px-6 py-4 font-medium">{encuesta.turno}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getBadgeVariant(encuesta.notaMedia)}>
                                                {encuesta.notaMedia.toFixed(1)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground italic">
                                            {encuesta.sugerencia}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No se encontraron encuestas con los filtros actuales.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}