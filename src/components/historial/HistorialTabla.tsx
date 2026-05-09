import { Badge } from "../ui/badge";
import type { EncuestaHistorial } from "../../database/repositories/HistorialRepository";

interface Props { encuestas: EncuestaHistorial[]; }

export const HistorialTabla = ({ encuestas }: Props) => {
    const getBadgeVariant = (nota: number) => {
        if (nota >= 4.5) return "default"; 
        if (nota >= 3.0) return "secondary"; 
        return "destructive"; 
    };

    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm mt-6">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                        <tr>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Planta</th> {/* 👈 Nueva Columna */}
                            <th className="px-6 py-4">Turno</th>
                            <th className="px-6 py-4">Nota media</th>
                            <th className="px-6 py-4 w-1/3">Sugerencias</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {encuestas.length > 0 ? (
                            encuestas.map((encuesta) => (
                                <tr key={encuesta.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 font-medium">
                                        {encuesta.fecha} <span className="text-xs text-muted-foreground block">{encuesta.hora}</span>
                                    </td>
                                    <td className="px-6 py-4 text-foreground font-medium">{encuesta.planta || '-'}</td> {/* 👈 Dato de Planta */}
                                    <td className="px-6 py-4 font-medium">{encuesta.turno}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={getBadgeVariant(encuesta.notaMedia)}>{encuesta.notaMedia.toFixed(1)}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground italic">{encuesta.sugerencia || "Sin comentarios."}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No se encontraron encuestas con los filtros actuales.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};