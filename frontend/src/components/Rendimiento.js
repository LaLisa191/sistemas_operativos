import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './Rendimiento.css';

const Rendimiento = ({ onVolver, procesos = [] }) => {
  const [historicoCPU, setHistoricoCPU] = useState([]);
  const [historicoMemoria, setHistoricoMemoria] = useState([]);
  const [topProcesos, setTopProcesos] = useState([]);

  useEffect(() => {
    // Simulación de datos históricos
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const cpuActual = Math.random() * 100;
      const memoriaActual = Math.random() * 100;

      setHistoricoCPU(prev => {
        const nuevo = [...prev, { tiempo: timestamp, cpu: cpuActual }];
        return nuevo.slice(-20); // Mantener solo los últimos 20 puntos
      });

      setHistoricoMemoria(prev => {
        const nuevo = [...prev, { tiempo: timestamp, memoria: memoriaActual }];
        return nuevo.slice(-20);
      });

      // Top 5 procesos por CPU
      if (procesos.length > 0) {
        const top = [...procesos]
          .sort((a, b) => b.cpu - a.cpu)
          .slice(0, 5)
          .map(p => ({
            nombre: p.nombre.substring(0, 15),
            cpu: p.cpu,
            memoria: p.memoria
          }));
        setTopProcesos(top);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [procesos]);

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#1a1a2e',
      minHeight: '100vh',
      color: '#fff'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ margin: 0 }}>Análisis de Rendimiento</h1>
        <button
          onClick={onVolver}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4a5568',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ← Volver
        </button>
      </div>

      {/* Gráfica de CPU */}
      <div style={{
        backgroundColor: '#16213e',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ marginTop: 0 }}>Uso de CPU en Tiempo Real</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historicoCPU}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="tiempo" stroke="#aaa" />
            <YAxis stroke="#aaa" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#2d3748',
                border: 'none',
                borderRadius: '5px',
                color: '#fff'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="cpu"
              stroke="#4299e1"
              strokeWidth={2}
              dot={false}
              name="CPU %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfica de Memoria */}
      <div style={{
        backgroundColor: '#16213e',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ marginTop: 0 }}>Uso de Memoria en Tiempo Real</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historicoMemoria}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="tiempo" stroke="#aaa" />
            <YAxis stroke="#aaa" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#2d3748',
                border: 'none',
                borderRadius: '5px',
                color: '#fff'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="memoria"
              stroke="#48bb78"
              strokeWidth={2}
              dot={false}
              name="Memoria %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Procesos */}
      {topProcesos.length > 0 && (
        <div style={{
          backgroundColor: '#16213e',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ marginTop: 0 }}>Top 5 Procesos por CPU</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProcesos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="nombre" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2d3748',
                  border: 'none',
                  borderRadius: '5px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar dataKey="cpu" fill="#f56565" name="CPU %" />
              <Bar dataKey="memoria" fill="#ed8936" name="Memoria %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Rendimiento;