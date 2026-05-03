import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { 
    LayoutDashboard, History, FileText, LogOut, 
    Users, Clock, ListChecks, Building2, Globe 
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
        <div className="min-h-screen bg-background font-sans relative">
            
            {/* 👇 FONDOS DEGRADADOS FIJOS 👇 */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            {/* 👇 Cabecera con efecto cristal (bg-card/95 y backdrop-blur-sm) 👇 */}
            <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* LOGO */}
                        <div className="flex items-center gap-2">
                            <div className="bg-primary text-primary-foreground font-bold py-1 px-2 rounded-md text-sm">
                                HFQ
                            </div>
                            <span className="font-extrabold text-xl text-card-foreground tracking-tight">Hospifood Quality</span>
                        </div>

                        {/* NAVEGACIÓN DINÁMICA POR ROLES */}
                        <nav className="hidden md:flex space-x-2 lg:space-x-4 overflow-x-auto relative z-10">
                            {isAdmin ? (
                                /* MENÚ EXCLUSIVO DEL ADMINISTRADOR */
                                <>
                                    <Link to="/panel/dashboard" className={getLinkClass('/panel/dashboard')}>
                                        <Globe size={18} /> Visión Global
                                    </Link>
                                    
                                    <div className="w-px h-6 bg-border self-center mx-1 lg:mx-2" />

                                    <Link to="/panel/hospitales" className={getLinkClass('/panel/hospitales', true)}>
                                        <Building2 size={18} /> Hospitales
                                    </Link>
                                    
                                    <Link to="/panel/usuarios" className={getLinkClass('/panel/usuarios', true)}>
                                        <Users size={18} /> Gestores
                                    </Link>
                                </>
                            ) : (
                                /* MENÚ EXCLUSIVO DEL GESTOR LOCAL */
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
                        <div className="flex items-center gap-4 relative z-10">
                            <Link to="/panel/perfil" className="flex items-center gap-3 hover:bg-muted/50 p-1 pr-3 rounded-full transition-colors group cursor-pointer" title="Ir a mi perfil">
                                {isAdmin ? (
                                    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold border-2 border-purple-500 group-hover:scale-110 transition-transform shadow-sm">
                                        AD
                                    </div>
                                ) : (
                                    <img 
                                        src={profile?.avatar_url || "/src/avatars/avatar1.jpg"} 
                                        className="w-9 h-9 rounded-full border-2 border-primary group-hover:scale-110 transition-transform bg-background shadow-sm object-cover" 
                                        alt="Mi Perfil" 
                                    />
                                )}

                                <div className="hidden sm:flex flex-col items-start justify-center">
                                    <span className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                                        {profile?.nombre_completo || "Cargando..."}
                                    </span>
                                    <span className={`text-[10px] font-bold uppercase ${isAdmin ? 'text-purple-600' : 'text-primary'}`}>
                                        {profile?.rol}
                                    </span>
                                </div>
                            </Link>

                            <div className="w-px h-6 bg-border mx-1" />

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

            {/* 👇 El Main debe tener position relative y z-10 para quedar por encima de las luces 👇 */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-foreground">
                <Outlet />
            </main>
        </div>
    );
};