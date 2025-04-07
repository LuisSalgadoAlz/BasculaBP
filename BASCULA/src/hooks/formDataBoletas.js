import { URLHOST } from "../constants/global";
import Cookies from 'js-cookie'

export const getAllDataForSelect = async (tipo, placa, socio, empresa, fun) => {
  try {
    const response = await fetch(`${URLHOST}boletas?tipo=${tipo}&placa=${placa}&socio=${socio}&empresa=${empresa}`, {
      method: "GET",
      headers: {
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    fun((prev)=> ({
      ...prev, ...data
    }));
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
  }
};