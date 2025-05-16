import { motion } from "framer-motion";
import { propsModalPrevisual, propsModalPrevisualHijo } from "../constants/global";
import { IoCloseSharp, IoScaleOutline } from "react-icons/io5";

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

export const ModalPrevisual = ({ hdClose, data }) => {
  return (
    <motion.div {...propsModalPrevisual}>
      <motion.div {...propsModalPrevisualHijo}>
        <div className="bg-[#5A3F27] text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center">
            <IoScaleOutline className="mr-2 text-2xl" />
            Detalle de Peso
          </h2>
          <button
            className="text-white hover:bg-[#795e47] p-1 rounded-full transition-colors"
            onClick={hdClose}
            aria-label="Cerrar"
          >
            <IoCloseSharp className="text-3xl" />
          </button>
        </div>
        <div className="px-6 py-6">
          <p className="text-gray-600">
            Peso Inicial:{" "}
            <span className="font-bold">{data?.pesoInicial} lb</span>
          </p>
          <hr className="text-gray-400 my-1" />
          <p className="text-gray-600">
            Peso neto: <span className="font-bold">{data?.pesoNeto} lb</span>
          </p>
          <hr className="text-gray-400 my-1" />
          <p className="text-gray-600">
            Peso tolerancia:{" "}
            <span className="font-bold">
              ±{" "}
              {data?.tolerancia || data?.tolerancia == 0
                ? data?.tolerancia
                : "Faltan datos"}{" "}
              lb
            </span>
          </p>
          <hr className="text-gray-400 my-1" />
          <p className="text-gray-600">
            Peso desviacion:{" "}
            <span className="font-bold">
              {data?.desviacion || data?.desviacion == 0
                ? data?.desviacion
                : "Faltan datos"}{" "}
              lb
            </span>
          </p>
        </div>
        <div className="px-6 py-2">
          <hr className="text-gray-400 my-1" />
          <p className="text-gray-600">
            Estado:{" "}
            {data?.fueraTol ? (
              <span className="text-red-800">Fuera de tolerancia</span>
            ) : (
              <span className="text-green-800">Dentro de la tolerancia</span>
            )}
          </p>
        </div>
        <div className="px-6 py-6 flex justify-end">
          <button
            onClick={hdClose}
            aria-label="Cerrar modal de éxito"
            className="px-4 py-2 text-white bg-[#5A3F27] rounded-lg hover:bg-[#8d7158] transition-transform duration-300 ease-in-out hover:scale-105"
          >
            Aceptar
          </button>
        </div>
      </motion.div>
    </motion.div>
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

export const Spinner = () => {
  return (
    <div className="flex justify-center items-center py-32">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-gray-300 border-t-[#5A3F27]" />
    </div>
  );
};

export const BigSpinner = () => {
  return (
    <div className="flex justify-center items-center py-60">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-gray-300 border-t-[#5A3F27]" />
    </div>
  );
};

export const MiniSpinner = () => {
  return (
    <div className="h-4 w-4 animate-spin rounded-full border-4 border-solid border-gray-300 border-t-[#5A3F27]" />
  );
};

export const SkeletonModalOut = () => {
  return (
    <>
      <div className="animate-pulse space-y-4">
        <div className="mb-1">
          <div className="h-6 bg-gray-300 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mt-1"></div>
        </div>

        <div className="my-2 p-2 bg-gray-100 rounded-lg border border-gray-300">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-gray-300 rounded w-40"></div>
            <div className="h-5 bg-gray-300 rounded w-20"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 p-2">
          {/* Columna izquierda */}
          <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="h-11 bg-gray-200 rounded w-full col-span-1"
              ></div>
            ))}
          </div>

          {/* Columna derecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-11 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>

        <div className="h-10 bg-gray-300 rounded w-32 mx-2"></div>

        <hr className="text-gray-300 mt-1" />

        <div className="mt-3 px-3 grid grid-cols-2 gap-2 max-sm:grid-cols-1">
          <div className="h-10 bg-gray-300 rounded"></div>
          <div className="h-10 bg-gray-400 rounded"></div>
        </div>
      </div>
    </>
  );
};

export const SkeletonBoleta = () => {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-1 flex items-center justify-between gap-7">
        <div>
          <div className="h-6 w-40 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 w-56 bg-gray-300 rounded"></div>
        </div>
        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
      </div>

      {/* Fecha */}
      <div className="my-2 p-2 bg-gray-100 rounded-lg border border-gray-300">
        <div className="h-5 w-60 bg-gray-300 rounded"></div>
      </div>

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-5">
        {[1, 2, 3].map((_, idx) => (
          <div key={idx} className="p-4 border-2 border-gray-300 rounded-lg space-y-3">
            <div className="h-5 w-40 bg-gray-300 rounded"></div>
            <div className="h-1 w-full bg-gray-300 rounded"></div>
            {[...Array(6)].map((__, i) => (
              <div key={i} className="h-4 w-full bg-gray-200 rounded"></div>
            ))}
            <div className="h-1 w-full bg-gray-300 rounded"></div>
            {[...Array(4)].map((__, i) => (
              <div key={i} className="h-4 w-5/6 bg-gray-200 rounded"></div>
            ))}
          </div>
        ))}
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <div className="h-10 w-32 bg-gray-300 rounded"></div>
        <div className="h-10 w-28 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};
