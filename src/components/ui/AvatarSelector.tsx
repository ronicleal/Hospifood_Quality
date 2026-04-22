// Ponemos las rutas de las imágenes que vas a guardar en public/assets/avatars/
const AVATARES_PREDEFINIDOS = [
    "/src/avatars/avatar1.jpg",
    "/src/avatars/avatar2.jpg",
    "/src/avatars/avatar3.jpg",
    "/src/avatars/avatar4.jpg",
    "/src/avatars/avatar5.jpg",
    "/src/avatars/avatar6.jpg",
];

interface Props {
    onSelect: (url: string) => void;
    selectedUrl: string;
}

export const AvatarSelector = ({ onSelect, selectedUrl }: Props) => {
    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground text-center">Selecciona tu perfil visual:</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {AVATARES_PREDEFINIDOS.map((url) => (
                    <button
                        key={url}
                        type="button"
                        onClick={() => onSelect(url)}
                        className={`relative rounded-full border-4 transition-all flex justify-center items-center overflow-hidden bg-white ${
                            selectedUrl === url 
                                ? "border-primary scale-110 shadow-lg" 
                                : "border-transparent hover:scale-105 shadow-sm"
                        }`}
                    >
                        {/* object-cover asegura que tus imágenes se adapten perfecto al círculo */}
                        <img src={url} alt="Avatar" className="w-14 h-14 object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
};