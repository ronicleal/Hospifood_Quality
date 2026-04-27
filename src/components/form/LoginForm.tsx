import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { createUserRepository } from "../../database/repositories";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { AvatarSelector } from "../ui/AvatarSelector";
import { Mail, Check, AlertCircle, Eye, EyeOff } from "lucide-react"; 
import { PasswordSegura } from "../ui/PasswordSegura";
import { isPasswordValid, validateName, capitalizeWords, validateEmail } from "../../utils/regex";

export const LoginForm = () => {
    const navigate = useNavigate();
    const initialize = useAuthStore(state => state.initialize);
    const userRepo = createUserRepository();

    const [isLogin, setIsLogin] = useState(true);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    const [nombre, setNombre] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("/src/avatars/avatar1.jpg");
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        if (isLogin) {
            const { error } = await userRepo.login(email, password);
            if (error) {
                setErrorMsg(error.message || "Correo o contraseña incorrectos.");
                setLoading(false);
                return;
            }
            await initialize();
            navigate("/panel/dashboard");
        } else {
            if (!nombre.trim() || !apellidos.trim()) {
                setErrorMsg("El nombre y los apellidos son obligatorios.");
                setLoading(false);
                return;
            }
            if (!validateName(nombre) || !validateName(apellidos)) {
                setErrorMsg("El nombre y apellidos solo pueden contener letras.");
                setLoading(false);
                return;
            }

            const nombreCompletoGuardar = `${nombre.trim()} ${apellidos.trim()}`;
            const { error } = await userRepo.register(email, password, nombreCompletoGuardar, avatarUrl);
            
            if (error) {
                setErrorMsg(error.message || "Error al crear la cuenta.");
                setLoading(false);
            } else {
                await initialize(); 
                navigate('/panel/dashboard');
            }
        }
    };
    
    const isLoginInvalid = isLogin && (!validateEmail(email) || password.length === 0);
    const isRegisterInvalid = !isLogin && (
        !isPasswordValid(password) || 
        !validateName(nombre) || 
        !validateName(apellidos) || 
        !validateEmail(email)
    );

    return (
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

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {errorMsg && (
                    <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md text-center">
                        {errorMsg}
                    </div>
                )}

                {!isLogin && (
                    <div className="space-y-4 animate-fade-in pb-4 border-b border-border">
                        <div className="flex flex-col items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                            <img src={avatarUrl} alt="Preview" className="w-24 h-24 rounded-full border-4 border-background shadow-lg object-cover" />
                            <AvatarSelector onSelect={setAvatarUrl} selectedUrl={avatarUrl} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 text-left">
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input 
                                    id="nombre" placeholder="Ej: Juan Luis" value={nombre} 
                                    onChange={(e) => setNombre(capitalizeWords(e.target.value))} 
                                    disabled={loading} required={!isLogin} 
                                />
                            </div>
                            <div className="space-y-2 text-left">
                                <Label htmlFor="apellidos">Apellidos</Label>
                                <Input 
                                    id="apellidos" placeholder="Ej: Ortiz Martin" value={apellidos} 
                                    onChange={(e) => setApellidos(capitalizeWords(e.target.value))} 
                                    disabled={loading} required={!isLogin} 
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-2 text-left">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
                        <Input
                            id="email" type="email" className="pl-10" placeholder="responsable@salud-juntaex.es"
                            value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required
                        />
                    </div>
                    {email.length > 0 && (
                        <div className="mt-1 animate-fade-in">
                            {validateEmail(email) ? (
                                <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                                    <Check size={14} /> Formato de correo válido
                                </span>
                            ) : (
                                <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                                    <AlertCircle size={14} /> Incluye un '@' y un dominio
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-2 text-left">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                        <Input
                            id="password" type={showPassword ? "text" : "password"} className="pr-10"
                            value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required
                        />
                        <button
                            type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {!isLogin && password.length > 0 && (
                        <PasswordSegura password={password} />
                    )}

                    {isLogin && (
                        <div className="mt-2 text-right">
                            <Link to="/recuperar-password" className="text-sm font-medium text-primary hover:underline">
                                ¿Olvidó su contraseña?
                            </Link>
                        </div>
                    )}
                </div>

                <Button
                    type="submit" className="w-full py-6 text-md font-bold mt-4"
                    disabled={loading || (isLogin ? isLoginInvalid : isRegisterInvalid)}
                >
                    {loading ? "Procesando..." : (isLogin ? "Iniciar Sesión" : "Registrarse")}
                </Button>
            </form>

            <div className="mt-8 border-t border-border pt-6 text-center flex flex-col gap-4">
                <button 
                    type="button" 
                    onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); setPassword(""); }}
                    className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                >
                    {isLogin ? "¿Eres un Responsable nuevo? Solicita acceso aquí" : "¿Ya tienes cuenta? Inicia sesión"}
                </button>
                <p className="text-xs text-muted-foreground">
                    {isLogin ? "Crea tu cuenta para darte de alta" : "El Administrador te asignará tus hospitales."}
                </p>
            </div>
        </div>
    );
};