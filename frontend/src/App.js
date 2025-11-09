import React, { useEffect, useState } from "react";
import { procesosService, cargarTodosLosDatos } from "./Services/Api";
import TablaProcesos from "./components/TablaProcesos";
import "./App.css";

function App() {
  const [procesos, setProcesos] = useState([]);
  const [stats, setStats] = useState({ cpu: 0, memoria: 0, uptime: 0, procesos: 0 });
  const [filtro, setFiltro] = useState("");
  const [orden, setOrden] = useState("nombre");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = async () => {
    try {
      setError(null);
      const { stats: nuevasStats, procesos: nuevosProcesos } = await cargarTodosLosDatos();
      setStats(nuevasStats);
      setProcesos(nuevosProcesos);
      setCargando(false);
    } catch (err) {
      setError("Error al cargar los datos");
      setCargando(false);
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

  if (cargando) return <h2 style={{ textAlign: "center" }}>Cargando datos...</h2>;
  if (error) return <h2 style={{ textAlign: "center", color: "red" }}>{error}</h2>;

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
      </div>

      <TablaProcesos procesos={procesosFiltrados} onMatarProceso={handleMatarProceso} />
    </div>
  );
}

export default App;
