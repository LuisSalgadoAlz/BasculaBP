import { motion } from "framer-motion";
import { propsModalPrevisual, propsModalPrevisualHijo } from "../constants/global";
import { 
  IoHelpCircleOutline, 
  IoScaleOutline,
  IoCloseSharp, 
  IoSendSharp, 
  IoWarningOutline,
  IoBugOutline,
  IoInformationCircleOutline 
} from "react-icons/io5";
import { useState } from "react";
import { postEnviarMensajeDeSoporte } from "../hooks/admin/soporte";
import { MdError, MdClose, MdCheckCircle, MdWarning } from 'react-icons/md';

export const ModalSuccess = ({ name, hdClose, onContinue }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100 transform transition-all duration-300 ease-out animate-in">
        {/* Header con icono de éxito */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3"> 
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MdCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Éxito</h2>
          </div>
          <button
            onClick={hdClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Cerrar modal"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del éxito */}
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed">
            La operación se ha completado exitosamente en:
          </p>
          <div className="mt-3 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
            <p className="text-green-800 font-medium">{name}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          {onContinue && (
            <button
              onClick={onContinue}
              className="px-6 py-3 text-green-700 bg-white border border-green-300 rounded-lg font-medium hover:bg-green-50 hover:border-green-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Continuar
            </button>
          )}
          <button
            onClick={hdClose}
            className="px-6 py-3 text-white bg-green-600 rounded-lg font-medium hover:bg-green-700 active:bg-green-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export const ModalErr = ({ name, hdClose, onRetry }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100 transform transition-all duration-300 ease-out animate-in">
        {/* Header con icono de error */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <MdError className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Error</h2>
          </div>
          <button
            onClick={hdClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Cerrar modal"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del error */}
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed">
            Ha ocurrido un problema durante la operación:
          </p>
          <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
            <p className="text-red-800 font-medium">{name}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 text-red-700 bg-white border border-red-300 rounded-lg font-medium hover:bg-red-50 hover:border-red-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Reintentar
            </button>
          )}
          <button
            onClick={hdClose}
            className="px-6 py-3 text-white bg-red-600 rounded-lg font-medium hover:bg-red-700 active:bg-red-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export const ModalVehiculoDuplicado = ({ name, hdClose, hdlSubmit }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-4 border border-gray-100 transform transition-all duration-300 ease-out animate-in">
        {/* Header con icono de advertencia */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <MdWarning className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Advertencia</h2>
          </div>
          <button
            onClick={hdClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Cerrar modal"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido de la advertencia */}
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed mb-3">
            Se ha detectado que el vehículo ya está registrado en el sistema.
          </p>
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <p className="text-gray-800 mb-2">
              <span className="font-medium">Empresas registradas:</span>
            </p>
            <p className="text-yellow-800 font-semibold">{name}</p>
          </div>
          <p className="text-gray-700 leading-relaxed mt-4">
            ¿Desea agregarlo de todos modos? Esta acción creará un registro duplicado.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={hdClose}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Cancelar operación"
          >
            Cancelar
          </button>
          <button
            onClick={hdlSubmit}
            className="px-6 py-3 text-white bg-yellow-600 rounded-lg font-medium hover:bg-yellow-700 active:bg-yellow-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
            aria-label="Agregar vehículo duplicado"
          >
            Agregar de todos modos
          </button>
        </div>
      </div>
    </div>
  );
};

export const ModalVehiculoDuplicadoEdit = ({ name, hdClose, hdlSubmit }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-4 border border-gray-100 transform transition-all duration-300 ease-out animate-in">
        {/* Header con icono de advertencia */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <MdWarning className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Advertencia</h2>
          </div>
          <button
            onClick={hdClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Cerrar modal"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido de la advertencia */}
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed mb-3">
            Se ha detectado que el vehículo ya está registrado en el sistema.
          </p>
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <p className="text-gray-800 mb-2">
              <span className="font-medium">Empresas registradas:</span>
            </p>
            <p className="text-yellow-800 font-semibold">{name}</p>
          </div>
          <p className="text-gray-700 leading-relaxed mt-4">
            ¿Desea modificarlo de todos modos? Esta acción afectará el registro existente.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={hdClose}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Cancelar operación"
          >
            Cancelar
          </button>
          <button
            onClick={hdlSubmit}
            className="px-6 py-3 text-white bg-yellow-600 rounded-lg font-medium hover:bg-yellow-700 active:bg-yellow-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
            aria-label="Modificar vehículo duplicado"
          >
            Modificar de todos modos
          </button>
        </div>
      </div>
    </div>
  );
};

export const ModalPrevisual = ({ hdClose, data }) => {
  return (
    <motion.div  className="fixed inset-0 flex items-center justify-center bg-opa-50 bg-opacity-60 z-50 p-4 backdrop-blur-sm" {...propsModalPrevisual}>
      <motion.div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden" {...propsModalPrevisualHijo}>
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
  const SkeletonLine = ({ width = "100%", height = "16px", className = "" }) => (
    <div 
      className={`bg-gray-200 rounded animate-pulse ${className}`}
      style={{ width, height }}
    />
  );

  const SkeletonInfoRow = () => (
    <div className="flex flex-col sm:flex-row sm:justify-between py-1 space-y-1 sm:space-y-0">
      <SkeletonLine width="40%" height="14px" />
      <SkeletonLine width="35%" height="14px" />
    </div>
  );

  const SkeletonInfoSection = ({ title, children, className = "" }) => (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      <div className="mb-3 border-b border-gray-200 pb-2">
        <SkeletonLine width="60%" height="20px" />
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-50 z-50">
      <div className="w-full h-full overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header Skeleton */}
          <div className="bg-white border-b border-gray-200 p-6 lg:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <SkeletonLine width="200px" height="28px" className="mb-2" />
                <SkeletonLine width="280px" height="14px" />
              </div>
              <div className="self-end sm:self-center">
                <SkeletonLine width="28px" height="28px" className="rounded-full" />
              </div>
            </div>
            
            {/* Fecha de creación skeleton */}
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <SkeletonLine width="300px" height="16px" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Información General Skeleton */}
              <SkeletonInfoSection className="lg:col-span-1">
                <div className="space-y-4">
                  {/* Datos de la boleta */}
                  <div>
                    <SkeletonLine width="140px" height="16px" className="mb-2" />
                    <div className="space-y-1 pl-2">
                      <SkeletonInfoRow />
                      <SkeletonInfoRow />
                      <SkeletonInfoRow />
                      <SkeletonInfoRow />
                    </div>
                  </div>

                  {/* Ruta */}
                  <div>
                    <SkeletonLine width="60px" height="16px" className="mb-2" />
                    <div className="space-y-1 pl-2">
                      <SkeletonInfoRow />
                      <SkeletonInfoRow />
                    </div>
                  </div>

                  {/* Traslado */}
                  <div>
                    <SkeletonLine width="80px" height="16px" className="mb-2" />
                    <div className="space-y-1 pl-2">
                      <SkeletonInfoRow />
                      <SkeletonInfoRow />
                      <SkeletonInfoRow />
                    </div>
                  </div>

                  {/* Datos de Tolva */}
                  <div>
                    <SkeletonLine width="120px" height="16px" className="mb-2" />
                    <div className="space-y-1 pl-2">
                      <SkeletonInfoRow />
                      <SkeletonInfoRow />
                    </div>
                  </div>
                </div>
              </SkeletonInfoSection>

              {/* Detalles del Proceso Skeleton */}
              <SkeletonInfoSection className="lg:col-span-1">
                <div className="space-y-4">
                  {/* Estado del proceso */}
                  <div>
                    <SkeletonLine width="100%" height="44px" className="rounded-lg" />
                  </div>

                  {/* Datos del proceso */}
                  <div className="space-y-1">
                    <SkeletonInfoRow />
                    <SkeletonInfoRow />
                    <SkeletonInfoRow />
                    <SkeletonInfoRow />
                    <SkeletonInfoRow />
                  </div>

                  {/* Tiempos */}
                  <div>
                    <SkeletonLine width="80px" height="16px" className="mb-2" />
                    <div className="space-y-1 pl-2">
                      <SkeletonInfoRow />
                      <SkeletonInfoRow />
                      <SkeletonInfoRow />
                    </div>
                  </div>

                  {/* Datos Puerto */}
                  <div>
                    <SkeletonLine width="100px" height="16px" className="mb-2" />
                    <div className="space-y-1 pl-2">
                      <SkeletonInfoRow />
                      <SkeletonInfoRow />
                    </div>
                  </div>

                  {/* Marchamos */}
                  <div>
                    <SkeletonLine width="90px" height="16px" className="mb-2" />
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <SkeletonLine width="100%" height="14px" />
                    </div>
                  </div>
                </div>
              </SkeletonInfoSection>

              {/* Datos del Peso Skeleton */}
              <SkeletonInfoSection className="lg:col-span-2 xl:col-span-1">
                <div className="space-y-4">
                  {/* Estado */}
                  <div>
                    <SkeletonLine width="100%" height="44px" className="rounded-lg" />
                  </div>

                  {/* Pesos */}
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <SkeletonLine width="35%" height="16px" />
                        <SkeletonLine width="25%" height="16px" />
                      </div>
                    ))}
                  </div>

                  {/* Observaciones */}
                  <div className="mt-6">
                    <SkeletonLine width="120px" height="16px" className="mb-2" />
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[60px]">
                      <SkeletonLine width="100%" height="14px" className="mb-2" />
                      <SkeletonLine width="70%" height="14px" />
                    </div>
                  </div>
                </div>
              </SkeletonInfoSection>
            </div>
          </div>

          {/* Footer con botones skeleton */}
          <div className="bg-white border-t border-gray-200 p-6 lg:p-8 shadow-sm">
            <div className="w-full">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <SkeletonLine width="140px" height="40px" className="rounded-lg" />
                <SkeletonLine width="140px" height="40px" className="rounded-lg" />
                <SkeletonLine width="140px" height="40px" className="rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export const AlertSupport = ({ msg }) => {
    return (
        <>
          <div className="my-4 text-sm text-yellow-800 rounded-lg bg-white" role="alert">
            <span className="font-medium">Alerta!</span> { msg }
          </div>
        </>
    )
}

export const SupportModal = ({ hdClose }) => {
  const [formSupports, setFormSupports] = useState({type: '', description: ''})
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false)
  const [msg, setMsg] = useState('')

  const modalAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  };
  
  const contentAnimation = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    transition: { delay: 0.1, duration: 0.3 }
  };

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormSupports((prev)=>({
      ...prev, [name] : value
    }))
  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (!formSupports.type) {
      setIsEmpty(true)
      setMsg("Por favor, ingrese el tipo de problema.")
      return
    }
    const response = await postEnviarMensajeDeSoporte(formSupports, setSubmitting)
    if(response.msg) {
      setIsEmpty(false)
      setSubmitted(true)
    }
  };

  const issueTypes = [
    { id: "Error o bug", label: "Error o bug", icon: <IoBugOutline className="text-red-500" /> },
    { id: "Funcionalidad incorrecta", label: "Funcionalidad incorrecta", icon: <IoWarningOutline className="text-amber-500" /> },
    { id: "Sugerencia de mejora", label: "Sugerencia de mejora", icon: <IoInformationCircleOutline className="text-blue-500" /> }
  ];

  return (
    <motion.div className="fixed inset-0 flex items-center justify-center bg-opa-50 z-50 p-4 backdrop-blur-sm" {...modalAnimation}>
      <motion.div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden" {...contentAnimation}>
        <div className="bg-[#5A3F27] text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center">
            <IoHelpCircleOutline className="mr-2 text-2xl" />
            Centro de Soporte
          </h2>
          <button className="text-white hover:bg-[#795e47] p-1 rounded-full transition-colors" onClick={hdClose} aria-label="Cerrar">
            <IoCloseSharp className="text-2xl" />
          </button>
        </div>
        
        {!submitted ? (
          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-3">
                Tipo de problema
              </label>
              <div className="grid grid-cols-1 gap-2">
                {issueTypes.map((type) => (
                  <label 
                    key={type.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formSupports.type === type.id 
                        ? "border-[#5A3F27] bg-[#5A3F27]/10" 
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.id}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div className="flex items-center">
                      <span className="mr-3 text-xl">{type.icon}</span>
                      <span className="font-medium">{type.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Descripción del problema
              </label>
              <textarea
                name="description"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3F27]"
                rows="3"
                placeholder="Describe detalladamente el problema o error que experimentaste"
                required
              />
            </div>
            {isEmpty && <AlertSupport msg={ msg }/>}            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={hdClose}
                className="px-4 py-2 text-[#5A3F27] border border-[#5A3F27] rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-white bg-[#5A3F27] rounded-lg flex items-center transition-all hover:bg-[#795e47]`}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Enviar reporte
                    <IoSendSharp className="ml-2" />
                  </span>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">¡Reporte enviado!</h3>
            <p className="text-gray-600 mb-6">
              Gracias por ayudarnos a mejorar. Revisaremos tu reporte lo antes posible.
            </p>
            <button
              onClick={hdClose}
              className="px-4 py-2 text-white bg-[#5A3F27] rounded-lg hover:bg-[#795e47] transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export const ModalReimprimirTicket = ({ ticketNumber, hdClose, hdlSubmit }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-opa-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Reimprimir Ticket</h2>
        <p className="text-gray-600">
          ¿Está seguro que desea reimprimir el ticket de tolva placa:  
          <span className="text-[#5A3F27] font-semibold"> {ticketNumber}</span>?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={hdClose}
            aria-label="Cancelar reimpresión"
            className="px-4 py-2 text-gray-400 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105"
          >
            Cancelar
          </button>
          <button
            onClick={hdlSubmit}
            aria-label="Confirmar reimpresión"
            className="px-4 py-2 text-white bg-[#5A3F27] rounded-lg transition-transform duration-300 ease-in-out hover:scale-105"
          >
            Reimprimir
          </button>
        </div>
      </div>
    </div>
  );
};