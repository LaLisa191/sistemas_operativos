Administrador de Tareas - Sistema Operativo

Sistema de monitoreo y gestión de procesos del sistema operativo en tiempo real, desarrollado con una arquitectura cliente-servidor, React y FastAPI, que permite visualizar, filtrar, ordenar y eliminar procesos del sistema.

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

Instalacion:
1. descargar el repositorio de GIT HUB https://github.com/LaLisa191/sistemas_operativos
2. descomprimir el archivo comprimido
3. Abrir la carpeta principal con Visual Studio Code
4. para arrancar el frontend, es necesario abrir una terminal en powershell y poner CD FRONTED
5. luego usa NPM INSTALL
6. para arrancar el Front se usa NPM START
7. instalar Python https://www.python.org/downloads/windows/
8. luego instalar pip  py -m pip install unicorn
9. Abrir Configuración

- Buscar "Variables de entorno"
- Editar PATH del usuario

Agregar:

C:\Users\SERGIO LUIS\AppData\Local\Programs\Python\Python313\
C:\Users\SERGIO LUIS\AppData\Local\Programs\Python\Python313\Scripts\

10. py -m pip install fastapi unicorn (para instalar Unicorn)

11. instalar librería PsultilÑ
- python -m pip install psutil
13. python -m uvicorn main:app --reload para arrancar el backend
