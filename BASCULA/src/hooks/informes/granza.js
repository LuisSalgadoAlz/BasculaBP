import { URLHOST } from "../../constants/global";
import Cookies from 'js-cookie'

export const getDataForSelect = async (fun, setIsLoading, selected) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}informes/buques?typeImp=${selected.typeImp}&buque=${selected.buque}`, {
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

export const getResumenBFH = async (fun, setIsLoading, selected, factura, typeImp) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}informes/resumenBFH?buque=${selected}&factura=${factura}&typeImp=${typeImp}`, {
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

export const getBuquesDetalles = async (fun, setIsLoading, selected, page, factura, typeImp) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}informes/buquedetalles?buque=${selected}&page=${page}&factura=${factura}&typeImp=${typeImp}`, {
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

export const getStatsBuque = async (fun, setIsLoading, selected, factura, typeImp) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}informes/stats?buque=${selected}&factura=${factura}&typeImp=${typeImp}`, {
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