import { useEffect, useRef, useState, useMemo } from 'react';
import { 
  AiOutlineClose, 
  AiOutlineDownload,
  AiOutlineEyeInvisible,
  AiOutlineFilter,
} from 'react-icons/ai';
import { formatNumber, URLHOST } from '../../constants/global';
import Cookies from 'js-cookie';
import { BsArrowsAngleExpand } from "react-icons/bs";
import Select from "react-select";
import { IoTimerOutline } from "react-icons/io5";
import { AiOutlineSetting, AiOutlineEye,   } from 'react-icons/ai';
import { IoWarningOutline } from "react-icons/io5";
import { FiCheck, FiCircle, FiClock, FiTool, FiTruck, FiUser, FiUsers } from 'react-icons/fi';
import { FaIdBadge, FaMapMarkerAlt, FaTruck, FaUserTie, FaWeightHanging } from 'react-icons/fa';
import { PiTruckTrailerLight } from 'react-icons/pi';

export const TablaResumenBFH = ({datos=[], type}) => {
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
                    TM {type==2 ? 'TEH' : 'OCM'} {/* Preguntar a AXEL CORREGIR NO ES POR COMO LO TENGO */}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    PESO NETO TM
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
                    TM T.E.H
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    PESO NETO TM
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

  const columnasInicialesContenerizadas = [
    'buque', 
    'numBoleta', 
    'producto', 
    'pesoTeorico',
    'pesoNeto',
    'desviacion',
    'empresa'
  ];

  const columnasOcultas = [
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

  // Clave única para localStorage según el tipo de importación
  const keyStorageColumnas = `buque-columnas-${typeImp}`;

  // Extraer todas las columnas disponibles de los datos
  useEffect(() => {
    if (datos.length > 0) {
      const todasLasColumnas = Object.keys(datos[0])
        .filter(key => !columnasOcultas.includes(key));

      // Intentar cargar configuración guardada
      let columnasGuardadas = null;
      try {
        const stored = localStorage.getItem(keyStorageColumnas);
        if (stored) {
          columnasGuardadas = JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Error al cargar columnas desde localStorage:', error);
        // Si hay error, eliminar el item corrupto
        localStorage.removeItem(keyStorageColumnas);
      }

      const columnasConfiguradas = todasLasColumnas.map(key => {
        let seleccionada;
        
        if (columnasGuardadas) {
          // Si hay configuración guardada, buscar esta columna
          const columnaGuardada = columnasGuardadas.find(col => col.key === key);
          seleccionada = columnaGuardada ? columnaGuardada.seleccionada : false;
        } else {
          // Si no hay configuración guardada, usar columnas iniciales
          seleccionada = typeImp === 2 
            ? columnasInicialesAGranel.includes(key) 
            : columnasInicialesContenerizadas.includes(key);
        }

        return {
          key,
          titulo: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          seleccionada,
        };
      });
      
      setColumnasDisponibles(columnasConfiguradas);
    }
  }, [datos, typeImp, keyStorageColumnas]);

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
    setColumnasDisponibles(prev => {
      const nuevasColumnas = prev.map(col => 
        col.key === key ? { ...col, seleccionada: !col.seleccionada } : col
      );
      
      // Guardar configuración en localStorage
      try {
        localStorage.setItem(keyStorageColumnas, JSON.stringify(nuevasColumnas));
      } catch (error) {
        console.warn('Error al guardar columnas en localStorage:', error);
      }
      
      return nuevasColumnas;
    });
  };

  // Función para resetear columnas a la configuración inicial
  const resetearColumnas = () => {
    setColumnasDisponibles(prev => {
      const columnasReset = prev.map(col => ({
        ...col,
        seleccionada: typeImp === 2 
          ? columnasInicialesAGranel.includes(col.key)
          : columnasInicialesContenerizadas.includes(col.key)
      }));
      
      // Guardar la configuración reseteada
      try {
        localStorage.setItem(keyStorageColumnas, JSON.stringify(columnasReset));
      } catch (error) {
        console.warn('Error al guardar columnas reseteadas:', error);
      }
      
      return columnasReset;
    });
  };

  // Actualizar columnas seleccionadas
  useEffect(() => {
    const seleccionadas = columnasDisponibles.filter(col => col.seleccionada);
    setColumnasSeleccionadas(seleccionadas);
  }, [columnasDisponibles]);

  return (
    <div className="">
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
                <div className="p-2 border-b border-gray-200">
                  <button
                    onClick={resetearColumnas}
                    className="w-full text-left text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-2 py-1 rounded"
                  >
                    🔄 Resetear columnas
                  </button>
                </div>
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
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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

export const TableComponentCasulla = ({ datos = [{}], fun, total = [{}], type = true }) => {
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
    <div className="w-full">
      {/* Contenedor principal con altura fija y scroll */}
      <div className="relative overflow-x-hidden overflow-y-auto rounded-lg h-[500px] border border-gray-200 bg-white">
        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-400 min-w-[600px]">
          {/* Header fijo */}
          <thead className="text-xs uppercase bg-[#725033] text-white sticky top-0 z-10 shadow-sm">
            <tr>
              {columnKeys.map((el, keys) => (
                <th 
                  key={keys} 
                  scope="col" 
                  className={`
                    px-3 py-4 font-semibold whitespace-nowrap
                    sm:px-4 md:px-6
                    ${(keys > 1 && lastColumnIndex !== keys && type) ? 'text-right' : ''}
                    ${(lastColumnIndex === keys && type) ? 'text-center' : ''}
                  `}
                >
                  <div className="truncate" title={el}>
                    {el}
                  </div>
                </th>
              ))}
              {type && (
                <th scope="col" className="px-3 py-4 text-center font-semibold whitespace-nowrap sm:px-4 md:px-6">
                  Detalles
                </th>
              )}
            </tr>
          </thead>
          
          {/* Cuerpo de la tabla con scroll */}
          <tbody className="divide-y divide-gray-200">
            {datos.map((fila, index) => (
              <tr
                key={index}
                className={`
                  transition-colors duration-200 hover:bg-[#FDF5D4] cursor-pointer select-none
                  ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                `}
                onDoubleClick={() => fun(fila)}
              >
                {Object.values(fila).map((el, key) => (
                  <td 
                    key={key} 
                    className={`
                      px-3 py-3 text-gray-700 text-sm font-mono
                      sm:px-4 md:px-6
                      ${(key > 1 && type) ? 'text-right' : ''}
                    `}
                  >
                    {(key === lastColumnIndex && type) ? (
                      // Progress bar responsive para la última columna
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[40px] max-w-[120px]">
                          <div
                            className="bg-[#725033] h-2 rounded-full transition-all duration-300 ease-in-out"
                            style={{ width: `${Math.min(getPercentageValue(el), 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 whitespace-nowrap min-w-[40px] flex-shrink-0">
                          {el}
                        </span>
                      </div>
                    ) : (
                      // Texto normal con truncate para contenido largo
                      <div 
                        className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-none" 
                        title={el?.toString()}
                      >
                        {el}
                      </div>
                    )}
                  </td>
                ))}
                
                {type && (
                  <td className="px-3 py-3 text-center sm:px-4 md:px-6">
                    <button
                      className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#725033] focus:ring-opacity-50"
                      onClick={() => fun(fila)}
                      title="Ver detalles"
                    >
                      <BsArrowsAngleExpand className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            
            {/* Fila de relleno si hay pocos datos */}
            {datos.length === 0 && (
              <tr>
                <td 
                  colSpan={columnKeys.length + (type ? 1 : 0)} 
                  className="px-6 py-8 text-center text-gray-500 text-sm"
                >
                  No hay datos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Indicador de scroll para móviles */}
      <div className="mt-2 text-xs text-gray-500 text-center sm:hidden">
        ← Desliza horizontalmente para ver más →
      </div>
    </div>
  );
};

const TableSheet = ({
  tableData = [{}], 
  openSheet = true, 
  setOpenSheet, 
  title, 
  subtitle, 
  type = false,
  fixedColumns = [], // Columnas que no se pueden ocultar/mover
  storageKey = 'tablesheet-columns', // Clave personalizable para localStorage
  isLoading = true, 
  labelActive= true,
  detailsSilo= false,
  diferencia=0,
  // Nuevos props para el progress bar
  inventarioInicial = 0,
  boletas = 0,
  parteVacia = 0,
  capacidad=0
}) => {
  const [visibleColumns, setVisibleColumns] = useState({});
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  
  const getStorageKey = () => {
    return `${storageKey}-${title ? title.toLowerCase().replace(/\s+/g, '-') : 'default'}`;
  };
  
  const loadColumnsConfig = () => {
    try {
      const savedConfig = localStorage.getItem(getStorageKey());
      return savedConfig ? JSON.parse(savedConfig) : null;
    } catch (error) {
      console.warn('Error loading columns config from localStorage:', error);
      return null;
    }
  };
  
  const saveColumnsConfig = (config) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(config));
    } catch (error) {
      console.warn('Error saving columns config to localStorage:', error);
    }
  };

  // Memoizar las columnas disponibles para evitar recálculos innecesarios
  const availableColumns = useMemo(() => {
    return tableData.length > 0 ? Object.keys(tableData[0]) : [];
  }, [tableData.length > 0 ? Object.keys(tableData[0]).join(',') : '']);

  // Inicializar columnas visibles cuando cambian las columnas disponibles o el título
  useEffect(() => {
    if (availableColumns.length > 0) {
      const savedConfig = loadColumnsConfig();
      const initialVisible = {};
      
      availableColumns.forEach(column => {
        // Si hay configuración guardada, usar esa; sino, mostrar todas por defecto
        initialVisible[column] = savedConfig && savedConfig.hasOwnProperty(column) 
          ? savedConfig[column] 
          : true;
      });
      
      // Solo actualizar si la configuración es diferente
      setVisibleColumns(prev => {
        const isEqual = Object.keys(initialVisible).length === Object.keys(prev).length &&
          Object.keys(initialVisible).every(key => initialVisible[key] === prev[key]);
        
        return isEqual ? prev : initialVisible;
      });
    }
  }, [availableColumns.join(','), title]); // Usar join para comparar arrays
  
  // Obtener columnas visibles filtradas
  const getVisibleColumns = () => {
    return availableColumns.filter(column => visibleColumns[column]);
  };
  
  // Toggle visibilidad de columna
  const toggleColumnVisibility = (columnKey) => {
    // No permitir ocultar columnas fijas
    if (fixedColumns.includes(columnKey)) return;
    
    setVisibleColumns(prev => {
      const newConfig = {
        ...prev,
        [columnKey]: !prev[columnKey]
      };
      
      // Guardar inmediatamente en localStorage
      saveColumnsConfig(newConfig);
      
      return newConfig;
    });
  };
  
  // Restablecer configuración de columnas
  const resetColumnsConfig = () => {
    const allColumns = Object.keys(tableData[0] || {});
    const resetConfig = {};
    
    allColumns.forEach(column => {
      resetConfig[column] = true;
    });
    
    setVisibleColumns(resetConfig);
    saveColumnsConfig(resetConfig);
    setShowColumnSelector(false);
  };
  
  // Formatear nombre de columna
  const formatColumnName = (key) => {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  };

  // Calcular porcentajes para el progress bar
  const calculateProgressBarData = () => {
    const total = capacidad;
    if (total === 0) return { inventarioInicial: 0, boletas: 0, parteVacia: 0 };
    
    return {
      inventarioInicial: (inventarioInicial / total) * 100,
      boletas: (boletas / total) * 100,
      parteVacia: (parteVacia / total) * 100
    };
  };

  const progressData = calculateProgressBarData();

  // Componente Progress Bar Vertical
  const VerticalProgressBar = () => (
    <div className="flex flex-col items-center space-y-4 p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Estado del Silo</h3>
      
      <div className="relative w-16 h-80 bg-gray-200 rounded-lg overflow-hidden border-2 border-gray-300">
        {/* Parte vacía (arriba) */}
        <div 
          className="absolute top-0 left-0 w-full bg-gray-100 border-b border-gray-300"
          style={{ height: `${progressData.parteVacia}%` }}
        >
          {progressData.parteVacia > 15 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-gray-600 transform rotate-90 whitespace-nowrap">Vacío</span>
            </div>
          )}
        </div>
        
        {/* Boletas (medio) */}
        <div 
          className="absolute w-full bg-blue-400"
          style={{ 
            top: `${progressData.parteVacia}%`,
            height: `${progressData.boletas}%` 
          }}
        >
          {progressData.boletas > 15 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-white transform rotate-90 whitespace-nowrap">Boletas</span>
            </div>
          )}
        </div>
        
        {/* Inventario inicial (abajo) */}
        <div 
          className="absolute bottom-0 left-0 w-full bg-[#5a3f27]"
          style={{ height: `${progressData.inventarioInicial}%` }}
        >
          {progressData.inventarioInicial > 15 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-white transform rotate-90 whitespace-nowrap">Inventario</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-100 rounded border"></div>
          <span className="text-gray-600">Parte Vacía: {parteVacia.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-400 rounded"></div>
          <span className="text-gray-600">Boletas: {boletas.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-[#5a3f27] rounded"></div>
          <span className="text-gray-600">Inventario Inicial: {Math.round(inventarioInicial).toLocaleString()}</span>
        </div>
        <div className="pt-2 border-t border-gray-200">
          <span className="font-medium text-gray-900">
            Total: {(
              Number(inventarioInicial) +
              Number(boletas)
            ).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

  // Componente de mensaje de error
  const ErrorMessage = () => (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800">Diferencia Negativa Detectada</h3>
        </div>
        <p className="text-red-700 mb-4">
          Se ha detectado una diferencia negativa en el inventario. Es necesario reiniciar el silo.
        </p>
        <p className="text-red-600 text-sm">
          <strong>Acción requerida:</strong> Contactar con el equipo de IT para restablecer el inventario del silo.
        </p>
        <div className="mt-4 p-3 bg-red-100 rounded border border-red-200">
          <span className="text-sm font-medium text-red-800">
            Diferencia: {diferencia.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );

  // Componente Spinner
  const LoadingSpinner = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin"></div>
          <div className="w-12 h-12 border-4 border-[#725033] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-gray-500 text-sm">Cargando datos...</p>
      </div>
    </div>
  );

  // Componente para mostrar cuando no hay datos
  const NoDataMessage = () => (
    <div className="flex-1 p-6 text-center text-gray-500 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
          <p className="text-gray-500">Los datos se mostrarán aquí cuando estén disponibles.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {openSheet && (
          <div className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300" />
        )}
        <div
          className={`fixed top-0 right-0 h-full w-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
            openSheet ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header fijo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            </div>
            
            {type && !isLoading && (
              <div className="relative mr-4">
                <button
                  onClick={() => setShowColumnSelector(!showColumnSelector)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  title="Configurar columnas"
                >
                  <AiOutlineSetting className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Columnas</span>
                </button>
                {/* Dropdown del selector de columnas */}
                {showColumnSelector && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Configuración</h3>
                      <button
                        onClick={resetColumnsConfig}
                        className="text-xs text-[#725033] hover:text-[#725033] underline"
                        title="Restablecer configuración"
                      >
                        Restablecer
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {availableColumns.map((column) => {
                        const isFixed = fixedColumns.includes(column);
                        const isVisible = visibleColumns[column];
                        
                        return (
                          <div
                            key={column}
                            className={`flex items-center justify-between p-3 hover:bg-gray-50 ${
                              isFixed ? 'opacity-60' : 'cursor-pointer'
                            }`}
                            onClick={() => !isFixed && toggleColumnVisibility(column)}
                          >
                            <div className="flex items-center space-x-2">
                              {isVisible ? (
                                <AiOutlineEye className="w-4 h-4 text-[#725033]" />
                              ) : (
                                <AiOutlineEyeInvisible className="w-4 h-4 text-gray-400" />
                              )}
                              <span className={`text-sm ${isFixed ? 'text-gray-500' : 'text-gray-900'}`}>
                                {formatColumnName(column)}
                                {isFixed && <span className="ml-1 text-xs">(fija)</span>}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={isVisible}
                              onChange={() => !isFixed && toggleColumnVisibility(column)}
                              disabled={isFixed}
                              className="h-4 w-4 text-[#725033] rounded border-gray-300 focus:ring-[#725033] disabled:opacity-50"
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-3 border-t border-gray-200 bg-gray-50 flex space-x-2">
                      <button
                        onClick={() => setShowColumnSelector(false)}
                        className="flex-1 px-3 py-2 text-sm bg-[#725033] text-white rounded-md hover:bg-[#725033] transition-colors"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setOpenSheet(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
            >
              <AiOutlineClose className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          
          {/* Contenido scrollable */}
          <div className="flex-1 overflow-hidden flex">
            {isLoading ? (
              <div className="flex-1">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {/* Contenido principal de la tabla o mensaje sin datos */}
                <div className="flex-1 overflow-auto flex flex-col">
                  {/* Tabla scrollable o mensaje sin datos */}
                  {tableData.length === 0 || !tableData ? (
                    <NoDataMessage />
                  ) : (
                    <div className="flex-1 overflow-auto p-6">
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                              <tr>
                                {getVisibleColumns().map((key) => (
                                  <th key={key} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                    {formatColumnName(key)}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {tableData.map((item, index) => (
                                <tr key={item.id || index} className="hover:bg-gray-50 transition-colors duration-150">
                                  {getVisibleColumns().map((key) => (
                                    <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {typeof item[key] === 'object' && item[key] !== null ? 
                                        JSON.stringify(item[key]) : 
                                        String(item[key])
                                      }
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Footer fijo - Solo mostrar si hay datos */}
                  {tableData.length > 0 && (
                    <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                      <div className="text-sm text-gray-600">
                        BAPROSA - Mostrando {tableData.length} {labelActive? 'registros' : 'camiones descargados'}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Panel lateral condicional - Ahora se muestra siempre que detailsSilo sea true */}
                {detailsSilo && (
                  <div className="w-80 border-l border-gray-200 bg-gray-50 flex-shrink-0">
                    {diferencia.toFixed(2) < 0 ? (
                      <ErrorMessage />
                    ) : (
                      <VerticalProgressBar />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
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


export const StatsCardTolvaReports = ({ value, loading, tiempos, tiempoPerdidoTotal }) => {
  if (value === undefined && !loading) return null

  // Si está cargando, mostrar cards con spinners (ahora 6 cards en total)
  if (loading) {
    const loadingCards = Array.from({ length: 6 }, (_, index) => ({
      title: `Tolva ${Math.floor(index / 3) + 1}`,
      value: null, // null indica que debe mostrar spinner
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgColor: "bg-white",
      iconColor: "text-[#725033]",
      textColor: "text-[#725033]"
    }))

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 mt-6">
        {loadingCards.map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            bgColor={card.bgColor}
            iconColor={card.iconColor}
            textColor={card.textColor}
          />
        ))}
      </div>
    )
  }

  // Crear cards para las cantidades
  const cantidadStats = value.map((el) => ({
    title: `Camiones Tolva ${el?.tolvaAsignada}`,
    value: `${el?.cantidad}`,
    subtitle: "Cantidad",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    bgColor: "bg-white",
    iconColor: "text-[#725033]",
    textColor: "text-[#725033]"
  }))

  // Crear cards para los tiempos promedio
  const tiempoStats = value.map((el) => {
    const tiempoData = tiempos.find((item) => item.tolvaAsignada === el.tolvaAsignada)
    const promedioTiempo = tiempoData?.PromedioTiempo || "N/A"
    
    return {
      title: `Promedio Tolva ${el?.tolvaAsignada}`,
      value: promedioTiempo,
      subtitle: "Tiempo Promedio",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-white",
      iconColor: "text-[#725033]",
      textColor: "text-[#725033]"
    }
  })

  // Crear cards para el tiempo perdido total
  const tiempoPerdidoStats = value.map((el) => {
    const tiempoPerdidoData = tiempoPerdidoTotal?.find((item) => item.tolvaAsignada === el.tolvaAsignada)
    const tiempoPerdido = tiempoPerdidoData?.tiempo_perdido_total || "0 h 0 m"
    
    return {
      title: `Tiempo Perdido T${el?.tolvaAsignada}`,
      value: tiempoPerdido,
      subtitle: "Tiempo Perdido Total",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      textColor: "text-red-600"
    }
  })

  // Combinar todos los arrays: cantidad, tiempo promedio y tiempo perdido por cada tolva
  const allStats = []
  for (let i = 0; i < cantidadStats.length; i++) {
    allStats.push(cantidadStats[i])      // Cantidad Tolva X
    allStats.push(tiempoStats[i])        // Tiempo Promedio Tolva X
    allStats.push(tiempoPerdidoStats[i]) // Tiempo Perdido Tolva X
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 mt-6">
      {allStats.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          bgColor={stat.bgColor}
          iconColor={stat.iconColor}
          textColor={stat.textColor}
        />
      ))}
    </div>
  )
}

export const StatsCardServicioBascula = ({ data, icons }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total de Servicios */}
      <StatsCard
        title="Total Servicios"
        value={data?.totalServicios || '0'}
        icon= {
          (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        }
        bgColor="bg-white"
        iconColor="text-[#725033]"
        textColor="text-[#725033]"
      />
      
      
      {!data && (
        <>
          <StatsCard
            title="SERVICIO BASCULA DOBLE: 0"
            value="L 0"
            icon={
              (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )
            }
            bgColor="bg-white"
            iconColor="text-[#725033]"
            textColor="text-[#725033]"
          />
          <StatsCard
            title="SERVICIO BASCULA SENCILLO: 0"
            value="L 0"
            icon={
              (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )
            }
            bgColor="bg-white"
            iconColor="text-[#725033]"
            textColor="text-[#725033]"
          />
        </>
      )}

      {data?.productoDetalle.map((item) => (
        <StatsCard
          key={item.producto}
          title={item.producto === 24 ? `SERVICIO BASCULA DOBLE: ${item.cantidad || '0'}` : `SERVICIO BASCULA SENCILLO: ${item.cantidad || '0'}`}
          value={`L ${formatNumber(item.totalLempiras)}`}
          icon= {
            (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )
          }
          bgColor="bg-white"
          iconColor="text-[#725033]"
          textColor="text-[#725033]"
        /> 
      ))}

      <StatsCard
        title="Total Servicios"
        value={`L ${formatNumber(data?.totalGeneralLempiras) || '0'}`}
        icon= {
          (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        }
        bgColor="bg-white"
        iconColor="text-[#725033]"
        textColor="text-[#725033]"
      />
    </div>
  );
};

export const TableComponentDescargados = ({ datos = [{}], fun, type=false, loading }) => {
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

  // Componente Skeleton
  const TableSkeleton = () => {
    const skeletonRows = datos.length || 5; // Número de filas skeleton
    const skeletonCols = columnKeys.length || 4; // Usar columnas reales o 4 por defecto
    
    return (
      <div className="relative overflow-x-auto rounded-sm">
        <table className="w-full text-sm text-left rtl:text-right">
          <thead className="text-xs uppercase bg-[#725033] rounded-2xl text-white">
            <tr>
              {Array.from({ length: skeletonCols }, (_, index) => (
                <th key={index} scope="col" className="px-6 py-4">
                  <div className="h-4 bg-white/20 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: skeletonRows }, (_, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${rowIndex % 2 === 0 && 'bg-gray-50'} border-b border-gray-200`}
              >
                {Array.from({ length: skeletonCols }, (_, colIndex) => (
                  <td key={colIndex} className="px-6 py-3">
                    {colIndex === skeletonCols - 1 && type ? (
                      // Skeleton para progress bar
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5 min-w-[20px]">
                          <div className="bg-gray-300 h-2.5 rounded-full animate-pulse w-3/4"></div>
                        </div>
                        <div className="h-3 bg-gray-300 rounded animate-pulse min-w-[35px]"></div>
                      </div>
                    ) : colIndex === skeletonCols - 1 && !type ? (
                      // Skeleton para ícono
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 bg-gray-300 rounded-full animate-pulse"></div>
                      </div>
                    ) : (
                      // Skeleton para texto normal
                      <div className={`h-4 bg-gray-300 rounded animate-pulse ${
                        colIndex > 1 ? 'w-16 ml-auto' : colIndex === 0 ? 'w-24' : 'w-20'
                      }`}></div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="relative overflow-x-auto rounded-sm">
          <table className="w-full text-sm text-left rtl:text-right text-gray-700 dark:text-gray-400">
            <thead className="text-xs uppercase bg-[#725033] rounded-2xl text-white">
              <tr>
                {columnKeys.map((el, keys) => (
                  <th key={keys} scope="col" className={`px-6 py-4 ${keys > 1 && 'text-center'}`}>
                    {el}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datos.map((fila, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 0 && 'bg-gray-50'} border-b border-gray-200 hover:bg-[#FDF5D4]`}
                  onDoubleClick={() => fun(fila)}
                >
                  {Object.values(fila).map((el, key) => (
                    <td key={key} className={`px-6 py-3 text-gray-700 text-sm font-mono ${key > 1 && 'text-center'}`}>
                      {key === lastColumnIndex && type ? (
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
                        type || key !== lastColumnIndex ? (
                          el || '- Sin comentarios -'
                        ) : (
                          <span className={`text-xl w-full flex items-center justify-center ${el===0 ? 'text-green-400' : 'text-red-400'}`}><IoTimerOutline /></span>
                        )
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export const ConfigurableTable = ({
  tableData = [{}], 
  title, 
  subtitle, 
  showColumnConfig = true,
  fixedColumns = [], // Columnas que no se pueden ocultar/mover
  filterableColumns = [], // Columnas que tendrán filtros - si está vacío, no muestra filtros
  storageKey = 'table-columns' // Clave personalizable para localStorage
}) => {
  const [visibleColumns, setVisibleColumns] = useState({});
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  
  const getStorageKey = () => {
    return `${storageKey}-${title ? title.toLowerCase().replace(/\s+/g, '-') : 'default'}`;
  };
  
  const loadColumnsConfig = () => {
    try {
      const savedConfig = localStorage.getItem(getStorageKey());
      return savedConfig ? JSON.parse(savedConfig) : null;
    } catch (error) {
      console.warn('Error', error);
      return null;
    }
  };
  
  const saveColumnsConfig = (config) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(config));
    } catch (error) {
      console.warn('Error', error);
    }
  };

  // Memoizar las columnas disponibles para evitar recálculos innecesarios
  const availableColumns = useMemo(() => {
    return tableData.length > 0 ? Object.keys(tableData[0]) : [];
  }, [tableData.length > 0 ? Object.keys(tableData[0]).join(',') : '']);

  // Inicializar columnas visibles cuando cambian las columnas disponibles o el título
  useEffect(() => {
    if (availableColumns.length > 0) {
      const savedConfig = loadColumnsConfig();
      const initialVisible = {};
      
      availableColumns.forEach(column => {
        // Si hay configuración guardada, usar esa; sino, mostrar todas por defecto
        initialVisible[column] = savedConfig && savedConfig.hasOwnProperty(column) 
          ? savedConfig[column] 
          : true;
      });
      
      // Solo actualizar si la configuración es diferente
      setVisibleColumns(prev => {
        const isEqual = Object.keys(initialVisible).length === Object.keys(prev).length &&
          Object.keys(initialVisible).every(key => initialVisible[key] === prev[key]);
        
        return isEqual ? prev : initialVisible;
      });
    }
  }, [availableColumns.join(','), title]);
  
  // Obtener columnas visibles filtradas
  const getVisibleColumns = () => {
    return availableColumns.filter(column => visibleColumns[column]);
  };
  
  // Toggle visibilidad de columna
  const toggleColumnVisibility = (columnKey) => {
    // No permitir ocultar columnas fijas
    if (fixedColumns.includes(columnKey)) return;
    
    setVisibleColumns(prev => {
      const newConfig = {
        ...prev,
        [columnKey]: !prev[columnKey]
      };
      
      // Guardar inmediatamente en localStorage
      saveColumnsConfig(newConfig);
      
      return newConfig;
    });
  };
  
  // Restablecer configuración de columnas
  const resetColumnsConfig = () => {
    const allColumns = Object.keys(tableData[0] || {});
    const resetConfig = {};
    
    allColumns.forEach(column => {
      resetConfig[column] = true;
    });
    
    setVisibleColumns(resetConfig);
    saveColumnsConfig(resetConfig);
    setShowColumnSelector(false);
  };

  // Filtrar datos basado en los filtros aplicados
  const filteredData = useMemo(() => {
    if (Object.keys(filters).length === 0) {
      return tableData;
    }

    return tableData.filter(item => {
      return Object.entries(filters).every(([column, filterValue]) => {
        if (!filterValue || filterValue.trim() === '') return true;
        
        const itemValue = item[column];
        
        // Manejo especial para booleanos
        if (typeof itemValue === 'boolean') {
          const filterLower = filterValue.toLowerCase();
          if (filterLower === 'true' || filterLower === 'verdadero' || filterLower === 'sí' || filterLower === 'si') {
            return itemValue === true;
          }
          if (filterLower === 'false' || filterLower === 'falso' || filterLower === 'no') {
            return itemValue === false;
          }
          return true;
        }
        
        // Para otros tipos, convertir a string y buscar coincidencia
        const searchValue = String(itemValue || '').toLowerCase();
        const filterLower = filterValue.toLowerCase();
        
        return searchValue.includes(filterLower);
      });
    });
  }, [tableData, filters]);

  // Manejar cambio en filtros
  const handleFilterChange = (column, value) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({});
  };

  // Obtener valores únicos para una columna (para sugerencias)
  const getUniqueValues = (column) => {
    const values = tableData.map(item => item[column])
      .filter(value => value !== null && value !== undefined)
      .map(value => String(value));
    return [...new Set(values)].sort().slice(0, 10); // Limitar a 10 sugerencias
  };
  
  // Formatear nombre de columna
  const formatColumnName = (key) => {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const visibleColumnsArray = getVisibleColumns();
  const filterableVisibleColumns = visibleColumnsArray.filter(column => 
    filterableColumns.includes(column)
  );
  const hasActiveFilters = Object.values(filters).some(filter => filter && filter.trim() !== '');
  const showFilterButton = filterableColumns.length > 0;
  return (
    <div className="min-h-screen flex flex-col p-1">
      {/* Header Sticky */}
      <div className="sticky top-0 bg-white z-30 border-b border-gray-200">
        <div className="flex items-center justify-between py-4 px-2">
          <div className="flex-1">
            {title && (
              <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">
                {subtitle} - Mostrando {filteredData.length} de {tableData.length} registros
                {hasActiveFilters && <span className="ml-2 text-[#725033]">(filtrado)</span>}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Botón de filtros - solo mostrar si hay columnas filtrables */}
            {showFilterButton && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 hover:bg-gray-100 rounded-lg flex items-center testing space-x-2 ${
                  hasActiveFilters ? 'bg-blue-50 text-[#5a3f27]' : 'text-gray-600'
                }`}
                title="Filtrar datos"
              >
                <AiOutlineFilter className="w-5 h-5" />
                <span className="text-sm">Filtros</span>
                {hasActiveFilters && (
                  <span className="bg-[#5a3f27] text-white text-xs rounded-full px-2 py-0.5 ml-1">
                    {Object.values(filters).filter(f => f && f.trim() !== '').length}
                  </span>
                )}
              </button>
            )}

            {showColumnConfig && (
              <div className="relative">
                <button
                  onClick={() => setShowColumnSelector(!showColumnSelector)}
                  className="p-2 hover:bg-gray-100 rounded-lg flex items-center space-x-2 testing"
                  title="Configurar columnas"
                >
                  <AiOutlineSetting className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Columnas</span>
                </button>
                
                {/* Dropdown del selector de columnas */}
                {showColumnSelector && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-40">
                    <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Configuración</h3>
                      <button
                        onClick={resetColumnsConfig}
                        className="text-xs text-[#725033] hover:text-[#725033] underline testing"
                        title="Restablecer configuración"
                      >
                        Restablecer
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {availableColumns.map((column) => {
                        const isFixed = fixedColumns.includes(column);
                        const isVisible = visibleColumns[column];
                        
                        return (
                          <div
                            key={column}
                            className={`flex items-center justify-between p-3 hover:bg-gray-50 ${
                              isFixed ? 'opacity-60' : 'cursor-pointer'
                            }`}
                            onClick={() => !isFixed && toggleColumnVisibility(column)}
                          >
                            <div className="flex items-center space-x-2">
                              {isVisible ? (
                                <AiOutlineEye className="w-4 h-4 text-[#725033]" />
                              ) : (
                                <AiOutlineEyeInvisible className="w-4 h-4 text-gray-400" />
                              )}
                              <span className={`text-sm ${isFixed ? 'text-gray-500' : 'text-gray-900'}`}>
                                {formatColumnName(column)}
                                {isFixed && <span className="ml-1 text-xs">(fija)</span>}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={isVisible}
                              onChange={() => !isFixed && toggleColumnVisibility(column)}
                              disabled={isFixed}
                              className="h-4 w-4 text-[#725033] rounded border-gray-300 focus:ring-[#725033] disabled:opacity-50"
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                      <button
                        onClick={() => setShowColumnSelector(false)}
                        className="w-full px-3 py-2 text-sm bg-[#725033] text-white rounded-md hover:bg-[#6a4a2f] testing"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Panel de filtros - solo mostrar si hay columnas filtrables */}
        {showFilters && showFilterButton && (
          <div className="border border-gray-200 bg-gray-50 p-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Filtros aplicables.</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-[#5a3f27] hover:text-[#5a3f27] underline testing"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterableVisibleColumns.map((column) => (
                <div key={column} className="flex flex-col">
                  <label className="text-xs font-medium text-gray-700 mb-1">
                    {formatColumnName(column)}
                  </label>
                  <input
                    type="text"
                    placeholder={`Filtrar ${formatColumnName(column).toLowerCase()}...`}
                    value={filters[column] || ''}
                    onChange={(e) => handleFilterChange(column, e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#725033] focus:border-[#725033] bg-white"
                  />
                  {/* Mostrar algunos valores únicos como sugerencias */}
                  {filters[column] && filters[column].length > 0 && (
                    <div className="mt-1">
                      {getUniqueValues(column)
                        .filter(value => value.toLowerCase().includes(filters[column].toLowerCase()))
                        .slice(0, 3)
                        .map((value, index) => (
                          <button
                            key={index}
                            onClick={() => handleFilterChange(column, value)}
                            className="text-xs text-[#5a3f27] bg-transparent testing mr-2 underline"
                          >
                            {value}
                          </button>
                        ))
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contenido de la tabla */}
      <div className="flex-1 p-1">
        <div className="mt-2">
          {filteredData.length === 0 ? (
            <div className="p-12 text-center text-gray-500 border border-gray-200 rounded-lg">
              {tableData.length === 0 ? 
                'No hay datos disponibles' : 
                'Sin datos según filtros'
              }
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Contenedor con altura máxima y scroll para el cuerpo de la tabla */}
              <div className="max-h-[75vh] overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100  [&::-webkit-scrollbar-thumb]:bg-gray-300">
                <table className="w-full">
                  {/* Header de tabla fijo */}
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {visibleColumnsArray.map((key) => (
                        <th key={key} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          <div className="flex items-center space-x-2">
                            <span>{formatColumnName(key)}</span>
                            {filters[key] && filterableColumns.includes(key) && (
                              <span className="bg-blue-100 text-[#5a3f27] text-xs px-2 py-0.5 rounded-full">
                                filtrado
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50">
                        {visibleColumnsArray.map((key) => (
                          <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof item[key] === 'object' && item[key] !== null ? 
                              JSON.stringify(item[key]) : 
                              item[key] == false ? (
                              <div className='flex items-center justify-left gap-2 text-red-600 font-bold'>
                                <IoWarningOutline />
                                No registrada.
                              </div>) 
                              : String(item[key])
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TimerCamionEnTolva = ({camion}) => {
  const {days, hours, minutes, seconds} = useTimerForUniqueComponent(camion.fechaEntrada);
  const defineTime = camion.tolvaDescarga.includes('T1') ? 50 : 40;
  const defineColor = (days > 0 || hours > 0 || minutes > defineTime) ? 'text-red-600' : 'text-green-600';
  return (
    <>
      <span className={`text-sm font-medium ${defineColor}`}>{days}d {hours}h {minutes}m {seconds}s</span>
    </>
  )
}

const TolvaCards = ({ datos = [], onFinalizar, tolvaNumero }) => {
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

  if (!datos || datos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <PiTruckTrailerLight className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm font-medium">Tolva Disponible</p>
        <p className="text-xs">Sin operaciones activas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {datos.map((item) => (
        <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">
                  #{item.idBoleta}
                </span>
                <TimerCamionEnTolva camion={item} />
              </div>
              <div className="flex items-center space-x-1">
                <FiCircle className={`w-2 h-2 fill-current ${getEstadoColor(item.estado)}`} />
                <span className={`text-xs font-medium ${getEstadoColor(item.estado)}`}>
                  {getEstadoTexto(item.estado)}
                </span>
              </div>
            </div>

            {/* Información en grid móvil */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              
              <div className="flex items-center space-x-2">
                <FiUser className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Usuario:</span>
                <span className="text-gray-700 truncate">{item.usuarioTolva}</span>
              </div>

              <div className="flex items-center space-x-2">
                <FaUserTie className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Socio:</span>
                <span className="text-gray-700 truncate">{item.boleta?.socio}</span>
              </div>

              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Origen:</span>
                <span className="text-gray-700 truncate">{item.boleta?.origen}</span>
              </div>

              <div className="flex items-center space-x-2">
                <FaTruck className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Placa:</span>
                <span className="text-gray-700 truncate">{item.boleta?.placa}</span>
              </div>

              <div className="flex items-center space-x-2">
                <FaIdBadge className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Motorista:</span>
                <span className="text-gray-700 truncate">{item.boleta?.motorista}</span>
              </div>
            </div>

            {/* Silos móvil */}
            <div className="flex items-center space-x-2">
              <FiTool className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">Silos:</span>
              <div className="flex items-center space-x-1 flex-wrap">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {item?.principal?.nombre || 'S1'}
                </span>
                {item.secundario && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {item?.secundario?.nombre || 'S2'}
                  </span>
                )}
                {item.terciario && (
                  <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                    {item?.terciario?.nombre || 'S3'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const TolvaSection = ({ tolva, numero, onFinalizar }) => {
  const conteoActivos = tolva?.filter(item => item.estado === 0).length || 0;
  const defineTolva = numero === 3 || numero ===1 ? 'T1' : 'T2';
  const defineNumero =  numero === 1 || numero === 2 ? 1 : 2;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#5a3f27] text-white rounded-full flex items-center justify-center text-sm font-bold">
              {numero}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Zona de Descarga {defineTolva} - {defineNumero}
              </h3>
              <p className="text-sm text-gray-500">
                {conteoActivos > 0 ? `${conteoActivos} operación${conteoActivos > 1 ? 'es' : ''} activa${conteoActivos > 1 ? 's' : ''}` : 'Disponible'}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            conteoActivos > 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {conteoActivos > 0 ? 'Ocupada' : 'Libre'}
          </div>
        </div>
      </div>
      <div className="p-6">
        <TolvaCards datos={tolva} onFinalizar={onFinalizar} tolvaNumero={numero} />
      </div>
    </div>
  );
};

const TimerCamionesEnEspera = ({camion}) =>{
  const {days, hours, minutes, seconds} = useTimerForUniqueComponent(camion.fechaInicio);
  return (
    <>
      <div className="flex items-center space-x-1">
        <FiClock className="w-3 h-3 text-orange-600" />
        <span className="text-sm text-orange-700 font-medium">
          {days}d {hours}h {minutes}m {seconds}s
        </span>
      </div>
    </>
  )
}

const CamionesEnEspera = ({ camiones = [] }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center">
              <FiUsers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Cola de Espera
              </h3>
              <p className="text-sm text-gray-500">
                {camiones.length} camión{camiones.length !== 1 ? 'es' : ''} esperando
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
            {camiones.length} en cola
          </div>
        </div>
      </div>
      <div className="p-3">
        {camiones.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FiTruck className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Sin camiones en espera</p>
            <p className="text-xs">La cola está vacía</p>
          </div>
        ) : (
          <div className="space-y-3">
            {camiones.map((camion, index) => (
              <div key={camion.id || index} className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-800">#{camion.id}</span>
                    <TimerCamionesEnEspera camion={camion} />
                  </div>
                  <div className="px-2 py-1 bg-orange-200 text-orange-800 rounded text-xs font-medium">
                    En espera
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <FaUserTie className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Socio:</span>
                    <span className="text-gray-700 truncate">{camion.socio}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <FaTruck className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Placa:</span>
                    <span className="text-gray-700 truncate">{camion.placa}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <FaIdBadge className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Motorista:</span>
                    <span className="text-gray-700 truncate">{camion.motorista}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FaIdBadge className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Producto:</span>
                    <span className="text-gray-700 truncate">{camion.producto}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Origen:</span>
                    <span className="text-gray-700 truncate">{camion.origen}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FaIdBadge className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Tolva destino:</span>
                    <span className="text-gray-700 truncate">{camion.tolvaAsignada}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const TolvasDashboard = ({ datos, camionesEspera = [], onFinalizar }) => {
  const [selectedTolva, setSelectedTolva] = useState(null);

  // Datos de ejemplo si no se proporcionan
  const datosEjemplo = datos || {
    tolva1: [],
    tolva2: [],
    tolva3: [],
    tolva4: []
  };

  const camionesEjemplo = camionesEspera.length > 0 ? camionesEspera : [];

  const tolvas = [
    { numero: 1, datos: datosEjemplo.tolva1 },
    { numero: 2, datos: datosEjemplo.tolva2 },
    { numero: 3, datos: datosEjemplo.tolva3 },
    { numero: 4, datos: datosEjemplo.tolva4 }
  ];

  return (
    <div className="bg-white shadow-2xl px-6 py-8">
      <div className="mx-auto">
        <div className="grid grid-cols-1 2xl:grid-cols-4 gap-6">
          
          {/* Tolvas - 3 columnas en pantallas grandes */}
          <div className="2xl:col-span-3">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {tolvas.map(({ numero, datos }) => (
                <TolvaSection
                  key={numero}
                  tolva={datos}
                  numero={numero}
                />
              ))}
            </div>
          </div>

          {/* Camiones en espera - 1 columna a la derecha */}
          <div className="2xl:col-span-1">
            <div className="sticky top-6">
              <CamionesEnEspera camiones={camionesEjemplo} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const useTimerForUniqueComponent = (fechaInicio) => {
   const [timeElapsed, setTimeElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Convertir la fecha string al formato que JavaScript entiende
    const parseDate = (dateString) => {
      const [datePart, timePart] = dateString.split(', ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes, seconds] = timePart.split(':');
      
      // Crear fecha (mes - 1 porque JavaScript cuenta los meses desde 0)
      return new Date(year, month - 1, day, hours, minutes, seconds);
    };

    const startDate = parseDate(fechaInicio);

    const updateTimer = () => {
      const now = new Date();
      const difference = now.getTime() - startDate.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeElapsed({ days, hours, minutes, seconds });
      }
    };

    // Actualizar inmediatamente
    updateTimer();

    // Actualizar cada segundo
    const interval = setInterval(updateTimer, 1000);

    // Limpiar interval al desmontar
    return () => clearInterval(interval);
  }, [fechaInicio]);

  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };

  return {
    days: formatNumber(timeElapsed.days),
    hours: formatNumber(timeElapsed.hours),
    minutes: formatNumber(timeElapsed.minutes),
    seconds: formatNumber(timeElapsed.seconds)
  }
}

export default TableSheet;