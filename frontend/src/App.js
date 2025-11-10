import React, { useEffect, useState } from "react";
import { procesosService, cargarTodosLosDatos } from "./Services/Api";
import TablaProcesos from "./components/TablaProcesos";
import Rendimiento from "./components/Rendimiento";
import "./App.css";

function App() {
  const [procesos, setProcesos] = useState([]);
  const [stats, setStats] = useState({ cpu: 0, memoria: 0, uptime: 0, procesos: 0 });
  const [filtro, setFiltro] = useState("");
  const [orden, setOrden] = useState("nombre");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [vistaActual, setVistaActual] = useState("procesos");
  const [primeraCarga, setPrimeraCarga] = useState(true); // Nueva bandera

  const cargarDatos = async () => {
    try {
      const { stats: nuevasStats, procesos: nuevosProcesos } = await cargarTodosLosDatos();
      setStats(nuevasStats);
      setProcesos(nuevosProcesos);
      setError(null); // Limpiar error si la carga fue exitosa
      
      if (primeraCarga) {
        setCargando(false);
        setPrimeraCarga(false);
      }
    } catch (err) {
      console.error("Error al cargar datos:", err);
      
      // Solo mostrar error en la primera carga
      if (primeraCarga) {
        setError("Error al cargar los datos. Verifica que el backend esté corriendo.");
        setCargando(false);
        setPrimeraCarga(false);
      }
      // En cargas subsecuentes, mantener los datos anteriores
    }
  };

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

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

  const handleMatarProceso = async (pid) => {
    if (window.confirm(`¿Estás seguro de matar el proceso ${pid}?`)) {
      try {
        await procesosService.matarProceso(pid);
        await cargarDatos();
      } catch {
        alert("Error al matar el proceso");
      }
    }
  };

  // Solo mostrar "Cargando..." en la primera carga
  if (cargando && primeraCarga) {
    return (
      <div className="loading-container">
        <h2>Cargando datos...</h2>
        <p>Asegúrate de que el backend esté corriendo en http://127.0.0.1:8000</p>
      </div>
    );
  }

  // Solo mostrar error en la primera carga
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

  // Renderizar vista de rendimiento
  if (vistaActual === "rendimiento") {
    return <Rendimiento onVolver={() => setVistaActual("procesos")} procesos={procesos} />;
  }

  // Vista normal de procesos
  return (
    <div className="App">
      <div className="stats-bar">
        <div className="stat-item">🖥️ CPU: {stats.cpu}%</div>
        <div className="stat-item">💾 Memoria: {stats.memoria}%</div>
        <div className="stat-item">⏱️ Uptime: {formatUptime(stats.uptime)}</div>
        <div className="stat-item">⚙️ Procesos: {stats.procesos}</div>
      </div>
      <h1>Administrador de Tareas</h1>
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
          📊 Rendimiento
        </button>
      </div>
      <TablaProcesos procesos={procesosFiltrados} onMatarProceso={handleMatarProceso} />
    </div>
  );
}

export default App;