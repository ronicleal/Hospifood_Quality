import { useEffect, useState } from "react";
import type { Parametro } from "../../interfaces/Parametro";
import { createParametroRepository } from "../../database/repositories";
import { useAuthStore } from "../../store/authStore";

// Componentes
import { ParametrosForm } from "../../components/parametros/ParametrosForm";
import { ParametrosTabla } from "../../components/parametros/ParametrosTabla";

export const ParametrosPage = () => {
    const { profile, isAdmin } = useAuthStore();
    const misHospitales = profile?.hospitales || [];

    const [parametros, setParametros] = useState<Parametro[]>([]);
    const [nuevoTitulo, setNuevoTitulo] = useState("");
    const [nuevaDescripcion, setNuevaDescripcion] = useState("");
    const [hospitalSeleccionado, setHospitalSeleccionado] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const parametroRepo = createParametroRepository();

    useEffect(() => {
        if (!isAdmin && misHospitales.length > 0 && hospitalSeleccionado === 0) {
            setHospitalSeleccionado(misHospitales[0]);
        }
    }, [misHospitales, isAdmin, hospitalSeleccionado]);

    const cargarParametros = async () => {
        setLoading(true);
        const { data, error } = await parametroRepo.getParametros(misHospitales, isAdmin);
        if (error) setErrorMsg("Error al cargar los parámetros.");
        if (data) setParametros(data);
        setLoading(false);
    };

    useEffect(() => {
        if (isAdmin || misHospitales.length > 0) cargarParametros();
    }, [misHospitales.length, isAdmin]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoTitulo.trim() || !nuevaDescripcion.trim() || hospitalSeleccionado === 0) return;

        setLoading(true);
        const { error } = await parametroRepo.createParametro(nuevoTitulo.trim(), nuevaDescripcion.trim(), hospitalSeleccionado);

        if (error) {
            setErrorMsg("Error al crear el parámetro.");
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
        if (!window.confirm("¿Seguro que quieres eliminar este parámetro?")) return;
        await parametroRepo.deleteParametro(id);
        await cargarParametros();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    {isAdmin ? "Visión Global de Parámetros" : "Parámetros a Evaluar"}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {isAdmin 
                        ? "Auditoría global de las preguntas y categorías evaluadas en la red hospitalaria."
                        : "Gestiona las preguntas y categorías que responderán los pacientes en las encuestas."}
                </p>
            </div>

            {errorMsg && (
                <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
                    {errorMsg}
                </div>
            )}

            {!isAdmin && (
                <ParametrosForm 
                    nuevoTitulo={nuevoTitulo} setNuevoTitulo={setNuevoTitulo}
                    nuevaDescripcion={nuevaDescripcion} setNuevaDescripcion={setNuevaDescripcion}
                    hospitalSeleccionado={hospitalSeleccionado} setHospitalSeleccionado={setHospitalSeleccionado}
                    misHospitales={misHospitales} loading={loading} onSubmit={handleCreate}
                />
            )}

            <ParametrosTabla 
                parametros={parametros} isAdmin={isAdmin} loading={loading}
                onToggleActivo={handleToggleActivo} onDelete={handleDelete}
            />
        </div>
    );
};