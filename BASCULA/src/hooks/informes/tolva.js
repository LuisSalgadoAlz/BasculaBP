import { URLHOST } from "../../constants/global";
import Cookies from 'js-cookie'

export const getInfoSilos = async (fun, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}tolva/info/silos`, {
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


export const postCreateNewReset = async (siloInfo, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}tolva/newReset`, {
      method: "POST",
      body: JSON.stringify(siloInfo),
      headers: {
        "Content-Type": "application/json",
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  } finally {
    setIsLoading(false)
  }
};


export const getStatsSilosForBuques = async (fun, setIsLoading, buque='', factura='') => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}tolva/info/statsTolvas?buque=${buque}&factura=${factura}`, {
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


export const getHistoricoViajes = async (fun, setIsLoading, buque='', factura='') => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}tolva/info/historicoViajes?buque=${buque}&factura=${factura}`, {
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