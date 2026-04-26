import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { createUserRepository } from "../../database/repositories";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { AvatarSelector } from "../../components/ui/AvatarSelector";
import { Save, ShieldCheck, Mail, User } from "lucide-react";
import { isPasswordValid } from "../../utils/regex";
import { PasswordSegura } from "../../components/ui/PasswordSegura";

export const PerfilPage = () => {
    const { profile, session, updateAvatar, isAdmin } = useAuthStore();
    const userRepo = createUserRepository();

    const [avatar, setAvatar] = useState(profile?.avatar_url || "/src/avatars/avatar1.jpg");
    const [newPass, setNewPass] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "" });

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: "", type: "" });

        const updateData: any = { password: newPass || undefined };
        if (!isAdmin) {
            updateData.avatarUrl = avatar;
        }

        const { error } = await userRepo.updateProfile(profile!.id, updateData);

        if (error) {
            setMsg({ text: "Error al actualizar. Inténtalo de nuevo.", type: "error" });
        } else {
            setMsg({ text: "Perfil actualizado correctamente.", type: "success" });
            setNewPass(""); 
            if (!isAdmin) updateAvatar(avatar); 
        }
        setLoading(false);
    };

    // Variable para saber si debemos bloquear el botón de guardar
    const isFormInvalid = newPass.length > 0 && !isPasswordValid(newPass);

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
                </div>

                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-foreground">
                        <ShieldCheck className="text-primary" size={20}/> Seguridad
                    </h3>
                    <div className="space-y-2 max-w-sm">
                        <Label htmlFor="pass">Nueva Contraseña (opcional)</Label>
                        <Input id="pass" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Dejar en blanco para no cambiar" />
                        
                        {/* 👇 VALIDACIÓN DINÁMICA 👇 */}
                        {newPass.length > 0 && <PasswordSegura password={newPass} />}
                    </div>
                </div>

                {msg.text && (
                    <div className={`p-4 rounded-lg text-sm font-bold text-center ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {msg.text}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    {/* 👇 Bloqueamos el botón si la contraseña no cumple los requisitos 👇 */}
                    <Button type="submit" disabled={loading || isFormInvalid} className="gap-2 px-8 h-12 text-md">
                        <Save size={18} /> {loading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </div>
            </form>
        </div>
    );
};