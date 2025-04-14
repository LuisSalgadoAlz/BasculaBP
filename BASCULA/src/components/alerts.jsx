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

export const ModalPrevisual = ({ name, hdClose, data }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opa-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Boleta
        </h2>
        <p className="text-gray-600">Peso Inicial: {data?.pesoInicial}</p>
        <hr className="text-gray-400 my-1" />
        <p className="text-gray-600">Peso neto: {data?.pesoNeto}</p>
        <hr className="text-gray-400 my-1" />
        <p className="text-gray-600">Peso tolerancia: {data?.tolerancia || data?.tolerancia==0 ?  data?.tolerancia : 'Faltan datos'}</p>
        <hr className="text-gray-400 my-1" />
        <p className="text-gray-600">Peso desviacion: {data?.desviacion || data?.tolerancia==0 ?  data?.desviacion : 'Faltan datos'}</p>
        <hr className="text-gray-400 my-1" />
        <p className="text-gray-600">Estado: {data?.fueraTol ? <span className="text-red-800">Fuera de tolerancia</span> : <span className="text-green-800">Dentro de la tolerancia</span>}</p>
        <div className="mt-6 flex justify-center">
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