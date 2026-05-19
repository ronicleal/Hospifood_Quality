# 🏥 Hospifood Quality

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)

**Hospifood Quality** es una plataforma web inteligente de nivel empresarial diseñada para la digitalización, control y análisis en tiempo real de la calidad alimentaria por parte del paciente en la red de hospitales públicos de Extremadura. Basado en el método normalizado **COCINHEX**, este sistema sustituye las encuestas en papel por una interfaz digital táctil para los pacientes y proporciona una potente herramienta analítica asistida por IA para el Responsable de Calidad (Veterinario Bromatólogo) .

## 🚀 Enlace de Producción
La aplicación se encuentra desplegada y accesible públicamente en: **[hospifood-quality.vercel.app](https://hospifood-quality.vercel.app/)**

## ✨ Características Principales
* **📱 Cuestionario Secuencial Táctil:** Interfaz paso a paso optimizada bajo la filosofía *"Fat Finger Design"* con botones e iconos de gran tamaño, garantizando la máxima accesibilidad web (WCAG).
* **🔒 Anonimato por Diseño:** El sistema cumple estrictamente con la LOPD/RGPD; la entidad encuesta carece de relaciones con datos personales de pacientes o usuarios.
* **🛡️ Control Anti-Spam Inteligente:** Bloqueo temporal basado en `LocalStorage` que restringe el envío a un máximo de una encuesta cada 4 horas por dispositivo.
* **📊 Dashboard Analítico:** Panel de control con cálculos automáticos de medias, KPIs de satisfacción y gráficos interactivos temporales.
* **🤖 Asistente Virtual con IA (Chatbot):** Integración nativa con modelos lingüísticos avanzados de Google para ayudar al personal a interpretar tendencias y generar conclusiones predictivas sobre los datos recogidos.
* **⚠️ Alertas Críticas por Email:** Sistema automatizado que detecta anomalías de seguridad alimentaria en tiempo real (ej. Temperatura crítica $\le$ 2) e inicia el envío inmediato de correos de alerta a los gestores asignados.
* **📄 Informes en PDF:** Generación nativa y descarga de reportes ejecutivos estadísticos directamente desde el navegador del usuario.

## 🛠&nbsp; Stack Tecnológico

**Frontend (Single Page Application):**
* **Core & Compilación:** React 18+ y Vite.
* **Arquitectura de Software:** Repositorios desacoplados (Pattern Repository) e interfaces en TypeScript/JavaScript (TSX/JSX).
* **Gestión de Estado Global:** Zustand con persistencia en memoria local (`persist` middleware).
* **Enrutamiento:** React Router DOM (Manejo de rutas públicas, privadas y de administración).
* **Diseño e Interfaz:** Tailwind CSS v4.0, componentes de Shadcn/UI y librería de iconos Lucide React.
* **Gráficos e Informes:** Recharts para analíticas dinámicas, junto a `jsPDF` y `html2canvas`.

**Backend as a Service (Supabase):**
* **Base de Datos:** PostgreSQL con soporte transaccional.
* **Autenticación:** Supabase Auth con control de sesiones y recuperación de credenciales mediante tokens por correo electrónico.
* **Ciberseguridad:** Activación estricta de **Row Level Security (RLS)** con políticas personalizadas por rol. Los datos están aislados por centro sanitario: un gestor solo interactúa con los hospitales que tiene asignados en su perfil.

## 🗄️ Modelo de Datos y Arquitectura Relacional
La base de datos PostgreSQL está optimizada para soportar una estructura multi-centro y mantener el desacoplamiento de la identidad del paciente:

1. `hospitales`: Almacena el catálogo de centros públicos con su respectivo código, provincia y área de salud.
2. `perfiles`: Información del personal (nombre, avatar, rol e interruptor de notificaciones de alerta).
3. `perfiles_hospitales`: Tabla puente relacional (Muchos a Muchos) que mapea qué gestor tiene control sobre qué hospital(es).
4. `turnos` y `parametros`: Configuraciones dinámicas de franjas horarias y preguntas del método COCINHEX específicas por hospital.
5. `encuestas`: Cabecera de la evaluación anónima del paciente (hospital, fecha, turno, tipo de dieta, planta y sugerencias de texto).
6. `respuestas`: Detalle transaccional de las puntuaciones de la escala de emojis (valores validados estrictamente del 1 al 5).

## 👤 Roles de Usuario
| Rol | Ámbito | Permisos y Capacidades |
| :--- | :--- | :--- |
| **Paciente** | Público (Anónimo) | Acceso vía código QR o tablet en bandeja de comida. Completa encuestas con escala visual de emojis sin necesidad de credenciales. |
| **Gestor de Calidad** | Privado (Autenticado) | Acceso restringido por RLS a sus centros asignados. Monitorea métricas en tiempo real, interactúa con el Chatbot de IA, gestiona parámetros locales, recibe alertas EmailJS y exporta PDFs. |
| **Administrador** | Superusuario (Autenticado) | Acceso global. Visualización consolidada de la red hospitalaria regional, administración de cuentas de usuario y control del CRUD de centros sanitarios. |

## 🖥️ Estructura de Vistas del Sistema
* **Vistas del Paciente:** `Inicio Encuesta` (pantalla limpia de bienvenida) y `Cuestionario Táctil` (flujo guiado por tarjetas).
* **Vistas de Autenticación:** `Login` seguro con visibilidad conmutada de contraseña ("ojito") y formulario de `Recuperación de Contraseña`.
* **Vistas del Gestor:** `Dashboard` analítico con KPIs, `Historial / Alertas` con resaltado de filas críticas, `Chatbot de IA` y ajustes de `Perfil` editable (nombre, avatar y alertas).
* **Vistas del Administrador:** Panel de `Gestión de Responsables` (con asignación dinámica N:M de hospitales) y mantenimiento global del sistema.

## 🚀 Instalación y Configuración Local

Sigue estos pasos para desplegar el entorno de desarrollo en tu máquina local. Asegúrate de disponer de Node.js (v18+).

### 1. Clonar el repositorio
```bash
git clone [https://github.com/ronicleal/Hospifood_Quality.git]
````
### 2. Instalar dependencias
```bash
npm install
```
### 3. Configuración de variables de entorno
Crea un archivo .env en la raíz del proyecto (este archivo se encuentra protegido en el .gitignore para evitar filtraciones de seguridad) e introduce tus credenciales de los proveedores de servicios:
```bash
# Servidor BaaS Supabase
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_publica

# Integración Inteligencia Artificial (Google AI Studio)
VITE_GEMINI_API_KEY=tu_clave_de_gemini_api

# Automatización de Alertas por Email
VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_TEMPLATE_ID=tu_template_id
VITE_EMAILJS_PUBLIC_KEY=tu_public_key
```
### 4. Lanzar en Entorno Local
```bash
npm run dev
```
### 🧑‍🏫 Tutorías
* **Tutor: Francisco José Mera Calderón**

## 📅 Evolución del Proyecto (Resumen de Tutorías)
Toda la documentación detallada sobre el avance del proyecto se encuentra en el repositorio, dentro de la ruta: `docs`.

| Fecha | Hito / Tarea Realizada |
| :--- | :--- |
| **12-septiembre** | Presentación de Asignatura y Proyecto. |
| **19-septiembre** | Creación de Imagen Corporativa de la Empresa. |
| **26-septiembre** | Elaboración de Contrato de Prestación de Servicios y Recogida de Necesidades. |
| **03-octubre** | Definición de Requisitos Funcionales y No Funcionales. Presentación a la Empresa. |
| **10-octubre** | Desarrollo de las Interfaces Gráficas (Bocetos y UI/UX). |
| **17-octubre** | Desarrollo de la Estructura de la Base de Datos. |
| **24-octubre** | Definición del Modelo Relacional de la Base de Datos. |
| **31-octubre** | Presentación a la Empresa de las Interfaces y la Base de Datos. |
| **07-noviembre** | Elección y justificación de Tecnologías a Utilizar. |
| **14-noviembre** | Estructuración Inicial de Documentación. |
| **21-noviembre** | Definición de Puntos de los Manuales de Usuario y Técnico. |
| **05-diciembre** | Desarrollo Inicial de Manuales de Usuario y Técnico. |
| **12-diciembre** | Análisis de Opciones de Despliegue de Aplicativos. |
| **19-diciembre** | Pruebas de Despliegue en Entorno Local. |
| **09-enero** | Pruebas de Despliegue en Producción (Vercel). |
| **16-enero** | Fase de pruebas (Testing) y corrección de errores (Bugs).|
| **23-enero** | Congelación de Código (Code Freeze) y Versionado Semántico. |
| **30-enero** | Orientaciones de material visual para la defensa. |
| **06 febrero** | Implementación de Feedback y Accesibilidad Web (WCAG). |
| **13 febrero** | Optimización de Base de Datos y Revisión de Ciberseguridad. |
| **20 febrero** | Generación de Datos Simulados (Mock Data) y Pruebas de Estrés.|
| **27 febrero** | Cierre de Documentación y Manual de Despliegue.|
| **05 marzo** | Revisión final de documentación y ajustes de accesibilidad.|
| **12 marzo** | Preparación para la presentación y defensa.|
| **04 mayo** | Reunión para orientaciones generales de la presentación y defensa.|
| **09 mayo** | Despliegue del proyecto en Vercel.|
| **25 mayo** | Invitación de los miembros del tribunal al proyecto.|
| **18 mayo** | Entrega del proyecto e invitación al tribunal.|
| **01 junio** | Defensa del proyecto.|





