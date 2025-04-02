import { FormEmpresa, FormMotoristas, FormMotoristasEdit, FormVehiculos, FormVehiculosEdit } from "./formEmpresa";

/**
 * TODO: Modal para el form de agregar empresas
 */
export const ModalEmpresas = ({hdlData, hdlSubmit, tglModal, frDta}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opa-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm border border-gray-300">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Añadir nueva empresa
        </h2>
        <div>
          <FormEmpresa fun={hdlData} />
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={tglModal}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg transition duration-300 ease-in-out transform hover:bg-gray-300 hover:scale-105"
          >
            Cancelar
          </button>
          <button
            onClick={hdlSubmit}
            className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * TODO: Modal para el form de agregar motoristas
 */
export const ModalVehiculos = ({hdlData, hdlSubmit, tglModal, frDta}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-opa-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm border border-gray-300">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Añadir nuevo vehiculo
        </h2>
        <div>
          <FormVehiculos fun={hdlData} />
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={tglModal}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg transition duration-300 ease-in-out transform hover:bg-gray-300 hover:scale-105"
          >
            Cancelar
          </button>
          <button
            onClick={hdlSubmit}
            className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * TODO: Modal para el form de editar vehiculos
 */
export const ModalVehiculosEdit = ({hdlData, hdlSubmit, tglModal, frDta}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-opa-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm border border-gray-300">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Editar nuevo vehiculo
        </h2>
        <div>
          <FormVehiculosEdit fun={hdlData} data={frDta} />
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={tglModal}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg transition duration-300 ease-in-out transform hover:bg-gray-300 hover:scale-105"
          >
            Cancelar
          </button>
          <button
            onClick={hdlSubmit}
            className="px-6 py-2 text-white bg-yellow-600 rounded-lg hover:bg-yellow-600 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Modificar
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * TODO: Modal para el form de motoristas
 */
export const ModalMotoristas = ({hdlData, hdlSubmit, tglModal}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-opa-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm border border-gray-300">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Añadir nuevo motorista
        </h2>
        <div>
          <FormMotoristas fun={hdlData} />
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={tglModal}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg transition duration-300 ease-in-out transform hover:bg-gray-300 hover:scale-105"
          >
            Cancelar
          </button>
          <button
            onClick={hdlSubmit}
            className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export const ModalMotoristasEdit = ({hdlData, hdlSubmit, tglModal, frDta}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-opa-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm border border-gray-300">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Añadir nuevo motorista
        </h2>
        <div>
          <FormMotoristasEdit fun={hdlData} data={frDta} />
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={tglModal}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg transition duration-300 ease-in-out transform hover:bg-gray-300 hover:scale-105"
          >
            Cancelar
          </button>
          <button
            onClick={hdlSubmit}
            className="px-6 py-2 text-white bg-yellow-600 rounded-lg hover:bg-yellow-600 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Modificar
          </button>
        </div>
      </div>
    </div>
  );
};
