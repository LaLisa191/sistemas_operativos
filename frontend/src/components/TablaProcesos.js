import React, { useState } from "react";
import "./TablaProcesos.css";

function TablaProcesos({ procesos, onMatarProceso }) {
  const [procesosExpandidos, setProcesosExpandidos] = useState(new Set());
  const [categoriasExpandidas, setCategoriasExpandidas] = useState(new Set(['Aplicaciones'])); // Aplicaciones expandida por defecto
  const [vistaAgrupada, setVistaAgrupada] = useState(true);

  // Categorizar procesos
  const categorizarProceso = (proceso) => {
    const nombre = proceso.nombre.toLowerCase();
    
    // Aplicaciones (programas de usuario comunes)
    const aplicaciones = [
      'chrome', 'firefox', 'edge', 'brave', 'opera', 'safari',
      'spotify', 'discord', 'slack', 'teams', 'zoom', 'skype',
      'code', 'vscode', 'pycharm', 'intellij', 'eclipse', 'sublime',
      'notepad++', 'notepad', 'word', 'excel', 'powerpoint', 'outlook',
      'photoshop', 'illustrator', 'premiere', 'aftereffects',
      'steam', 'epicgameslauncher', 'origin', 'battle.net',
      'vlc', 'itunes', 'foobar', 'whatsapp', 'telegram'
    ];
    
    // Procesos de Windows
    const procesosWindows = [
      'explorer', 'dwm', 'csrss', 'lsass', 'winlogon', 'services',
      'smss', 'wininit', 'svchost', 'system', 'registry', 'taskhostw',
      'sihost', 'runtimebroker', 'applicationframehost', 'searchindexer',
      'searchapp', 'startmenuexperiencehost', 'shellexperiencehost',
      'textinputhost', 'lockapp', 'systemsettings'
    ];
    
    // Servicios (suelen terminar en Service o tener nombres específicos)
    const esServicio = nombre.includes('service') || 
                      nombre.includes('helper') ||
                      nombre.includes('updater') ||
                      nombre.includes('daemon') ||
                      nombre === 'spoolsv.exe';
    
    // Determinar categoría
    if (aplicaciones.some(app => nombre.includes(app))) {
      return 'Aplicaciones';
    } else if (procesosWindows.some(proc => nombre.includes(proc))) {
      return 'Procesos de Windows';
    } else if (esServicio) {
      return 'Servicios';
    } else {
      return 'Procesos en segundo plano';
    }
  };

  // Agrupar procesos por nombre y categoría
  const organizarProcesos = () => {
    const categorias = {
      'Aplicaciones': {},
      'Procesos en segundo plano': {},
      'Procesos de Windows': {},
      'Servicios': {}
    };
    
    procesos.forEach(proceso => {
      const categoria = categorizarProceso(proceso);
      const nombre = proceso.nombre;
      
      if (!categorias[categoria][nombre]) {
        categorias[categoria][nombre] = {
          nombre: nombre,
          instancias: [],
          totalCPU: 0,
          totalMemoria: 0,
          pids: []
        };
      }
      
      categorias[categoria][nombre].instancias.push(proceso);
      categorias[categoria][nombre].totalCPU += proceso.cpu || 0;
      categorias[categoria][nombre].totalMemoria += proceso.memoria || 0;
      categorias[categoria][nombre].pids.push(proceso.pid);
    });

    return categorias;
  };

  const toggleExpansion = (nombreProceso) => {
    const nuevosExpandidos = new Set(procesosExpandidos);
    if (nuevosExpandidos.has(nombreProceso)) {
      nuevosExpandidos.delete(nombreProceso);
    } else {
      nuevosExpandidos.add(nombreProceso);
    }
    setProcesosExpandidos(nuevosExpandidos);
  };

  const toggleCategoria = (categoria) => {
    const nuevasExpandidas = new Set(categoriasExpandidas);
    if (nuevasExpandidas.has(categoria)) {
      nuevasExpandidas.delete(categoria);
    } else {
      nuevasExpandidas.add(categoria);
    }
    setCategoriasExpandidas(nuevasExpandidas);
  };

  const categoriasOrganizadas = organizarProcesos();

  // Vista detallada (sin agrupar)
  if (!vistaAgrupada) {
    return (
      <div className="tabla-container">
        <div className="tabla-controls">
          <button 
            className="btn-toggle-vista"
            onClick={() => setVistaAgrupada(true)}
          >
            📁 Agrupar por categorías
          </button>
        </div>
        <table className="tabla-procesos">
          <thead>
            <tr>
              <th>PID</th>
              <th>NOMBRE</th>
              <th>USUARIO</th>
              <th>CPU %</th>
              <th>MEMORIA (MB)</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {procesos.map((p) => (
              <tr key={p.pid}>
                <td>{p.pid}</td>
                <td>{p.nombre}</td>
                <td>{p.usuario}</td>
                <td className={p.cpu > 50 ? "high-cpu" : ""}>{p.cpu || 0}</td>
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

  // Vista agrupada por categorías
  return (
    <div className="tabla-container">
      <div className="tabla-controls">
        <button 
          className="btn-toggle-vista"
          onClick={() => setVistaAgrupada(false)}
        >
          📋 Ver todos los detalles
        </button>
      </div>
      <table className="tabla-procesos">
        <thead>
          <tr>
            <th>NOMBRE (Instancias)</th>
            <th>PID</th>
            <th>USUARIO</th>
            <th>CPU %</th>
            <th>MEMORIA (MB)</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(categoriasOrganizadas).map(([categoria, grupos]) => {
            const gruposArray = Object.values(grupos);
            if (gruposArray.length === 0) return null;
            
            const categoriaExpandida = categoriasExpandidas.has(categoria);
            const totalProcesos = gruposArray.reduce((sum, g) => sum + g.instancias.length, 0);
            const totalCPU = gruposArray.reduce((sum, g) => sum + g.totalCPU, 0);
            const totalMemoria = gruposArray.reduce((sum, g) => sum + g.totalMemoria, 0);

            return (
              <React.Fragment key={categoria}>
                {/* Fila de categoría */}
                <tr 
                  className="categoria-header"
                  onClick={() => toggleCategoria(categoria)}
                >
                  <td colSpan="7">
                    <span className="categoria-icon">
                      {categoriaExpandida ? '▼' : '▶'}
                    </span>
                    <strong className="categoria-nombre">{categoria}</strong>
                    <span className="categoria-stats">
                      ({totalProcesos} procesos • CPU: {totalCPU.toFixed(1)}% • Memoria: {totalMemoria.toFixed(1)} MB)
                    </span>
                  </td>
                </tr>

                {/* Grupos de procesos dentro de la categoría */}
                {categoriaExpandida && gruposArray.map((grupo) => {
                  const estaExpandido = procesosExpandidos.has(`${categoria}-${grupo.nombre}`);
                  const tieneMultiplesInstancias = grupo.instancias.length > 1;
                  const primeraInstancia = grupo.instancias[0];

                  return (
                    <React.Fragment key={`${categoria}-${grupo.nombre}`}>
                      {/* Fila del proceso */}
                      <tr 
                        className={tieneMultiplesInstancias ? "proceso-agrupado" : "proceso-simple"}
                        onClick={() => tieneMultiplesInstancias && toggleExpansion(`${categoria}-${grupo.nombre}`)}
                        style={{ cursor: tieneMultiplesInstancias ? 'pointer' : 'default' }}
                      >
                        <td>
                          {tieneMultiplesInstancias && (
                            <span className="expand-icon">
                              {estaExpandido ? '▼' : '▶'}
                            </span>
                          )}
                          <span className="proceso-nombre">{grupo.nombre}</span>
                          {tieneMultiplesInstancias && (
                            <span className="instance-count"> ({grupo.instancias.length})</span>
                          )}
                        </td>
                        <td>
                          {tieneMultiplesInstancias 
                            ? `${grupo.pids.length} procesos` 
                            : primeraInstancia.pid
                          }
                        </td>
                        <td>{primeraInstancia.usuario}</td>
                        <td className={grupo.totalCPU > 50 ? "high-cpu" : ""}>
                          {grupo.totalCPU.toFixed(1)}
                        </td>
                        <td>{grupo.totalMemoria.toFixed(1)}</td>
                        <td>
                          <span className={`badge badge-${primeraInstancia.estado.toLowerCase()}`}>
                            {primeraInstancia.estado}
                          </span>
                        </td>
                        <td>
                          {tieneMultiplesInstancias ? (
                            <span className="multiple-processes-indicator">
                              {estaExpandido ? 'Ocultar' : 'Expandir'}
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMatarProceso(primeraInstancia.pid);
                              }}
                              className="btn-kill"
                              title="Matar proceso"
                            >
                              ❌
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Instancias individuales */}
                      {estaExpandido && tieneMultiplesInstancias && grupo.instancias.map((instancia, index) => (
                        <tr key={`${categoria}-${grupo.nombre}-${instancia.pid}`} className="subproceso">
                          <td className="subproceso-indent">
                            └─ Instancia {index + 1}
                          </td>
                          <td>{instancia.pid}</td>
                          <td>{instancia.usuario}</td>
                          <td className={instancia.cpu > 50 ? "high-cpu" : ""}>
                            {instancia.cpu || 0}
                          </td>
                          <td>{instancia.memoria}</td>
                          <td>
                            <span className={`badge badge-${instancia.estado.toLowerCase()}`}>
                              {instancia.estado}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMatarProceso(instancia.pid);
                              }}
                              className="btn-kill btn-kill-small"
                              title={`Matar proceso ${instancia.pid}`}
                            >
                              ❌
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TablaProcesos;