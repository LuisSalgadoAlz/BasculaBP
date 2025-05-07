import { URLHOST } from "../constants/global";
import Cookies from 'js-cookie'

export const getHistorialBoletas = async (fun, formFiltros = {},setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}boletas/historial?movimiento=${formFiltros?.movimiento}&producto=${formFiltros?.producto}&dateIn=${formFiltros?.dateIn}&dateOut=${formFiltros?.dateOut}&socios=${formFiltros?.socio}`, {
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

export const getDataForSelect = async (fun) => {
  try {
    const response = await fetch(`${URLHOST}boletas/informes`, {
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