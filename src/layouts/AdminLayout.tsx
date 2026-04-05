import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { supabase } from "../database/supabase/Client";
import { LayoutDashboard, History, FileText, User, LogOut } from "lucide-react";

export const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Función para cerrar sesión
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin');
    };

    // Función auxiliar para saber qué pestaña está activa y pintarla de azul
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* MENÚ SUPERIOR (Navbar) */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* 1. Logo (Izquierda) */}
                        <div className="flex items-center gap-2">
                            <div className="bg-[#2563EB] text-white font-bold py-1 px-2 rounded-md text-sm">
                                SES
                            </div>
                            <span className="font-extrabold text-xl text-slate-800 tracking-tight">Hospifood</span>
                        </div>

                        {/* 2. Enlaces de Navegación (Centro) - Ocultos en móvil pequeño */}
                        <nav className="hidden md:flex space-x-8">
                            <Link
                                to="/admin/dashboard"
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors border-b-2 ${isActive('/admin/dashboard') ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                            >
                                <LayoutDashboard size={18} /> Inicio
                            </Link>
                            <Link
                                to="/admin/historial"
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors border-b-2 ${isActive('/admin/historial') ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                            >
                                <History size={18} /> Historial
                            </Link>
                            <Link
                                to="/admin/reportes"
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors border-b-2 ${isActive('/admin/reportes') ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                            >
                                <FileText size={18} /> Reportes
                            </Link>
                        </nav>

                        {/* 3. Perfil y Logout (Derecha) */}
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600">
                                <User size={18} className="text-slate-400" />
                                <span>Gestor</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Cerrar sesión"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>


            {/* CONTENIDO PRINCIPAL */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <Outlet />
            </main>


        </div>
    );

};