// Api.js - Servicio centralizado para todas las llamadas a la API
import axios from "axios";

// Configuración base de axios
const API = axios.create({
  baseURL: "http://127.0.0.1:8000", // URL base de tu backend FastAPI
  timeout: 30000, // Timeout de 10 segundos
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejar errores globalmente (opcional pero recomendado)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error en la API:", error.message);
    // Aquí puedes agregar lógica para mostrar notificaciones al usuario
    return Promise.reject(error);
  }
);

// 📊 Servicios para Stats
export const statsService = {
  // Obtener estadísticas del sistema
  obtenerStats: async () => {
    try {
      const response = await API.get("/stats");
      return response.data;
    } catch (error) {
      console.error("Error al obtener stats:", error);
      throw error;
    }
  },
};

// ⚙️ Servicios para Procesos
export const procesosService = {
  // Obtener todos los procesos
  obtenerProcesos: async () => {
    try {
      const response = await API.get("/procesos");
      return response.data;
    } catch (error) {
      console.error("Error al cargar procesos:", error);
      throw error;
    }
  },

  // Obtener un proceso específico por PID
  obtenerProcesoPorPid: async (pid) => {
    try {
      const response = await API.get(`/procesos/${pid}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener proceso ${pid}:`, error);
      throw error;
    }
  },

  // Matar un proceso (si tu API lo soporta)
  matarProceso: async (pid) => {
    try {
      const response = await API.delete(`/procesos/${pid}`);
      return response.data;
    } catch (error) {
      console.error(`Error al matar proceso ${pid}:`, error);
      throw error;
    }
  },
};

// 🔄 Servicio combinado para cargar todos los datos a la vez
export const cargarTodosLosDatos = async () => {
  try {
    const [stats, procesos] = await Promise.all([
      statsService.obtenerStats(),
      procesosService.obtenerProcesos(),
    ]);
    
    return { stats, procesos };
  } catch (error) {
    console.error("Error al cargar datos:", error);
    throw error;
  }
};

// Exportar la instancia de axios por si necesitas usarla directamente
export default API;