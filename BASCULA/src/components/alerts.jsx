import { hoy } from "../constants/boletas";

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

export const ModalBoletas = ({hdlClose}) => {
  return (
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 bg-opa-50">
      <div class="bg-white w-[1000px] rounded-2xl p-6 shadow-lg max-sm:w-[300px] max-sm:h-[500px] max-sm:overflow-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Boletas</h2>
          <p class="text-sm text-gray-500">Gestión de entrada y salida de material del {hoy.toLocaleDateString()}</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          Aqui va el form
        </div>
        <div class="grid grid-cols-2 gap-4">
          Aqui va el form
        </div>
        <div class="grid grid-cols-2 gap-4">
          Aqui va el form
        </div>
        <div class="grid grid-cols-2 gap-4">
          Aqui va el form
        </div>
        <div class="grid grid-cols-2 gap-4">
          Aqui va el form
        </div>
        <div class="grid grid-cols-2 gap-4">
          Aqui va el form
        </div>
        <div class="grid grid-cols-2 gap-4">
          Aqui va el form
        </div>
        <div class="grid grid-cols-2 gap-4">
          Aqui va el form
        </div>
        <div class="grid grid-cols-2 gap-4">
          Aqui va el form
        </div>
        <div class="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <h3 class="text-lg font-semibold text-gray-700">Lectura de Peso</h3>
          <div class="flex justify-between items-center mt-2">
            <span class="text-xl font-bold text-gray-900">Peso Actual:</span>
            <span class="text-xl font-bold text-gray-900">0 kg</span>
          </div>
          <p class="text-sm text-gray-500">Peso en tiempo real de la báscula</p>
        </div>
        <div class="flex justify-end mt-6 space-x-4">
          <button onClick={hdlClose} class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-transform duration-300 ease-in-out hover:scale-105">Cancelar</button>
          <button class="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-transform duration-300 ease-in-out hover:scale-105">Guardar</button>
        </div>
      </div>
    </div>

  );
};
