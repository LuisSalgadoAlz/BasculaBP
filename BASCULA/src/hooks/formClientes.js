import { regexNombre, regexEmail, regexTelefono } from "../constants/regex";
import {URLHOST} from '../constants/global'
import Cookies from 'js-cookie'

/**
 * 
 * @param {*} fun 
 * @param {*} page 
 * @param {*} search 
 * @param {*} tipo 
 * 
 */
export const getClientes = async (fun, page, search, tipo, estado, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}socios?page=${page}&search=${search}&tipo=${tipo}&estado=${estado}`, {
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

/**
 * 
 * @param {*} fun funcion que retorna un valor al estado del componente padre
 * @param {*} id 
 * 
 */

export const getClientesPorID = async (fun, id) => {
  try {
    const response = await fetch(`${URLHOST}socios/${id}`, {
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

/**
 * 
 * @param {*} fun funcion que retorna un valor al estado del componente padre
 * @param {*} id 
 */

export const getDireccionesPorSocios = async (fun, id, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}socios/direcciones/${id}`, {
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

/**
 * 
 * @param {*} socio obj que contiene los datos
 */

export const postEmpresas = async (socio) => {
  try {
    const response = await fetch(`${URLHOST}socios/`, {
      method: "POST",
      body: JSON.stringify(socio),
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
  }
};

/**
 * 
 * @param {*} fun funcion que retorna un valor al estado del componente padre
 */

export const getStatsSocios = async (fun) => {
  try {
    const response = await fetch(`${URLHOST}socios/stats`, {
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

/**
 * 
 * @param {*} socio 
 * @param {*} id 
 * @returns 
 * 
 * funcion que actualiza por id un socio
 */

export const updateSocios = async (socio, id) => {
  try {
    const response = await fetch(`${URLHOST}socios/${id}`, {
      method: "PUT",
      body: JSON.stringify(socio),
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
  }
};

/**
 * 
 * @param {*} direccion 
 * 
 * funcion para guardar direcciones
 */

export const postDirecciones = async (direccion) => {
  try {
    const response = await fetch(`${URLHOST}socios/direcciones`, {
      method: "POST",
      body: JSON.stringify(direccion),
      headers: {
        "Content-Type": "application/json",
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
};

/**
 * 
 * @param {*} fun 
 * @param {*} id
 * 
 * funcion para obtener por id las direciones  
 */

export const getDireccionesPorID = async (fun, id) => {
  try {
    const response = await fetch(`${URLHOST}socios/direcciones/f/${id}`, {
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

/**
 * 
 * @param {*} direccion 
 * @returns 
 * 
 * funcion para actualizar direccoines
 */

export const updateDireccionesPorID = async (direccion) => {
  try {
    const response = await fetch(`${URLHOST}socios/direcciones/pt/`, {
      method: "PUT",
      body: JSON.stringify(direccion),
      headers: {
        "Content-Type": "application/json",
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    if (response.ok) {
      return true;
    }
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
};

/* Expresiones regulares verificacion */

export const verificarData = (funSuccess,funError, data, setMsg,) => {
  
  const { nombre, tipo, correo, telefono, estado} = data 

  if (!regexNombre.test(nombre) || nombre == "" || nombre.length < 2) {
    funError(true)
    setMsg('nombre invalido, vacio o demasiado corto.')
    return false
  }

  if(tipo==-1) {
    funError(true)
    setMsg('seleccione un tipo de socio.')
    return false
  }

  if(estado && estado==-1) {
    funError(true)
    setMsg('seleccione un estado.')
    return false
  }

  /**
   * ? Como el campo es unico tiene que validarse que no exista en la base de datos!
   */
  if (!regexEmail.test(correo) && correo) {
    funError(true)
    setMsg('correo permite letras, números, puntos, guiones. Además de ir acompañado de un @dominio.es / @dominio.com')
    return false
  }

  if (!regexTelefono.test(telefono) && telefono){
    funError(true)
    setMsg('numero ingresado invalido (debe iniciar con 2 / 3 / 8 y 9) y tener 8 digitos. Ej: 22222222')
    return false
  }

  return true

};

export const verificarDirecciones = (funErr, data, setMsg) => {
  const { nombre, tipo, estado } = data
  if (!regexNombre.test(nombre) || nombre == "" || nombre.length < 2) {
    funErr(true)
    setMsg('nombre invalido o vacio o demasiado corto.')
    return false
  }

  if(tipo==-1) {
    funErr(true)
    setMsg('seleccione un tipo de direccion.')
    return false
  }
  
  if (estado == -1){
    funErr(true)
    setMsg('seleccione un estado de direccion.')
    return false
  }

  return true
}