export const getEmpresas = async (fun) => {
    try {
      const response = await fetch("http://localhost:3000/empresas/", {
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
      const response = await fetch("http://localhost:3000/empresas/", {
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
  