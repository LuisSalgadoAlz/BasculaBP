import {URLHOST} from '../../constants/global'
import Cookies from 'js-cookie'

export const getMetrics = async (fun, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}admin/metrics`, {
      method: "GET",
      headers: {
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    fun(data[0]);
  } catch (error) {
    console.error("Error al obtener las metricas:", error);
  } finally {
    setIsLoading(false)
  }
};


export const getSpaceForTable = async (fun, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}admin/spaceTables`, {
      method: "GET",
      headers: {
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    fun(data);
  } catch (error) {
    console.error("Error al obtener las metricas:", error);
  } finally {
    setIsLoading(false)
  }
};


export const getLogs = async (fun, setIsLoading, categoria, user, search) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}admin/logs?cat=${categoria}&user=${user}&search=${search}`, {
      method: "GET",
      headers: {
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    fun(data);
  } catch (error) {
    console.error("Error al obtener las metricas:", error);
  } finally {
    setIsLoading(false)
  }
};

export const getStatsOfLogs = async (fun, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}admin/stats`, {
      method: "GET",
      headers: {
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    fun(data);
  } catch (error) {
    console.error("Error al obtener las metricas:", error);
  } finally {
    setIsLoading(false)
  }
};

export const getUserForSelect = async (fun) => {
  try {
    const response = await fetch(`${URLHOST}admin/usuarios`, {
      method: "GET",
      headers: {
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    fun(data);
  } catch (error) {
    console.error("Error al obtener las metricas:", error);
  }
};