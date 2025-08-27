import { useEffect, useMemo, useState } from "react";
import { ModalErr, NoData, Spinner } from "../components/alerts";
import {TableHistorial, TableHistorialSkeleton} from "../components/historial/tables";
import {
  getHistorialBoletas,
  getDataForSelect,
} from "../hooks/formDataInformes";
import { FiltrosReporteria } from "../components/informes/filters";
import { DistribucionPorTipoChart } from "../components/graficos/charts";
import { URLHOST } from "../constants/global";
import Cookies from 'js-cookie'
import { RiFileExcel2Line } from "react-icons/ri";
import { Pagination } from "../components/buttons";
import { classExportToExcel } from "../constants/boletas";
import { CiSettings } from "react-icons/ci";
import { VisualizarBoletas } from "../components/boletas/formBoletas";
import { debounce } from "lodash";
import { getDataBoletasPorID } from "../hooks/formDataBoletas";

const Informes = () => {
  const [data, setData] = useState();
  const [isLoad, setIsload] = useState(false);
  const [dataSelect, setDataSelect] = useState({});
  const [formFiltros, setFormFiltros] = useState({
    movimiento: "",
    producto: "",
    socio: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [err, setErr] = useState(false);
  const [msg, setMsg] = useState();
  const [isLoadingDescargas, setIsLoadingDescargas] = useState(false);
  const [pagination, setPagination] = useState(1)
  const [search, setSearch] = useState('')
  const [showGraph, setShowGraph] = useState(false)
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [columnasVisibles, setColumnasVisibles] = useState(new Set());
  const [tamanoColumna, setTamanoColumna] = useState('normal');
  const [details, setDetails] = useState(false)
  const [isLoadingViewBol ,setIsLoadingViewBol] = useState(false)
  const [dataDetails, setDataDetails] = useState({})

  const handleCloseDetails = () => {
    setDetails(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(formFiltros);
  };

  const handleChanceForInput = (e) => {
    const {value} = e.target
    handleSearchDebounced(value);
  }

  const handleSearchDebounced = useMemo(
    () =>
      debounce((value) => {
          setSearch(value);
        setPagination(1);
      }, 350), 
    []
  );

  const handleShowGraph = () => {
    setShowGraph(!showGraph)
  }

  useEffect(() => {
    getDataForSelect(setDataSelect);
  }, []);

  useEffect(() => {
    getHistorialBoletas(setData, formFiltros, setIsload, pagination, search);
  }, [pagination, search]);

  const handlePrint = (boleta) => {
    console.log(boleta);
  };

  const handlePushFilter = () => {
    console.log(formFiltros)
    if (!formFiltros?.dateIn || !formFiltros?.dateOut) {
      setErr(true);
      setMsg(
        "Ingrese la fecha inicial y fecha final, para poder realizar el filtrado o exportaciones a: PDF | Excel"
      );
      return;
    }
    getHistorialBoletas(setData, formFiltros, setIsload, pagination);
  };

const handleExportToExcel = async () => {
  if (!formFiltros?.dateIn || !formFiltros?.dateOut) {
    setErr(true);
    setMsg(
      "Ingrese la fecha inicial y fecha final, para poder realizar el filtrado o exportaciones a: PDF | Excel"
    );
    return;
  }

  try {
    setIsLoadingDescargas(true);

    const url = `${URLHOST}boletas/export/excel?movimiento=${formFiltros?.movimiento}&producto=${formFiltros?.producto}&dateIn=${formFiltros?.dateIn}&dateOut=${formFiltros?.dateOut}&socio=${formFiltros?.socio}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json" // 👈 importante
      },
      body: JSON.stringify({columnas: [...columnasVisibles]}) // convierte el Set en array
    });

    if (!response.ok) throw new Error("Error en la exportación");

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "boletas.xlsx"; // nombre del archivo
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error(err);
    setMsg("Error al exportar archivo");
  } finally {
    setIsLoadingDescargas(false);
  }
};


  const handleCloseErr = () => {
    setErr(false);
  };

  const handlePagination = (item) => {
    if (pagination>0) {
      const newRender = pagination+item
      if(newRender==0) return
      if(newRender>data.pagination.totalPages) return
      setPagination(newRender) 
    }
  } 

  const handleOpenDetails = async (data) => {
    setDetails(true)
    console.log(data)
    const response = await getDataBoletasPorID(data?.id, setIsLoadingViewBol)
    setDataDetails(response)
  }

  /**
   * Props para los hijos de los componentes
   * !importante @props actuales
   */
  const propsFiltros = { handleChange, dataSelect, handlePushFilter };
  const propsModalErr = { name: msg, hdClose: handleCloseErr };
  const propsTable = { datos: data?.table, imprimirCopia: handlePrint, mostrarConfig, setMostrarConfig, columnasVisibles, setColumnasVisibles, tamanoColumna, setTamanoColumna, handleOpenDetails, isLoad };
  const propsGraficosProceso = {
    data: data?.graphProcesos,
    title: "Distribución de Procesos",
    subtitle:
      "Distribución por porcentaje de entradas y salidas de material.",
  };
  const propsGraficosTipoDeBoleta = {
    data: data?.graphEstados,
    title: "Distribución por Tipo De Boleta",
    subtitle:
      "Distribución por porcentaje de boletas completadas, canceladas y boleta desviadas.",
  };

  return (
    <div className="">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold titulo">Reportes de Boletas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los informes generados en el sistema.
          </p>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
        {/* Cabecera y acciones principales */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-3">
              <div className="relative">
                <input
                  className="w-full p-3 pl-10 text-sm bg-white border  rounded-lg"
                  type="text"
                  placeholder="Buscar boletas por número de boleta, transporte, movimiento, manifiesto, productos, placas o motorista..."
                  onChange={handleChanceForInput}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <button onClick={handleExportToExcel} disabled={isLoadingDescargas} className={classExportToExcel}>
              {isLoadingDescargas ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <span className="text-lg"><RiFileExcel2Line /></span>
              )}
              Exportar Excel
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-blue-50 text-white-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
            >
              <span>{showFilters ? "Ocultar filtros" : "Mostrar filtros"}</span>
              <svg 
                className={`w-5 h-5 ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>            
            {showFilters && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 col-span-5">
                <FiltrosReporteria {...propsFiltros} />
              </div>
            )}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-6 bg-white border-t border-gray-200">
          {isLoad && !data ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : !data || data.table.length === 0 ? (
            <div className="py-12">
              <NoData />
            </div>
          ) : (
            <>
              {/* Gráficos */}
              <div className="grid grid-cols-3 gap-2">
                {/* Mostrar graficos */}
                <button
                  onClick={handleShowGraph}
                  className="flex items-center px-4 py-2 bg-gray-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                >
                  <span>{handleShowGraph ? "Ocultar gráficos" : "Mostrar gráficos"}</span>
                  <svg 
                    className={`w-5 h-5 ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {/* Mostrar configuracion de tablas */}
                <button onClick={() => setMostrarConfig(!mostrarConfig)} className="flex items-center px-4 py-2 bg-gray-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                  >
                  <CiSettings className="text-lg" />
                    Configurar Columnas
                </button>

                {/* Mostrar las configuraciones de tama;o de la tabla */}          
                <select value={tamanoColumna} onChange={(e) => setTamanoColumna(e.target.value)} className="flex items-center px-4 py-2 bg-gray-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
                    <option value="pequeño">Compacta</option>
                    <option value="normal">Normal</option>
                    <option value="grande">Amplia</option>
                </select>  
              </div>
              
              {showGraph && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mt-2">
                    <DistribucionPorTipoChart {...propsGraficosProceso} />
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mt-2">
                    <DistribucionPorTipoChart {...propsGraficosTipoDeBoleta} />
                  </div>
                </div>
                </>
              )}
              
              {/* Tabla de datos */}
              <div className="mt-6">
                <div className="bg-white mt-5 border-gray-100 overflow-hidden flex flex-col gap-2">
                  <div className="p-2 flex items-center justify-end">
                    {data?.pagination?.totalRecords || 0} registros
                  </div>
                  <TableHistorial {...propsTable} />
                  {data && data.pagination.totalPages > 1 && <Pagination pg={pagination} sp={setPagination} hp={handlePagination} dt={data}/>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {err && <ModalErr {...propsModalErr} />}
      {details && (<VisualizarBoletas hdlClose={handleCloseDetails} boletas={dataDetails} isLoad={isLoadingViewBol}/>)}
      
    </div>
  );
};

export default Informes;