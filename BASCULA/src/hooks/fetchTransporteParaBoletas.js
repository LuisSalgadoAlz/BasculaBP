const getTransporte = async ( fun, id='' ) => {
    try {
      const response = await fetch("http://localhost:3000/transportes/boletas", {
        method: 'GET',
        headers: {
          "Authorization": window.localStorage.getItem('token'),
        },
      });
  
      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }
  
      const data = await response.json();
      if (id) {
        const dataFilter = data.filter(el => el.idPlaca == id)
        console.log(dataFilter)
        return fun(dataFilter)
      }
      return fun(data)
    } catch (error) {
      console.error("Error al obtener los clientes:", error);
    }
  };
  
  export default getTransporte;
  