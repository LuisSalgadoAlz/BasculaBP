import { FiClock, FiUser, FiTool, FiCircle, FiCheck } from 'react-icons/fi';
import { FaUserTie, FaMapMarkerAlt, FaTruck, FaIdBadge} from "react-icons/fa";      // Socio
import { PiTruckTrailerLight } from "react-icons/pi";
import { MdOutlineCancel } from "react-icons/md";

const ALERTS_COLORS = {
  COMPLETO : 'bg-white', 
  ADVERTENCIA: 'bg-yellow-200', 
  ERROR: 'bg-red-200'
}

const ESTADOS = {
  Activo: 'bg-green-200', 
  Inactivo: 'bg-red-100'
}

export const TableTolva = ({ datos = [{}] }) => {
  return (
    <>
      <div className="relative overflow-x-auto min-h-[400px]">
        <table className="w-full text-sm text-left rtl:text-right text-gray-700 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-[#FFFDF5]">
            <tr>
              {Object.keys(datos[0]).map((el, keys) => (
                <th key={keys} scope="col" className={`px-6 py-3 text-gray-700 ${keys === 0 ? 'text-left' : 'text-center'}`}>
                  {el}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.map((fila, index) => (
              <tr key={index} className={`${fila.categoria && ALERTS_COLORS[fila?.categoria]} border-b border-gray-200 hover:bg-[#FDF5D4] rounded-2xl`}>
                {Object.values(fila).map((el, key) => (
                  <td
                    key={key}
                    className={`px-6 py-3 text-gray-700 ${key === 0 ? 'text-left' : 'text-center'}`}
                  >
                    {el}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const TolvaCards = ({ datos = [], onFinalizar }) => {
  const formatFecha = (fecha) => {
    if (!fecha) return 'Pendiente';
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 0: return 'text-green-600';
      case 1: return 'text-gray-500';
      default: return 'text-yellow-600';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 0: return 'EN CURSO';
      case 1: return 'Finalizado';
      default: return 'Pendiente';
    }
  };

  const handleFinalizar = (item) => {
    if (onFinalizar) {
      onFinalizar(item);
    }
  };

  if (!datos || datos.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        <PiTruckTrailerLight className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {datos.map((item) => (
        <div key={item.id} className="bg-white border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors">
          
          {/* Layout Desktop - horizontal */}
          <div className="hidden 2xl:flex items-center justify-between space-x-6 text-sm">
            
            {/* Boleta y Tolva */}
            <div className="flex items-center space-x-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">#{item.idBoleta}</span>
              </div>
            </div>

            {/* Usuario */}
            <div className="flex items-center space-x-2">
              <FiUser className="w-3 h-3 text-gray-400" />
              <span className="text-gray-700 truncate max-w-32">{item.usuarioTolva}</span>
            </div>

            <div className="flex items-center space-x-2">
              <FaUserTie className="w-3 h-3 text-gray-400" />
              <span className="text-gray-700 truncate max-w-32">{item.boleta.socio}</span>
            </div>

            <div className="flex items-center space-x-2">
              <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
              <span className="text-gray-700 truncate max-w-32">{item.boleta.origen}</span>
            </div>

            <div className="flex items-center space-x-2">
              <FaTruck  className="w-3 h-3 text-gray-400" />
              <span className="text-gray-700 truncate max-w-32">{item.boleta.placa}</span>
            </div>

            <div className="flex items-center space-x-2">
              <FaIdBadge  className="w-3 h-3 text-gray-400" />
              <span className="text-gray-700 truncate max-w-32">{item.boleta.motorista}</span>
            </div>

            {/* Fechas */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <FiClock className="w-3 h-3 text-gray-400" />
                <span className="text-gray-700">{formatFecha(item.fechaEntrada)}</span>
              </div>
              {item.fechaSalida && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Salida:</span>
                  <span className="text-gray-700">{formatFecha(item.fechaSalida)}</span>
                </div>
              )}
            </div>

            {/* Silos */}
            <div className="flex items-center space-x-2">
              <FiTool className="w-3 h-3 text-gray-400" />
              <div className="flex items-center space-x-1">
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  {item?.principal?.nombre}
                </span>
                {item.secundario && (
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                    {item?.secundario?.nombre}
                  </span>
                )}
                {item.terciario && (
                  <span className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded">
                    {item?.terciario?.nombre}
                  </span>
                )}
              </div>
            </div>

            {/* Estado */}
            <div className="flex items-center space-x-1">
              <FiCircle className={`w-2 h-2 fill-current ${getEstadoColor(item.estado)}`} />
              <span className={`text-xs ${getEstadoColor(item.estado)}`}>
                {getEstadoTexto(item.estado)}
              </span>
            </div>

            <button
              onClick={() => handleFinalizar(item)}
                className="self flex items-center space-x-1 px-3 py-3 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-xs font-medium"
              >
              <MdOutlineCancel className="w-3 h-3" />
              <span>Cancelar</span>
            </button>

            {/* Botón Finalizar */}
            {item.estado === 0 && (
              <button
                onClick={() => handleFinalizar(item)}
                className="flex items-center space-x-1 px-3 py-3 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-xs font-medium"
              >
                <FiCheck className="w-3 h-3" />
                <span>Finalizar</span>
              </button>
            )}

          </div>

          {/* Layout Mobile/Tablet - vertical */}
          <div className="2xl:hidden space-y-3">
            
            {/* Header móvil */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">#{item.idBoleta}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{item.tolvaDescarga}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiCircle className={`w-2 h-2 fill-current ${getEstadoColor(item.estado)}`} />
                <span className={`text-xs ${getEstadoColor(item.estado)}`}>
                  {getEstadoTexto(item.estado)}
                </span>
              </div>
            </div>

            {/* Información en grid móvil */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              
              {/* Usuario */}
              <div className="flex items-center space-x-2">
                <FiUser className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Usuario:</span>
                <span className="text-gray-700 truncate">{item.usuarioTolva}</span>
              </div>

              <div className="flex items-center space-x-2">
                <FaUserTie className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Socio:</span>
                <span className="text-gray-700 truncate max-w-32">{item.boleta.socio}</span>
              </div>

              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Origen:</span>
                <span className="text-gray-700 truncate max-w-32">{item.boleta.origen}</span>
              </div>

              <div className="flex items-center space-x-2">
                <FaTruck  className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Placa:</span>
                <span className="text-gray-700 truncate max-w-32">{item.boleta.placa}</span>
              </div>

              <div className="flex items-center space-x-2">
                <FaIdBadge  className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Motorista:</span>
                <span className="text-gray-700 truncate max-w-32">{item.boleta.motorista}</span>
              </div>
              {/* Entrada */}
              <div className="flex items-center space-x-2">
                <FiClock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Entrada:</span>
                <span className="text-gray-700">{formatFecha(item.fechaEntrada)}</span>
              </div>

              {/* Salida (si existe) */}
              {item.fechaSalida && (
                <div className="flex items-center space-x-2 sm:col-span-2">
                  <FiClock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">Salida:</span>
                  <span className="text-gray-700">{formatFecha(item.fechaSalida)}</span>
                </div>
              )}

            </div>

            {/* Silos móvil */}
            <div className="flex items-center space-x-2">
              <FiTool className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">Silos:</span>
              <div className="flex items-center space-x-1 flex-wrap">
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  {item?.principal?.nombre}
                </span>
                {item.secundario && (
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                    {item?.secundario?.nombre}
                  </span>
                )}
                {item.terciario && (
                  <span className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded">
                    {item?.terciario?.nombre}
                  </span>
                )}
              </div>
            </div>

            {/* Botón Finalizar móvil */}
            {item.estado === 0 && (
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleFinalizar(item)}
                  className="w-full flex items-center justify-center space-x-1 px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-sm font-medium"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>Finalizar</span>
                </button>
              </div>
            )}

          </div>
        </div>
      ))}
    </div>
  );
};

// Componente principal con header simplificado
export const TolvaSection = ({ tolva, titulo = "Tolva De Descarga #1", datos, onFinalizar }) => {
  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <span className="text-md font-semibold text-gray-800 flex items-center max-sm:text-sm">
          {titulo}
        </span>
        <div className="h-px flex-1 ml-4 bg-gray-200"></div>
      </div>
      <TolvaCards datos={datos || tolva?.descarga1} onFinalizar={onFinalizar} />
    </div>
  );
};