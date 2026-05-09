import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { createUserRepository } from "../../database/repositories";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { AvatarSelector } from "../ui/AvatarSelector";
import { Mail, Check, AlertCircle, Eye, EyeOff, UserCircle } from "lucide-react"; 
import { PasswordSegura } from "../ui/PasswordSegura";
import { isPasswordValid, validateName, capitalizeWords, validateEmail } from "../../utils/regex";
import { ConfirmModal } from "../ui/ConfirmModal";

export const LoginForm = () => {
    const navigate = useNavigate();
    const initialize = useAuthStore(state => state.initialize);
    const userRepo = createUserRepository();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [nombre, setNombre] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("/avatars/avatar1.jpg");
    const [loading, setLoading] = useState(false);

    const [modal, setModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning';
        action: 'login' | 'register' | 'close';
    }>({ isOpen: false, title: "", message: "", type: "success", action: "close" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (isLogin) {
            const { error } = await userRepo.login(email, password);
            if (error) {
                setModal({ isOpen: true, title: "Error de Acceso", message: "El correo o la contraseña son incorrectos.", type: "error", action: "close" });
                setLoading(false);
                return;
            }
            await initialize();
            navigate("/panel/dashboard");
        } else {
            if (password !== confirmPassword) {
                setModal({ isOpen: true, title: "Contraseñas no coinciden", message: "La contraseña y su confirmación deben ser idénticas.", type: "warning", action: "close" });
                setLoading(false);
                return;
            }

            if (!nombre.trim() || !apellidos.trim()) {
                setModal({ isOpen: true, title: "Datos incompletos", message: "El nombre y los apellidos son obligatorios.", type: "warning", action: "close" });
                setLoading(false);
                return;
            }

            const nombreCompletoGuardar = `${nombre.trim()} ${apellidos.trim()}`;
            const { error } = await userRepo.register(email, password, nombreCompletoGuardar, avatarUrl);
            
            if (error) {
                setModal({ isOpen: true, title: "Fallo en el Registro", message: error.message || "No se ha podido crear la cuenta.", type: "error", action: "close" });
                setLoading(false);
            } else {
                setModal({ isOpen: true, title: "¡Cuenta creada con éxito!", message: "Te has registrado correctamente. Accede al panel para comprobar tus centros.", type: "success", action: "register" });
            }
        }
    };

    const handleModalConfirm = async () => {
        if (modal.action === 'register') {
            await initialize(); 
            navigate('/panel/dashboard');
        } else {
            setModal(prev => ({ ...prev, isOpen: false }));
        }
    };
    
    const isLoginInvalid = isLogin && (!validateEmail(email) || password.length === 0);
    const isRegisterInvalid = !isLogin && (!isPasswordValid(password) || !validateName(nombre) || !validateName(apellidos) || !validateEmail(email) || password !== confirmPassword);

    return (
        /* Contenedor principal con ancho responsivo: más ancho en registro */
        <div className={`bg-card text-card-foreground border border-border rounded-2xl shadow-2xl transition-all duration-500 ease-in-out p-8 sm:p-10 animate-fade-in w-full ${isLogin ? 'max-w-md' : 'max-w-4xl'}`}>
            <div className="text-center mb-8">
                <div className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg inline-block mb-4 shadow-sm">
                    HFQ
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight">
                    {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                </h2>
                <p className="text-muted-foreground text-sm mt-2">Hospifood Quality</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Grid responsivo: 1 columna en login/móvil, 2 columnas en registro/escritorio */}
                <div className={`grid gap-8 ${!isLogin ? 'lg:grid-cols-2 lg:items-start' : 'grid-cols-1'}`}>
                    
                    {/* SECCIÓN IZQUIERDA: Perfil e Identidad (Solo en Registro) */}
                    {!isLogin && (
                        <div className="space-y-6 animate-fade-in pr-0 lg:pr-8 lg:border-r lg:border-border">
                            <div className="flex flex-col items-center gap-6 bg-muted/20 p-6 rounded-2xl border border-dashed border-border">
                                <div className="relative">
                                    <img src={avatarUrl} alt="Preview" className="w-32 h-32 rounded-full border-4 border-background shadow-xl object-cover" />
                                    <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-lg">
                                        <UserCircle size={20} />
                                    </div>
                                </div>
                                <div className="w-full text-center">
                                    <Label className="mb-3 block text-sm font-semibold uppercase tracking-wider text-muted-foreground">Selecciona tu Avatar</Label>
                                    <AvatarSelector onSelect={setAvatarUrl} selectedUrl={avatarUrl} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre</Label>
                                    <Input id="nombre" className="h-11" placeholder="Juan Manuel" value={nombre} onChange={(e) => setNombre(capitalizeWords(e.target.value))} disabled={loading} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellidos">Apellidos</Label>
                                    <Input id="apellidos" className="h-11" placeholder="Jiménez López" value={apellidos} onChange={(e) => setApellidos(capitalizeWords(e.target.value))} disabled={loading} required />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN DERECHA: Credenciales y Seguridad */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Corporativo</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
                                <Input id="email" type="email" className="pl-10 h-11" placeholder="responsable@salud-juntaex.es" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required />
                            </div>
                            {email.length > 0 && (
                                <div className="mt-1 flex items-center gap-2">
                                    {validateEmail(email) ? (
                                        <span className="text-[10px] text-green-500 font-bold tracking-widest flex items-center gap-1"><Check size={12} /> Email Válido</span>
                                    ) : (
                                        <span className="text-[10px] text-amber-500 font-bold tracking-widest flex items-center gap-1"><AlertCircle size={12} /> Formato Incorrecto</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <div className="relative">
                                <Input id="password" type={showPassword ? "text" : "password"} className="pr-10 h-11" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {!isLogin && password.length > 0 && (
                                <div className="pt-1">
                                    <PasswordSegura password={password} />
                                </div>
                            )}
                            {isLogin && (
                                <div className="text-right">
                                    <Link to="/recuperar-password" title="Recuperar acceso" className="text-xs font-semibold text-primary hover:underline underline-offset-4">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                            )}
                        </div>

                        {!isLogin && (
                            <div className="space-y-2 animate-fade-in">
                                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                                <Input id="confirmPassword" type="password" className="h-11" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} required placeholder="Repite tu contraseña" />
                                {confirmPassword.length > 0 && password !== confirmPassword && (
                                    <span className="text-[10px] text-red-500 font-bold tracking-widest flex items-center gap-1"><AlertCircle size={12} /> Las contraseñas no coinciden</span>
                                )}
                            </div>
                        )}

                        <Button type="submit" className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" disabled={loading || (isLogin ? isLoginInvalid : isRegisterInvalid)}>
                            {loading ? "Verificando..." : (isLogin ? "Continuar" : "Empezar")}
                        </Button>
                    </div>
                </div>
            </form>

            <div className="mt-10 border-t border-border pt-8 text-center space-y-4">
                <button 
                    type="button" 
                    onClick={() => { setIsLogin(!isLogin); setPassword(""); setConfirmPassword(""); }}
                    className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                    {isLogin ? "¿Eres un Responsable nuevo? Regístrate" : "¿Ya tienes una cuenta? Accede"}
                </button>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    {isLogin 
                        ? "Utiliza tus credenciales asignadas por el Administrador para entrar al Panel." 
                        : "Al registrarte, un Administrador deberá asignarte tus centros hospitalarios antes de poder ver datos."}
                </p>
            </div>

            <ConfirmModal 
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                showCancel={false}
                confirmText={modal.action === 'register' ? "Comenzar en el Panel" : "Entendido"}
                onConfirm={handleModalConfirm}
                onCancel={() => setModal(prev => ({...prev, isOpen: false}))}
            />
        </div>
    );
};