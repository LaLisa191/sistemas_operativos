import React from "react";


function TablaProcesos({ procesos, onMatarProceso }) {
  return (
    <div className="tabla-container">
      <table className="tabla-procesos">
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
          {procesos.map((p) => (
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
                  onClick={() => onMatarProceso(p.pid)}
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

export default TablaProcesos;
