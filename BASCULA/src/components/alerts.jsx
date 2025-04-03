import { useState, useEffect } from "react";
import { cargando, claseFormInputs, classFormSelct, classTextArea, fechaCorta, hoy } from "../constants/boletas";
import { ESTADOS_BOLETAS, Proceso, URLHOST } from "../constants/global";
import SelectFormBoletas from "./boletas/select";
import { InputsFormBoletas } from "./boletas/inputs";
import { PiGaugeThin } from "react-icons/pi";
import Cookies from 'js-cookie'


export const ModalSuccess = ({ name, hdClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opa-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          ¡Éxito en {name}!
        </h2>
        <p className="text-gray-600">La operación se realizó correctamente.</p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={hdClose}
            aria-label="Cerrar modal de éxito"
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-transform duration-300 ease-in-out hover:scale-105"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export const ModalErr = ({ name, hdClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opa-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">¡Error!</h2>
        <p className="text-gray-600">La operación fallo por: {name}</p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={hdClose}
            aria-label="Cerrar modal de éxito"
            className="px-4 py-2 text-white bg-red-600 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export const ModalVehiculoDuplicado = ({ name, hdClose, hdlSubmit }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opa-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">¡Advertencia!</h2>
        <p className="text-gray-600">
          El vehículo ya está registrado en las siguientes empresas:
          <span className="text-yellow-600"> {name}</span>. ¿Desea agregarlo de
          todos modos?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={hdClose}
            aria-label="Cerrar modal de éxito"
            className="px-4 py-2 text-gray-400 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105"
          >
            Cancelar
          </button>
          <button
            onClick={hdlSubmit}
            aria-label="Cerrar modal de éxito"
            className="px-4 py-2 text-white bg-yellow-600 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export const ModalVehiculoDuplicadoEdit = ({ name, hdClose, hdlSubmit }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opa-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">¡Advertencia!</h2>
        <p className="text-gray-600">
          El vehículo ya está registrado en las siguientes empresas:
          <span className="text-yellow-600"> {name}</span>. ¿Desea modificarlo
          de todos modos?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={hdClose}
            aria-label="Cerrar modal de éxito"
            className="px-4 py-2 text-gray-400 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105"
          >
            Cancelar
          </button>
          <button
            onClick={hdlSubmit}
            aria-label="Cerrar modal de éxito"
            className="px-4 py-2 text-white bg-yellow-600 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105"
          >
            Modificar
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * TODO : NO DATA COMPONENTS
 */

export const NoData = () => {
  return (
    <div className="flex items-center justify-center py-32 px-4 max-sm:text-center">
      <span className="text-lg text-gray-500">No hay datos disponibles.</span>
    </div>
  );
};

export const ModalBoletas = ({hdlClose, hdlChange}) => {
  
  const fillData = {
    Proceso, "Placa" : cargando, "Clientes" : cargando, "Transportes": cargando, "Motoristas": cargando, "Producto" : cargando, "Origen": cargando, "Destino": cargando, "Flete": cargando
  }

  const [peso, setPeso] = useState('0lb');

  const api = async () => {
    const response = await fetch(`${URLHOST}peso`, {
      method: "GET",
      headers: {
        Authorization: Cookies.get('token'),
      },
    });
    const adata = await response.json();
    setPeso(adata.peso);
  };
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      api();
    }, 1000); // Actualiza cada 5 segundos (ajusta el tiempo según tus necesidades)
  
    // Limpia el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 sm:p-6 min-h-screen bg-opa-50">
    <div className="bg-white w-full max-w-5xl rounded-2xl p-6 shadow-lg sm:w-[90%] md:w-[80%] lg:w-[60%] max-h-[90vh] overflow-y-auto boletas border-8 border-white">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Boletas</h2>
        <p className="text-sm text-gray-500">Creación de entrada y salida de material del {new Date().toLocaleDateString()}</p>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
        <h3 className="text-lg font-semibold text-gray-700">Lectura de Peso</h3>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xl font-bold text-gray-900">Peso Actual:</span>
          <span className="text-xl font-bold text-gray-900">{peso}</span>
        </div>
        <p className="text-sm text-gray-500">Peso en tiempo real de la báscula</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 p-2 mt-2 place-content-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {["Proceso", "Placa", "Clientes", "Transportes", "Motoristas", "Producto", "Origen", "Destino", "Flete"].map((item) => (
            <SelectFormBoletas key={item} classCss={classFormSelct} name={item} data={fillData[item]} fun={hdlChange} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2  place-content-center p-1">
          <label>Peso de Entrada</label>
          <div className="flex gap-3">
            <input type="text" name='pesoIn' className={claseFormInputs} onChange={hdlChange} disabled/>
            <button className="text-2xl"><PiGaugeThin/></button>
          </div>
          <label>Peso de salida</label>
          <div className="flex gap-3">
            <input type="text" name='pesoIn' className={claseFormInputs} onChange={hdlChange} disabled/>
            <button className="text-2xl"><PiGaugeThin /></button>
          </div>
          {["Documento", "Peso teorico", "Peso neto", "Desviacion", "Observacion"].map((item) => (
            <InputsFormBoletas key={item} data={claseFormInputs} name={item} fun={hdlChange} />
          ))}
          <label>Fecha de entrada</label>
          <input type="text" name='fechaIn' className={claseFormInputs} value={new Date()} disabled/>
          <label>Fecha de salida</label>
          <input type="text" name='fechaEntrada' className={claseFormInputs} value={'-----'} disabled/>
        </div>
      </div>

      <div className="mt-3 px-3">
        <select name="estado" className={claseFormInputs} onChange={hdlChange}>
          {ESTADOS_BOLETAS.map((el)=>(
            <option key={el.id} value={el.id}>{el.nombre}</option>
          ))}
        </select>
      </div>

      <hr className="text-gray-300 mt-2" />
      <div className="flex flex-col sm:flex-row justify-end mt-6 space-y-2 sm:space-y-0 sm:space-x-4">
        <button
          onClick={hdlClose}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-transform duration-300 ease-in-out hover:scale-105"
        >
          Cancelar
        </button>
        <button
          className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-transform duration-300 ease-in-out hover:scale-105"
        >
          Guardar
        </button>
      </div>
    </div>
  </div>

  );
};
