import { useState } from "react";
import {
  IoClose,
  IoCalendarOutline,
  IoPerson,
  IoCarOutline,
  IoGrid,
  IoBusinessOutline,
} from "react-icons/io5";
import { MdOutlinePlace, MdOutlineSecurity } from "react-icons/md";

export const Modals = (props) => {
  const { hdlClose, hdlSubmit, isLoadingImage, data, silos, handleChange, error} = props

  if (data.err) {
    return;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opa-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto border border-gray-200 max-h-[90vh] overflow-y-auto">
        {isLoadingImage ? (
          <>
            <ModalLoader />
          </>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Asignar Boleta #{data?.id}
              </h2>
              <button
                onClick={hdlClose}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar modal"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <strong>Nota:</strong> Una vez asignado, no puede volver a
                utilizar este código QR
              </div>

              {/* Información de la Boleta */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Información de la Boleta
                </h3>

                {/* Nombre del Socio */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <IoPerson size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{data.idProducto === 17 ? 'Productor' : 'Motorista'}</p>
                    <p className="text-sm font-medium text-gray-800">
                      {(data.idProducto === 17 ? data.socio : data.motorista) || "No especificado"}
                    </p>
                  </div>
                </div>

                {/* Transporte */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <IoCarOutline size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Transporte</p>
                    <p className="text-sm font-medium text-gray-800">
                      {data?.empresa || "No especificado"}
                    </p>
                  </div>
                </div>

                {/* Producto */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                    <IoGrid size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Producto</p>
                    <p className="text-sm font-medium text-gray-800">
                      {data?.producto || "No especificado"}
                    </p>
                  </div>
                </div>

                {/* Procedencia */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                    <MdOutlinePlace  size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Procedencia</p>
                    <p className="text-sm font-medium text-gray-800">
                      {(data.idProducto === 17 ? data.origen : data.socio) || "No especificado"}
                    </p>
                  </div>
                </div>

                {/* Fecha de Ingreso */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                    <IoCalendarOutline size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fecha de Ingreso</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(data?.fechaInicio).toLocaleString() ||
                        "No especificada"}
                    </p>
                  </div>
                </div>

                {/* Marchamos */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                    <MdOutlineSecurity size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Marchamos</p>
                    <p className="text-sm font-medium text-gray-800">
                      {[data?.sello1, data?.sello2, data?.sello3, data?.sello4, data?.sello5, data?.sello6]
                    .filter(Boolean)
                    .join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Selección de Silo */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <IoBusinessOutline size={16} />
                  Seleccionar tolva de descarga 
                </label>
                <select name="tolvaDescarga"
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#5A3F27] focus:border-transparent text-sm transition-all border-gray-300`}
                >
                  <option value={0}>Seleccione tolva de descarga</option>
                  <option value={1}>Tolva De Descarga #1</option>
                  <option value={2}>Tolva De Descarga #2</option>
                </select>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <IoBusinessOutline size={16} />
                  Seleccionar Destino
                </label>
                <select name="silo" onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#5A3F27] focus:border-transparent text-sm transition-all border-gray-300`}
                >
                  <option value="">Seleccione destino principal</option>
                  {silos.map((silo) => (
                    <option key={silo.id} value={silo.id}>
                      {silo.nombre} -{" "}
                      {silo.capacidad ? `Capacidad: ${silo.capacidad}` : "Sin especificar"}
                    </option>
                  ))}
                </select>
                <select name="silo2" onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#5A3F27] focus:border-transparent text-sm transition-all border-gray-300`}
                >
                  <option value="">Seleccione destino #2 (opcional)</option>
                  {silos.map((silo) => (
                    <option key={silo.id} value={silo.id}>
                      {silo.nombre} -{" "}
                      {silo.capacidad ? `Capacidad: ${silo.capacidad}` : "Sin especificar"}
                    </option>
                  ))}
                </select>
                <select name="silo3" onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#5A3F27] focus:border-transparent text-sm transition-all border-gray-300`}
                >
                  <option value="">Seleccione destino #3 (opcional)</option>
                  {silos.map((silo) => (
                    <option key={silo.id} value={silo.id}>
                      {silo.nombre} -{" "}
                      {silo.capacidad ? `Capacidad: ${silo.capacidad}` : "Sin especificar"}
                    </option>
                  ))}
                </select>
                {error && <p className="text-red-500 text-xs">{error}</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200">
              <button
                onClick={hdlClose}
                className="w-full sm:w-full px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:scale-105"
              >
                Cancelar
              </button>
              <button
                onClick={hdlSubmit}
                className="w-full sm:w-full px-6 py-3 text-white bg-[#5A3F27] rounded-lg hover:bg-[#4a3420] transition-all duration-200 hover:scale-105"
              >
                Asignar a Silo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ModalLoader = () => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center  p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto border border-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Body Skeleton */}
        <div className="p-6 space-y-4">
          {/* Warning Note Skeleton */}
          <div className="bg-gray-100 p-3 rounded-lg border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>

          {/* Information Card Skeleton */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-40 mb-3 animate-pulse"></div>

            {/* Info Items Skeleton */}
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Select Skeleton */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
            <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200">
          <div className="w-full sm:w-auto h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-full sm:w-auto h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export const FinalizarDescarga = ({ hdClose, hdlSubmit, isLoading }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opa-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100 animate-fadeIn">
        {/* Header con icono y título */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-[#5A3F27] tracking-wide">
            Finalizar Descarga
          </h2>
        </div>

        {/* Contenido del mensaje */}
        <div className="text-center mb-8">
          <p className="text-gray-700 text-lg">
            ¿Está seguro que desea finalizar la descarga?
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={hdClose}
            aria-label="Cancelar operación"
            disabled={isLoading}
            className="px-6 py-3 w-full text-gray-600 font-medium rounded-lg border border-gray-300 
                       transition-all duration-200 ease-in-out 
                       hover:bg-gray-50 hover:border-gray-400 hover:scale-[1.02]
                       focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
                       active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={hdlSubmit}
            aria-label="Confirmar ingreso sin marchamos"
            disabled={isLoading}
            className="px-6 py-3 w-full text-white font-semibold bg-gradient-to-r from-[#5A3F27] to-[#5A3F27]
                       rounded-lg shadow-lg transition-all duration-200 ease-in-out 
                       hover:from-[#5A3F27] hover:to-[#5A3F27] hover:scale-[1.02] hover:shadow-xl
                       focus:outline-none focus:ring-2 focus:ring-[#5A3F27] focus:ring-offset-2
                       active:scale-95"
          >
            {isLoading ? 'PROCESANDO...' : 'CONFIRMAR'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const FinalizarDescargaConMotivo = ({ hdClose, hdlSubmit, isLoading, time, setMotivo }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opa-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100 animate-fadeIn">
        {/* Header con icono y título */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <h2 className="text-2xl font-bold text-[amber-600] tracking-wide">
            {time ? 'Tiempo de finalización demasiado corto' : 'Limite de tiempo excedido'}
          </h2>
        </div>

        {/* Contenido del mensaje */}
        <div className="w-full">
          <label 
            htmlFor="motivo" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <span>Por favor, indique el motivo de este caso:</span>
          </label>
          <textarea
            id="motivo"
            name="motivo"
            onChange={(e)=>setMotivo(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-[#5A3F27] focus:border-[#5A3F27]
                      placeholder-gray-400 text-gray-900 resize-vertical resize-none max-sm:text-sm"
            placeholder="Ingrese el motivo detalladamente..."
          />
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={hdClose}
            aria-label="Cancelar operación"
            disabled={isLoading}
            className="px-6 py-3 w-full text-gray-600 font-medium rounded-lg border border-gray-300 
                       transition-all duration-200 ease-in-out 
                       hover:bg-gray-50 hover:border-gray-400 hover:scale-[1.02]
                       focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
                       active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={hdlSubmit}
            aria-label="Confirmar ingreso sin marchamos"
            disabled={isLoading}
            className="px-6 py-3 w-full text-white font-semibold bg-gradient-to-r from-[#5A3F27] to-[#5A3F27] 
                       rounded-lg shadow-lg transition-all duration-200 ease-in-out 
                       hover:from-[#5A3F27] hover:to-[#5A3F27] hover:scale-[1.02] hover:shadow-xl
                       focus:outline-none focus:ring-2 focus:ring-[#5A3F27] focus:ring-offset-2
                       active:scale-95"
          >
            {isLoading ? 'PROCESANDO...' : 'CONFIRMAR'}
          </button>
        </div>
      </div>
    </div>
  );
};