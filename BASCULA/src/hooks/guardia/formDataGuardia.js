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