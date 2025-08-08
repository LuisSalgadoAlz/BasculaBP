import { useMemo, useEffect } from "react";
import { MdOutlineRemoveRedEye } from "react-icons/md";

export const TableHistorial = (props) => {
  const { datos = [], imprimirCopia, columnasIniciales = [], mostrarConfig, setMostrarConfig, 
    columnasVisibles, setColumnasVisibles, tamanoColumna, setTamanoColumna, handleOpenDetails, isLoad
  } = props;
  
  // Obtener todas las columnas disponibles (excluyendo 'id')
  const todasLasColumnas = useMemo(() => {
    if (datos.length === 0) return [];
    return Object.keys(datos[0]).filter(columna => columna.toLowerCase() !== 'id');
  }, [datos.length > 0 ? JSON.stringify(Object.keys(datos[0])) : '']);

  // Inicializar columnas visibles
  useEffect(() => {
    if (todasLasColumnas.length === 0) return;
    
    if (columnasIniciales.length > 0) {
      // Filtrar columnasIniciales para excluir 'id'
      const columnasInicialesFiltradas = columnasIniciales.filter(columna => columna.toLowerCase() !== 'id');
      setColumnasVisibles(new Set(columnasInicialesFiltradas));
    } else {
      // Si hay más de 8 columnas, mostrar solo las primeras 8
      const columnasDefault = todasLasColumnas.length > 8 
        ? todasLasColumnas.slice(0, 8)
        : todasLasColumnas;
      setColumnasVisibles(new Set(columnasDefault));
    }
  }, [JSON.stringify(todasLasColumnas), JSON.stringify(columnasIniciales)]);

  const toggleColumna = (columna) => {
    const nuevasColumnas = new Set(columnasVisibles);
    if (nuevasColumnas.has(columna)) {
      nuevasColumnas.delete(columna);
    } else {
      nuevasColumnas.add(columna);
    }
    setColumnasVisibles(nuevasColumnas);
  };

  const mostrarTodasLasColumnas = () => {
    setColumnasVisibles(new Set(todasLasColumnas));
  };

  const ocultarTodasLasColumnas = () => {
    setColumnasVisibles(new Set());
  };

  const columnasArray = Array.from(columnasVisibles);

  const estilosColumna = {
    pequeño: 'px-2 py-1 text-xs',
    normal: 'px-4 py-2 text-sm',
    grande: 'px-6 py-3 text-base'
  };

  const estilosHeader = {
    pequeño: 'px-2 py-2 text-xs',
    normal: 'px-4 py-3 text-xs',
    grande: 'px-6 py-4 text-sm'
  };

  if (datos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  return (
    isLoad ? (
      <>
        <TableHistorialSkeleton />
      </>
    ) : (
      <>
        <div className="w-full">
          {/* Panel desplegable de selección de columnas */}
          {mostrarConfig && (
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-700">Seleccionar Columnas</h3>
                <div className="flex gap-2">
                  <button
                    onClick={mostrarTodasLasColumnas}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Todas
                  </button>
                  <button
                    onClick={ocultarTodasLasColumnas}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Ninguna
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                {todasLasColumnas.map((columna) => (
                  <label key={columna} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={columnasVisibles.has(columna)}
                      onChange={() => toggleColumna(columna)}
                      className="rounded"
                    />
                    <span className="truncate" title={columna}>
                      {columna}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tabla */}
          <div className="relative overflow-x-auto shadow-sm rounded-lg border border-gray-200">
            <table className="w-full text-left text-gray-700 dark:text-gray-400">
              <thead className="text-gray-700 uppercase bg-[#FFFDF5] border-b border-gray-200">
                <tr>
                  {columnasArray.map((columna, index) => (
                    <th 
                      key={index} 
                      scope="col" 
                      className={`${estilosHeader[tamanoColumna]} font-semibold sticky top-0 bg-[#FFFDF5]`}
                      style={{ minWidth: '120px' }}
                    >
                      <div className="truncate" title={columna}>
                        {columna}
                      </div>
                    </th>
                  ))}
                  {imprimirCopia && (
                    <th 
                      scope="col" 
                      className={`${estilosHeader[tamanoColumna]} text-center font-semibold sticky top-0 bg-[#FFFDF5]`}
                      style={{ minWidth: '80px' }}
                    >
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {datos.map((fila, index) => (
                  <tr 
                    key={index} 
                    onDoubleClick={()=>handleOpenDetails(fila)}
                    className="bg-white border-b border-gray-100 hover:bg-[#FDF5D4] transition-colors cursor-pointer"
                  >
                    {columnasArray.map((columna, key) => (
                      <td 
                        key={key} 
                        className={`${estilosColumna[tamanoColumna]} text-gray-700 border-r border-gray-50 last:border-r-0`}
                        style={{ minWidth: '120px' }}
                      >
                        <div className="truncate" title={fila[columna] || 'N/A'}>
                          {fila[columna] || 'N/A'}
                        </div>
                      </td>
                    ))}
                    {imprimirCopia && (
                      <td className={`${estilosColumna[tamanoColumna]} text-center border-r border-gray-50`}>
                        <button 
                          className="font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition-all" 
                          onClick={() => handleOpenDetails(fila)}
                          title="Imprimir/Editar"
                        >
                          <MdOutlineRemoveRedEye className="text-lg" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Información adicional */}
          {columnasArray.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg mt-4">
              No hay columnas seleccionadas. Usa el botón "Configurar Columnas" para seleccionar qué mostrar.
            </div>
          )}
        </div>
      </>
    )
  );
};

export const TableHistorialSkeleton = ({ 
  columnasIniciales = [], 
  mostrarConfig = false, 
  imprimirCopia = false, 
  tamanoColumna = 'normal',
  filas = 10// Número de filas skeleton a mostrar
}) => {
  // Número de columnas a mostrar en el skeleton
  const numColumnas = columnasIniciales.length > 0 ? columnasIniciales.length : 6;
  
  const estilosHeader = {
    pequeño: 'px-2 py-2 text-xs',
    normal: 'px-4 py-3 text-xs',
    grande: 'px-6 py-4 text-sm'
  };

  const estilosColumna = {
    pequeño: 'px-2 py-1 text-xs',
    normal: 'px-4 py-2 text-sm',
    grande: 'px-6 py-3 text-base'
  };

  // Componente para línea skeleton animada
  const SkeletonLine = ({ width = "w-full", height = "h-4" }) => (
    <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`}></div>
  );

  return (
    <div className="w-full">
      {/* Panel desplegable de selección de columnas - Skeleton */}
      {mostrarConfig && (
        <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <SkeletonLine width="w-32" height="h-5" />
            <div className="flex gap-2">
              <SkeletonLine width="w-12" height="h-6" />
              <SkeletonLine width="w-16" height="h-6" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="flex items-center gap-2 p-1">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <SkeletonLine width="w-20" height="h-4" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla Skeleton */}
      <div className="relative overflow-x-auto shadow-sm rounded-lg border border-gray-200">
        <table className="w-full text-left">
          {/* Header Skeleton */}
          <thead className="bg-[#FFFDF5] border-b border-gray-200">
            <tr>
              {[...Array(numColumnas)].map((_, index) => (
                <th 
                  key={index} 
                  scope="col" 
                  className={`${estilosHeader[tamanoColumna]} sticky top-0 bg-[#FFFDF5]`}
                  style={{ minWidth: '120px' }}
                >
                  <SkeletonLine width="w-24" height="h-4" />
                </th>
              ))}
              {imprimirCopia && (
                <th 
                  scope="col" 
                  className={`${estilosHeader[tamanoColumna]} text-center sticky top-0 bg-[#FFFDF5]`}
                  style={{ minWidth: '80px' }}
                >
                  <SkeletonLine width="w-16" height="h-4" />
                </th>
              )}
            </tr>
          </thead>

          {/* Body Skeleton */}
          <tbody>
            {[...Array(filas)].map((_, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="bg-white border-b border-gray-100"
              >
                {[...Array(numColumnas)].map((_, colIndex) => (
                  <td 
                    key={colIndex} 
                    className={`${estilosColumna[tamanoColumna]} border-r border-gray-50 last:border-r-0`}
                    style={{ minWidth: '120px' }}
                  >
                    <SkeletonLine 
                      width={`w-${Math.floor(Math.random() * 4 + 16)}`} 
                      height="h-4" 
                    />
                  </td>
                ))}
                {imprimirCopia && (
                  <td className={`${estilosColumna[tamanoColumna]} text-center border-r border-gray-50`}>
                    <div className="flex justify-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Indicador de carga adicional */}
      <div className="flex justify-center items-center py-4">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span>Cargando datos...</span>
        </div>
      </div>
    </div>
  );
};

export default TableHistorialSkeleton;
