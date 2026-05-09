import { Building2, Plus, Save, X } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface Props {
    nombre: string; setNombre: (val: string) => void;
    codigoCentro: string; setCodigoCentro: (val: string) => void;
    provincia: string; setProvincia: (val: string) => void;
    areaSalud: string; setAreaSalud: (val: string) => void;
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
    // 👇 Nuevas props para edición
    isEditing?: boolean;
    onCancelEdit?: () => void;
}

export const HospitalesForm = (props: Props) => {
    return (
        <div className={`border rounded-xl p-6 shadow-sm transition-colors ${props.isEditing ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                    <Building2 size={20} className="text-primary" />
                    {props.isEditing ? 'Modificar Hospital' : 'Dar de Alta Nuevo Hospital'}
                </h2>
                {props.isEditing && (
                    <Button variant="ghost" size="sm" onClick={props.onCancelEdit} className="text-muted-foreground hover:text-destructive">
                        <X size={18} className="mr-1" /> Cancelar
                    </Button>
                )}
            </div>

            <form onSubmit={props.onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2 lg:col-span-2">
                        <Label htmlFor="nombre">Nombre del Centro *</Label>
                        <Input id="nombre" placeholder="Ej: Hospital de Coria" value={props.nombre} onChange={(e) => props.setNombre(e.target.value)} disabled={props.loading} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="codigo">Código Centro (Único) *</Label>
                        <Input id="codigo" placeholder="Ej: 060156" value={props.codigoCentro} onChange={(e) => props.setCodigoCentro(e.target.value)} disabled={props.loading} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="provincia">Provincia</Label>
                        <Input id="provincia" placeholder="Ej: Cáceres" value={props.provincia} onChange={(e) => props.setProvincia(e.target.value)} disabled={props.loading} required />
                    </div>
                    <div className="space-y-2 lg:col-span-4">
                        <Label htmlFor="area">Área de Salud</Label>
                        <Input id="area" placeholder="Ej: Área de Salud de Coria" value={props.areaSalud} onChange={(e) => props.setAreaSalud(e.target.value)} disabled={props.loading} required />
                    </div>
                </div>
                <div className="flex justify-end pt-2">
                    <Button
                        type="submit"
                        disabled={props.loading || !props.nombre || !props.codigoCentro || !props.provincia || !props.areaSalud}
                        className={`gap-2 w-full sm:w-auto ${props.isEditing
                                ? 'bg-primary/90 hover:bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20'
                                : ''
                            }`}
                    >
                        {props.isEditing ? <Save size={18} /> : <Plus size={18} />}
                        {props.isEditing ? 'Guardar Cambios' : 'Registrar Hospital'}
                    </Button>
                </div>
            </form>
        </div>
    );
};