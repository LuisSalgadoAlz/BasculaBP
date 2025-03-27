import { URLHOST } from "../constants/global";
import { regexEmail, regexNombre, regexTelefono } from "../constants/regex";

export const getEmpresas = async (fun, page, search, estado) => {
  try {
    const response = await fetch(`${URLHOST}empresas?page=${page}&search=${search}&estado=${estado}`, {
      method: "GET",
      headers: {
        Authorization: window.localStorage.getItem("token"),
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

export const getSociosParaSelect = async (fun) => {
  try {
    const response = await fetch(`${URLHOST}empresas/socios`, {
      method: "GET",
      headers: {
        Authorization: window.localStorage.getItem("token"),
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


export const postEmpresas = async (empresa) => {
  try {
    const response = await fetch(`${URLHOST}empresas/`, {
      method: "POST",
      body: JSON.stringify(empresa),
      headers: {
        "Content-Type": "application/json",
        Authorization: window.localStorage.getItem("token"),
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

export const getStatsEmpresas= async (fun) => {
  try {
    const response = await fetch(`${URLHOST}empresas/stats`, {
      method: "GET",
      headers: {
        Authorization: window.localStorage.getItem("token"),
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

export const getEmpresasPorId = async (fun, id) => {
  try {
    const response = await fetch(`${URLHOST}empresas/${id}`, {
      method: "GET",
      headers: {
        Authorization: window.localStorage.getItem("token"),
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
 * Validaciones de los forms
 * 
 */

export const verificarData = (funError, data, setMsg) => {
  
  const { nombre, email, telefono, estado, idSocios} = data 

  if (!regexNombre.test(nombre) || nombre == "" || nombre.length < 2) {
    funError(true)
    setMsg('nombre invalido, vacio o demasiado corto.')
    return false
  }

  if(estado && estado==-1) {
    funError(true)
    setMsg('seleccione un estado.')
    return false
  }

  if (!regexEmail.test(email) || email == "" ) {
    funError(true)
    setMsg('correo permite letras, números, puntos, guiones. Además de ir acompañado de un @dominio.es / @dominio.com')
    return false
  }

  if (!regexTelefono.test(telefono) || telefono==""){
    funError(true)
    setMsg('numero ingresado invalido o no ingresado (debe iniciar con 2 / 3 / 8 y 9) y tener 8 digitos. Ej: 22222222')
    return false
  }

  if(!idSocios){
    funError(true)
    setMsg('no seleccionar a ningun socio para el transporte')
    return false
  }

  return true

};