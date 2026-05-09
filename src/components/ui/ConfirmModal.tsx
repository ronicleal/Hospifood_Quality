import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "./button";

interface Props {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    isDeleting?: boolean;
    showCancel?: boolean;
    type?: 'warning' | 'success' | 'error';
}

export const ConfirmModal = ({ 
    isOpen, title, message, onConfirm, onCancel, 
    confirmText = "Aceptar", isDeleting = false, 
    showCancel = true, type = 'warning' 
}: Props) => {
    if (!isOpen) return null;

    const icons = {
        warning: <AlertTriangle size={32} className="text-amber-500" />,
        success: <CheckCircle size={32} className="text-green-500" />,
        error: <XCircle size={32} className="text-destructive" />
    };

    const bgColors = {
        warning: "bg-amber-100",
        success: "bg-green-100",
        error: "bg-destructive/10"
    };

    // Si es éxito usamos el botón azul/primario, si es error/warning usamos el rojo
    const buttonVariant = type === 'success' ? 'default' : 'destructive';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                
                <div className="p-6 sm:p-8 text-center space-y-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${bgColors[type]}`}>
                        {icons[type]}
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{title}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {message}
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/30 border-t border-border">
                    {showCancel && onCancel && (
                        <Button variant="outline" onClick={onCancel} disabled={isDeleting} className="flex-1">
                            Cancelar
                        </Button>
                    )}
                    <Button variant={buttonVariant} onClick={onConfirm} disabled={isDeleting} className="flex-1 font-bold">
                        {isDeleting ? "Procesando..." : confirmText}
                    </Button>
                </div>
                
            </div>
        </div>
    );
};