import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { EncuestaHistorial } from "../database/repositories/HistorialRepository";

export const chartToImage = async (ref: React.RefObject<HTMLDivElement | null>): Promise<string> => {
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
            canvas.width = 600; 
            canvas.height = 300; 
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/png"));
            } else {
                reject("Error de Canvas");
            }
        };
        img.onerror = () => reject("Error loading SVG");
        img.src = image64;
    });
};

interface GenerarPDFProps {
    tituloReporte: string;
    nombreHospital: string;
    nombrePlanta: string; // 👈 Añadido
    totalEncuestas: number;
    encuestasFiltradas: EncuestaHistorial[];
    dataTurnos: { name: string; nota: number }[];
    chartPieRef: React.RefObject<HTMLDivElement | null>;
    chartBarRef: React.RefObject<HTMLDivElement | null>;
}

export const generarReportePDF = async ({
    tituloReporte, nombreHospital, nombrePlanta, totalEncuestas, encuestasFiltradas, dataTurnos, chartPieRef, chartBarRef
}: GenerarPDFProps) => {
    
    if (totalEncuestas === 0) {
        alert("No hay encuestas en este período para generar el reporte.");
        return;
    }

    const doc = new jsPDF();

    doc.setFillColor(37, 99, 235); 
    doc.rect(0, 0, 210, 45, 'F');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(`SES - HOSPIFOOD QUALITY`, 20, 20);
    doc.setFontSize(14);
    doc.text(`INFORME DE CALIDAD Y SATISFACCIÓN DEL PACIENTE`, 20, 30);
    doc.setFontSize(11);
    doc.text(`Servicio de Alimentación del Hospital`, 20, 38);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.text(`Detalles del Documento:`, 20, 60);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Centro Hospitalario: ${nombreHospital}`, 25, 68);
    doc.text(`Unidad / Planta: ${nombrePlanta}`, 25, 74); // 👈 Añadido al PDF
    doc.text(`Tipo de Informe: ${tituloReporte.toUpperCase()}`, 25, 80);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-ES')}`, 25, 86);
    doc.text(`Volumen de Muestra: ${totalEncuestas} encuestas procesadas`, 25, 92);

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 98, 190, 98); 

    const mediaGlobal = (encuestasFiltradas.reduce((acc, curr) => acc + curr.notaMedia, 0) / totalEncuestas).toFixed(1);
    const turnosValidos = dataTurnos.filter(t => t.nota > 0);

    const mejorTurno = turnosValidos.length > 0 ? turnosValidos.reduce((p, c) => (p.nota > c.nota) ? p : c) : { name: 'N/A', nota: 0 };
    const peorTurno = turnosValidos.length > 0 ? turnosValidos.reduce((p, c) => (p.nota < c.nota) ? p : c) : { name: 'N/A', nota: 0 };

    const textoAnalisis = `Durante el periodo evaluado, el índice de satisfacción general de los pacientes respecto al servicio de comidas se sitúa en un ${mediaGlobal} sobre 5.0. \n\nAnalizando el desglose por turnos, se observa que el servicio de ${mejorTurno.name} presenta el mayor índice de aceptación (${mejorTurno.nota}/5.0). Por el contrario, los resultados indican que el turno de ${peorTurno.name} (${peorTurno.nota}/5.0) requiere una supervisión prioritaria para identificar posibles deficiencias en temperatura, presentación o calidad del emplatado.`;

    doc.setFontSize(13);
    doc.setTextColor(37, 99, 235);
    doc.text("1. Resumen Ejecutivo", 20, 110);

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const lineasTexto = doc.splitTextToSize(textoAnalisis, 170);
    doc.text(lineasTexto, 20, 118);

    doc.setFontSize(13);
    doc.setTextColor(37, 99, 235);
    doc.text("2. Representación Visual de Datos", 20, 155);

    try {
        const imgPie = await chartToImage(chartPieRef);
        const imgBar = await chartToImage(chartBarRef);
        doc.addImage(imgPie, 'PNG', 15, 165, 85, 42);
        doc.addImage(imgBar, 'PNG', 105, 165, 85, 42);
        
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text("Fig 1. Distribución porcentual de las valoraciones.", 20, 215);
        doc.text("Fig 2. Media de puntuación segmentada por servicio.", 110, 215);
    } catch (error) {
        console.error("Error al capturar los gráficos:", error);
    }

    doc.addPage();
    doc.setFontSize(13);
    doc.setTextColor(37, 99, 235);
    doc.text("3. Registro Detallado de Feedback", 20, 20);

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("A continuación se detallan las respuestas individuales y comentarios proporcionados por los pacientes:", 20, 26);

    // 👈 Añadimos la columna Planta a la tabla del reporte PDF
    autoTable(doc, {
        startY: 32,
        head: [['Fecha', 'Planta', 'Turno', 'Nota Media', 'Comentarios del Paciente']],
        body: encuestasFiltradas.map(e => [e.fecha, e.planta || '-', e.turno, `${e.notaMedia} / 5`, e.sugerencia || "Sin comentarios."]),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { top: 30 }
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Documento generado por Hospifood Quality - Página ${i} de ${pageCount}`, 20, 290);
    }

    doc.save(`Hospifood_${tituloReporte.replace(" ", "_")}.pdf`);
};