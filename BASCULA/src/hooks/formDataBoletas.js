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

export const getDataBoletasPorID = async (id, setIsLoading) => {
  try {
    setIsLoading(true)
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
  } finally {
    setIsLoading(false)
  }
};

export const formaterDataNewPlaca = (formBoletas, marchamos) => {
  const typeSocio = formBoletas?.Socios ==-998 ?  formBoletas?.Cliente : formBoletas?.Proveedor
  console.log(formBoletas)
  const allData = {
    proceso: formBoletas?.Proceso, 
    idCliente : formBoletas?.Socios,
    socio: typeSocio,    
    idUsuario: Cookies.get('token'),
    idMotorista: formBoletas?.Motoristas,
    pesoInicial: formBoletas?.pesoIn,
    idPlaca: formBoletas?.Placa,
    idEmpresa: formBoletas?.Transportes,
    ...(formBoletas?.Proceso == 0 && {
      idProducto: formBoletas?.Producto|| null, 
      idMovimiento: formBoletas?.Movimiento ||  null,
      ...((formBoletas?.Movimiento==10 || formBoletas?.Movimiento==11) && {
        idTrasladoOrigen: formBoletas['Traslado Origen'],
      }),
      ...((formBoletas?.Movimiento!=10 && formBoletas?.Movimiento!=11) && {
        idOrigen: formBoletas?.Origen || null, 
      }),
      NSalida: formBoletas?.NSalida || null, 
      NViajes:  formBoletas.NViajes  || null, 
      ...(formBoletas?.Movimiento==2 && {
        sello1 : marchamos[0] || null,
        sello2 : marchamos[1] || null,
        sello3 : marchamos[2] || null,
        sello4 : marchamos[3] || null,
        sello5 : marchamos[4] || null,
        sello6 : marchamos[5] || null,
      })
    })
  }
  console.log(allData)
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

/**
 * !Error solucionado ( PROBAR )
 * @param {} setFormBoletas 
 * @param {*} data 
 * @param {*} setMove 
 */
export const getDataParaForm = async (setFormBoletas, data, setMove, setIsLoading) => {
  const response = await getDataBoletasPorID(data.Id, setIsLoading);
  const esClienteX = response.boletaType === 3;
  setMove(response?.movimiento)
  console.log(response)
  setFormBoletas((prev) => ({
    ...prev,
    Socios: response.idSocio ?? (esClienteX ? -998 : -999),
    valueSocio : response?.socio,
    Motoristas: response.idMotorista ?? response.motorista,
    Placa: response.placa,
    Proceso: response.proceso,
    Producto: response.idProducto,
    Movimiento: response.idMovimiento,
    Origen: response.idOrigen || response.origen, 
    'Traslado origen' : response.idTrasladoOrigen,
    Transportes: response.idEmpresa ?? response.empresa,
    Estado: 0,
    pesoIn: response.pesoInicial,
    pesoOut: 0,
    idBoleta: data.Id,
    tipoSocio: response?.clienteBoleta?.tipo,
  }));
};

export const updateBoletaOut = async (boleta, id) => {
  try {
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

export const getPrintEpson = async (id, setIsLoading, types) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}boletas/historial/${id}?type=${types}`, {
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
    }, 2000);
  }
};

export const getReimprimirTicketTolva = async (id, setIsLoading) => {
  try {
    setIsLoading(true)
    const response = await fetch(`${URLHOST}boletas/reimprimir/ticket?id=${id}`, {
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
    }, 2000);
  }
};

export const getConvertPdf = async (id) => {
  try {
    const response = await fetch(`${URLHOST}boletas/pdf/bol/${id}`, {
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

export const getToleranciaValue = async () => {
  try {
    const response = await fetch(`${URLHOST}boletas/config/tolerancia`, {
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

export const formaterData = (formBoletas, valor, marchamos) => {
  const pesoNeto = Math.abs(formBoletas?.pesoOut - formBoletas?.pesoIn);

  const tolerancia = (formBoletas['Peso Teorico']) ? (formBoletas['Peso Teorico'] * valor) : 0;
  const desviacion = (formBoletas['Peso Teorico']) ? (Math.abs(pesoNeto) - formBoletas['Peso Teorico']) : 0;
  const absDesviacion = (formBoletas['Peso Teorico']) ? Math.abs(Math.abs(pesoNeto) - formBoletas['Peso Teorico']) : 0
  const fueraTol = (formBoletas['Peso Teorico']) ? (absDesviacion > tolerancia) : false
  
  const allSellos = marchamos.slice(0, 6).reduce((acc, sello, index) => {
    acc[`sello${index + 1}`] = sello;
    return acc;
  }, {});

  const allData = {
    idCliente : formBoletas?.Socios,
    boletaType: formBoletas?.Estado, 
    manifiesto: formBoletas?.Documento ? formBoletas?.Documento : 0,
    ordenDeCompra : formBoletas['Orden de compra'] ? formBoletas['Orden de compra'] : 0, 
    pesoTeorico: formBoletas['Peso Teorico'] ?formBoletas['Peso Teorico'] : 0,
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
    desviacion: desviacion, 
    allSellos,
  }
  console.log(allData)
  return allData
}


export const verificarDataNewPlaca = (funError, data, setMsg, marchamos) => {
  const { 
    idCliente, 
    idUsuario, 
    idMotorista, 
    idPlaca, 
    idEmpresa, 
    pesoInicial, 
    proceso, 
    idMovimiento, 
    idOrigen, 
    idProducto,
    NViajes, 
    NSalida, 
    idTrasladoOrigen,
  } = data 

  /* pesoInicial */

  if (!idCliente || !idUsuario || !idMotorista || !idPlaca || !idEmpresa) {
    funError(true)
    setMsg('Por favor, complete todos los campos antes de continuar.')
    return false
  }

  if(proceso==0 && (!idMovimiento || !idProducto)) {
    funError(true)
    setMsg('Por favor, complete todos los campos de detalles de entrada.')
    return false
  }

  if(proceso==0 && ((idMovimiento===10 || idMovimiento===11) && (!idTrasladoOrigen))) {
    funError(true)
    setMsg('Por favor, ingrese un origen de traslado.')
    return false
  }

  if(proceso==0 && ((idMovimiento!=10 && idMovimiento!=11) && (!idOrigen))) {
    funError(true)
    setMsg('Por favor, complete todos los campos de detalles de entrada.')
    return false
  }
  
  if(idProducto===18 && (!NSalida || !NViajes)) {
    funError(true)
    setMsg('Por favor, ingresar numero de viaje y de salida')
    return false
  }

  if (!regexPlca.test(idPlaca) && (idCliente ==-998 || idCliente ==-999)) {
    funError(true)
    setMsg('placa invalida. Formatos validos (particulares: 3 letras y 4 números | comerciales: 1 letra C, O o D + 6 números).')
    return false
  }
  
  if (parseFloat(pesoInicial) <= 0 ) {
    funError(true)
    setMsg('Por favor, el peso inicial no debe de ser menor o igual a 0')
    return false
  }  

  if(idMovimiento==2 && marchamos.length ==0){
    funError(true)
    setMsg('Las importaciones deben de llevar al menos 1 marchamo.')
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

  if(proceso == 0 && parseFloat(pesoIn)<=parseFloat(pesoFinal)){
    setMsg('Peso inicial debe ser mayor al peso final)')
    funError(true)
    return false
  }

  if(proceso == 1 && parseFloat(pesoIn)>=parseFloat(pesoFinal)){
    if (idMovimiento!=13 && idMovimiento!=12) {
      setMsg('Peso final debe ser mayor al peso de inicio')
      funError(true)
      return false
    }
  }
  
  if (!idCliente || !idEmpresa || !idMotorista || !idMovimiento || !idProducto) {
    setMsg('Por favor, ingresar todos los datos primer nivel: cliente, transporte, motorista, movimiento, producto')
    funError(true)
    return false
  }

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

  if (parseFloat(pesoFinal) <= 0) {
    setMsg('El peso final debe ser mayor que 0')
    funError(true)
    return false
  }

  /**
   * Parte de las direcciones
   */
  if(proceso==1 && !idDestino && (idMovimiento!=11 && idMovimiento!=10)){
    setMsg('Ingrese todos los datos de direcciones.')
    funError(true)
    return false
  }

  if((idMovimiento==11 || idMovimiento==10) && (!idTrasladoDestino || !idTrasladoOrigen)){
    setMsg('Ingrese todos los datos de direcciones.')
    funError(true)
    return false
  }

  return true
}

export const verificarDataCasulla = (funError, data, setMsg, pesoIn) => {
  const {
    idCliente,
    idDestino,
    idEmpresa,
    idMotorista,
    idProducto,
    proceso, 
    pesoFinal
  } = data;

  if(proceso == 1 && parseFloat(pesoIn)>=parseFloat(pesoFinal)){
    setMsg('Peso final debe ser mayor al peso de inicio')
    funError(true)
    return false
  }
  
  if (!idCliente || !idEmpresa || !idMotorista || !idProducto || !idDestino) {
    setMsg('Por favor, ingresar todos los datos primer nivel: cliente, transporte, motorista, movimiento, producto, destino')
    funError(true)
    return false
  }

  console.log(data)

  /* Aqui se puso parseFloat */
  if (parseFloat(pesoFinal) <= 0 || parseFloat(pesoIn)<= 0) {
    setMsg('Los pesos deben ser diferente de 0')
    funError(true)
    return false
  }

  return true
}