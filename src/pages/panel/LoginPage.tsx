import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // <-- Añadido Link
import { useAuthStore } from "../../store/authStore";
import { createUserRepository } from "../../database/repositories";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";

export const LoginPage = () => {
    const navigate = useNavigate();
    const initialize = useAuthStore(state => state.initialize);
    const userRepo = createUserRepository();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        const { error } = await userRepo.login(email, password);

        if (error) {
            console.error("Error devuelto por Supabase:", error);
            // Mostrar el mensaje EXACTO de Supabase para saber por qué falla
            setErrorMsg(error.message || "Correo o contraseña incorrectos.");
            setLoading(false);
            return;
        }

        await initialize();
        navigate("/panel/dashboard");
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative">

            <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-md p-8 sm:p-10 animate-fade-in">

                <div className="text-center mb-8">
                    <div className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg inline-block mb-4 shadow-sm">
                        SES Extremadura
                    </div>
                    <h2 className="text-2xl font-extrabold">Acceso Gestores</h2>
                    <p className="text-muted-foreground text-sm mt-1">Hospifood Quality</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">

                    {errorMsg && (
                        // Usamos text-destructive (rojo de Shadcn)
                        <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md text-center">
                            {errorMsg}
                        </div>
                    )}

                    <div className="space-y-2 text-left">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@salud-juntaex.es"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="space-y-2 text-left">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Contraseña</Label>

                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />

                        <Link to="/admin/recuperar-password" className="text-sm font-medium text-primary hover:underline">
                            ¿Olvidó su contraseña?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-6 text-md font-bold mt-4"
                        disabled={loading}
                    >
                        {loading ? "Verificando credenciales..." : "Iniciar Sesión"}
                    </Button>
                </form>

                <div className="mt-8 border-t border-border pt-6 text-center">
                    <p className="text-xs text-muted-foreground">
                        Las cuentas son creadas por el Administrador del SES
                    </p>
                </div>
            </div>
        </div>
    );
};