import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, History, FileText, LogOut, Users, Clock, ListChecks } from "lucide-react";

import { useAuthStore } from "../store/authStore";
import { createUserRepository } from "../database/repositories";

export const PanelLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { profile, isAdmin, clearSession } = useAuthStore();
    const userRepo = createUserRepository();

    const handleLogout = async () => {
        await userRepo.logout();
        clearSession();
        // 1. Al salir, vamos a /login
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-background font-sans">

            <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        <div className="flex items-center gap-2">
                            <div className="bg-primary text-primary-foreground font-bold py-1 px-2 rounded-md text-sm">
                                SES
                            </div>
                            <span className="font-extrabold text-xl text-card-foreground tracking-tight">Hospifood</span>
                        </div>

                        <nav className="hidden md:flex space-x-4">
                            <Link
                                to="/panel/dashboard"
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors border-b-2 ${isActive('/panel/dashboard') ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            >
                                <LayoutDashboard size={18} /> Inicio
                            </Link>

                            <Link
                                to="/panel/historial"
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors border-b-2 ${isActive('/panel/historial') ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            >
                                <History size={18} /> Historial
                            </Link>

                            <Link
                                to="/panel/reportes"
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors border-b-2 ${isActive('/panel/reportes') ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            >
                                <FileText size={18} /> Reportes
                            </Link>

                            <Link
                                to="/panel/turnos"
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors border-b-2 ${isActive('/panel/turnos') ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            >
                                <Clock size={18} /> Turnos
                            </Link>

                            <Link
                                to="/panel/parametros"
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors border-b-2 ${isActive('/panel/parametros') ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            >
                                <ListChecks size={18} /> Parámetros
                            </Link>

                            {isAdmin && (
                                <>
                                    <div className="w-px h-6 bg-border self-center mx-2" />
                                    <Link
                                        to="/panel/usuarios"
                                        className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors border-b-2 ${isActive('/panel/usuarios') ? 'border-purple-600 text-purple-600' : 'border-transparent text-purple-400 hover:text-purple-700'}`}
                                    >
                                        <Users size={18} /> Usuarios
                                    </Link>
                                </>
                            )}
                        </nav>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end justify-center">
                                <span className="text-sm font-bold text-foreground">
                                    {profile?.nombre_completo || "Cargando..."}
                                </span>
                                <span className={`text-xs font-bold uppercase ${isAdmin ? 'text-purple-600' : 'text-primary'}`}>
                                    {profile?.rol}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                title="Cerrar sesión"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-foreground">
                <Outlet />
            </main>

        </div>
    );
};