import requests
import psutil
import subprocess
import time

API_URL = "http://127.0.0.1:8000"

def crear_proceso_prueba():
    """Crear un proceso de prueba (notepad en Windows, sleep en Linux/Mac)"""
    try:
        import platform
        if platform.system() == "Windows":
            proceso = subprocess.Popen(["notepad.exe"])
        else:
            proceso = subprocess.Popen(["sleep", "60"])
        
        print(f"Proceso de prueba creado con PID: {proceso.pid}")
        return proceso.pid
    except Exception as e:
        print(f"Error al crear proceso de prueba: {e}")
        return None

def test_matar_proceso(pid):
    """Probar el endpoint DELETE"""
    print(f"\n🔍 Probando DELETE /procesos/{pid}")
    
    try:
        response = requests.delete(f"{API_URL}/procesos/{pid}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Éxito: {data.get('message', 'Proceso terminado')}")
            return True
        elif response.status_code == 403:
            print(f"Acceso denegado (403): {response.json().get('detail', 'Sin permisos')}")
            print("   Ejecuta el backend como administrador")
            return False
        elif response.status_code == 404:
            print(f"Proceso no encontrado (404)")
            return False
        else:
            print(f"Error {response.status_code}: {response.json()}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("No se pudo conectar al backend")
        print("   Asegúrate de que esté corriendo: uvicorn main:app --reload")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def verificar_proceso_existe(pid):
    """Verificar si un proceso existe"""
    return psutil.pid_exists(pid)

def main():
    print("=" * 60)
    print("🧪 Test de Matar Procesos - Administrador de Tareas")
    print("=" * 60)
    
    # Verificar conexión con backend
    print("\n1 Verificando conexión con backend...")
    try:
        response = requests.get(f"{API_URL}/")
        print(f"Backend conectado: {response.json()}")
    except:
        print("Backend no está corriendo")
        print("Ejecuta: uvicorn main:app --reload")
        return
    
    # Crear proceso de prueba
    print("\n2 Creando proceso de prueba...")
    pid_prueba = crear_proceso_prueba()
    
    if not pid_prueba:
        print("No se pudo crear proceso de prueba")
        return
    
    time.sleep(1)  # Esperar a que el proceso se inicie
    
    # Verificar que el proceso existe
    print(f"\n3 Verificando que el proceso {pid_prueba} existe...")
    if verificar_proceso_existe(pid_prueba):
        print(f"Proceso {pid_prueba} existe")
    else:
        print(f"Proceso {pid_prueba} no existe")
        return
    
    # Intentar matar el proceso
    print(f"\n4 Intentando matar el proceso {pid_prueba}...")
    exito = test_matar_proceso(pid_prueba)
    
    # Verificar que el proceso fue terminado
    time.sleep(1)
    print(f"\n5 Verificando que el proceso fue terminado...")
    if not verificar_proceso_existe(pid_prueba):
        print(f"Proceso {pid_prueba} terminado exitosamente")
    else:
        print(f"Proceso {pid_prueba} aún existe")
    
    print("\n" + "=" * 60)
    print("Test completado")
    print("=" * 60)

if __name__ == "__main__":
    main()