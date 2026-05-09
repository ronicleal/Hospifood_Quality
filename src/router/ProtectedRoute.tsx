import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const ProtectedRoute = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    
    // Si NO está logueado, lo mandamos al login (que ahora llamaremos /login)
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    // Si está logueado, lo dejamos pasar
    return <Outlet />;
};