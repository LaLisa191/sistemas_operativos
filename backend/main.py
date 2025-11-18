from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psutil
import time

app = FastAPI()

# Permitir conexión desde el frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

inicio = time.time()

@app.get("/")
def read_root():
    """Endpoint de prueba"""
    return {"message": "API de Administrador de Tareas funcionando correctamente"}

@app.get("/stats")
def get_stats():
    """Obtener estadísticas del sistema"""
    cpu = psutil.cpu_percent(interval=0.5)
    memoria = psutil.virtual_memory().percent
    uptime = time.time() - inicio
    procesos = len(psutil.pids())
    return {
        "cpu": cpu,
        "memoria": memoria,
        "uptime": uptime,
        "procesos": procesos
    }

@app.get("/procesos")
def get_procesos():
    """Obtener lista de todos los procesos"""
    lista = []
    for p in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_info', 'status']):
        try:
            info = p.info
            lista.append({
                "pid": info['pid'],
                "nombre": info['name'],
                "usuario": info.get('username', 'N/A'),
                "cpu": info['cpu_percent'] or 0,
                "memoria": round(info['memory_info'].rss / 1024 / 1024, 1),  # MB
                "estado": info['status']
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    
    # Ordenar alfabéticamente por nombre
    lista_ordenada = sorted(lista, key=lambda x: x["nombre"].lower())
    return lista_ordenada

@app.get("/procesos/{pid}")
def get_proceso_por_pid(pid: int):
    """Obtener información de un proceso específico"""
    try:
        proceso = psutil.Process(pid)
        return {
            "pid": proceso.pid,
            "nombre": proceso.name(),
            "usuario": proceso.username(),
            "cpu": proceso.cpu_percent(interval=0.1),
            "memoria": round(proceso.memory_info().rss / 1024 / 1024, 1),
            "estado": proceso.status()
        }
    except psutil.NoSuchProcess:
        raise HTTPException(status_code=404, detail=f"Proceso con PID {pid} no encontrado")
    except psutil.AccessDenied:
        raise HTTPException(status_code=403, detail=f"Acceso denegado al proceso {pid}")

@app.delete("/procesos/{pid}")
def matar_proceso(pid: int):
    """
    Matar un proceso por su PID
    IMPORTANTE: Requiere ejecutar el backend como administrador
    """
    try:
        proceso = psutil.Process(pid)
        nombre_proceso = proceso.name()
        
        # Intentar terminar el proceso de forma ordenada primero
        proceso.terminate()
        
        # Esperar hasta 3 segundos para que termine
        try:
            proceso.wait(timeout=3)
        except psutil.TimeoutExpired:
            # Si no termina en 3 segundos, forzar el cierre
            proceso.kill()
            return {
                "success": True,
                "message": f"Proceso {nombre_proceso} (PID: {pid}) forzado a terminar"
            }
        
        return {
            "success": True,
            "message": f"Proceso {nombre_proceso} (PID: {pid}) terminado exitosamente"
        }
        
    except psutil.NoSuchProcess:
        raise HTTPException(
            status_code=404, 
            detail=f"Proceso con PID {pid} no encontrado o ya fue terminado"
        )
    except psutil.AccessDenied:
        raise HTTPException(
            status_code=403, 
            detail=f"Acceso denegado. Ejecuta el backend como administrador para matar el proceso {pid}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al matar proceso: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    print("Iniciando servidor...")
    print("IMPORTANTE: Para matar procesos, ejecuta como administrador")
    print("API corriendo en: http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)