import { useEffect, useState } from "react";
import { ModalErr, NoData, Spinner } from "../components/alerts";
import TableHistorial from "../components/historial/tables";
import {
  getHistorialBoletas,
  getDataForSelect,
} from "../hooks/formDataInformes";
import { FiltrosReporteria } from "../components/informes/filters";
import { DistribucionPorTipoChart } from "../components/graficos/charts";
import { URLHOST } from "../constants/global";
import Cookies from 'js-cookie'
import { RiFileExcel2Line } from "react-icons/ri";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(formFiltros);
  };

  useEffect(() => {
    getDataForSelect(setDataSelect);
  }, []);

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
    getHistorialBoletas(setData, formFiltros, setIsload);
  };

  const handleExportToExcel = () => {
    if (!formFiltros?.dateIn || !formFiltros?.dateOut) {
      setErr(true);
      setMsg(
        "Ingrese la fecha inicial y fecha final, para poder realizar el filtrado o exportaciones a: PDF | Excel"
      );
      return;
    }

    const url = `${URLHOST}boletas/export/excel?movimiento=${formFiltros?.movimiento}&producto=${formFiltros?.producto}&dateIn=${formFiltros?.dateIn}&dateOut=${formFiltros?.dateOut}&socio=${formFiltros?.socio}`;
    window.open(url, '_blank');
  };

  const handleCloseErr = () => {
    setErr(false);
  };

  /**
   * Props para los hijos de los componentes
   * !importante @props actuales
   */
  const propsFiltros = { handleChange, dataSelect, handlePushFilter };
  const propsModalErr = { name: msg, hdClose: handleCloseErr };
  const propsTable = { datos: data?.table, imprimirCopia: handlePrint };
  const propsGraficosProceso = {
    data: data?.graphProcesos,
    title: "Distribución de Procesos",
    subtitle:
      "Distribución por porcentaje de entradas, salidas y boletas canceladas",
  };
  const propsGraficosTipoDeBoleta = {
    data: data?.graphEstados,
    title: "Distribución por Tipo De Boleta",
    subtitle:
      "Distribución por porcentaje de boleta especial, comodín y boleta normal",
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
            <div className="md:col-span-4">
              <div className="relative">
                <input
                  className="w-full p-3 pl-10 text-sm bg-white border  rounded-lg"
                  type="text"
                  placeholder="Buscar boletas por ID, placas o motorista..."
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <button onClick={handleExportToExcel} disabled={isLoadingDescargas} className="inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
            focus:                                                                         disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 hover:bg-gray-300 text-gray-800 focus:ring-gray-500 px-4">
              {isLoadingDescargas ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <span className="text-lg"><RiFileExcel2Line /></span>
              )}
              Exportar Excel
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Filtros de Reporte
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
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
          </div>

          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <FiltrosReporteria {...propsFiltros} />
            </div>
          )}
        </div>

        {/* Contenido principal */}
        <div className="p-6">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <DistribucionPorTipoChart {...propsGraficosProceso} />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <DistribucionPorTipoChart {...propsGraficosTipoDeBoleta} />
                </div>
              </div>
              
              {/* Tabla de datos */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Historial de Boletas</h3>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                  <TableHistorial {...propsTable} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {err && <ModalErr {...propsModalErr} />}
    </div>
  );
};

export default Informes;