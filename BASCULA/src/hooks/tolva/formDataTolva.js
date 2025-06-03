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
