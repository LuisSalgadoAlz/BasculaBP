import { useEffect, useRef, useState } from 'react';
import { 
  AiOutlineClose, 
  AiOutlineDownload,
} from 'react-icons/ai';
import { formatNumber, URLHOST } from '../../constants/global';
import Cookies from 'js-cookie';
import { BsArrowsAngleExpand } from "react-icons/bs";
import {  AiOutlineUser, AiOutlineMail, AiOutlinePhone, AiOutlineEnvironment, AiOutlineCalendar } from 'react-icons/ai';
import Select from "react-select";

export const TablaResumenBFH = ({datos=[]}) => {
  return (
    <div className=" mt-10">
      <div className=" mx-auto">
        <h2 className="text-xl font-bold text-gray-500 mb-2">Resumen por día</h2>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-[#725033] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    FECHA
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    CANTIDAD VIAJES
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
                      {typeof fila?.pesoTeorico === 'number' ? `${formatNumber(fila.pesoTeorico/2204.62)} TM` : fila.pesoTeorico}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-mono">
                      {typeof fila?.pesoNeto === 'number' ? `${formatNumber(fila.pesoNeto/2204.62)} TM` : fila.pesoNeto}
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
        <h2 className="text-xl font-bold text-gray-500 mb-2">Resumen por día</h2>
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
/* 
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
                    # Boleta
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    # VIAJE
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    # Factura
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
                      {fila.numBoleta}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {fila.Nviajes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      # Fact. {fila.factura}
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
 */
export const BuqueDetalles = ({ datos = [], typeImp }) => {
  const [columnasDisponibles, setColumnasDisponibles] = useState([]);
  const [columnasSeleccionadas, setColumnasSeleccionadas] = useState([]);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const menuRef = useRef(null);

  const columnasInicialesAGranel = [
    'buque', 
    'numBoleta',
    'Nviajes', 
    'bodegaPuerto',
    'pesoTeorico',
    'pesoNeto',
    'desviacion',
    'empresa'
  ];

  const columnasInicialesContenerizadas= [
    'buque', 
    'numBoleta', 
    'producto', 
    'pesoTeorico',
    'pesoNeto',
    'desviacion',
    'empresa'
  ]

  const columnasOcultas = [
    // 'numBoleta',  
    // 'Nviajes',
    // 'factura', 
    // 'bodegaPuerto',
    // 'pesoTeorico',
    // 'pesoNeto',
    // 'desviacion',
    // 'empresa',
    
    // También puedes ocultar campos que no sean útiles para el usuario:
    'id',
    'idDestino',
    'idEmpresa', 
    'idFurgon',
    'idMotorista',
    'idMovimiento',
    'idOrigen',
    'idPlaca',
    'idProducto',
    'idSocio',
    'idTrasladoDestino',
    'idTrasladoOrigen',
    'idUsuario',
    'boletaType',
    'proceso', 
    'furgon'
  ];

  // Extraer todas las columnas disponibles de los datos
  useEffect(() => {
    if (datos.length > 0) {
      const todasLasColumnas = Object.keys(datos[0])
        .filter(key => !columnasOcultas.includes(key)) // Filtrar columnas ocultas
        .map(key => ({
          key,
          titulo: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          seleccionada: typeImp === 2 ? columnasInicialesAGranel.includes(key) : columnasInicialesContenerizadas.includes(key),
        }));
      setColumnasDisponibles(todasLasColumnas);
    }
  }, [datos]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMostrarMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar selección de columnas
  const toggleColumna = (key) => {
    setColumnasDisponibles(prev => 
      prev.map(col => 
        col.key === key ? { ...col, seleccionada: !col.seleccionada } : col
      )
    );
  };

  // Actualizar columnas seleccionadas
  useEffect(() => {
    const seleccionadas = columnasDisponibles.filter(col => col.seleccionada);
    setColumnasSeleccionadas(seleccionadas);
  }, [columnasDisponibles]);

  return (
    <div className="mt-10 mb-4">
      <div className="mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-500">Detalles</h2>
          
          {/* Botón y menú flotante */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMostrarMenu(!mostrarMenu)}
              className="bg-[#725033] hover:bg-[#725033] text-white px-4 py-2 rounded text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Columnas ({columnasSeleccionadas.length})
            </button>

            {/* Menú flotante compacto */}
            {mostrarMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="max-h-64 overflow-y-auto p-2">
                  {columnasDisponibles.map((columna) => (
                    <label 
                      key={columna.key} 
                      className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={columna.seleccionada}
                        onChange={() => toggleColumna(columna.key)}
                        className="rounded text-blue-500"
                      />
                      <span className="text-gray-700">{columna.titulo}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabla */}
        {columnasSeleccionadas.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-[#725033] text-white">
                  <tr>
                    {columnasSeleccionadas.map((columna, index) => (
                      <th key={index} className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                        {columna.titulo}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {datos.map((fila, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                      {columnasSeleccionadas.map((columna, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {typeof fila[columna.key] === 'object' && fila[columna.key] !== null
                            ? JSON.stringify(fila[columna.key])
                            : String(fila[columna.key] ?? '')
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
            Selecciona al menos una columna para mostrar los datos
          </div>
        )}
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

export const ModalReportes=({reports, hdlClose, buque = 1058, factura='110016055'}) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoadingDescargasExcel, setIsLoadingDescargasExcel] = useState(false);
  const [showParametersModal, setShowParametersModal] = useState(false);
  const [parameters, setParameters] = useState({
    tarifa: '',
    tasaCompraDolar: '',
    tasaVentaDolar: '',
    costeQuintal: ''
  });

  const handleSelectReport = (report) => {
    setSelectedReport(report);
  };

  const handleParameterChange = (field, value) => {
    setParameters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateParameters = () => {
    return Object.values(parameters).every(value => value.trim() !== '');
  };

  const handleGenerateReport = async() => {
    if (selectedReport) {
      if(selectedReport.id === 2) {
        // Mostrar modal de parámetros para liquidaciones
        setShowParametersModal(true);
        return;
      }
      
      // Para otros reportes, generar directamente
      await generateReport();
    }
  };

  const generateReport = async () => {
  try {
    setIsLoadingDescargasExcel(true);
    let url = '';

    // Construir URL según el tipo de reporte
    if (selectedReport.id === 1) {
      url = `${URLHOST}informes/export/r1/excel?buque=${buque}&factura=${factura}`;
    } else if(selectedReport.id === 3) {
      url = `${URLHOST}informes/export/r2/excel?socio=${buque}&factura=${factura}`;
    } else if (selectedReport.id === 2) {
      url = `${URLHOST}informes/generar/pagos/${buque}/${factura}`;
      
      const params = new URLSearchParams({
        tarifa: parameters.tarifa,
        tasaCompraDolar: parameters.tasaCompraDolar,
        tasaVentaDolar: parameters.tasaVentaDolar,
        costeQuintal: parameters.costeQuintal
      });
      url += `?${params.toString()}`;
    } else {
      throw new Error('Tipo de reporte no válido');
    }

    // Realizar petición HTTP
    const response = await fetch(url, {
      method: "GET",
      headers: { "Authorization" : Cookies.get('token') },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    // Descargar archivo
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${selectedReport.title}_${factura}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    
    // Limpiar URL del blob para liberar memoria
    window.URL.revokeObjectURL(downloadUrl);

    // Limpiar estado solo para reporte tipo 2
    if (selectedReport.id === 2) {
      setShowParametersModal(false);
      setParameters({
        tarifa: '',
        tasaCompraDolar: '',
        tasaVentaDolar: '',
        costeQuintal: ''
      });
    }
    
    // Limpiar selección de reporte
    setSelectedReport(null);

  } catch (err) {
    console.error('Error al generar el reporte:', err);
    alert('Algo salió mal al generar el reporte. Verifique su conexión a la red e intente de nuevo.');
  } finally {
    setIsLoadingDescargasExcel(false);
  }
};

  const handleCloseParametersModal = () => {
    setShowParametersModal(false);
    setParameters({
      tarifa: '',
      tasaCompraDolar: '',
      tasaVentaDolar: '',
      costeQuintal: ''
    });
  };

  return (
    <>
      {/* Modal principal de selección de reportes */}
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
                  {isLoadingDescargasExcel ? 'Generando...' : selectedReport?.id === 2 ? 'Ingresar Parametros' : 'Generar'}
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* Modal de parámetros para reporte 2 */}
      {showParametersModal && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="bg-gradient-to-r bg-[#725033] text-white p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Parámetros del Reporte</h2>
                <button
                  onClick={handleCloseParametersModal}
                  className="text-white hover:text-gray-200 hover:bg-red-400 rounded-2xl p-1 hover:scale-105 transition-colors"
                >
                  <AiOutlineClose size={20} />
                </button>
              </div>
              <p className="text-blue-100 mt-1 text-sm">
                Complete los siguientes campos
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarifa de pago de transporte
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={parameters.tarifa}
                  onChange={(e) => handleParameterChange('tarifa', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#725033] focus:border-transparent outline-none transition-all"
                  placeholder="Ingrese la tarifa de pago de transporte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tasa de Compra del Dólar
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={parameters.tasaCompraDolar}
                  onChange={(e) => handleParameterChange('tasaCompraDolar', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#725033] focus:border-transparent outline-none transition-all"
                  placeholder="Ingrese la tasa de compra"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tasa de Venta del Dólar
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={parameters.tasaVentaDolar}
                  onChange={(e) => handleParameterChange('tasaVentaDolar', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#725033] focus:border-transparent outline-none transition-all"
                  placeholder="Ingrese la tasa de venta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coste del quintal para cobro de transporte
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={parameters.costeQuintal}
                  onChange={(e) => handleParameterChange('costeQuintal', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#725033] focus:border-transparent outline-none transition-all"
                  placeholder="Ingrese el coste del quintal"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 rounded-b-xl">
              <button
                onClick={handleCloseParametersModal}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors hover:scale-105"
              >
                Cancelar
              </button>
              <button
                onClick={generateReport}
                disabled={!validateParameters() || isLoadingDescargasExcel}
                className={`
                  px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 hover:scale-105
                  ${validateParameters() && !isLoadingDescargasExcel
                    ? 'bg-[#725033] hover:bg-[#8f6c4c] text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                <AiOutlineDownload size={14} />
                {isLoadingDescargasExcel ? 'Generando...' : 'Generar Reporte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export const TableComponentCasulla = ({ datos = [{}], fun, total = [{}] }) => {
  // Función para extraer el valor numérico del porcentaje
  const getPercentageValue = (value) => {
    if (typeof value === 'string' && value.includes('%')) {
      return parseFloat(value.replace('%', ''));
    }
    return parseFloat(value) || 0;
  };

  // Obtener las claves de las columnas
  const columnKeys = Object.keys(datos[0]);
  const lastColumnIndex = columnKeys.length - 1;

  return (
    <>
      <div className="relative overflow-x-auto rounded-sm">
        <table className="w-full text-sm text-left rtl:text-right text-gray-700 dark:text-gray-400">
          <thead className="text-xs uppercase bg-[#725033] rounded-2xl text-white">
            <tr>
              {columnKeys.map((el, keys) => (
                <th key={keys} scope="col" className={`px-6 py-4 ${(keys > 1 && lastColumnIndex!==keys) && 'text-right'} ${lastColumnIndex===keys && 'text-center'}`}>
                  {el}
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-center">
                Detalles
              </th>
            </tr>
          </thead>
          <tbody>
            {datos.map((fila, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 && 'bg-gray-50'} border-b border-gray-200 hover:bg-[#FDF5D4] select-none`}
                onDoubleClick={() => fun(fila)}
              >
                {Object.values(fila).map((el, key) => (
                  <td key={key} className={`px-6 py-3 text-gray-700 text-sm font-mono ${key > 1 && 'text-right'}`}>
                    {key === lastColumnIndex ? (
                      // Renderizar progress bar para la última columna (porcentaje)
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5 min-w-[20px] flex-col">
                          <div
                            className="bg-[#725033] h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(getPercentageValue(el), 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600 min-w-[35px]">
                          {el}
                        </span>
                      </div>
                    ) : (
                      // Renderizar texto normal para las demás columnas
                      el
                    )}
                  </td>
                ))}
                <td className="py-3 text-center">
                  <button
                    className="font-medium text-gray-800 hover:underline text-center"
                    onClick={() => fun(fila)}
                  >
                    <span className="text-center">
                      <BsArrowsAngleExpand className="text-xl" />
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const TableSheet = ({tableData = [{}], openSheet = true, setOpenSheet}) => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Overlay */}
        {openSheet && (
          <div className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300" />
        )}

        {/* Sheet */}
        <div
          className={`fixed top-0 right-0 h-full w-full max-w-4xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
            openSheet ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header del Sheet */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Detalles casulla</h2>
              <p className="text-sm text-gray-500 mt-1">Visualización de los datos de Casulla: <span className='text-black font-bold'>{tableData[0].socio}</span></p>
            </div>
            <button
              onClick={() => setOpenSheet(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <AiOutlineClose className="w-6 h-6 text-gray-500" />
            </button>
          </div>

           {/* Contenido del Sheet con la tabla */}
          {tableData.length == 0 || !tableData ? (
            <>No data</>
          ) : (
            <div className="p-6 overflow-auto h-full pb-20">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {/* Generar encabezados dinámicamente */}
                        {tableData.length > 0 && Object.keys(tableData[0]).map((key) => (
                          <th key={key} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tableData.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-gray-50 transition-colors duration-150">
                          {/* Generar celdas dinámicamente */}
                          {Object.entries(item).map(([key, value]) => (
                            <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {typeof value === 'object' && value !== null ? 
                                JSON.stringify(value) : 
                                String(value)
                              }
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Estadísticas dinámicas */}
              <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <AiOutlineUser className="w-8 h-8 text-gray-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Registros</p>
                      <p className="text-2xl font-semibold text-gray-900">{tableData.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export const StatsCard = ({ title, value, icon, bgColor = "bg-blue-50", iconColor = "text-blue-600", textColor = "text-blue-800" }) => {
  return (
    <div className={`${bgColor} p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
          <p className={`text-2xl font-bold ${textColor} mt-1`}>{value}</p>
        </div>
        <div className={`${iconColor} p-3 rounded-lg bg-white/50`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export const CasullaStatsCards = ({ total }) => {
  // Extraer los datos del total
  const totalData = total?.[0] || {};
  
  const stats = [
    {
      title: "Total Viajes",
      value: totalData.Viajes || "0",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      bgColor: "bg-white",
      iconColor: "text-[#725033]",
      textColor: "text-[#725033]"
    },
    {
      title: "Peso Total (lb)",
      value: totalData.totalPesoLb || "0 lb",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgColor: "bg-white",
      iconColor: "text-[#725033]",
      textColor: "text-[#725033]"
    },
    {
      title: "Peso Total (qq)",
      value: totalData.totalPesoQq || "0 qq",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgColor: "bg-white",
      iconColor: "text-[#725033]",
      textColor: "text-[#725033]"
    },
    {
      title: "Peso Total (tm)",
      value: totalData.totalPesoTm || "0 tm",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgColor: "bg-white",
      iconColor: "text-[#725033]",
      textColor: "text-[#725033]"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          bgColor={stat.bgColor}
          iconColor={stat.iconColor}
          textColor={stat.textColor}
        />
      ))}
    </div>
  );
};

export const SelectFormImportaciones = ({ data = {}, name, fun, stt = false, val }) => {
  const customStyles = {
    control: (base, state) => ({
      ...base,
      appearance: 'none',
      width: '300px', 
      backgroundColor: 'white',
      color: '#111827', 
      border: state.isFocused 
        ? '2px solid #955e37' 
        : '1px solid #d1d5db',
      borderRadius: '8px',
      paddingTop: '6px',
      paddingBottom: '6px',
      paddingLeft: '16px',
      paddingRight: '10px', // pr-10
      boxShadow: state.isFocused 
        ? '0 0 0 2px rgba(149, 94, 55, 0.1)' 
        : '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
      outline: 'none',
      maxWidth: '200px',
      transition: 'colors 200ms',
      '&:hover': {
        borderColor: state.isFocused ? '#955e37' : '#9ca3af'
      },
      minHeight: 'auto'
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0'
    }),
    input: (base) => ({
      ...base,
      margin: '0',
      padding: '0'
    }),
    indicatorSeparator: (base) => ({
      ...base,
      display: 'none'
    }),
    dropdownIndicator: (base) => ({
      ...base,
      paddingRight: '0'
    }),
    menuPortal: (base) => ({ 
      ...base, 
      zIndex: 9999 
    })
  };

  const opt = data.map((el) => {
    return {
      value: el.id,
      label: el.nombre,
    };
  });

  const selectedValue = val !== undefined
    ? opt.find((item) => item.value === val) || null
    : undefined; 

  const handleChange = (selectedOption) => {
    const fakeEvent = {
      target: {
        name,
        value: selectedOption ? selectedOption.value : "",
        data: selectedOption ? selectedOption.label : ""
      },
    };
    fun(fakeEvent); 
  };

  return (
    <>
      <Select
        name={name}
        styles={customStyles}
        menuPortalTarget={document.body}
        onChange={handleChange}
        options={opt}
        isDisabled={stt}
        isClearable
        {...(val !== undefined ? { value: selectedValue } : {})}
      />
    </>
  );
};


export default TableSheet;