/* Fetching de los datos de clientes */
export const getClientes = async (fun) => {
  try {
    const response = await fetch("http://localhost:3000/clientes/boletas", {
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
      `http://localhost:3000/transportes/boletas/${id}`,
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
    const response = await fetch("http://localhost:3000/motoristas/boletas", {
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
    const response = await fetch("http://localhost:3000/placas/boletas", {
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
    const response = await fetch("http://localhost:3000/procesos/boletas", {
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

