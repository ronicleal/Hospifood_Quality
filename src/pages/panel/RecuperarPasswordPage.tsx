import { useState } from "react";
import { Link } from "react-router-dom";
import { createUserRepository } from "../../database/repositories";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

export const RecuperarPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'warning' | 'error' }>({ 
        isOpen: false, title: "", message: "", type: "warning" 
    });

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setModal({ 
                isOpen: true, 
                title: "Campo vacío", 
                message: "Por favor, introduce tu correo corporativo para poder enviarte el enlace.", 
                type: "warning" 
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setModal({ 
                isOpen: true, 
                title: "Formato incorrecto", 
                message: "El correo introducido no tiene un formato válido. Debe contener una '@' y un dominio (ej. usuario@salud-juntaex.es).", 
                type: "warning" 
            });
            return;
        }

        setLoading(true);
        
        const userRepo = createUserRepository();
        const { error } = await userRepo.sendResetPasswordEmail(email);
        
        if (error) {
            setModal({ 
                isOpen: true, 
                title: "Error al recuperar", 
                message: error.message, 
                type: "error" 
            });
        } else {
            setEnviado(true);
        }
        
        setLoading(false);
    };

    if (enviado) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-card p-8 rounded-xl border border-border text-center max-w-md w-full shadow-2xl animate-fade-in">
                    <CheckCircle className="mx-auto text-green-500 mb-4" size={56} />
                    <h2 className="text-2xl font-extrabold mb-2">Enlace Enviado</h2>
                    <p className="text-muted-foreground text-sm">Revisa tu bandeja de entrada o spam. Hemos enviado un enlace para restablecer tu contraseña.</p>
                    <Link to="/login"><Button className="mt-8 w-full font-bold h-12">Volver al Inicio</Button></Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-card p-8 rounded-xl border border-border max-w-md w-full shadow-2xl animate-fade-in">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-extrabold">Recuperar Acceso</h2>
                    <p className="text-muted-foreground text-sm mt-2">Introduce tu correo corporativo y te enviaremos las instrucciones.</p>
                </div>
                
                <form onSubmit={handleReset} className="space-y-5" noValidate>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
                            <Input 
                                type="email" 
                                className="pl-10 h-12" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="ejemplo@salud-juntaex.es" 
                                disabled={loading}
                            />
                        </div>
                    </div>
                    
                    <Button type="submit" className="w-full h-12 font-bold text-md" disabled={loading}>
                        {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
                    </Button>
                    
                    <div className="text-center mt-4 border-t border-border pt-4">
                        <Link to="/login" className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4">
                            <ArrowLeft size={16} /> Volver al Inicio de Sesión
                        </Link>
                    </div>
                </form>
            </div>

            <ConfirmModal 
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                showCancel={false} 
                confirmText="Entendido"
                onConfirm={() => setModal(prev => ({ ...prev, isOpen: false }))}
                onCancel={() => setModal(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};