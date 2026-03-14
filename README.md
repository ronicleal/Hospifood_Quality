# 🏥 Hospifood Quality

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)

**Hospifood Quality** es una aplicación web desarrollada para digitalizar el proceso de recogida y análisis de la satisfacción de los pacientes con respecto al servicio de alimentación en los hospitales públicos de Extremadura. Basado en el método normalizado **COCINHEX**, este sistema sustituye las encuestas en papel por una interfaz digital táctil para los pacientes y proporciona un cuadro de mando en tiempo real para los Responsables de Calidad.

## ✨ Características Principales
* **📱 Encuestas Táctiles (Anónimas):** Interfaz adaptada con diseño "Fat Finger" (botones grandes) para facilitar la interacción de los pacientes.
* **📊 Dashboard en Tiempo Real:** Cálculo automático de medias de satisfacción en parámetros como Presentación, Sabor y Temperatura.
* **🔍 Filtrado Avanzado:** Segmentación de datos por fecha, turno (Desayuno/Comida/Cena) y dieta (Basal/Blanda/Turmix).
* **⚠️ Sistema de Alertas:** Notificaciones visuales automáticas cuando parámetros críticos caen por debajo de los estándares de calidad.
* **📄 Exportación a PDF:** Generación de informes analíticos de forma nativa en el navegador.

## 🛠️ Tecnologías
**Frontend:**
* **Core:** React (v18+) + Vite + JavaScript (ES6+) / JSX.
* **Enrutamiento:** React Router DOM.
* **Estilos:** Tailwind CSS.
* **Visualización de Datos:** Recharts.
* **Utilidades:** Lucide React (iconos) y jsPDF + html2canvas (generación de informes).

**Backend (Supabase):**
* **Base de Datos:** PostgreSQL.
* **Autenticación:** Supabase Auth (para gestores y administradores).
* **Seguridad:** Row Level Security (RLS) para aislar los datos entre diferentes hospitales.

## 🗄️ Modelo de Datos
La base de datos relacional en PostgreSQL está estructurada para permitir la participación anónima de los pacientes y la gestión segura por parte de los responsables de calidad:

1.  `hospitales`: Catálogo de centros.
2.  `perfiles`: Usuarios gestores vinculados a Supabase Auth y a un hospital específico.
3.  `parametros`: Preguntas evaluables del método COCINHEX.
4.  `encuestas`: Cabecera de la encuesta anónima (turno, dieta, planta).
5.  `respuestas`: Detalle de las puntuaciones (0-10) vinculadas a la encuesta.

### Políticas de Seguridad (RLS) en Supabase:
* **Pacientes:** Cualquier usuario anónimo puede insertar nuevas encuestas en el sistema (Cero fricción).
* **Gestores:** Solo pueden visualizar e interactuar con los datos (encuestas y respuestas) que pertenezcan a su `hospital_id` asignado.
* **Administradores:** Tienen acceso global para crear nuevos hospitales y gestionar los perfiles de los gestores.

## 👤 Roles de Usuario
| Rol | Permisos |
| :--- | :--- |
| **Paciente (Anónimo)** | Acceso a la interfaz pública mediante tablet o código QR para rellenar encuestas. No requiere registro. |
| **Gestor de Calidad** | Acceso privado. Puede visualizar el *dashboard* de su hospital, filtrar encuestas, ver alertas y exportar reportes PDF. |
| **Administrador SES** | Acceso total. Gestión de la tabla de hospitales y creación/desactivación de perfiles de gestores de calidad. |


## 🖥️ Vistas Principales

| Vista | Descripción |
| :--- | :--- |
| **🏠 Inicio Encuesta** | Pantalla de bienvenida amigable con botón gigante de inicio para el paciente. |
| **📋 Cuestionario táctil** | Interfaz paso a paso (tipo tarjeta) para valorar Presentación, Sabor, Temperatura, etc., mediante iconos. |
| **🔐 Login** | Pantalla de acceso seguro y recuperación de contraseña exclusivo para el staff del hospital. |
| **📊 Dashboard** | Panel de control principal con métricas en tiempo real, gráficos de barras y evolución semanal. |
| **🔍 Historial / Alertas** | Tabla con el registro detallado de todas las encuestas y resaltado visual de las puntuaciones críticas. |
| **⚙️ Administración** | (Solo Administradores) Panel CRUD para gestionar los centros hospitalarios y las cuentas del personal. |

## 🚀 Instalación y Configuración Local

Sigue estos pasos para desplegar el proyecto en tu entorno local. Necesitarás tener instalado Node.js (v18+).

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/hospitalfood-quality.git
````
### 2. Instalar dependencias
```bash
npm install
```
### 3. Configuración de variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto y añade tus claves de Supabase:
```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### 🧑‍🏫 Tutorías
* **Tutor: Francisco José Mera Calderón**

## 📅 Evolución del Proyecto (Resumen de Tutorías)
Toda la documentación detallada sobre el avance semanal se encuentra en el repositorio, dentro de la ruta: `docs >> Evolución de Proyecto`.

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
| **23-enero** | Revisión final de documentación y ajustes de accesibilidad. |
| **30-enero** | Preparación para la presentación y defensa del TFG. |

