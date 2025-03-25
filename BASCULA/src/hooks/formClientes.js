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
  console.log(socio)
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
      return true
    }

  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
};


/* Expresiones regulares verificacion */
