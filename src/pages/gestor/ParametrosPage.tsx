import { useEffect, useState } from "react";
import type { Parametro } from "../../interfaces/Parametro";
import { createParametroRepository } from "../../database/repositories";
import { useAuthStore } from "../../store/authStore";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Plus, Power, PowerOff, Trash2, Building2 } from "lucide-react";

export const ParametrosPage = () => {
    const { profile } = useAuthStore();
    const misHospitales = profile?.hospitales || [];

    const [parametros, setParametros] = useState<Parametro[]>([]);
    const [nuevoTitulo, setNuevoTitulo] = useState("");
    const [nuevaDescripcion, setNuevaDescripcion] = useState("");
    const [hospitalSeleccionado, setHospitalSeleccionado] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const parametroRepo = createParametroRepository();

    useEffect(() => {
        if (misHospitales.length > 0 && hospitalSeleccionado === 0) {
            setHospitalSeleccionado(misHospitales[0]);
        }
    }, [misHospitales]);

    const cargarParametros = async () => {
        setLoading(true);
        const { data, error } = await parametroRepo.getParametros(misHospitales);
        if (error) setErrorMsg("Error al cargar los parámetros.");
        if (data) setParametros(data);
        setLoading(false);
    };

    useEffect(() => {
        if (misHospitales.length > 0) cargarParametros();
    }, [misHospitales.length]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoTitulo.trim() || !nuevaDescripcion.trim() || hospitalSeleccionado === 0) return;

        setLoading(true);
        const { error } = await parametroRepo.createParametro(nuevoTitulo.trim(), nuevaDescripcion.trim(), hospitalSeleccionado);

        if (error) {
            setErrorMsg("Error al crear el parámetro. Revisa la conexión.");
        } else {
            setNuevoTitulo("");
            setNuevaDescripcion("");
            await cargarParametros();
        }
        setLoading(false);
    };

    const handleToggleActivo = async (id: number, estadoActual: boolean) => {
        await parametroRepo.toggleActivo(id, !estadoActual);
        await cargarParametros();
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Seguro que quieres eliminar este parámetro? Desaparecerá de las encuestas.")) return;
        await parametroRepo.deleteParametro(id);
        await cargarParametros();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Parámetros a Evaluar</h1>
                <p className="text-muted-foreground mt-1">
                    Gestiona las preguntas y categorías que responderán los pacientes en las encuestas.
                </p>
            </div>

            {errorMsg && (
                <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
                    {errorMsg}
                </div>
            )}

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-card-foreground">Añadir Nuevo Parámetro</h2>
                <form onSubmit={handleCreate} className="flex flex-col gap-4">
                    
                    {misHospitales.length > 1 && (
                        <div className="w-full sm:w-1/3 space-y-2">
                            <Label htmlFor="hospitalParam" className="flex items-center gap-2 text-foreground"><Building2 size={16}/> Hospital Destino</Label>
                            <select 
                                id="hospitalParam"
                                value={hospitalSeleccionado}
                                onChange={(e) => setHospitalSeleccionado(parseInt(e.target.value))}
                                className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring outline-none"
                            >
                                {misHospitales.map(hId => (
                                    <option key={hId} value={hId}>Hospital ID: {hId}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="titulo">Título Corto</Label>
                            <Input 
                                id="titulo" 
                                placeholder="Ej: Temperatura" 
                                value={nuevoTitulo}
                                onChange={(e) => setNuevoTitulo(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="flex-[2] space-y-2">
                            <Label htmlFor="descripcion">Pregunta Completa (Descripción)</Label>
                            <Input 
                                id="descripcion" 
                                placeholder="Ej: ¿La comida llegó a la temperatura adecuada?" 
                                value={nuevaDescripcion}
                                onChange={(e) => setNuevaDescripcion(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-2">
                        <Button 
                            type="submit" 
                            disabled={loading || !nuevoTitulo || !nuevaDescripcion || hospitalSeleccionado === 0} 
                            className="gap-2 w-full sm:w-auto"
                        >
                            <Plus size={18} /> Añadir Parámetro
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-muted text-muted-foreground text-sm">
                        <tr>
                            <th className="p-4 font-semibold border-b border-border">Parámetro Evaluado</th>
                            <th className="p-4 font-semibold border-b border-border text-center">Estado</th>
                            <th className="p-4 font-semibold border-b border-border text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {parametros.map((param) => (
                            <tr key={param.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                                <td className="p-4">
                                    <p className="font-bold text-foreground text-base">{param.titulo}</p>
                                    <p className="text-muted-foreground mt-0.5">{param.descripcion}</p>
                                </td>
                                
                                <td className="p-4 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                        param.activo 
                                        ? 'bg-primary/10 text-primary border-primary/20' 
                                        : 'bg-muted text-muted-foreground border-border'
                                    }`}>
                                        {param.activo ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                </td>
                                
                                <td className="p-4 flex justify-end gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleToggleActivo(param.id, param.activo)}
                                        className={
                                            param.activo 
                                            ? 'text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground' 
                                            : 'text-primary border-primary/20 hover:bg-primary/10'
                                        }
                                    >
                                        {param.activo ? <PowerOff size={16} /> : <Power size={16} />}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleDelete(param.id)}
                                        className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {parametros.length === 0 && !loading && (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                    No hay parámetros registrados. La encuesta estará vacía.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};