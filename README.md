Administrador de Tareas - Sistema Operativo

Sistema de monitoreo y gestión de procesos en tiempo real con interfaz web moderna, desarrollado con React y FastAPI.

Características:

Vista de Procesos:
Agrupación inteligente por categorías:

- Aplicaciones (Chrome, Discord, Spotify, etc.)
- Procesos en segundo plano
- Procesos de Windows
- Servicios del sistema

Filtrado dinámico por nombre de proceso
Ordenamiento por CPU, Memoria, Nombre o PID
Expansión de grupos para ver instancias individuales

Eliminación de procesos:
- Individual: Matar un proceso específico
- Grupal: Matar todas las instancias de un proceso

Vista de Rendimiento:
- Gráficas en tiempo real de uso de CPU
- Gráficas en tiempo real de uso de Memoria
- Top 5 procesos con mayor consumo de CPU
- Actualización automática cada 2 segundos

Tecnologías:
Frontend:
- React 18.2.0 - Biblioteca de interfaz de usuario
- Axios - Cliente HTTP para llamadas a la API
- Recharts - Gráficas interactivas
- CSS3 - Estilos modernos con animaciones

Backend:
- FastAPI - Framework web moderno y rápido
- Python 3.8+ - Lenguaje de programación
- sutil - Librería para obtener información del sistema
- uvicorn - Servidor ASGI de alto rendimiento

Requisitos Previos:

Software necesario:
- Node.js 14.0+ y npm
- Python 3.8+

Sistema Operativo:
- Windows 10/11 (recomendado)
- Linux (soportado)
- macOS (soportado con limitaciones)

Instalación:
1. Clonar el repositorio
git clone https://github.com/LaLisa191/sistemas_operativos.git
cd sistemas_operativos

Configurar el Backend
cd backend

# Crear entorno virtual (opcional pero recomendado)
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# O instalar manualmente:
pip install fastapi uvicorn psutil

cd backend

# Crear entorno virtual (opcional pero recomendado)
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# O instalar manualmente:
pip install fastapi uvicorn psutil

cd ../frontend

# Instalar dependencias
npm install

cd backend

# Windows (como Administrador para poder matar procesos):
uvicorn main:app --reload

# Linux/Mac (con sudo):
sudo uvicorn main:app --reload

l backend estará disponible en: http://127.0.0.1:8000
Iniciar el Frontend
Abre otra terminal y ejecuta:

cd frontend
npm start

