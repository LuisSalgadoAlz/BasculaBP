import { URLHOST } from '../../constants/global'
import Cookies from 'js-cookie'


export const getDataPlaca = async (fun, placa) => {
  try {
    const response = await fetch(`${URLHOST}guardia/buscarPlaca?placa=${placa}`, {
      method: "GET",
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
    console.error("Error al obtener los clientes:", error);
  }
};

export const updatePaseSalida = async (id, setIsLoading) => {
  setIsLoading(true)
  try {
    const response = await fetch(`${URLHOST}guardia/upd/pase/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const msg = await response.json()
    return msg;

  } catch (error) {
    console.error("Error al obtener los datos:", error);
  } finally {
    setIsLoading(false)
  }
};
