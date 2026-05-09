import { Power, PowerOff, Trash2, Pencil } from "lucide-react"; // 👈 Añadido Pencil
import { Button } from "../ui/button";
import type { Hospital } from "../../interfaces/Hospital";

interface Props {
    hospitales: Hospital[];
    onToggleActivo: (id: number, estadoActual: boolean) => void;
    onDelete: (id: number) => void;
    onEdit: (hospital: Hospital) => void; // 👈 Nueva prop
}

export const HospitalesTabla = ({ hospitales, onToggleActivo, onDelete, onEdit }: Props) => {
    return (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-muted text-muted-foreground text-sm">
                        <tr>
                            <th className="p-4 font-semibold border-b border-border w-16 text-center">ID</th>
                            <th className="p-4 font-semibold border-b border-border">Centro y Código</th>
                            <th className="p-4 font-semibold border-b border-border">Área y Provincia</th>
                            <th className="p-4 font-semibold border-b border-border text-center">Estado</th>
                            <th className="p-4 font-semibold border-b border-border text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm whitespace-nowrap">
                        {hospitales.map((hospital) => (
                            <tr key={hospital.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                                <td className="p-4 text-center text-muted-foreground font-mono">{hospital.id}</td>
                                <td className="p-4">
                                    <p className="font-bold text-foreground text-base">{hospital.nombre}</p>
                                    <p className="text-muted-foreground font-mono text-xs mt-0.5">Cód: {hospital.codigo_centro}</p>
                                </td>
                                <td className="p-4">
                                    <p className="text-foreground">{hospital.area_salud || '-'}</p>
                                    <p className="text-muted-foreground mt-0.5">{hospital.provincia || '-'}</p>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${hospital.activo ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}>
                                        {hospital.activo ? 'OPERATIVO' : 'CERRADO'}
                                    </span>
                                </td>
                                <td className="p-4 flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => onToggleActivo(hospital.id, hospital.activo)} className={hospital.activo ? 'text-muted-foreground border-border hover:bg-accent' : 'text-primary border-primary/20 hover:bg-primary/10'}>
                                        {hospital.activo ? <PowerOff size={16} /> : <Power size={16} />}
                                    </Button>
                                    
                                    {/* 👇 Botón Editar */}
                                    <Button 
                                        variant="outline" size="sm" 
                                        onClick={() => onEdit(hospital)} 
                                        className="text-primary border-primary/20 hover:bg-primary/10"
                                    >
                                        <Pencil size={16} />
                                    </Button>

                                    <Button variant="outline" size="sm" onClick={() => onDelete(hospital.id)} className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive">
                                        <Trash2 size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};