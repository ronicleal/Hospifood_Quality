import { useEffect, useState } from "react";
import type { Hospital } from "../../interfaces/Hospital";
import { createHospitalRepository } from "../../database/repositories";
import { HospitalesForm } from "../../components/hospitales/HospitalesForm";
import { HospitalesTabla } from "../../components/hospitales/HospitalesTabla";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

export const HospitalesPage = () => {
    const [hospitales, setHospitales] = useState<Hospital[]>([]);
    const [nombre, setNombre] = useState("");
    const [codigoCentro, setCodigoCentro] = useState("");
    const [provincia, setProvincia] = useState("");
    const [areaSalud, setAreaSalud] = useState("");
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    // 👇 Estado para edición
    const [hospitalEnEdicion, setHospitalEnEdicion] = useState<Hospital | null>(null);

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

    const hospitalRepo = createHospitalRepository();

    const cargarHospitales = async () => {
        setLoading(true);
        const { data, error } = await hospitalRepo.getHospitales();
        if (error) setErrorMsg("Error al cargar los hospitales.");
        if (data) setHospitales(data);
        setLoading(false);
    };

    useEffect(() => { cargarHospitales(); }, []);

    // 👇 Funciones para manejar el ciclo de edición
    const iniciarEdicion = (hospital: Hospital) => {
        setHospitalEnEdicion(hospital);
        setNombre(hospital.nombre);
        setCodigoCentro(hospital.codigo_centro);
        setProvincia(hospital.provincia || "");
        setAreaSalud(hospital.area_salud || "");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelarEdicion = () => {
        setHospitalEnEdicion(null);
        setNombre("");
        setCodigoCentro("");
        setProvincia("");
        setAreaSalud("");
    };

    // 👇 Manejador unificado (Submit)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !codigoCentro.trim()) return;
        
        setLoading(true); 
        setErrorMsg("");

        try {
            if (hospitalEnEdicion) {
                // UPDATE
                const { error } = await hospitalRepo.updateHospital(
                    hospitalEnEdicion.id, 
                    nombre.trim(), 
                    provincia.trim(), 
                    codigoCentro.trim(), 
                    areaSalud.trim()
                );
                if (error) throw error;
                cancelarEdicion();
            } else {
                // CREATE
                const { error } = await hospitalRepo.createHospital(
                    nombre.trim(), 
                    provincia.trim(), 
                    codigoCentro.trim(), 
                    areaSalud.trim()
                );
                if (error) {
                    if (error.code === '23505') {
                        throw new Error(`El código de centro '${codigoCentro}' ya existe.`);
                    }
                    throw error;
                }
                setNombre(""); setCodigoCentro(""); setProvincia(""); setAreaSalud("");
            }
            await cargarHospitales();
        } catch (err: any) {
            setErrorMsg(err.message || "Error al procesar la operación.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActivo = async (id: number, estadoActual: boolean) => {
        await hospitalRepo.toggleActivo(id, !estadoActual);
        await cargarHospitales();
    };

    const solicitarBorrado = (id: number) => setDeleteModal({ isOpen: true, id });

    const confirmarBorrado = async () => {
        if (!deleteModal.id) return;
        setLoading(true);
        const { error } = await hospitalRepo.deleteHospital(deleteModal.id);
        if (error) setErrorMsg("No se puede borrar porque tiene datos asociados (encuestas o gestores). Desactívalo en su lugar.");
        else await cargarHospitales();
        setDeleteModal({ isOpen: false, id: null });
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Red de Hospitales Extremadura</h1>
                <p className="text-muted-foreground mt-1">Gestión global de centros hospitalarios adscritos a la plataforma de calidad.</p>
            </div>

            {errorMsg && <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md font-medium text-sm">{errorMsg}</div>}

            <HospitalesForm 
                nombre={nombre} setNombre={setNombre} 
                codigoCentro={codigoCentro} setCodigoCentro={setCodigoCentro}
                provincia={provincia} setProvincia={setProvincia} 
                areaSalud={areaSalud} setAreaSalud={setAreaSalud}
                loading={loading} 
                onSubmit={handleSubmit}
                isEditing={!!hospitalEnEdicion}
                onCancelEdit={cancelarEdicion}
            />

            <HospitalesTabla 
                hospitales={hospitales} 
                onToggleActivo={handleToggleActivo} 
                onDelete={solicitarBorrado}
                onEdit={iniciarEdicion} 
            />

            <ConfirmModal 
                isOpen={deleteModal.isOpen}
                title="CUIDADO: ¿Borrar Hospital?"
                message="Si el hospital ya tiene encuestas registradas, el borrado fallará. Para esos casos se recomienda 'Desactivarlo'. ¿Intentar borrar de todas formas?"
                confirmText="Intentar Borrar"
                onCancel={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={confirmarBorrado}
                isDeleting={loading}
            />
        </div>
    );
};