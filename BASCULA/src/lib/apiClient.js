import { URLHOST } from "../constants/global";
import Cookies from 'js-cookie';

/**
 * ? Primero obtenemos el token para el backend
 */

const getAuthToken = () => Cookies.get('token') || '';

/**
 * 
 * @param {*} saveData Variable utilizada para los metodos set de useState()
 * @param {*} getUrl URL sin el host - http:host/api eso lo añade el metodo
 * @param {*} setLoading Loader de la solicitud del api
 * @param {*} options {method: post, put, patch, delete, body}
 * @returns 
 */

export const apiRequest = async (saveData, getUrl, setLoading, options = {}) => {
  
  const baprosaAPI = `${URLHOST}${getUrl}`;
  const { method = "GET", body } = options;
  
  try {
    if (setLoading) setLoading(true);
    
    const config = {
      method,
      headers: {
        Authorization: getAuthToken(),
      },
    };

    // Agregar Content-Type y body para métodos que lo requieren
    const methodsWithBody = ["POST", "PUT", "PATCH"];
    if (methodsWithBody.includes(method) && body) {
      config.headers["Content-Type"] = "application/json";
      config.body = JSON.stringify(body);
    }

    const response = await fetch(baprosaAPI, config);

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    if (saveData) saveData(data);
    
    console.log(`${method} ${baprosaAPI}`)
    return data;
  } catch (error) {
    console.error(`Error en ${baprosaAPI}`, error);
    throw error;
  } finally {
    if (setLoading) setLoading(false);
  }
};