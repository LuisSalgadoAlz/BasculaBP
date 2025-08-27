import { URLHOST } from "../../constants/global";
import Cookies from 'js-cookie'

export const getDataCasulla = async (fun, setIsLoading, filters) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}informes/casulla/data?dateIn=${filters.dateIn}&dateOut=${filters.dateOut}`, {
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