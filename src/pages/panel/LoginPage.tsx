import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { createUserRepository } from "../../database/repositories";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";

export const LoginPage = () => {
    const navigate = useNavigate();
    const initialize = useAuthStore(state => state.initialize);
    const userRepo = createUserRepository();

    const [isLogin, setIsLogin] = useState(true);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nombreCompleto, setNombreCompleto] = useState(""); // Solo para registro
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        if (isLogin) {
            // LÓGICA DE INICIO DE SESIÓN
            const { error } = await userRepo.login(email, password);

            if (error) {
                console.error("Error devuelto por Supabase:", error);
                setErrorMsg(error.message || "Correo o contraseña incorrectos.");
                setLoading(false);
                return;
            }

            await initialize();
            navigate("/panel/dashboard");
        } else {
            // LÓGICA DE REGISTRO
            if (!nombreCompleto.trim()) {
                setErrorMsg("El nombre completo es obligatorio.");
                setLoading(false);
                return;
            }
            
            const { error } = await userRepo.register(email, password, nombreCompleto);
            if (error) {
                setErrorMsg(error.message || "Error al crear la cuenta. La contraseña debe tener al menos 6 caracteres.");
                setLoading(false);
            } else {
                // Al registrarse, entra automáticamente
                await initialize(); 
                navigate('/panel/dashboard');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative">

            <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-md p-8 sm:p-10 animate-fade-in">

                <div className="text-center mb-8">
                    <div className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg inline-block mb-4 shadow-sm">
                        HFQ
                    </div>
                    <h2 className="text-2xl font-extrabold">
                        {isLogin ? "Acceso Gestores" : "Registro de Gestores"}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Hospifood Quality</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {errorMsg && (
                        <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md text-center">
                            {errorMsg}
                        </div>
                    )}

                    {/* 👇 CAMPO NOMBRE (Solo visible en Registro) */}
                    {!isLogin && (
                        <div className="space-y-2 text-left">
                            <Label htmlFor="nombre">Nombre Completo</Label>
                            <Input
                                id="nombre"
                                placeholder="Ej: Pepe Reyes"
                                value={nombreCompleto}
                                onChange={(e) => setNombreCompleto(e.target.value)}
                                disabled={loading}
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div className="space-y-2 text-left">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="responsable@salud-juntaex.es"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="space-y-2 text-left">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />

                        {/* Ocultamos el 'olvidó contraseña' si está registrándose */}
                        {isLogin && (
                            <div className="mt-2 text-right">
                                <Link to="/admin/recuperar-password" className="text-sm font-medium text-primary hover:underline">
                                    ¿Olvidó su contraseña?
                                </Link>
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-6 text-md font-bold mt-4"
                        disabled={loading}
                    >
                        {loading ? "Procesando..." : (isLogin ? "Iniciar Sesión" : "Registrarse")}
                    </Button>
                </form>

                {/* BOTÓN PARA ALTERNAR ENTRE LOGIN Y REGISTRO */}
                <div className="mt-8 border-t border-border pt-6 text-center flex flex-col gap-4">
                    <button 
                        type="button" 
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setErrorMsg("");
                        }}
                        className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                    >
                        {isLogin 
                            ? "¿Eres un Responsable nuevo? Solicita acceso aquí" 
                            : "¿Ya tienes cuenta? Inicia sesión"}
                    </button>

                    <p className="text-xs text-muted-foreground">
                        {isLogin 
                            ? "Crea tu cuenta para darte de alta en el SES" 
                            : "Una vez registrado, el Administrador te asignará tus hospitales."}
                    </p>
                </div>
            </div>
        </div>
    );
};