import { regexNombre, regexEmail, regexTelefono } from "../constants/regex";

export const getClientes = async (fun) => {
  try {
    const response = await fetch("http://localhost:3000/socios/", {
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

export const getClientesPorID = async (fun, id) => {
  try {
    const response = await fetch(`http://localhost:3000/socios/${id}`, {
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

export const getDireccionesPorSocios = async (fun, id) => {
  try {
    const response = await fetch(`http://localhost:3000/socios/direcciones/${id}`, {
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

export const postEmpresas = async (socio) => {
  try {
    const response = await fetch("http://localhost:3000/socios/", {
      method: "POST",
      body: JSON.stringify(socio),
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

export const getStatsSocios = async (fun) => {
  try {
    const response = await fetch("http://localhost:3000/socios/stats", {
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

export const updateSocios = async (socio, id) => {
  console.log(socio);
  try {
    const response = await fetch(`http://localhost:3000/socios/${id}`, {
      method: "PUT",
      body: JSON.stringify(socio),
      headers: {
        "Content-Type": "application/json",
        Authorization: window.localStorage.getItem("token"),
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

export const postDirecciones = async (direccion) => {
  try {
    const response = await fetch("http://localhost:3000/socios/direcciones", {
      method: "POST",
      body: JSON.stringify(direccion),
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

export const getDireccionesPorID = async (fun, id) => {
  try {
    const response = await fetch(`http://localhost:3000/socios/direcciones/f/${id}`, {
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

export const updateDireccionesPorID = async (direccion) => {
  try {
    const response = await fetch(`http://localhost:3000/socios/direcciones/pt/`, {
      method: "PUT",
      body: JSON.stringify(direccion),
      headers: {
        "Content-Type": "application/json",
        Authorization: window.localStorage.getItem("token"),
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

export const verificarData = (funSuccess,funError, data, setMsg, id) => {
  
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

  if (!regexEmail.test(correo) || correo == "" ) {
    funError(true)
    setMsg('correo permite letras, números, puntos, guiones. Además de ir acompañado de un @dominio.es / @dominio.com')
    return false
  }

  if (!regexTelefono.test(telefono) || telefono==""){
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