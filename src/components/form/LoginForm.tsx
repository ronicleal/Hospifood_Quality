import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserRepository } from "../../database/repositories";

export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    // Instanciamos el repositorio
    const userRepository = createUserRepository();

    // --- FUNCION DE AUTENTICACION Y ROLES (RBAC) --- //
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Usamos el Repositorio para iniciar sesión
            const result = await userRepository.login(email, password);

            // 2. Manejo de errores
            if (result.error) {
                setError("Correo o contraseña incorrectos. Por favor, revíselos.");
                setLoading(false);
                return;
            }

            // 3. Éxito: Leemos el rol y redirigimos
            if (result.data){
                const perfil = result.data.perfil;
                console.log(`✅ Acceso concedido. Bienvenido ${perfil.nombre_completo} (Rol: ${perfil.rol})`);

                if (perfil.rol === 'admin'){
                    navigate('/admin/usuarios');
                }else{
                    navigate('/admin/dashboard');
                }

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
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold mb-4 text-center border border-red-200">
                    {error}
                </div>
            )}

            {/* Formulario */}
            <form className="space-y-5" onSubmit={handleLogin}>
                <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="gestor@ses.es"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 transition-all"
                    />
                </div>

                <div className="flex justify-end">
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        ¿Olvidó su contraseña?
                    </a>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors disabled:opacity-50"
                >
                    {loading ? 'Verificando...' : 'Iniciar Sesión'}
                </button>

            </form>


        </>
    )
}