import { Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export const TIPOS_REPORTE = [
    { id: "diario", titulo: "Reporte Diario", desc: "Resumen de las encuestas del día actual.", icono: Calendar },
    { id: "semanal", titulo: "Reporte Semanal", desc: "Análisis de tendencias de los últimos 7 días.", icono: CalendarDays },
    { id: "mensual", titulo: "Reporte Mensual", desc: "Informe completo y evolutivo del mes.", icono: CalendarRange },
] as const;

interface Props {
    tipoSeleccionado: string;
    setTipoSeleccionado: (val: "diario" | "semanal" | "mensual") => void;
}

export const ReportesOpciones = ({ tipoSeleccionado, setTipoSeleccionado }: Props) => {
    return (
        <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold mb-4">1. Selecciona el tipo de reporte</h2>
            {TIPOS_REPORTE.map((reporte) => {
                const isSelected = tipoSeleccionado === reporte.id;
                return (
                    <Card
                        key={reporte.id}
                        onClick={() => setTipoSeleccionado(reporte.id as any)}
                        className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
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
    );
};