import { useEffect, useState } from "react";
import type { Parametro } from "../../interfaces/Parametro";
import { createParametroRepository } from "../../database/repositories";
import { useAuthStore } from "../../store/authStore";

import { ParametrosForm } from "../../components/parametros/ParametrosForm";
import { ParametrosTabla } from "../../components/parametros/ParametrosTabla";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

export const ParametrosPage = () => {
    const { profile, isAdmin } = useAuthStore();
    const misHospitales = profile?.hospitales || [];

    const [parametros, setParametros] = useState<Parametro[]>([]);
    const [nuevoTitulo, setNuevoTitulo] = useState("");
    const [nuevaDescripcion, setNuevaDescripcion] = useState("");
    const [hospitalSeleccionado, setHospitalSeleccionado] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

    const parametroRepo = createParametroRepository();

    useEffect(() => {
        if (!isAdmin && misHospitales.length > 0 && hospitalSeleccionado === 0) setHospitalSeleccionado(misHospitales[0]);
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
        if (error) setErrorMsg("Error al crear el parámetro.");
        else { setNuevoTitulo(""); setNuevaDescripcion(""); await cargarParametros(); }
        setLoading(false);
    };

    const handleToggleActivo = async (id: number, estadoActual: boolean) => {
        await parametroRepo.toggleActivo(id, !estadoActual);
        await cargarParametros();
    };

    const solicitarBorrado = (id: number) => setDeleteModal({ isOpen: true, id });

    const confirmarBorrado = async () => {
        if (!deleteModal.id) return;
        setLoading(true);
        await parametroRepo.deleteParametro(deleteModal.id);
        await cargarParametros();
        setDeleteModal({ isOpen: false, id: null });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">{isAdmin ? "Visión Global de Parámetros" : "Parámetros a Evaluar"}</h1>
                <p className="text-muted-foreground mt-1">{isAdmin ? "Auditoría global de preguntas." : "Gestiona las preguntas de las encuestas."}</p>
            </div>

            {errorMsg && <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">{errorMsg}</div>}

            {!isAdmin && (
                <ParametrosForm 
                    nuevoTitulo={nuevoTitulo} setNuevoTitulo={setNuevoTitulo} nuevaDescripcion={nuevaDescripcion} setNuevaDescripcion={setNuevaDescripcion}
                    hospitalSeleccionado={hospitalSeleccionado} setHospitalSeleccionado={setHospitalSeleccionado}
                    misHospitales={misHospitales} loading={loading} onSubmit={handleCreate}
                />
            )}

            <ParametrosTabla parametros={parametros} isAdmin={isAdmin} loading={loading} onToggleActivo={handleToggleActivo} onDelete={solicitarBorrado} />

            <ConfirmModal 
                isOpen={deleteModal.isOpen}
                title="¿Eliminar parámetro?"
                message="Esta acción no se puede deshacer y eliminará esta pregunta de las futuras encuestas."
                onCancel={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={confirmarBorrado}
                isDeleting={loading}
            />
        </div>
    );
};