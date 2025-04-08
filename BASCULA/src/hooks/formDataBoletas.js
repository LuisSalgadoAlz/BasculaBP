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
  }
};

export const formaterData = (formBoletas) => {
  const allData = {
    idCliente : formBoletas?.Clientes,
    idOrigen : formBoletas?.Origen,
    idDestino: formBoletas?.Destino,
    manifiesto: formBoletas?.Documento,
    pesoTeorico: formBoletas['Peso Teorico'],
    estado: 'Pendiente',
    idUsuario: 5,
    idMotorista: formBoletas?.Motoristas,
    fechaInicio: formBoletas?.fechaInicio,
    pesoInicial: formBoletas?.pesoIn,
    idPlaca: formBoletas?.Placa,
    idEmpresa: formBoletas?.Transportes,
    idMovimiento: formBoletas?.Proceso,
    idProducto: formBoletas?.Producto,
    observaciones: formBoletas?.Observacion,
  }
  return allData
}