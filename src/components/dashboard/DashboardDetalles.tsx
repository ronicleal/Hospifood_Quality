import { Users, Clock, ListChecks } from "lucide-react";
import { Badge } from "../ui/badge";
import type { GestorData } from "../../database/repositories/GestorRepository";
import type { Turno } from "../../interfaces/Turnos";
import type { Parametro } from "../../interfaces/Parametro";

interface Props {
    filtroHospitalId: number;
    detallesGestores: GestorData[];
    detallesTurnos: Turno[];
    detallesParametros: Parametro[];
}

export const DashboardDetalles = ({ filtroHospitalId, detallesGestores, detallesTurnos, detallesParametros }: Props) => {
    if (filtroHospitalId === 0) return null; // Solo se muestra si hay 1 hospital seleccionado

    return (
        <div className="pt-8 border-t border-border animate-fade-in mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Configuración del Centro Seleccionado</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Gestores */}
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

                {/* Turnos */}
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

                {/* Parámetros */}
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
    );
};