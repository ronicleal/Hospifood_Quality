import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { createUserRepository } from "../../database/repositories";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { AvatarSelector } from "../../components/ui/AvatarSelector";
import { Switch } from "../../components/ui/Switch"; 
import { Save, ShieldCheck, Mail, User, Clock, Bell, BellOff, Building2 } from "lucide-react";
import { isPasswordValid } from "../../utils/regex";
import { PasswordSegura } from "../../components/ui/PasswordSegura";
import { supabase } from "../../database/supabase/Client";

export const PerfilPage = () => {
    const { profile, session, updateAvatar, updateNotificaciones, isAdmin } = useAuthStore();
    const userRepo = createUserRepository();

    const [avatar, setAvatar] = useState(profile?.avatar_url || "/src/avatars/avatar1.jpg");
    const [newPass, setNewPass] = useState("");
    const [notificaciones, setNotificaciones] = useState(profile?.notificaciones_activas ?? true);
    
    // 👇 Ahora guardamos un array de nombres en lugar de un string único
    const [hospitalesAsignados, setHospitalesAsignados] = useState<string[]>([]);
    const [loadingHospitales, setLoadingHospitales] = useState(true); // Para mostrar "Cargando..."

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "" });

    useEffect(() => {
        if (profile?.notificaciones_activas !== undefined) {
            setNotificaciones(profile.notificaciones_activas);
        }
    }, [profile]);

    // Buscar nombres de hospitales
    useEffect(() => {
        const fetchHospitales = async () => {
            if (isAdmin) {
                setLoadingHospitales(false);
                return;
            }
            
            if (!profile?.hospitales || profile.hospitales.length === 0) {
                setHospitalesAsignados([]);
                setLoadingHospitales(false);
                return;
            }

            const { data } = await supabase
                .from('hospitales')
                .select('nombre')
                .in('id', profile.hospitales);
            
            if (data && data.length > 0) {
                // Guardamos el array directamente
                setHospitalesAsignados(data.map(h => h.nombre));
            }
            setLoadingHospitales(false);
        };

        fetchHospitales();
    }, [profile, isAdmin]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: "", type: "" });

        const updateData: any = { password: newPass || undefined };
        
        if (!isAdmin) {
            updateData.avatarUrl = avatar;
            updateData.notificaciones_activas = notificaciones; 
        }

        const { error } = await userRepo.updateProfile(profile!.id, updateData);

        if (error) {
            setMsg({ text: "Error al actualizar. Inténtalo de nuevo.", type: "error" });
        } else {
            setMsg({ text: "Perfil actualizado correctamente.", type: "success" });
            setNewPass(""); 
            if (!isAdmin) {
                updateAvatar(avatar); 
                if (updateNotificaciones) updateNotificaciones(notificaciones);
            }
        }
        setLoading(false);
    };

    const isFormInvalid = newPass.length > 0 && !isPasswordValid(newPass);

    const formatFecha = (isoString?: string) => {
        if (!isoString) return "No hay registro reciente";
        const date = new Date(isoString);
        return date.toLocaleString('es-ES', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        }) + ' h';
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-3xl font-extrabold text-foreground">Ajustes de Perfil</h1>
                <p className="text-muted-foreground mt-1">Gestiona tu identidad visual y seguridad.</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-8 bg-card border border-border rounded-2xl p-8 shadow-sm">
                
                {!isAdmin && (
                   <div className="flex flex-col items-center gap-6 pb-8 border-b border-border">
                        <img src={avatar} className="w-32 h-32 rounded-full border-4 border-background shadow-xl object-cover" alt="Avatar actual" />
                        <AvatarSelector onSelect={setAvatar} selectedUrl={avatar} />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-border">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><User size={16} className="text-muted-foreground"/> Nombre Completo</Label>
                        <Input value={profile?.nombre_completo || ""} disabled className="bg-muted cursor-not-allowed font-medium text-foreground" />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Mail size={16} className="text-muted-foreground"/> Email Corporativo</Label>
                        <Input value={session?.user.email || ""} disabled className="bg-muted cursor-not-allowed font-medium text-foreground" />
                    </div>
                    
                    {/* 👇 LISTA DE HOSPITALES CON ESTILO DE ETIQUETAS (BADGES) 👇 */}
                    {!isAdmin && (
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Building2 size={16} className="text-muted-foreground"/> Centros Asignados</Label>
                            <div className="min-h-10 p-2 rounded-md border border-input bg-muted cursor-not-allowed flex flex-wrap gap-2 items-center">
                                {loadingHospitales ? (
                                    <span className="text-sm text-muted-foreground px-2">Cargando...</span>
                                ) : hospitalesAsignados.length > 0 ? (
                                    hospitalesAsignados.map((hospital, index) => (
                                        <span key={index} className="bg-background border border-border text-foreground px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm">
                                            {hospital}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground px-2">Sin centro asignado</span>
                                )}
                            </div>
                        </div>
                    )}

                    {!isAdmin && (
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Clock size={16} className="text-muted-foreground"/> Último acceso</Label>
                            <Input value={formatFecha(profile?.ultimo_acceso)} disabled className="bg-muted cursor-not-allowed font-medium text-foreground" />
                        </div>
                    )}

                    {!isAdmin && (
                        <div className="md:col-span-2 mt-2 p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
                            <div className="space-y-1 pr-4">
                                <Label className="flex items-center gap-2 text-md font-bold cursor-pointer" onClick={() => setNotificaciones(!notificaciones)}>
                                    {notificaciones ? <Bell size={18} className="text-primary"/> : <BellOff size={18} className="text-muted-foreground"/>}
                                    Alertas de temperatura
                                </Label>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Activa esta opción para recibir un correo electrónico automáticamente si la temperatura de un carro registrado baja del umbral crítico.
                                </p>
                            </div>
                            <Switch 
                                checked={notificaciones} 
                                onCheckedChange={setNotificaciones}
                                disabled={loading}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-foreground">
                        <ShieldCheck className="text-primary" size={20}/> Seguridad
                    </h3>
                    <div className="space-y-2 max-w-sm">
                        <Label htmlFor="pass">Nueva Contraseña (opcional)</Label>
                        <Input id="pass" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Dejar en blanco para no cambiar" />
                        
                        {newPass.length > 0 && <PasswordSegura password={newPass} />}
                    </div>
                </div>

                {msg.text && (
                    <div className={`p-4 rounded-lg text-sm font-bold text-center ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {msg.text}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={loading || isFormInvalid} className="gap-2 px-8 h-12 text-md">
                        <Save size={18} /> {loading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </div>
            </form>
        </div>
    );
};