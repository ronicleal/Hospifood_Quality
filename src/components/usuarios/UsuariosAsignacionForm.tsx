import { Building2, Save, UserCog, X } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import type { Hospital } from "../../interfaces/Hospital";
import type { GestorData } from "../../database/repositories/GestorRepository";

interface Props {
    gestorEditando: GestorData;
    hospitalesDisponibles: Hospital[];
    hospitalesSeleccionados: number[];
    onToggleHospital: (id: number) => void;
    onCancel: () => void;
    onSave: () => void;
    saving: boolean;
}

export const UsuariosAsignacionForm = ({ gestorEditando, hospitalesDisponibles, hospitalesSeleccionados, onToggleHospital, onCancel, onSave, saving }: Props) => {
    return (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-sm animate-fade-in">
            <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-4">
                <div>
                    <h2 className="text-lg font-semibold text-primary flex items-center gap-2"><UserCog size={20} /> Gestionando Accesos</h2>
                    <p className="text-sm text-muted-foreground mt-1">Marcando hospitales para: <strong className="text-foreground">{gestorEditando.nombre_completo}</strong></p>
                </div>
                <Button variant="ghost" size="icon" onClick={onCancel} className="text-muted-foreground hover:bg-primary/10"><X size={20} /></Button>
            </div>
            <div className="space-y-3">
                <Label className="flex items-center gap-2"><Building2 size={16} className="text-primary"/> Hospitales Disponibles</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-3 bg-background rounded-lg border border-border">
                    {hospitalesDisponibles.map(h => (
                        <label key={h.id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-border">
                            <input 
                                type="checkbox" className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-primary"
                                checked={hospitalesSeleccionados.includes(h.id)} onChange={() => onToggleHospital(h.id)}
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">{h.nombre}</span>
                                <span className="text-xs text-muted-foreground">{h.localidad || h.provincia}</span>
                            </div>
                        </label>
                    ))}
                    {hospitalesDisponibles.length === 0 && <p className="text-sm text-muted-foreground p-2">No hay hospitales activos registrados.</p>}
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onCancel} disabled={saving}>Cancelar</Button>
                <Button onClick={onSave} disabled={saving} className="gap-2 bg-primary">
                    <Save size={18} /> {saving ? "Guardando..." : "Guardar Asignación"}
                </Button>
            </div>
        </div>
    );
};