import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-300 dark:hover:bg-slate-700 shadow-sm"
            aria-label="Alternar modo de color"
            title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
        >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
};