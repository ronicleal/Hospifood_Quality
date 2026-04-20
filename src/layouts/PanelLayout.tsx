import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { 
    LayoutDashboard, History, FileText, LogOut, 
    Users, Clock, ListChecks, Building2, Globe, BarChart3 
} from "lucide-react";

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
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    // Función auxiliar para los colores de los enlaces
    const getLinkClass = (path: string, isSpecial: boolean = false) => {
        const activeClass = isSpecial 
            ? 'border-purple-600 text-purple-600' 
            : 'border-primary text-primary';
        const inactiveClass = isSpecial 
            ? 'border-transparent text-purple-400 hover:text-purple-700' 
            : 'border-transparent text-muted-foreground hover:text-foreground';
        
        return `flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors border-b-2 ${isActive(path) ? activeClass : inactiveClass}`;
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* LOGO */}
                        <div className="flex items-center gap-2">
                            <div className="bg-primary text-primary-foreground font-bold py-1 px-2 rounded-md text-sm">
                                SES
                            </div>
                            <span className="font-extrabold text-xl text-card-foreground tracking-tight">Hospifood</span>
                        </div>

                        {/* NAVEGACIÓN DINÁMICA POR ROLES */}
                        <nav className="hidden md:flex space-x-2 lg:space-x-4 overflow-x-auto">
                            {isAdmin ? (
                                /* ==========================================
                                   MENÚ EXCLUSIVO DEL ADMINISTRADOR (DIRECTIVA)
                                   ========================================== */
                                <>
                                    <Link to="/panel/dashboard" className={getLinkClass('/panel/dashboard')}>
                                        <Globe size={18} /> Visión Global
                                    </Link>
                                    
                                    <Link to="/panel/reportes" className={getLinkClass('/panel/reportes')}>
                                        <BarChart3 size={18} /> Reportes Globales
                                    </Link>

                                    <div className="w-px h-6 bg-border self-center mx-1 lg:mx-2" />

                                    <Link to="/panel/hospitales" className={getLinkClass('/panel/hospitales', true)}>
                                        <Building2 size={18} /> Hospitales
                                    </Link>
                                    
                                    <Link to="/panel/usuarios" className={getLinkClass('/panel/usuarios', true)}>
                                        <Users size={18} /> Gestores
                                    </Link>

                                    <div className="w-px h-6 bg-border self-center mx-1 lg:mx-2" />

                                    <Link to="/panel/turnos" className={getLinkClass('/panel/turnos')}>
                                        <Clock size={18} /> Turnos (Global)
                                    </Link>
                                    
                                    <Link to="/panel/parametros" className={getLinkClass('/panel/parametros')}>
                                        <ListChecks size={18} /> Parámetros (Global)
                                    </Link>
                                </>
                            ) : (
                                /* ==========================================
                                   MENÚ EXCLUSIVO DEL GESTOR LOCAL
                                   ========================================== */
                                <>
                                    <Link to="/panel/dashboard" className={getLinkClass('/panel/dashboard')}>
                                        <LayoutDashboard size={18} /> Dashboard
                                    </Link>
                                    
                                    <Link to="/panel/historial" className={getLinkClass('/panel/historial')}>
                                        <History size={18} /> Historial
                                    </Link>
                                    
                                    <Link to="/panel/reportes" className={getLinkClass('/panel/reportes')}>
                                        <FileText size={18} /> Mis Reportes
                                    </Link>

                                    <div className="w-px h-6 bg-border self-center mx-1 lg:mx-2" />

                                    <Link to="/panel/turnos" className={getLinkClass('/panel/turnos')}>
                                        <Clock size={18} /> Mis Turnos
                                    </Link>
                                    
                                    <Link to="/panel/parametros" className={getLinkClass('/panel/parametros')}>
                                        <ListChecks size={18} /> Mis Parámetros
                                    </Link>
                                </>
                            )}
                        </nav>

                        {/* PERFIL Y LOGOUT */}
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