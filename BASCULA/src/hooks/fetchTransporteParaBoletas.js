const getTransporte = async ( fun, idnfcdo='') => {
    try {
      console.log(`http://localhost:3000/transportes/boletas/${idnfcdo}`)
      const response = await fetch(`http://localhost:3000/transportes/boletas/${idnfcdo}`, {
        method: 'GET',
        headers: {
          "Authorization": window.localStorage.getItem('token'),
        },
      });
  
      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }
  
      const data = await response.json();
      fun(data)
    } catch (error) {
      console.error("Error al obtener los clientes:", error);
    }
  };
  
  export default getTransporte;
  