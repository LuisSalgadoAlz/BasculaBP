import { URLHOST } from "../constants/global";

/* Fetching de los datos de clientes */
export const getClientes = async (fun) => {
  try {
    const response = await fetch(`${URLHOST}clientes/boletas`, {
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

/* Fetching de transportes (empresas) */
export const getTransporte = async (fun, id = "") => {
  try {
    const response = await fetch(
      `${URLHOST}transportes/boletas/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: window.localStorage.getItem("token"),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    fun(data);
  } catch (error) {
    console.error("Error al obtener los transporte:", error);
  }
};

/* Fetching de datos de motoristas */

export const getMotoristas = async (fun) => {
  try {
    const response = await fetch(`${URLHOST}motoristas/boletas`, {
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
    console.error("Error al obtener los mortoristas:", error);
  }
};

/* Fetching de datos para placas */

export const getPlacas = async (fun) => {
  try {
    const response = await fetch(`${URLHOST}placas/boletas`, {
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
    console.error("Error al obtener los placas:", error);
  }
};

export const getProcesos = async (fun) => {
  try {
    const response = await fetch(`${URLHOST}procesos/boletas`, {
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
    console.error("Error al obtener los procesos:", error);
  }
};

export const getOrigen = async (fun, url) => {
  try {
    const response = await fetch(`${URLHOST}origen/boletas`, {
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
    console.error("Error al obtener los procesos:", error);
  }
};

export const getDestino = async (fun, url) => {
  try {
    const response = await fetch(`${URLHOST}destino/boletas`, {
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
    console.error("Error al obtener los procesos:", error);
  }
};

export const getProductos = async (fun, url) => {
  try {
    const response = await fetch(`${URLHOST}producto/boletas`, {
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
    console.error("Error al obtener los procesos:", error);
  }
};

export const getTipoDePeso = async (fun, url) => {
  try {
    const response = await fetch(`${URLHOST}tipodepeso/boletas`, {
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
    console.error("Error al obtener los procesos:", error);
  }
};

export const getPeso = async (fun, url) => {
  try {
    const response = await fetch(`${URLHOST}peso`, {
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
    console.error("Error al obtener los procesos:", error);
  }
};
