import { URLHOST } from '../../constants/global'
import Cookies from 'js-cookie'

export const postEnviarMensajeDeSoporte = async (soporte, setLoading) => {
  try {
    setLoading(true)
    const response = await fetch(`${URLHOST}soporte/`, {
      method: "POST",
      body: JSON.stringify(soporte),
      headers: {
        "Content-Type": "application/json",
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
    setLoading(false)
  }
};
