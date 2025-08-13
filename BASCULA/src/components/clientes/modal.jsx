import {FormClientes, FormDirecciones, FormDireccionesEdit, FormFacturas} from "./formClientes";

export const ModalClientes = ({ hdlData, hdlSubmit, tglModal, isLoading }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opa-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm border border-gray-300">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Añadir nuevo socio
        </h2>
        <div>
          <FormClientes fun={hdlData} />
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
            disabled={isLoading}
            className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            {isLoading ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ModalDirecciones = ({ hdlData, hdlSubmit, tglModal, isLoading }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-opa-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm border border-gray-300">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Añadir nueva dirección
        </h2>
        <div>
          <FormDirecciones fun={hdlData} />
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
            disabled={isLoading}
            className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            {isLoading ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ModalDireccionesEdit = ({ hdlData, hdlSubmit, tglModal, dtDir, isLoading }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-opa-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm border border-gray-300">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Editar dirección
        </h2>
        <div>
          <FormDireccionesEdit fun={hdlData} data={dtDir}/>
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
            disabled={isLoading}
            className="px-6 py-2 text-white bg-yellow-600 rounded-lg hover:bg-yellow-600 transition duration-300 ease-in-out transform hover:scale-105"
          >
            {isLoading ? 'Modificando...': 'Modificar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ModalFacturas = ({ hdlData, hdlSubmit, tglModal, isLoading }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-opa-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm border border-gray-300">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Añadir nueva facturas
        </h2>
        <div>
          <FormFacturas fun={hdlData} />
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
            disabled={isLoading}
            className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            {isLoading ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
};