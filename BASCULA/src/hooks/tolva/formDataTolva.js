import {URLHOST} from '../../constants/global'
import Cookies from 'js-cookie'

export const postAnalizarQR = async (img, setIsLoading) => {
  try {
    setIsLoading(true)
    const formData = new FormData()
    formData.append('image', img.file)

    const response = await fetch(`${URLHOST}tolva/analizar-qr`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    return data
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  } finally {
    setIsLoading(false)
  }
};

export const getDataSelectSilos = async (fun) => {
  try {
    const response = await fetch(`${URLHOST}tolva/silos`, {
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
  }
};

export const updateSilos = async (silo, id, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}tolva/add/silo/${id}`, {
      method: "PUT",
      body: JSON.stringify(silo),
      headers: {
        "Content-Type": "application/json",
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const msg = await response.json()

    if (response.ok) {
      return msg;
    }
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  } finally {
    setIsLoading(false)
  }
};

export const getDataAsign = async (fun, setIsLoading, pagination) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}tolva/silosForTime?page=${pagination }`, {
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
  } finally {
    setIsLoading(false)
  }
};

export const getStatsTolvaDiarias = async (fun) => {
  try {
    const response = await fetch(`${URLHOST}tolva/stats`, {
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
  } 
};