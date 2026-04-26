import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserRepository } from "../../database/repositories";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { isPasswordValid } from "../../utils/regex";
import { CheckCircle } from "lucide-react";
import { PasswordSegura } from "../../components/ui/PasswordSegura";

export const ActualizarPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [exito, setExito] = useState(false);
    const navigate = useNavigate();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        const userRepo = createUserRepository();
        const { error } = await userRepo.updatePassword(password);
        
        if (error) {
            alert("Error al actualizar la contraseña: " + error.message);
            setLoading(false);
        } else {
            setExito(true);
            setTimeout(() => navigate("/login"), 3000);
        }
    };

    if (exito) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-card p-8 rounded-xl text-center max-w-md w-full animate-fade-in shadow-2xl">
                    <CheckCircle className="mx-auto text-green-500 mb-4" size={56} />
                    <h2 className="text-2xl font-extrabold mb-2">¡Contraseña Actualizada!</h2>
                    <p className="text-muted-foreground text-sm">Serás redirigido al panel de control en unos segundos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-card p-8 rounded-xl border border-border max-w-md w-full shadow-2xl animate-fade-in">
                <h2 className="text-2xl font-extrabold mb-6 text-center">Crea tu nueva clave</h2>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nueva Contraseña</Label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="h-12" />
                        
                        {/* VALIDACIÓN EN TIEMPO REAL */}
                        {password.length > 0 && <PasswordSegura password={password} />}
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full h-12 font-bold mt-4" 
                        disabled={loading || !isPasswordValid(password)}
                    >
                        {loading ? "Actualizando..." : "Guardar Contraseña"}
                    </Button>
                </form>
            </div>
        </div>
    );
};