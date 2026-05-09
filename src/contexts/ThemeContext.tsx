import { createContext, useContext, useEffect, useState } from 'react';

// Tipos permitidos
type Theme = 'light' | 'dark';

// Estructura de nuestro contexto
interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

// Inicialización
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    // Estado inicial: Lee de localStorage, o si no hay, de la preferencia del sistema operativo
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('hospifood-theme');
        if (savedTheme) {
            return savedTheme as Theme;
        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    // Efecto secundario: Cada vez que cambie 'theme', aplicamos la clase al <html> y guardamos
    useEffect(() => {
        const root = window.document.documentElement;
        
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        localStorage.setItem('hospifood-theme', theme);
    }, [theme]);

    // Función para alternar el tema
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook personalizado para usarlo fácilmente en cualquier componente
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme debe usarse dentro de un ThemeProvider');
    }
    return context;
};