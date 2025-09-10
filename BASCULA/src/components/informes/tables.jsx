import { useEffect, useRef, useState, useMemo } from 'react';
import { 
  AiOutlineClose, 
  AiOutlineDownload,
  AiOutlineEyeInvisible,
} from 'react-icons/ai';
import { formatNumber, URLHOST } from '../../constants/global';
import Cookies from 'js-cookie';
import { BsArrowsAngleExpand } from "react-icons/bs";
import Select from "react-select";
import { IoTimerOutline } from "react-icons/io5";
import { AiOutlineSetting, AiOutlineEye,   } from 'react-icons/ai';
import { IoWarningOutline } from "react-icons/io5";

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

const TableSheet = ({
  tableData = [{}], 
  openSheet = true, 
  setOpenSheet, 
  title, 
  subtitle, 
  type = false,
  fixedColumns = [], // Columnas que no se pueden ocultar/mover
  storageKey = 'tablesheet-columns' // Clave personalizable para localStorage
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
            
            {type && (
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
          <div className="flex-1 overflow-hidden flex flex-col">
            {tableData.length === 0 || !tableData ? (
              <div className="p-6 text-center text-gray-500 flex-1 flex items-center justify-center">
                No hay datos.
              </div>
            ) : (
              <>
                {/* Tabla scrollable */}
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
                
                {/* Footer fijo */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                  <div className="text-sm text-gray-600">
                    BAPROSA - Mostrando {tableData.length} registros
                  </div>
                </div>
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


export const StatsCardTolvaReports = ({ value, loading, tiempos }) => {
  if (value === undefined && !loading) return null

  // Si está cargando, mostrar cards con spinners
  if (loading) {
    const loadingCards = Array.from({ length: 4 }, (_, index) => ({
      title: `Tolva ${index + 1}`,
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-6 mt-6">
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

  // Crear cards para los tiempos
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

  // Combinar ambos arrays intercalados
  const allStats = []
  for (let i = 0; i < cantidadStats.length; i++) {
    allStats.push(cantidadStats[i])
    allStats.push(tiempoStats[i])
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-6 mt-6">
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
                  <th key={keys} scope="col" className={`px-6 py-4 ${(keys > 1 && lastColumnIndex!==keys) && 'text-right'} ${lastColumnIndex===keys && 'text-center'}`}>
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
                    <td key={key} className={`px-6 py-3 text-gray-700 text-sm font-mono ${key > 1 && 'text-right'}`}>
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
                          el
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
  storageKey = 'table-columns' // Clave personalizable para localStorage
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
  
  // Formatear nombre de columna
  const formatColumnName = (key) => {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  };

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
              <p className="text-sm text-gray-500 mt-1">{subtitle} - Mostrando {tableData.length} registros</p>
            )}
          </div>
          
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

      {/* Contenido de la tabla */}
      <div className="flex-1 p-1">
        <div className="mt-2">
          {tableData.length === 0 || !tableData ? (
            <div className="p-12 text-center text-gray-500 border border-gray-200 rounded-lg">
              No hay datos disponibles
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Contenedor con altura máxima y scroll para el cuerpo de la tabla */}
              <div className="max-h-[75vh] overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100  [&::-webkit-scrollbar-thumb]:bg-gray-300">
                <table className="w-full">
                  {/* Header de tabla fijo */}
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {getVisibleColumns().map((key) => (
                        <th key={key} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          {formatColumnName(key)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableData.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50">
                        {getVisibleColumns().map((key) => (
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

export default TableSheet;