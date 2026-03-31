export const LoginPage = () => {
    return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 font-sans relative">

            {/* Tarjeta Blanca Central */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 sm:p-10 animate-fade-in">

                {/* Cabecera Logo */}
                <div className="text-center mb-8">
                    <div className="bg-[#2563EB] text-white font-bold py-2 px-4 rounded-lg inline-block mb-4 shadow-sm">
                        SES Extremadura
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Acceso Gestores</h2>
                    <p className="text-slate-500 text-sm mt-1">HospitalFood</p>
                </div>

                {/* Formulario */}
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Email</label>
                        <input
                            type="email"
                            placeholder="gestor@sesextremadura.es"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 transition-all"
                        />
                    </div>

                    <div className="flex justify-end">
                        <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                            ¿Olvidó su contraseña?
                        </a>
                    </div>

                    <button className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors">
                        Iniciar Sesión
                    </button>
                    
                </form>
            </div>
        </div>
    );
};