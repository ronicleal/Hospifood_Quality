// src/pages/admin/ReportesPage.tsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Building2, Calendar, CalendarDays, CalendarRange, CheckCircle2, Clock, Download, FileText, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import type { EncuestaHistorial } from "../../database/repositories/HistorialRepository";
import { createHistorialRepository } from "../../database/repositories";
import { Badge } from "../../components/ui/badge";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from "recharts";

export const ReportesPage = () => {
    const [tipoSeleccionado, setTipoSeleccionado] = useState<"diario" | "semanal" | "mensual">("semanal");
    const [encuestas, setEncuestas] = useState<EncuestaHistorial[]>([]);
    const [loading, setLoading] = useState(true);

    const chartPieRef = useRef<HTMLDivElement>(null);
    const chartBarRef = useRef<HTMLDivElement>(null);

    const NOMBRE_HOSPITAL = "Hospital Universitario (SES)";
    const historialRepo = createHistorialRepository();

    useEffect(() => {
        async function load() {
            const { data } = await historialRepo.getHistorial(1);
            if (data) setEncuestas(data);
            setLoading(false);
        }
        load();
    }, []);

    const encuestasFiltradas = encuestas.filter(e => {
        if (!e.fechaOriginal) return false;
        const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
        const fechaEnc = new Date(e.fechaOriginal); fechaEnc.setHours(0, 0, 0, 0);

        if (tipoSeleccionado === "diario") return fechaEnc.getTime() === hoy.getTime();
        if (tipoSeleccionado === "semanal") {
            const hace7 = new Date(hoy); hace7.setDate(hoy.getDate() - 7);
            return fechaEnc >= hace7 && fechaEnc <= hoy;
        }
        if (tipoSeleccionado === "mensual") {
            return fechaEnc.getMonth() === hoy.getMonth() && fechaEnc.getFullYear() === hoy.getFullYear();
        }
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
        const media = encuestasTurno.length > 0
            ? encuestasTurno.reduce((acc, curr) => acc + curr.notaMedia, 0) / encuestasTurno.length : 0;
        return { name: t, nota: parseFloat(media.toFixed(1)) };
    });

    const getEncuestasDelPeriodo = () => encuestasFiltradas.length;

    const tiposReporte = [
        { id: "diario", titulo: "Reporte Diario", desc: "Resumen de las encuestas del día actual.", icono: Calendar },
        { id: "semanal", titulo: "Reporte Semanal", desc: "Análisis de tendencias de los últimos 7 días.", icono: CalendarDays },
        { id: "mensual", titulo: "Reporte Mensual", desc: "Informe completo y evolutivo del mes.", icono: CalendarRange },
    ] as const;

    const contenidoIncluido = [
        "Estadísticas generales de satisfacción",
        "Gráficos de evolución temporal",
        "Análisis por tipo de comida",
        "Comentarios destacados de pacientes",
        "Recomendaciones de mejora"
    ];

    // Función nativa para convertir SVG a PNG sin librerías externas ---
    const chartToImage = async (ref: React.RefObject<HTMLDivElement | null>): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!ref.current) return reject("No ref");
            const svg = ref.current.querySelector("svg");
            if (!svg) return reject("No SVG");

            const clone = svg.cloneNode(true) as SVGSVGElement;
            clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

            const xml = new XMLSerializer().serializeToString(clone);
            const svg64 = btoa(unescape(encodeURIComponent(xml)));
            const image64 = "data:image/svg+xml;base64," + svg64;

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = 400; // Ancho fijo del gráfico
                canvas.height = 200; // Alto fijo del gráfico
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL("image/png"));
                } else {
                    reject("Error de Canvas");
                }
            };
            img.onerror = () => reject("Error loading SVG");
            img.src = image64;
        });
    };

    const generarPDF = async () => {
        const total = getEncuestasDelPeriodo();
        if (total === 0) {
            alert("No hay encuestas en este período para generar el reporte.");
            return;
        }

        const doc = new jsPDF();
        const reporteData = tiposReporte.find(r => r.id === tipoSeleccionado);

        // --- 1. CABECERA ---
        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235);
        doc.text(`SES - HOSPIFOOD QUALITY`, 20, 30);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`${reporteData?.titulo.toUpperCase()}`, 20, 40);

        doc.setFontSize(12);
        doc.text(`Hospital: ${NOMBRE_HOSPITAL}`, 20, 50);
        doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 20, 57);
        doc.text(`Total de encuestas analizadas: ${total}`, 20, 64);

        // --- 2. CÁLCULOS PARA EL ANÁLISIS TEXTUAL DINÁMICO ---
        const mediaGlobal = (encuestasFiltradas.reduce((acc, curr) => acc + curr.notaMedia, 0) / total).toFixed(1);
        const turnosValidos = dataTurnos.filter(t => t.nota > 0);

        const mejorTurno = turnosValidos.length > 0
            ? turnosValidos.reduce((prev, current) => (prev.nota > current.nota) ? prev : current)
            : { name: '-', nota: 0 };

        const peorTurno = turnosValidos.length > 0
            ? turnosValidos.reduce((prev, current) => (prev.nota < current.nota) ? prev : current)
            : { name: '-', nota: 0 };

        const textoAnalisis = `Durante el periodo seleccionado (${tipoSeleccionado}), se han recogido un total de ${total} encuestas. La satisfacción general media de los pacientes se sitúa en un ${mediaGlobal} sobre 5. Analizando los datos por servicio de comidas, destaca positivamente el turno de ${mejorTurno.name} con la puntuación más alta (${mejorTurno.nota}/5), mientras que el turno de ${peorTurno.name} (${peorTurno.nota}/5) presenta la mayor área de mejora prioritaria.`;

        doc.setFontSize(14);
        doc.setTextColor(37, 99, 235);
        doc.text("Conclusión Analítica Ejecutiva:", 20, 80);
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        // splitTextToSize rompe el párrafo para que no se salga de los márgenes del folio
        const lineasTexto = doc.splitTextToSize(textoAnalisis, 170);
        doc.text(lineasTexto, 20, 88);

        // --- 3. GRÁFICOS VISUALES ---
        doc.setFontSize(14);
        doc.setTextColor(37, 99, 235);
        doc.text("Análisis Gráfico:", 20, 115);

        try {
            const imgPie = await chartToImage(chartPieRef);
            const imgBar = await chartToImage(chartBarRef);
            doc.addImage(imgPie, 'PNG', 15, 120, 85, 45);
            doc.addImage(imgBar, 'PNG', 105, 120, 85, 45);
        } catch (error) {
            console.error("Error al capturar los gráficos:", error);
        }

        // --- 4. TABLA DE DATOS (En página nueva) ---
        doc.addPage();
        doc.text("Desglose detallado de valoraciones:", 20, 20);
        autoTable(doc, {
            startY: 25,
            head: [['Fecha', 'Turno', 'Nota Media', 'Comentarios']],
            body: encuestasFiltradas.map(e => [e.fecha, e.turno, `${e.notaMedia} / 5`, e.sugerencia]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [37, 99, 235] }
        });

        doc.save(`Hospifood_${reporteData?.titulo.replace(" ", "_")}.pdf`);

    };

    const enviarEmail = () => {
        const reporteData = tiposReporte.find(r => r.id === tipoSeleccionado);
        const total = getEncuestasDelPeriodo();

        const subject = encodeURIComponent(`Resultados: ${reporteData?.titulo} - Hospifood Quality`);
        const body = encodeURIComponent(
            `Hola,\n\nAdjunto los resultados del ${reporteData?.titulo} correspondientes al ${NOMBRE_HOSPITAL}.\n\n` +
            `Resumen rápido:\n` +
            `- Total de encuestas recogidas: ${total}\n\n` +
            `Por favor, revise el PDF adjunto para ver las estadísticas detalladas, análisis por dietas y los comentarios de los pacientes.\n\n` +
            `Un saludo,\nEquipo de Calidad SES.`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const totalEncuestas = getEncuestasDelPeriodo();

    if (loading) return <div className="p-10 text-center font-bold text-muted-foreground">Cargando reportes...</div>;

    return (
        <div className="space-y-6 animate-fade-in pb-10 relative">

            {/* 🛑 ZONA INVISIBLE: Los gráficos se renderizan aquí fuera de la pantalla */}
            <div style={{ position: "absolute", top: "-9999px", left: "-9999px", color: "#000000", fill: "#000000" }}>
                <div ref={chartPieRef} style={{ width: "400px", height: "250px", backgroundColor: "#ffffff", padding: "10px" }}>
                    <h4 style={{ textAlign: "center", fontFamily: "sans-serif", color: "#333", fontWeight: "bold", marginBottom: "10px" }}>Satisfacción General</h4>
                    <PieChart width={400} height={200}>
                        <Pie data={dataSatisfaccion} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={80}>
                            {dataSatisfaccion.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                    </PieChart>
                </div>
                <div ref={chartBarRef} style={{ width: "400px", height: "250px", backgroundColor: "#ffffff", padding: "10px" }}>
                    <h4 style={{ textAlign: "center", fontFamily: "sans-serif", color: "#333", fontWeight: "bold", marginBottom: "10px" }}>Nota Media por Turnos</h4>
                    <BarChart width={400} height={200} data={dataTurnos}>
                        {/* Aquí recuperamos la cuadrícula (rayas) con un color gris suave explícito en HEX */}
                        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} domain={[0, 5]} />
                        <Bar dataKey="nota" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </div>
            </div>

            {/* --- DISEÑO VISUAL --- */}
            <div className="pl-1">
                <h1 className="text-3xl font-extrabold tracking-tight">Reportes y Análisis</h1>
                <p className="text-muted-foreground mt-1">Genera informes ejecutivos detallados para la directiva</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-1">

                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold mb-4">1. Selecciona el tipo de reporte</h2>

                    {tiposReporte.map((reporte) => {
                        const isSelected = tipoSeleccionado === reporte.id;
                        return (
                            <Card
                                key={reporte.id}
                                onClick={() => setTipoSeleccionado(reporte.id)}
                                className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary bg-primary/5" : "border-border hover:border-primary/50"
                                    }`}
                            >
                                <CardContent className="p-6 flex items-center gap-6">
                                    <div className={`p-4 rounded-full ${isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                                        <reporte.icono size={28} />
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                                            {reporte.titulo}
                                        </h3>
                                        <p className="text-muted-foreground mt-1">{reporte.desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-xl font-bold mb-4">2. Detalles de los datos</h2>

                    <Card className="border-border shadow-sm h-[calc(100%-2.5rem)]">
                        <CardHeader className="bg-muted/30 border-b border-border pb-4">
                            <CardTitle className="text-primary">{tiposReporte.find(r => r.id === tipoSeleccionado)?.titulo}</CardTitle>
                        </CardHeader>

                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Building2 className="text-muted-foreground" size={18} />
                                    <span className="font-medium">{NOMBRE_HOSPITAL}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="text-muted-foreground" size={18} />
                                    <span className="font-medium text-muted-foreground">Período:</span>
                                    <span className="font-bold capitalize">{tipoSeleccionado}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <FileText className="text-muted-foreground" size={18} />
                                    <span className="font-medium text-muted-foreground">Volumen de datos:</span>
                                    <Badge variant={totalEncuestas > 0 ? "default" : "destructive"}>
                                        {totalEncuestas} encuestas
                                    </Badge>
                                </div>
                            </div>

                            <div className="h-px w-full bg-border" />

                            <div>
                                <p className="text-sm font-bold mb-3 text-foreground">El PDF incluirá:</p>
                                <ul className="space-y-3">
                                    {contenidoIncluido.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-xs font-medium text-muted-foreground">
                                            <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                                            {item}
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
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Genera el documento para guardarlo o envíalo directamente por correo electrónico.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Button
                                        onClick={generarPDF}
                                        size="lg"
                                        disabled={totalEncuestas === 0}
                                        className="gap-2 bg-primary hover:bg-primary/90 text-white min-w-[200px]"
                                    >
                                        <Download size={20} /> Generar Reporte PDF
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={enviarEmail}
                                        disabled={totalEncuestas === 0}
                                        className="gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors min-w-[200px]"
                                    >
                                        <Mail size={20} /> Enviar por Email
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}