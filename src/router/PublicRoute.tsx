import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const PublicRoute = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // Si ya está logueado, lo mandamos directo a su panel
    if (isAuthenticated) return <Navigate to="/panel/dashboard" replace />;

    // Si NO está logueado, lo dejamos ver la pantalla pública (como el Login)
    return <Outlet />;
};