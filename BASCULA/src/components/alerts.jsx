import { useState, useEffect } from "react";
import { cargando, claseFormInputs, classFormSelct, hoy } from "../constants/boletas";
import { ESTADOS_BOLETAS, URLHOST } from "../constants/global";
import Cookies from 'js-cookie'
import SelectFormBoletas from "./boletas/select";
import { InputsFormBoletas } from "./boletas/inputs";

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

export const ModalBoletas = ({hdlClose, handleChange}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 sm:p-6 min-h-screen bg-opa-50">
    <div className="bg-white w-full max-w-4xl rounded-2xl p-6 shadow-lg sm:w-[90%] md:w-[80%] lg:w-[60%] max-h-[90vh] overflow-y-auto boletas">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Boletas</h2>
        <p className="text-sm text-gray-500">Gestión de entrada y salida de material del {new Date().toLocaleDateString()}</p>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
        <h3 className="text-lg font-semibold text-gray-700">Lectura de Peso</h3>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xl font-bold text-gray-900">Peso Actual:</span>
          <span className="text-xl font-bold text-gray-900">0 Lb</span>
        </div>
        <p className="text-sm text-gray-500">Peso en tiempo real de la báscula</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 p-2 mt-4 place-content-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {["Proceso", "Placa", "Clientes", "Transportes", "Motoristas", "Producto", "Origen", "Destino", "Flete"].map((item) => (
            <SelectFormBoletas key={item} classCss={classFormSelct} name={item} data={cargando} fun={handleChange} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2  place-content-center">
          {["Documento", "Peso entrada", "Peso salida", "Peso teorico", "Peso neto", "Desviacion", "Observacion"].map((item) => (
            <InputsFormBoletas key={item} data={claseFormInputs} name={item} />
          ))}
          <label>Fecha de entrada</label>
          <input type="datetime-local" name='fechaEntrada' className={claseFormInputs} disabled/>
          <label>Fecha de salida</label>
          <input type="datetime-local" name='fechaSalida' className={claseFormInputs} disabled/>
        </div>
      </div>

      <div className="mt-4">
        <SelectFormBoletas classCss={classFormSelct} name={'Estado'} data={ESTADOS_BOLETAS} fun={handleChange} />
      </div>

      <hr className="text-gray-300 mt-7" />
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
