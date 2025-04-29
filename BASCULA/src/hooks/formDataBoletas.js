import { URLHOST } from "../constants/global";
import Cookies from 'js-cookie'
import { regexPlca } from "../constants/regex";

export const getAllDataForSelect = async (tipo, placa, socio, empresa, motorista,fun) => {
  try {
    const response = await fetch(`${URLHOST}boletas?tipo=${tipo}&placa=${placa}&socio=${socio}&empresa=${empresa}&motorista=${motorista}`, {
      method: "GET",
      headers: {
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    fun((prev)=> ({
      ...prev, ...data
    }));
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
  }
};

export const postBoletasNormal = async (boleta, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}boletas/newPlaca`, {
      method: "POST",
      body: JSON.stringify(boleta),
      headers: {
        "Content-Type": "application/json",
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  } finally {
    setIsLoading(false)
  }
};

export const getDataBoletas = async (fun, setIsLoading, search, searchDate, pagination) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}boletas/data?search=${search}&searchDate=${searchDate}&page=${pagination}`, {
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
    setIsLoading(false)
  }
};

export const getDataBoletasCompletadas = async (fun, setIsLoading, search, searchDate, pagination) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}boletas/data/completadas?search=${search}&searchDate=${searchDate}&page=${pagination}`, {
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
    setIsLoading(false)
  }
};

export const getDataBoletasPorID = async (id) => {
  try {
    const response = await fetch(`${URLHOST}boletas/boleta/${id}`, {
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
};

export const formaterDataNewPlaca = (formBoletas) => {
  const typeSocio = formBoletas?.Socios ==-998 ?  formBoletas?.Cliente : formBoletas?.Proveedor
  const allData = {
    idCliente : formBoletas?.Socios,
    socio: typeSocio,    
    idUsuario: Cookies.get('token'),
    idMotorista: formBoletas?.Motoristas,
    pesoInicial: formBoletas?.pesoIn,
    idPlaca: formBoletas?.Placa,
    idEmpresa: formBoletas?.Transportes,
  }
  return allData
}

export const getStatsBoletas = async (fun) => {
  try {
    const response = await fetch(`${URLHOST}boletas/stats`, {
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

export const getDataParaForm = async (setFormBoletas, data) => {
  const response = await getDataBoletasPorID(data.Id);
  const esClienteX = response.boletaType === 3;

  setFormBoletas((prev) => ({
    ...prev,
    Socios: response.idSocio ?? (esClienteX ? -998 : -999),
    valueSocio : response?.socio,
    Motoristas: response.idMotorista ?? response.motorista,
    Placa: response.placa,
    Proceso: '',
    Transportes: response.idEmpresa ?? response.empresa,
    Estado: 0,
    pesoIn: response.pesoInicial,
    pesoOut: 0,
    idBoleta: data.Id,
    tipoSocio: response?.clienteBoleta?.tipo,
  }));
};

export const updateBoletaOut = async (boleta, id, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}boletas/${id}`, {
      method: "PUT",
      body: JSON.stringify(boleta),
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
  } finally {
    setIsLoading(false)
  }
};

export const postBoletasCasulla = async (boleta, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}boletas/`, {
      method: "POST",
      body: JSON.stringify(boleta),
      headers: {
        "Content-Type": "application/json",
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  } finally {
    setIsLoading(false)
  }
};

export const getPrintEpson = async (id, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}boletas/historial/${id}`, {
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
  } finally{
    setTimeout(() => {  
      setIsLoading(false)
    }, 10000);
  }
};

export const updateCancelBoletas = async (boleta, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}boletas/cancelar/${boleta.Id}`, {
      method: "PUT",
      body: JSON.stringify(boleta),
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
  } finally {
    setIsLoading(false)
  }
};

/**
 * Area para calendario
 * Mes
 */
export const getBoletasMes = async (fun, start, end, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}boletas/calendario/mes?start=${start}&end=${end}`, {
      method: "GET",
      headers: {
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    fun(data)
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
  } finally {
    setIsLoading(false)
  }
};

/**
 * Area para calendario
 * Mes
 */
export const getTimeLineDetails = async (fun, fecha,setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}boletas/calendario/mes/detalles?fecha=${fecha}`, {
      method: "GET",
      headers: {
        Authorization: Cookies.get('token'),
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }

    const data = await response.json();
    fun(data)
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
  } finally{
    setIsLoading(false)
  }
};

/**
 * ! Area de formateadores 
 * ! Parte delicada No tocar mucho
 * @param {*} formBoletas 
 * @returns 
 */

export const formaterData = (formBoletas) => {
  const pesoNeto = Math.abs(formBoletas?.pesoOut - formBoletas?.pesoIn);
  const tolerancia = formBoletas['Peso Teorico'] * 0.005;
  const desviacion = Math.abs(pesoNeto) - formBoletas['Peso Teorico'];
  const absDesviacion = Math.abs(Math.abs(pesoNeto) - formBoletas['Peso Teorico'])
  const fueraTol = absDesviacion > tolerancia

  const allData = {
    idCliente : formBoletas?.Socios,
    boletaType: formBoletas?.Estado, 
    manifiesto: formBoletas?.Documento,
    ordenDeCompra : formBoletas['Orden de compra'], 
    pesoTeorico: formBoletas['Peso Teorico'],
    estado: fueraTol ? 'Completo(Fuera de tolerancia)' : 'Completado',
    idUsuario: Cookies.get('token'),
    idMotorista: formBoletas?.Motoristas,
    fechaFin: new Date(),
    pesoFinal: formBoletas?.pesoOut,
    idPlaca: formBoletas?.Placa,
    idEmpresa: formBoletas?.Transportes,
    idMovimiento: formBoletas?.Movimiento,
    idProducto: formBoletas?.Producto,
    observaciones: formBoletas?.Observaciones,
    proceso: formBoletas?.Proceso, 
    idTrasladoOrigen: formBoletas['Traslado origen'], 
    idTrasladoDestino: formBoletas['Traslado destino'], 
    idOrigen : formBoletas?.Origen,
    idDestino: formBoletas?.Destino,
    ordenDeTransferencia : formBoletas['Orden de Transferencia'] || null, 
    tipoSocio: formBoletas?.tipoSocio, 
    pesoNeto: pesoNeto, 
    desviacion: desviacion
  }
  return allData
}


export const verificarDataNewPlaca = (funError, data, setMsg) => {
  const {idCliente, idUsuario, idMotorista, idPlaca, idEmpresa, pesoInicial } = data 

  /* pesoInicial */

  if (!idCliente || !idUsuario || !idMotorista || !idPlaca || !idEmpresa) {
    funError(true)
    setMsg('Por favor, complete todos los campos antes de continuar.')
    return false
  }

  if (!regexPlca.test(idPlaca) && (idCliente ==-998 || idCliente ==-999)) {
    funError(true)
    setMsg('placa invalida. Formatos validos (particulares: 3 letras y 4 números | comerciales: 1 letra C, O o D + 6 números).')
    return false
  }
  
  if (pesoInicial <= 0 ) {
    funError(true)
    setMsg('Por favor, el peso inicial no debe de ser menor o igual a 0')
    return false
  }  

  return true
};

export const verificarDataCompleto = (funError, data, setMsg, pesoIn) => {
  const {
    idCliente,
    idDestino,
    idEmpresa,
    idMotorista,
    idMovimiento,
    idOrigen,
    idProducto,
    idTrasladoDestino,
    idTrasladoOrigen,
    manifiesto,
    ordenDeCompra,
    proceso, 
    ordenDeTransferencia,
    pesoFinal
  } = data;

  /* idPlaca observaciones ordenDeTransferencia pesoInicial pesoTeorico*/

  if(proceso == 0 && pesoIn<=pesoFinal){
    setMsg('Advertencia: peso inicial debe ser mayor al peso final)')
    funError(true)
    return false
  }

  if(proceso == 1 && pesoIn>=pesoFinal){
    setMsg('Advertencia: peso final debe ser mayor al peso de inicial)')
    funError(true)
    return false
  }
  
  if (!idCliente || !idEmpresa || !idMotorista || !idMovimiento || !idProducto) {
    setMsg('Por favor, ingresar todos los datos primer nivel: cliente, transporte, motorista, movimiento, producto')
    funError(true)
    return false
  }

  console.log(data)
  if ((idMovimiento==11 || idMovimiento==10) && (idTrasladoOrigen == idTrasladoDestino)) {
    setMsg('traslado origen y destino deben de ser diferentes')
    funError(true)
    return false
  }

  if ((idMovimiento!=11 && idMovimiento!=10) && (idOrigen == idDestino)) {
    setMsg('origen y destino deben de ser diferentes')
    funError(true)
    return false
  }

  if(proceso==0 && !ordenDeCompra){
    setMsg('Por favor, ingresar todos los datos segundo nivel: orden de compra')
    funError(true)
    return false
  }

  if(proceso==1 && !manifiesto){
    setMsg('Por favor, ingresar todos los datos tercer nivel: proceso, manifiesto')
     funError(true)
    return false
  }

  if ((idMovimiento==11 || idMovimiento==10) && !ordenDeTransferencia) {
    setMsg('Por favor, ingresar todos los datos cuarto nivel: orden de transferencia')
    funError(true)
    return false
  }

  if (pesoFinal <= 0) {
    setMsg('El peso final debe ser mayor que 0')
    funError(true)
    return false
  }

  return true
}