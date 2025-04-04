import { URLHOST } from "../constants/global";
import Cookies from 'js-cookie'

export const getAllDataForSelect = async (socios, empresa, placa, motorista, fun) => {
  try {
    const response = await fetch(`${URLHOST}boletas/?socios=${socios}&placa=${placa}&empresa=${empresa}&motorista=${motorista}`, {
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