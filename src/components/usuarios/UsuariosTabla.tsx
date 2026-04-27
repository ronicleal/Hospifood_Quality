import { Trash2, UserCog, Users } from "lucide-react";
import { Button } from "../ui/button";
import type { GestorData } from "../../database/repositories/GestorRepository";

interface Props {
    gestores: GestorData[];
    gestorEditando: GestorData | null;
    loading: boolean;
    onEdit: (gestor: GestorData) => void;
    onDelete: (id: string) => void;
}

export const UsuariosTabla = ({ gestores, gestorEditando, loading, onEdit, onDelete }: Props) => {
    return (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
                <Users size={18} className="text-muted-foreground"/>
                <h3 className="font-semibold text-foreground">Directorio de Gestores Registrados</h3>
            </div>
            <table className="w-full text-left border-collapse">
                <thead className="bg-muted text-muted-foreground text-sm">
                    <tr>
                        <th className="p-4 font-semibold border-b border-border">Responsable</th>
                        <th className="p-4 font-semibold border-b border-border">Hospitales Asignados</th>
                        <th className="p-4 font-semibold border-b border-border text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {gestores.map((gestor) => {
                        const isSelected = gestorEditando?.id === gestor.id;
                        const hasHospitals = gestor.hospitales && gestor.hospitales.length > 0;
                        return (
                            <tr key={gestor.id} className={`border-b border-border last:border-0 transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'}`}>
                                <td className="p-4">
                                    <p className="font-bold text-foreground text-base">{gestor.nombre_completo}</p>
                                    <p className="text-muted-foreground font-mono text-xs mt-0.5">ID: {gestor.id.split('-')[0]}...</p>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {hasHospitals ? (
                                            gestor.hospitales!.map((hRel, idx) => (
                                                <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm">
                                                    {hRel.hospitales?.nombre || 'Centro Desconocido'}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20 animate-pulse">Sin asignación</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => onEdit(gestor)} className={`gap-1 ${isSelected ? 'border-primary text-primary bg-primary/10' : 'text-muted-foreground'}`}>
                                        <UserCog size={16} /> <span className="hidden sm:inline">Gestionar Accesos</span>
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => onDelete(gestor.id)} className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive">
                                        <Trash2 size={16} />
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                    {gestores.length === 0 && !loading && (
                        <tr>
                            <td colSpan={3} className="p-8 text-center text-muted-foreground">Aún no hay ningún gestor registrado en la plataforma.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};