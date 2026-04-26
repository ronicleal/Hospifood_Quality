import { Check, X } from "lucide-react";
import { validatePassword } from "../../utils/regex";

export const PasswordSegura = ({ password }: { password: string }) => {
    const v = validatePassword(password);
    
    const requirements = [
        { label: "Mínimo 8 caracteres", met: v.length },
        { label: "Una mayúscula", met: v.hasUpper },
        { label: "Una minúscula", met: v.hasLower },
        { label: "Un número", met: v.hasNumber },
        { label: "Carácter especial (@$!%*?&#)", met: v.hasSpecial },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg border border-border mt-3 animate-fade-in">
            {requirements.map((req, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs font-bold transition-colors ${req.met ? "text-green-500" : "text-muted-foreground"}`}>
                    {req.met ? <Check size={14} /> : <X size={14} className="opacity-40" />}
                    {req.label}
                </div>
            ))}
        </div>
    );
};