// App.js - Componente principal refactorizado
import React, { useEffect, useState } from "react";
import { statsService, procesosService, cargarTodosLosDatos } from "./Api";
import "./App.css";

function App() {
  const [procesos, setProcesos] = useState([]);
  const [stats, setStats] = useState({ 
    cpu: 0, 
    memoria: 0, 
    uptime: 0, 
    procesos: 0 
  });
  const [filtro, setFiltro] = useState("");
  const [orden, setOrden] = useState("nombre");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // 🔁 Función para cargar datos usando los servicios de Api.js
  const cargarDatos = async () => {
    try {
      setError(null);
      
      // Opción 1: Cargar todo en paralelo (más eficiente)
      const { stats: nuevasStats, procesos: nuevosProcesos } = await cargarTodosLosDatos();
      setStats(nuevasStats);
      setProcesos(nuevosProcesos);

      // Opción 2: Cargar por separado (si prefieres tener más control)
      // const nuevasStats = await statsService.obtenerStats();
      // const nuevosProcesos = await procesosService.obtenerProcesos();
      // setStats(nuevasStats);
      // setProcesos(nuevosProcesos);

      setCargando(false);
    } catch (err) {
      setError("Error al cargar los datos");
      setCargando(false);
      console.error("Error:", err);
    }
  };

  // 🔁 Cargar datos al inicio y cada 3 segundos
  useEffect(() => {
    cargarDatos(); // Carga inicial

    const interval = setInterval(() => {
      cargarDatos(); // Actualizar cada 3 segundos
    }, 3000);

    return () => clearInterval(interval); // Limpiar al desmontar
  }, []);

  // 🕒 Convertir uptime a formato horas:minutos:segundos
  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  // 🔍 Filtrar y ordenar procesos
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

  // 💀 Manejar eliminación de proceso (ejemplo de uso del servicio)
  const handleMatarProceso = async (pid) => {
    if (window.confirm(`¿Estás seguro de matar el proceso ${pid}?`)) {
      try {
        await procesosService.matarProceso(pid);
        // Recargar datos después de matar el proceso
        await cargarDatos();
      } catch (err) {
        alert("Error al matar el proceso");
      }
    }
  };

  // Mostrar estado de carga
  if (cargando) {
    return (
      <div className="App">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>Cargando datos...</h2>
        </div>
      </div>
    );
  }

  // Mostrar errores
  if (error) {
    return (
      <div className="App">
        <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
          <h2>{error}</h2>
          <button onClick={cargarDatos}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* 🟩 Barra superior */}
      <div className="stats-bar">
        <div className="stat-item">🖥️ CPU: {stats.cpu}%</div>
        <div className="stat-item">💾 Memoria: {stats.memoria}%</div>
        <div className="stat-item">⏱️ Uptime: {formatUptime(stats.uptime)}</div>
        <div className="stat-item">⚙️ Procesos: {stats.procesos}</div>
      </div>

      <h1>Administrador de Tareas</h1>

      {/* 🔧 Controles de filtro y orden */}
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

      {/* 📊 Tabla de procesos */}
      <table>
        <thead>
          <tr>
            <th>PID</th>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>CPU %</th>
            <th>Memoria (MB)</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {procesosFiltrados.map((p) => (
            <tr key={p.pid}>
              <td>{p.pid}</td>
              <td>{p.nombre}</td>
              <td>{p.usuario}</td>
              <td className={p.cpu > 50 ? "high-cpu" : ""}>{p.cpu}</td>
              <td>{p.memoria}</td>
              <td>
                <span className={`badge badge-${p.estado.toLowerCase()}`}>
                  {p.estado}
                </span>
              </td>
              <td>
                <button
                  onClick={() => handleMatarProceso(p.pid)}
                  className="btn-kill"
                  title="Matar proceso"
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;