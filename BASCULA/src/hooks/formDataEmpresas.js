import { URLHOST } from "../constants/global";
import { regexEmail, regexNombre, regexTelefono, regexPlca } from "../constants/regex";
import Cookies from 'js-cookie'

export const getEmpresas = async (fun, page, search, estado, setIsloading) => {
  try {
    setIsloading(true)
    const response = await fetch(`${URLHOST}empresas?page=${page}&search=${search}&estado=${estado}`, {
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
    setIsloading(false)
  }
};

export const getSociosParaSelect = async (fun) => {
  try {
    const response = await fetch(`${URLHOST}empresas/socios`, {
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


export const postEmpresas = async (empresa, setIsloading) => {
  setIsloading(true)
  try {
    const response = await fetch(`${URLHOST}empresas/`, {
      method: "POST",
      body: JSON.stringify(empresa),
      headers: {
        "Content-Type": "application/json",
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  } finally{
    setIsloading(false)
  }
};

export const getStatsEmpresas= async (fun) => {
  try {
    const response = await fetch(`${URLHOST}empresas/stats`, {
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

export const getEmpresasPorId = async (fun, id) => {
  try {
    const response = await fetch(`${URLHOST}empresas/${id}`, {
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


export const updateEmpresas = async (empresa, id, setIsloading) => {
  setIsloading(true)
  try {
    const response = await fetch(`${URLHOST}empresas/${id}`, {
      method: "PUT",
      body: JSON.stringify(empresa),
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
  } finally {
    setIsloading(false)
  }
};

export const getVehiculosPorEmpresas = async (fun, id, setIsloading)=>{
  try {
    setIsloading(true)
      const response = await fetch(`${URLHOST}empresas/vehiculos/${id}`, {
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
      setIsloading(false)
    }
}

export const postVehiculosPorEmpresas = async (vehiculos) => {
  try {
    const response = await fetch(`${URLHOST}empresas/vehiculos`, {
      method: "POST",
      body: JSON.stringify(vehiculos),
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

export const verificarListadoDeVehiculos = async (placa,idEmpresa) => {
  try {
    const response = await fetch(`${URLHOST}empresas/vehiculos/v/data?placa=${placa}&id=${idEmpresa}`, {
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
}

export const updateVehiculosPorEmpresas = async (vehiculo, idEmpresa) => {
  try {
    const response = await fetch(`${URLHOST}empresas/vehiculos/u/${idEmpresa}`, {
      method: "PUT",
      body: JSON.stringify(vehiculo),
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

export const getMotoristasPorEmpresas = async (fun, id, setIsloading)=>{
  try {
      setIsloading(true)
      const response = await fetch(`${URLHOST}empresas/motoristas/${id}`, {
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
      setIsloading(false)
    }
}

/**
 * 
 * TODO: Parte de motoristas
 */

export const postMotoristasDeLaEmpresa = async (motoristas, setIsloading) => {
  setIsloading(true)
  try {
    const response = await fetch(`${URLHOST}empresas/motoristas`, {
      method: "POST",
      body: JSON.stringify(motoristas),
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
    setIsloading(false)
  }
};


export const updateMotoristasPorEmpresa = async (motoristas, idEmpresa, setIsloading) => {
  setIsloading(true)
  try {
    const response = await fetch(`${URLHOST}empresas/motoristas/${idEmpresa}`, {
      method: "PUT",
      body: JSON.stringify(motoristas),
      headers: {
        "Content-Type": "application/json",
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    if (response.ok) {
      const data = await response.json()
      return data;
    }
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  } finally {
    setIsloading(false)
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

  if (!regexEmail.test(email) && email ) {
    funError(true)
    setMsg('correo permite letras, números, puntos, guiones. Además de ir acompañado de un @dominio.es / @dominio.com')
    return false
  }

  if (!regexTelefono.test(telefono) && telefono){
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


export const verificarDataDeMotoristas = (funError, data, setMsg) => {
  
  const { nombre, correo, telefono, estado } = data 

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

  if (!regexTelefono.test(telefono) && telefono){
    funError(true)
    setMsg('numero ingresado invalido o no ingresado (debe iniciar con 2 / 3 / 8 y 9) y tener 8 digitos. Ej: 22222222')
    return false
  }

  if (!regexEmail.test(correo) && correo ) {
    funError(true)
    setMsg('correo permite letras, números, puntos, guiones. Además de ir acompañado de un @dominio.es / @dominio.com')
    return false
  }

  return true
};


/**
 * 
 * @param {*} funErr 
 * @param {*} data 
 * @param {*} setMsg 
 * @returns Bolean
 */
export const verificarDataVehiculos = (funErr, data, setMsg) => {
  const { placa, pesoMaximo, tipo, estado } = data

  /* Placas */
  if (!regexPlca.test(placa) || placa == "") {
    funErr(true)
    setMsg('Placa inválida. Formatos válidos: Honduras (ABC1234 o C123456), El Salvador y Nicaragua (una letra seguida de 6 números, como M123456), Guatemala (123ABC o P123ABC).');
    return false
  }
  
  if(pesoMaximo <0) {
    funErr(true)
    setMsg('peso no puede ser negativo')
    return false
  }

  if(tipo==-1) {
    funErr(true)
    setMsg('seleccione un tipo de vehiculo.')
    return false
  }
  
  if (estado == -1){
    funErr(true)
    setMsg('seleccione un estado de direccion.')
    return false
  }

  /* Parte de las validaciones de las placas */

  return true
}