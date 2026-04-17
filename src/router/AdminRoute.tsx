import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const AdminRoute = () => {
    const { isAuthenticated, isAdmin } = useAuthStore();

    // Si no está logueado, fuera
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    // Si está logueado pero NO es admin (es decir, es Gestor), lo devolvemos al inicio del panel
    if (!isAdmin) return <Navigate to="/panel/dashboard" replace />;

    // Si es Admin, lo dejamos pasar
    return <Outlet />;
};