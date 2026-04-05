import { LoginForm } from "../../components/form/LoginForm";


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
                    <p className="text-slate-500 text-sm mt-1">Hospifood Quality</p>
                </div>

                {/* Inyección del Componente Formulario */}
                <LoginForm />

                <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                    <p className="text-xs text-slate-400">
                        Las cuentas son creadas por el Administrador del SES
                    </p>
                </div>

            </div>
        </div>
    );






};



