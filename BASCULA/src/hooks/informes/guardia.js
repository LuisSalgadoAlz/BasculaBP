import { URLHOST } from "../../constants/global";
import Cookies from 'js-cookie'

export const getPorcentajeDeCumplimiento = async (fun, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}guardia/porcentajeCumplimiento`, {
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
    console.error("Error al obtener los clientes:", error);
  } finally{
    setIsLoading(false)
  }
};

export const getPorcentajeMes = async (fun, start, end, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}guardia/calendario/mes?start=${start}&end=${end}`, {
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
    console.error("Error al obtener los clientes:", error);
  } finally{
    setIsLoading(false)
  }
};

export const getPorcentajeMesPorDia = async (fun, start, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}guardia/calendario/dia?fecha=${start}`, {
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
    console.error("Error al obtener los clientes:", error);
  } finally{
    setIsLoading(false)
  }
};

export const getBoletasPorDia = async (fun, setIsLoading, boleta) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}guardia/calendario/dia`, {
      method: "POST",
      body: JSON.stringify({boleta}),
      headers: {
        "Content-Type": "application/json",
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    fun(data);
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
  } finally{
    setIsLoading(false)
  }
};

export const getStatsServicioBascula = async (fun, setIsLoading, filters) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}guardia/servicioBascula/stats?dateIn=${filters.dateIn}&dateOut=${filters.dateOut}`, {
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
    console.error("Error al obtener los clientes:", error);
  } finally{
    setIsLoading(false)
  }
};

export const getBoletasServicioBascula = async (fun, setIsLoading, filters) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}guardia/servicioBascula/boletas?dateIn=${filters.dateIn}&dateOut=${filters.dateOut}`, {
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
    console.error("Error al obtener los clientes:", error);
  } finally{
    setIsLoading(false)
  }
};