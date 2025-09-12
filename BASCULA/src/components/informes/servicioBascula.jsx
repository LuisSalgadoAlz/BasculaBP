import { useCallback, useEffect, useState } from "react";
import { getBoletasServicioBascula, getStatsServicioBascula } from "../../hooks/informes/guardia";
import { StatsCardServicioBascula, TableComponentCasulla } from "./tables";
import { NoData } from "../alerts";
import { Pagination } from "../buttons";
import Cookies from 'js-cookie'
import { URLHOST } from "../../constants/global";

const ServicioBascula = () => {
  const [stats, setStats] = useState()
  const [loadingStats, setLoadingStats] = useState(false)
  const [boletas, setBoletas] = useState()
  const [loadingBoletas, setLoadingBoletas] = useState(false)
  const [pagination, setPagination] = useState(1)
  const [loadingExcel, setLoadingExcel] = useState(false)

  const [filters, setFilters] = useState({
    dateIn: "",
    dateOut: "",
  });

  const handleChangeFilters = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPagination(1)
  };

  const handlePaginationServices = (item) => {
    if (pagination>0) {
      const newRender = pagination+item
      if(newRender==0) return
      if(newRender>boletas.pagination.totalPages) return
      setPagination(newRender) 
    }
  }

  const handleExportToExcel = async () => {
    try {
      setLoadingExcel(true);

      const url = `${URLHOST}guardia/servicioBascula/excel?dateIn=${filters.dateIn}&dateOut=${filters.dateOut}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization" : Cookies.get('token')
        },
      });

      if (!response.ok) throw new Error("Error en la exportación");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `ServicioBascula_${filters.dateIn && filters.dateOut ? `${filters.dateIn}_${filters.dateOut}` : `${new Date().toISOString().slice(0, 10)}`}.xlsx`; // nombre del archivo
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExcel(false);
    }
  };  
  

  const fetchStats = useCallback(()=>{
    getStatsServicioBascula(setStats, setLoadingStats, filters)
    getBoletasServicioBascula(setBoletas, setLoadingBoletas, filters, pagination)
  }, [filters, pagination])

  useEffect(()=> {
    fetchStats()
  }, [fetchStats])

  return (
    <>
      <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Servicio Báscula</h1>
          <h1 className="text-gray-600 max-sm:text-sm">
            {" "}
            Análisis detallado del servicio de báscula
          </h1>
        </div>
        <div className="parte-der flex items-center justify-center gap-3 max-sm:text-sm max-sm:flex-col">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <div className="relative">
                <div className="flex gap-2 max-sm:flex-col">
                  <div className="flex flex-col">
                    <label htmlFor="dateIn" className="text-gray-700">
                      Inicio
                    </label>
                    <input
                      name="dateIn"
                      onChange={handleChangeFilters}
                      value={filters?.dateIn}
                      type="date"
                      className=" w-48 bg-white text-gray-900 border border-gray-300 rounded-lg py-2.5 pl-4 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#955e37] focus:border-[#955e37 ] hover:border-gray-400 transition-colors duration-200"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="dateOut" className="text-gray-700">
                      Fin
                    </label>
                    <input
                      name="dateOut"
                      onChange={handleChangeFilters}
                      value={filters?.dateOut}
                      type="date"
                      className=" w-48 bg-white text-gray-900 border border-gray-300 rounded-lg py-2.5 pl-4 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#955e37] focus:border-[#955e37 ] hover:border-gray-400 transition-colors duration-200"
                    />
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <StatsCardServicioBascula data={stats?.data} loading={loadingStats}/>
      <div className="p-3 bg-white rounded-md shadow-sm mt-5 space-y-2">
        {!boletas || boletas?.data?.length === 0 ? (
            <NoData />
        ) : (
          <>
            <div className="w-full flex justify-between items-center max-sm:flex-col">
              <span className="text-md max-sm:text-mds font-bold text-gray-700 gap-2 mt-0.5">
                Lista de servicios de báscula {`${(filters.dateIn && filters.dateOut) && `entre ${filters.dateIn} - ${filters.dateOut}`}`}
              </span>
              <button 
                onClick={handleExportToExcel} 
                className="max-sm:px-5 max-sm:py-[0.95em] bg-gradient-to-r from-[#804e2b] to-[#804e2b] text-white font-medium py-3 px-6 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-full md:w-auto min-w-fit"
              >
                <span className="flex items-center justify-center gap-2 text-sm font-medium">
                  <svg className="w-4 h-6" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
                    <path fill="white" d="M 16 4 C 14.35 4 13 5.35 13 7 L 13 11 L 15 11 L 15 7 C 15 6.45 15.45 6 16 6 L 30 6 L 30 14 L 26.509766 14 C 26.799766 14.61 26.970234 15.28 26.990234 16 L 30 16 L 30 24 L 27 24 L 27 26 L 30 26 L 30 34 L 26.990234 34 C 26.970234 34.72 26.799766 35.39 26.509766 36 L 30 36 L 30 44 L 16 44 C 15.45 44 15 43.55 15 43 L 15 39 L 13 39 L 13 43 C 13 44.65 14.35 46 16 46 L 46 46 C 47.65 46 49 44.65 49 43 L 49 7 C 49 5.35 47.65 4 46 4 L 16 4 z M 32 6 L 46 6 C 46.55 6 47 6.45 47 7 L 47 14 L 32 14 L 32 6 z M 4.1992188 13 C 2.4437524 13 1 14.443752 1 16.199219 L 1 33.800781 C 1 35.556248 2.4437524 37 4.1992188 37 L 21.800781 37 C 23.556248 37 25 35.556248 25 33.800781 L 25 16.199219 C 25 14.443752 23.556248 13 21.800781 13 L 4.1992188 13 z M 4.1992188 15 L 21.800781 15 C 22.475315 15 23 15.524685 23 16.199219 L 23 33.800781 C 23 34.475315 22.475315 35 21.800781 35 L 4.1992188 35 C 3.5246851 35 3 34.475315 3 33.800781 L 3 16.199219 C 3 15.524685 3.5246851 15 4.1992188 15 z M 32 16 L 47 16 L 47 24 L 32 24 L 32 16 z M 7.96875 19 L 11.462891 24.978516 L 7.6308594 31 L 10.494141 31 L 13.015625 26.283203 L 15.548828 31 L 18.369141 31 L 14.599609 25 L 18.285156 19 L 15.609375 19 L 13.154297 23.505859 L 10.830078 19 L 7.96875 19 z M 32 26 L 47 26 L 47 34 L 32 34 L 32 26 z M 32 36 L 47 36 L 47 43 C 47 43.55 46.55 44 46 44 L 32 44 L 32 36 z"></path>
                  </svg>
                  {loadingExcel ? (
                    'Exportando...'
                  ) : (
                    `Exportar ${boletas?.pagination?.totalRecords ? `(${boletas.pagination.totalRecords})` : '(0)'}`
                  )}
                </span>
              </button>
            </div>
            <TableComponentCasulla datos={boletas['data']} type={false} />
            {boletas && boletas.pagination.totalPages > 1 && <Pagination pg={pagination} sp={setPagination} hp={handlePaginationServices} dt={boletas}/>}
          </>            
        )}
      </div>
    </>
  );
};

export default ServicioBascula;
