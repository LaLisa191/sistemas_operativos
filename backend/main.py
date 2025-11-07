from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psutil
import time

app = FastAPI()

# Permitir conexión desde el frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # o ["*"] si quieres permitir todo
    allow_credentials=True,
    allow_methods=["*"],   # ← permite GET, POST, etc.
    allow_headers=["*"],   # ← permite todos los encabezados
)


inicio = time.time()

@app.get("/stats")
def get_stats():
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
    lista = []
    for p in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_info', 'status']):
        try:
            info = p.info
            lista.append({
                "pid": info['pid'],
                "nombre": info['name'],
                "usuario": info.get('username', 'N/A'),
                "cpu": info['cpu_percent'],
                "memoria": round(info['memory_info'].rss / 1024 / 1024, 1),  # MB
                "estado": info['status']
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    # 🔤 Ordenar alfabéticamente por nombre
    lista_ordenada = sorted(lista, key=lambda x: x["nombre"].lower())

    return lista_ordenada