// src/components/form/LoginForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserRepository } from "../../database/repositories";

// Importamos nuestros nuevos componentes Shadcn
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const userRepository = createUserRepository();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await userRepository.login(email, password);

            if (result.error) {
                setError("Correo o contraseña incorrectos. Por favor, revíselos.");
                setLoading(false);
                return;
            }

            if (result.data) {
                const perfil = result.data.perfil;
                if (perfil.rol === 'admin') navigate('/admin/usuarios');
                else navigate('/admin/dashboard');
            }
        } catch (err: any) {
            setError("Ocurrió un error inesperado de conexión.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {error && (
                <div className="bg-destructive/15 text-destructive p-3 rounded-lg text-sm font-bold mb-4 text-center border border-destructive/20">
                    {error}
                </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="gestor@ses.es"
                        required
                        className="py-6" // Hacemos el input un poco más alto para mejor UX
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="py-6"
                    />
                </div>

                <div className="flex justify-end">
                    <a href="#" className="text-sm text-primary hover:underline font-medium">
                        ¿Olvidó su contraseña?
                    </a>
                </div>

                {/* Usamos el Button de Shadcn */}
                <Button 
                    type="submit" 
                    className="w-full py-6 text-md font-bold" 
                    disabled={loading}
                >
                    {loading ? 'Verificando...' : 'Iniciar Sesión'}
                </Button>
            </form>
        </>
    );
};