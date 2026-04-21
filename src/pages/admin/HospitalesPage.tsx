import { useEffect, useState } from "react";
import type { Hospital } from "../../interfaces/Hospital";
import { createHospitalRepository } from "../../database/repositories";
import { Building2, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export const HospitalesPage = () => {
    const [hospitales, setHospitales] = useState<Hospital[]>([]);

    // Estados para todos los campos de la BD
    const [nombre, setNombre] = useState("");
    const [codigoCentro, setCodigoCentro] = useState("");
    const [provincia, setProvincia] = useState("");
    const [areaSalud, setAreaSalud] = useState("");

    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const hospitalRepo = createHospitalRepository();

    const cargarHospitales = async () => {
        setLoading(true);
        const { data, error } = await hospitalRepo.getHospitales();
        if (error) setErrorMsg("Error al cargar los hospitales.");
        if (data) setHospitales(data);
        setLoading(false);
    };

    useEffect(() => {
        cargarHospitales();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !codigoCentro.trim()) return;

        setLoading(true);
        setErrorMsg("");

        const { error } = await hospitalRepo.createHospital(
            nombre.trim(), 
            provincia.trim(), 
            codigoCentro.trim(), 
            areaSalud.trim()
        );

        if (error){
            // Manejo de error si el código de centro está duplicado
            if (error.code === '23505') {
                setErrorMsg(`El código de centro '${codigoCentro}' ya existe en el sistema.`);
            } else {
                setErrorMsg("Error al dar de alta el hospital. Revisa los datos.");
            }
            
        }else{
            setNombre("");
            setCodigoCentro("");
            setProvincia("");
            setAreaSalud("");
            await cargarHospitales();
        }

        setLoading(false);
    };

    const handleToggleActivo = async (id: number, estadoActual: boolean) => {
        await hospitalRepo.toggleActivo(id, !estadoActual);
        await cargarHospitales();
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("CUIDADO: Borrar un hospital fallará si ya tiene encuestas registradas. Es mejor 'Desactivarlo'. ¿Seguro que quieres intentar borrarlo?")) return;

        const { error } = await hospitalRepo.deleteHospital(id);
        if (error) {
            alert("No se puede borrar porque tiene encuestas o gestores asociados. Por favor, desactívalo en su lugar.");
        } else {
            await cargarHospitales();
        }
        
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Red de Hospitales Extremadura</h1>
                <p className="text-muted-foreground mt-1">
                    Gestión global de centros hospitalarios adscritos a la plataforma de calidad.
                </p>
            </div>

            {errorMsg && (
                <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md font-medium text-sm">
                    {errorMsg}
                </div>
            )}

            {/* FORMULARIO COMPLETO */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-card-foreground flex items-center gap-2">
                    <Building2 size={20} className="text-primary" /> Dar de Alta Nuevo Hospital
                </h2>
                
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2 lg:col-span-2">
                            <Label htmlFor="nombre">Nombre del Centro *</Label>
                            <Input 
                                id="nombre" placeholder="Ej: Hospital de Coria" 
                                value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={loading} required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="codigo">Código Centro (Único) *</Label>
                            <Input 
                                id="codigo" placeholder="Ej: 060156" 
                                value={codigoCentro} onChange={(e) => setCodigoCentro(e.target.value)} disabled={loading} required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="provincia">Provincia</Label>
                            <Input 
                                id="provincia" placeholder="Ej: Cáceres" 
                                value={provincia} onChange={(e) => setProvincia(e.target.value)} disabled={loading}
                            />
                        </div>
                        <div className="space-y-2 lg:col-span-4">
                            <Label htmlFor="area">Área de Salud</Label>
                            <Input 
                                id="area" placeholder="Ej: Área de Salud de Coria" 
                                value={areaSalud} onChange={(e) => setAreaSalud(e.target.value)} disabled={loading}
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={loading || !nombre || !codigoCentro} className="gap-2 w-full sm:w-auto">
                            <Plus size={18} /> Registrar Hospital   
                        </Button>
                    </div>
                </form>
            </div>

            {/* TABLA DETALLADA */}
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
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                            hospital.activo 
                                            ? 'bg-primary/10 text-primary border-primary/20' 
                                            : 'bg-muted text-muted-foreground border-border'
                                        }`}>
                                            {hospital.activo ? 'OPERATIVO' : 'CERRADO'}
                                        </span>
                                    </td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <Button 
                                            variant="outline" size="sm"
                                            onClick={() => handleToggleActivo(hospital.id, hospital.activo)}
                                            className={hospital.activo ? 'text-muted-foreground border-border hover:bg-accent' : 'text-primary border-primary/20 hover:bg-primary/10'}
                                        >
                                            {hospital.activo ? <PowerOff size={16} /> : <Power size={16} />}
                                        </Button>
                                        <Button 
                                            variant="outline" size="sm"
                                            onClick={() => handleDelete(hospital.id)}
                                            className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );


};