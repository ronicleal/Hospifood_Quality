import { Building2, Power, PowerOff, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import type { Parametro } from "../../interfaces/Parametro";

interface Props {
    parametros: Parametro[];
    isAdmin: boolean;
    loading: boolean;
    onToggleActivo: (id: number, estadoActual: boolean) => void;
    onDelete: (id: number) => void;
}

export const ParametrosTabla = ({ parametros, isAdmin, loading, onToggleActivo, onDelete }: Props) => {
    return (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-muted text-muted-foreground text-sm">
                    <tr>
                        {isAdmin && <th className="p-4 font-semibold border-b border-border">Centro Hospitalario</th>}
                        <th className="p-4 font-semibold border-b border-border">Parámetro Evaluado</th>
                        <th className="p-4 font-semibold border-b border-border text-center">Estado</th>
                        {!isAdmin && <th className="p-4 font-semibold border-b border-border text-right">Acciones</th>}
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {parametros.map((param) => (
                        <tr key={param.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                            {isAdmin && (
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={16} className="text-muted-foreground" />
                                        <span className="font-medium text-foreground">{param.hospitales?.nombre || `ID: ${param.hospital_id}`}</span>
                                    </div>
                                </td>
                            )}

                            <td className="p-4">
                                <p className="font-bold text-foreground text-base">{param.titulo}</p>
                                <p className="text-muted-foreground mt-0.5">{param.descripcion}</p>
                            </td>
                            
                            <td className="p-4 text-center">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                    param.activo ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'
                                }`}>
                                    {param.activo ? 'ACTIVO' : 'INACTIVO'}
                                </span>
                            </td>
                            
                            {!isAdmin && (
                                <td className="p-4 flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => onToggleActivo(param.id, param.activo)}
                                        className={param.activo ? 'text-muted-foreground border-border hover:bg-accent' : 'text-primary border-primary/20 hover:bg-primary/10'}>
                                        {param.activo ? <PowerOff size={16} /> : <Power size={16} />}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => onDelete(param.id)} className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive">
                                        <Trash2 size={16} />
                                    </Button>
                                </td>
                            )}
                        </tr>
                    ))}
                    {parametros.length === 0 && !loading && (
                        <tr>
                            <td colSpan={isAdmin ? 3 : 3} className="p-8 text-center text-muted-foreground">
                                No hay parámetros registrados.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};