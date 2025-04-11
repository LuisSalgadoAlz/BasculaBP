import { URLHOST } from "../constants/global";
import Cookies from 'js-cookie'

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

export const postBoletasNormal = async (boleta) => {
  try {
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
  }
};

export const getDataBoletas = async (fun) => {
  try {
    const response = await fetch(`${URLHOST}boletas/data`, {
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
  const allData = {
    idCliente : formBoletas?.Socios,
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

export const getDataParaForm = async(setFormBoletas, data) => {
  const response = await getDataBoletasPorID(data.Id)  
  console.log(response.idPlaca)
  setFormBoletas((prev)=>({
    ...prev,
    Socios: response.idSocio,
    Motoristas: response.idMotorista,
    Placa: response.placa,
    Proceso: response.clienteBoleta.tipo,
    Transportes: response.idEmpresa,
    Estado: 0,
    pesoIn: response.pesoInicial,
    pesoOut: 0,
    idBoleta: data.Id, 
    tipoSocio: response.clienteBoleta.tipo
  }))
}

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

/**
 * ! Area de formateadores 
 * ! Parte delicada No tocar mucho
 * @param {*} formBoletas 
 * @returns 
 */

export const formaterData = (formBoletas) => {
  const allData = {
    idCliente : formBoletas?.Socios,
    boletaType: formBoletas?.Estado, 
    manifiesto: formBoletas?.Documento,
    ordenDeCompra : formBoletas['Orden de compra'], 
    pesoTeorico: formBoletas['Peso Teorico'],
    estado: 'Completado',
    idUsuario: Cookies.get('token'),
    idMotorista: formBoletas?.Motoristas,
    fechaFin: new Date(),
    pesoInicial: formBoletas?.pesoIn,
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
    tipoSocio: formBoletas?.tipoSocio
  }
  return allData
}


export const verificarDataNewPlaca = (funError, data, setMsg) => {
  const {idCliente, idUsuario, idMotorista, pesoInicial, idPlaca, idEmpresa } = data 
  console.log(data)
  if (!idCliente || !idUsuario || !idMotorista || !idPlaca || !idEmpresa) {
    funError(true)
    setMsg('Por favor, complete todos los campos antes de continuar.')
    return false
  }

  if (pesoInicial <= 0 ) {
    funError(true)
    setMsg('Por favor, el peso no debe de ser 0.')
    return false
  }

  return true
};

export const verificarDataCompleto = (funError, data, setMsg) => {
  const {
    idCliente,
    idDestino,
    idEmpresa,
    idMotorista,
    idMovimiento,
    idOrigen,
    idPlaca,
    idProducto,
    idTrasladoDestino,
    idTrasladoOrigen,
    manifiesto,
    observaciones,
    ordenDeCompra,
    ordenDeTransferencia,
    pesoInicial,
    pesoTeorico,
    proceso, 
    tipoSocio
  } = data;

  console.log(data)
  
  if (!idCliente || !idEmpresa || !idMotorista || !idMovimiento || !idProducto || !proceso) {
    setMsg('Por favor, ingresar todos los datos primer nivel')
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
    setMsg('Por favor, ingresar todos los datos segundo nivel ')
    funError(true)
    return false
  }

  if(proceso==1 && !manifiesto){
    setMsg('Por favor, ingresar todos los datos tercer nivel')
     funError(true)
    return false
  }

  if (proceso != tipoSocio){
    setMsg('Socio no valido para este tipo de movimiento')
    funError(true)
    return false
  }

  return true
}