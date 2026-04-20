import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserRepository } from "../../database/repositories";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export const LoginForm = () => {
    const navigate = useNavigate();
    const { initialize } = useAuthStore();
    const userRepo = createUserRepository();

    // Estado para alternar entre Login y Registro
    const [isLogin, setIsLogin] = useState(true);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nombreCompleto, setNombreCompleto] = useState(""); // Solo para registro
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        if (isLogin) {
            // LÓGICA DE INICIO DE SESIÓN
            const { error } = await userRepo.login(email, password);
            if (error) {
                setErrorMsg("Credenciales incorrectas o usuario no encontrado.");
                setLoading(false);
            } else {
                await initialize();
                navigate('/panel/dashboard');
            }
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
                // El registro hace login automático en Supabase
                await initialize(); 
                navigate('/panel/dashboard');
            }
        }
    };

    return (
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-foreground">
                    {isLogin ? "Bienvenido de nuevo" : "Crear cuenta Gestor"}
                </h2>
                <p className="text-muted-foreground mt-2">
                    {isLogin 
                        ? "Introduce tus credenciales para acceder al panel." 
                        : "Regístrate para solicitar acceso a la gestión de calidad."}
                </p>
            </div>

            {errorMsg && (
                <div className="mb-6 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm text-center font-medium">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* CAMPO NOMBRE (Solo visible en Registro) */}
                {!isLogin && (
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre Completo</Label>
                        <Input 
                            id="nombre" 
                            placeholder="Ej: Dr. García" 
                            value={nombreCompleto} 
                            onChange={(e) => setNombreCompleto(e.target.value)} 
                            disabled={loading} 
                            required={!isLogin} 
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico Corporativo</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="usuario@salud-juntaex.es" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        disabled={loading} 
                        required 
                    />
                </div>

                <div className="space-y-2">
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
                </div>

                <Button type="submit" className="w-full h-12 text-base font-bold mt-4" disabled={loading}>
                    {loading ? "Procesando..." : (isLogin ? "Iniciar Sesión" : "Registrarme")}
                </Button>
            </form>

            {/* BOTÓN PARA ALTERNAR ENTRE LOGIN Y REGISTRO */}
            <div className="mt-6 text-center">
                <button 
                    type="button" 
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setErrorMsg("");
                    }}
                    className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                >
                    {isLogin 
                        ? "¿Eres un gestor nuevo? Regístrate aquí" 
                        : "¿Ya tienes cuenta? Inicia sesión"}
                </button>
            </div>
        </div>
    );
};