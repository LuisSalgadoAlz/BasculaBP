import {URLHOST} from '../../constants/global'
import Cookies from 'js-cookie'
import { regexEmail } from '../../constants/regex';

const typesOfUsers = ['VACIO','BASCULA', 'CONTABILIDAD', 'TOLVA', 'ADMINISTRADOR']
const typesOfState = [0,true, false]

export const getMetrics = async (fun, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}admin/metrics`, {
      method: "GET",
      headers: {
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    fun(data[0]);
  } catch (error) {
    console.error("Error al obtener las metricas:", error);
  } finally {
    setIsLoading(false)
  }
};


export const getSpaceForTable = async (fun, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}admin/spaceTables`, {
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
    console.error("Error al obtener las metricas:", error);
  } finally {
    setIsLoading(false)
  }
};


export const getLogs = async (fun, setIsLoading, categoria, user, search, pagination, date) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}admin/logs?cat=${categoria}&user=${user}&search=${search}&page=${pagination}&date=${date}`, {
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
    console.error("Error al obtener las metricas:", error);
  } finally {
    setIsLoading(false)
  }
};

export const getStatsOfLogs = async (fun, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}admin/stats`, {
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
    console.error("Error al obtener las metricas:", error);
  } finally {
    setIsLoading(false)
  }
};

export const getUserForSelect = async (fun) => {
  try {
    const response = await fetch(`${URLHOST}admin/usuarios`, {
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
    console.error("Error al obtener las metricas:", error);
  }
};

export const getUsers = async (fun, setIsLoading, search, tipo, estado, page) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}usuarios?search=${search}&tipo=${tipo}&estado=${estado}&page=${page}`, {
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
    console.error("Error al obtener las metricas:", error);
  }finally {
    setIsLoading(false)
  }
};

export const postUsers = async (formUsers) => {
  const newUser = { 
    name: formUsers?.Nombre, 
    usuarios: formUsers?.Usuario, 
    email: formUsers?.Gmail, 
    tipo: typesOfUsers[formUsers?.Tipo], 
    contrasena: formUsers?.Contraseña, 
  }

  if (!newUser.name || !newUser.usuarios || !newUser.tipo || !newUser.contrasena) {
    return {msgErr: 'datos del formulario se encuentan vacia'}
  }

  if (!regexEmail.test(newUser.email) && newUser.email) {
    return {
      msgErr: 'correo permite letras, números, puntos, guiones. Además de ir acompañado de un @dominio.es / @dominio.com'
    }
  }

  try {
    const response = await fetch(`${URLHOST}usuarios/`, {
      method: "POST",
      body: JSON.stringify(newUser),
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
}

export const updateUsers = async (formUsers) => {
  const updateUser = { 
    name: formUsers?.Nombre, 
    usuarios: formUsers?.Usuario, 
    email: formUsers?.Gmail, 
    tipo: typesOfUsers[formUsers?.Tipo], 
    ...(formUsers?.nuevaContraseña ? {contrasena: formUsers?.nuevaContraseña} : {}), 
    estado: typesOfState[formUsers?.Estado]
  }

  if (!regexEmail.test(updateUser.email) && updateUser.email) {
    return {
      msgErr: 'correo permite letras, números, puntos, guiones. Además de ir acompañado de un @dominio.es / @dominio.com'
    }
  }

  try {
    const response = await fetch(`${URLHOST}usuarios/${formUsers?.Id}`, {
      method: "PUT",
      body: JSON.stringify(updateUser),
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
}

export const getStasUsers = async (fun) => {
  try {
    const response = await fetch(`${URLHOST}usuarios/stats`, {
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
    console.error("Error al obtener las metricas:", error);
  } 
};