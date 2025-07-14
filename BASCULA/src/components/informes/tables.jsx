import { useState } from 'react';
import { 
  AiOutlineClose, 
  AiOutlineDownload,
} from 'react-icons/ai';

export const TablaResumenBFH = ({datos=[]}) => {
  return (
    <div className=" mt-10">
      <div className=" mx-auto">
        <h2 className="text-xl font-bold text-gray-500 mb-2">Resumen BFH</h2>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-[#725033] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    FECHA
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    # VIAJE TEH
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    QQ T.E.H
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    PESO NETO QQ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    DIF. EN PESOS
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    % DIF. EN PESOS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {datos.map((fila, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {fila.fecha}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {fila.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-mono">
                      {typeof fila?.pesoTeorico === 'number' ? `${(fila.pesoTeorico/2204.62).toFixed(2)} TM` : fila.pesoTeorico}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-mono">
                      {typeof fila?.pesoNeto === 'number' ? `${(fila.pesoNeto/2204.62).toFixed(2)} TM` : fila.pesoNeto}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-medium ${
                      fila.desviacion >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {typeof fila?.desviacion === 'number' ? `${fila.desviacion >= 0 ? '+' : ''}${(fila.desviacion/2204.62).toFixed(2)} TM` : fila.desviacion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                      {typeof fila?.desviacion === 'number' ? `${((fila.desviacion/fila.pesoTeorico)*100).toFixed(2)} %` : fila.desviacion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Total de registros: {datos.length}
        </div>
      </div>
    </div>
  );
};

export const TablaResumenBFHLoader = () => {
  const skeletonRows = Array(1).fill(null);

  return (
    <div className="mt-10">
      <div className="mx-auto">
        <h2 className="text-xl font-bold text-gray-500 mb-2">Resumen BFH</h2>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-[#725033] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    FECHA
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    # VIAJE TEH
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    QQ T.E.H
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    PESO NETO QQ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    DIF. EN PESOS
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    % DIF. EN PESOS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {skeletonRows.map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-4 bg-gray-200 rounded w-14 ml-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-4 bg-gray-200 rounded w-14 ml-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export const BuqueDetalles = ({datos=[]}) => {
  return (
    <div className=" mt-10 mb-4">
      <div className=" mx-auto">
        <h2 className="text-xl font-bold text-gray-500 mb-2">Detalles</h2>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-[#725033] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    # VIAJE
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    # Bodega
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    QQ T.E.H
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    PESO NETO QQ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    DIF. EN PESOS
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    % DIF. EN PESOS
                  </th> 
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {datos.map((fila, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {fila.Nviajes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {fila.bodegaPuerto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-mono">
                      {typeof fila.pesoTeorico === 'number' ? `${(fila.pesoTeorico/100).toFixed(2)} QQ` : fila.pesoTeorico}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-mono">
                      {typeof fila.pesoNeto === 'number' ? `${(fila.pesoNeto/100).toFixed(2)} QQ` : fila.pesoNeto}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-medium ${
                      fila.desviacion >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {fila.desviacion >= 0 ? '+' : ''}{typeof fila.desviacion === 'number' ? `${(fila.desviacion/100).toFixed(2)} QQ` : fila.desviacion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                      {typeof fila.desviacion === 'number' && typeof fila.pesoTeorico === 'number' ?  `${((fila.desviacion/fila.pesoTeorico)*100).toFixed(2)} %` : fila.desviacion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BuqueDetallesLoader = ({page}) => {
  const skeletonRows = Array(page!==1 ? 10 : 1).fill(null);
  return (
    <div className="mt-10">
      <div className="mx-auto">
        <h2 className="text-xl font-bold text-gray-500 mb-2">Detalles</h2>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-[#725033] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    # VIAJE
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    QQ T.E.H
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    PESO NETO QQ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    DIF. EN PESOS
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    % DIF. EN PESOS
                  </th> 
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {skeletonRows.map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-4 bg-gray-200 rounded w-14 ml-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-4 bg-gray-200 rounded w-14 ml-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export const ModalReportes=({reports, hdlClose}) => {
  const [selectedReport, setSelectedReport] = useState(null);

  const handleSelectReport = (report) => {
    setSelectedReport(report);
  };

  const handleGenerateReport = () => {
    if (selectedReport) {
      alert(`Generando reporte: ${selectedReport.title}`);
      setIsOpen(false);
      setSelectedReport(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opa-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[70vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r bg-[#725033] text-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Seleccionar Reporte</h2>
                <button
                  onClick={hdlClose}
                  className="text-white hover:text-gray-200 hover:bg-red-400 rounded-2xl p-1 hover:scale-105 transition-colors"
                >
                  <AiOutlineClose size={20} />
                </button>
              </div>
              <p className="text-blue-100 mt-1 text-sm">
                Elige el tipo de reporte
              </p>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[40vh]">
              <div className="grid grid-cols-2 gap-3">
                {reports.map((report) => {
                  const IconComponent = report.icon;
                  const isSelected = selectedReport?.id === report.id;
                  
                  return (
                    <div
                      key={report.id}
                      onClick={() => handleSelectReport(report)}
                      className={`
                        relative cursor-pointer rounded-lg border-2 transition-all duration-200 p-3 hover:shadow-md
                        ${isSelected 
                          ? 'border-[#725033] bg-[#72503313] shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      {/* Checkmark indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#725033] rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}

                      {/* Icon */}
                      <div className={`${report.color} w-8 h-8 rounded-md flex items-center justify-center mb-2`}>
                        <IconComponent size={16} className="text-white" />
                      </div>

                      {/* Content */}
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{report.title}</h3>
                      <p className="text-xs text-gray-600 mb-2">{report.description}</p>
                      
                      {/* Category badge */}
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {report.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
              <div className="text-xs text-gray-600">
                {selectedReport ? (
                  <span>Seleccionado: <strong>{selectedReport.title}</strong></span>
                ) : (
                  <span>Selecciona un reporte</span>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={hdlClose}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors hover:scale-105"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={!selectedReport}
                  className={`
                    px-4 py-1 text-sm rounded-lg font-semibold transition-all duration-200 flex items-center gap-1 hover:scale-105
                    ${selectedReport 
                      ? 'bg-[#725033] hover:bg-[#8f6c4c] text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  <AiOutlineDownload size={14} />
                  Generar
                </button>
              </div>
            </div>
          </div>
      </div>
    </>
  )
}