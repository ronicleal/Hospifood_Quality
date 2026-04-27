import { useEffect, useState } from "react";
import type { Hospital } from "../../interfaces/Hospital";
import { createHospitalRepository } from "../../database/repositories";
import { HospitalesForm } from "../../components/hospitales/HospitalesForm";
import { HospitalesTabla } from "../../components/hospitales/HospitalesTabla";

export const HospitalesPage = () => {
    const [hospitales, setHospitales] = useState<Hospital[]>([]);
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

    useEffect(() => { cargarHospitales(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !codigoCentro.trim()) return;

        setLoading(true); setErrorMsg("");
        const { error } = await hospitalRepo.createHospital(nombre.trim(), provincia.trim(), codigoCentro.trim(), areaSalud.trim());

        if (error) {
            setErrorMsg(error.code === '23505' ? `El código de centro '${codigoCentro}' ya existe en el sistema.` : "Error al dar de alta el hospital. Revisa los datos.");
        } else {
            setNombre(""); setCodigoCentro(""); setProvincia(""); setAreaSalud("");
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
        if (error) alert("No se puede borrar porque tiene encuestas o gestores asociados. Por favor, desactívalo en su lugar.");
        else await cargarHospitales();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Red de Hospitales Extremadura</h1>
                <p className="text-muted-foreground mt-1">Gestión global de centros hospitalarios adscritos a la plataforma de calidad.</p>
            </div>

            {errorMsg && <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md font-medium text-sm">{errorMsg}</div>}

            <HospitalesForm 
                nombre={nombre} setNombre={setNombre} codigoCentro={codigoCentro} setCodigoCentro={setCodigoCentro}
                provincia={provincia} setProvincia={setProvincia} areaSalud={areaSalud} setAreaSalud={setAreaSalud}
                loading={loading} onSubmit={handleCreate}
            />

            <HospitalesTabla hospitales={hospitales} onToggleActivo={handleToggleActivo} onDelete={handleDelete} />
        </div>
    );
};