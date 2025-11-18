import React, { useEffect, useState } from "react";
import { procesosService, cargarTodosLosDatos } from "./Services/Api";
import TablaProcesos from "./components/TablaProcesos";
import Rendimiento from "./components/Rendimiento";
import "./App.css";

function App() {
  // Estados principales
  const [procesos, setProcesos] = useState([]);
  const [stats, setStats] = useState({ cpu: 0, memoria: 0, uptime: 0, procesos: 0 });
  const [filtro, setFiltro] = useState("");
  const [orden, setOrden] = useState("nombre");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [vistaActual, setVistaActual] = useState("procesos");
  const [primeraCarga, setPrimeraCarga] = useState(true);
  const [conectado, setConectado] = useState(false);

  // Cargar datos del backend
  const cargarDatos = async () => {
    try {
      const { stats: nuevasStats, procesos: nuevosProcesos } = await cargarTodosLosDatos();
      setStats(nuevasStats);
      setProcesos(nuevosProcesos);
      setError(null);
      setConectado(true);
      
      if (primeraCarga) {
        setCargando(false);
        setPrimeraCarga(false);
      }
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setConectado(false);
      
      if (primeraCarga) {
        setError("Error al cargar los datos. Verifica que el backend esté corriendo.");
        setCargando(false);
        setPrimeraCarga(false);
      }
    }
  };

  // Actualización automática cada 3 segundos
  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Formatear tiempo de actividad
  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  // Filtrar y ordenar procesos
  const procesosFiltrados = procesos
    .filter((p) => p.nombre.toLowerCase().includes(filtro.toLowerCase()))
    .sort((a, b) => {
      switch (orden) {
        case "cpu":
          return b.cpu - a.cpu;
        case "memoria":
          return b.memoria - a.memoria;
        case "pid":
          return a.pid - b.pid;
        default:
          return a.nombre.localeCompare(b.nombre);
      }
    });

  /**
   * Eliminar proceso por PID
   * @param {number} pid - ID del proceso
   * @param {boolean} noConfirmar - Si es true, omite confirmación (para grupos)
   */
  const handleMatarProceso = async (pid, noConfirmar = false) => {
    if (!noConfirmar && !window.confirm(`¿Estás seguro de matar el proceso ${pid}?`)) {
      return;
    }
    
    try {
      const response = await procesosService.matarProceso(pid);
      
      if (!noConfirmar) {
        alert(`✅ ${response.message || 'Proceso terminado exitosamente'}`);
      }
      
      await cargarDatos();
    } catch (error) {
      console.error("Error al matar proceso:", error);
      
      // Construir mensaje de error específico
      let mensaje = "Error al matar el proceso";
      if (error.response) {
        if (error.response.status === 403) {
          mensaje = "⚠️ Acceso denegado. Necesitas ejecutar como Administrador para matar este proceso.";
        } else if (error.response.status === 404) {
          mensaje = "⚠️ El proceso ya no existe.";
        } else if (error.response.data && error.response.data.detail) {
          mensaje = `❌ ${error.response.data.detail}`;
        }
      } else if (error.message) {
        mensaje = `❌ ${error.message}`;
      }
      
      if (!noConfirmar) {
        alert(mensaje);
      }
      
      throw error;
    }
  };

  // Pantalla de carga inicial
  if (cargando && primeraCarga) {
    return (
      <div className="loading-container">
        <h2>Cargando datos...</h2>
        <p>Asegúrate de que el backend esté corriendo en http://127.0.0.1:8000</p>
      </div>
    );
  }

  // Pantalla de error
  if (error && primeraCarga) {
    return (
      <div className="error-container">
        <h2>{error}</h2>
        <p>Verifica que FastAPI esté corriendo:</p>
        <code>uvicorn main:app --reload</code>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  // Vista de rendimiento
  if (vistaActual === "rendimiento") {
    return <Rendimiento onVolver={() => setVistaActual("procesos")} procesos={procesos} />;
  }

  // Vista principal
  return (
    <div className="App">
      {/* Alerta de desconexión */}
      {!conectado && !primeraCarga && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: '#ff4444',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '5px',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          ⚠️ Sin conexión con el backend
        </div>
      )}
      
      {/* Estadísticas del sistema */}
      <div className="stats-bar">
        <div className="stat-item">🖥️ CPU: {stats.cpu}%</div>
        <div className="stat-item">💾 Memoria: {stats.memoria}%</div>
        <div className="stat-item">⏱️ Uptime: {formatUptime(stats.uptime)}</div>
        <div className="stat-item">⚙️ Procesos: {stats.procesos}</div>
      </div>

      <h1>Administrador de Tareas</h1>
      
      {/* Controles */}
      <div className="controls">
        <input
          type="text"
          placeholder="Buscar proceso..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="input-filter"
        />
        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          className="select-order"
        >
          <option value="cpu">Ordenar por CPU</option>
          <option value="memoria">Ordenar por Memoria</option>
          <option value="nombre">Ordenar por Nombre</option>
          <option value="pid">Ordenar por PID</option>
        </select>
        <button
          onClick={() => setVistaActual("rendimiento")}
          className="btn-rendimiento"
        >
          Rendimiento
        </button>
      </div>

      <TablaProcesos procesos={procesosFiltrados} onMatarProceso={handleMatarProceso} />
    </div>
  );
}

export default App;