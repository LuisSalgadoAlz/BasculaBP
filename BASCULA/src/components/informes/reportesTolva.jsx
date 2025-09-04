import { useState, useCallback, useEffect } from "react";
import { BaprosaSiloChart } from "../graficos/informes";
import { getHistoricoViajes, getInfoSilos, getStatsSilosForBuques, getUsers, postCreateNewReset } from "../../hooks/informes/tolva";
import { SelectFormImportaciones, StatsCardTolvaReports, TableComponentDescargados } from "./tables";
import { getBuquesDetalles, getDataForSelect, getResumenBFH } from "../../hooks/informes/granza";
import { RiResetRightFill } from "react-icons/ri";
import { Pagination } from "../buttons";

const TolvaReportes = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingReset, setLoadingReset] =  useState(false)
  const [selected, setBuqueSelected] = useState({ typeImp: 2, buque: '' })
  const [buques, setBuques] = useState({sociosImp: [], facturasImp: []})
  const [isLoadingBuques, setIsLoadingBuques] = useState(false)
  const [historico, setHistorico] = useState([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)
  const [pagination, setPagination] = useState(1)
  const [filtersHistorico, setFiltersHistorico] = useState({userInit_historico: '', userEnd_historico: '', state_historico: '', search_historico: ''})
  const [user, setUsers] = useState()
  const [loadingUser, setLoadingUser] = useState(false)

  const fetchData = useCallback(() => {
    getInfoSilos(setData, setLoading);
  }, []);

  const fetchDataStats = useCallback(() => {
    getStatsSilosForBuques(setStats,setLoadingStats)
  }, [])

  const handleResetSilo = async (name, action) => {
    const cuerpoSilo = { silo: name }
    const response = await postCreateNewReset(cuerpoSilo, setLoadingReset)
    fetchData()
  }

  useEffect(()=> {
    fetchDataStats()
  }, [fetchDataStats])

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 30000); // cada 30 segundos

    return () => clearInterval(interval); // limpiar cuando se desmonte
  }, [fetchData]);

  /**
   * ? Aqui comienza la parte de los filtros
   * @param {*} e 
   */
  const handleChangeFilters = (e) => {  
    const { name, value } = e.target;
    
    setBuqueSelected((prev) => {
      if (name === 'typeImp') {
        return {
          typeImp: value,
          buque: '',
          facturasImp: '', 
        };
      }
      
      if (name === 'buque') {
        return {
          ...prev,
          buque: value,
          facturasImp: '', 
        };
      }
      
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleFilterHistorico = (e) => {
    const { name, value } = e.target;
    setFiltersHistorico((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPagination(1)
  }

  /**
   * ? Aqui termina la parte de los filtros
   */

  const handleReset = () => {
    setBuqueSelected({ typeImp: 2, buque: '', facturasImp: '' })
    getStatsSilosForBuques(setStats,setLoadingStats, '', '')
  }

  const handleAplicarFiltro = () => {
    getStatsSilosForBuques(setStats,setLoadingStats, selected?.buque, selected?.facturasImp)
    setPagination(1)
    getHistoricoViajes(setHistorico, setLoadingHistorico, selected?.buque, selected?.facturasImp, pagination, filtersHistorico)
  }

  const fetchBuques = useCallback(()=>{
    getDataForSelect(setBuques, setIsLoadingBuques, selected)
  }, [selected])
  
  useEffect(()=> {
    fetchBuques()
  }, [fetchBuques])


  const fetchHistorico = useCallback(()=> {
    getHistoricoViajes(setHistorico, setLoadingHistorico, selected?.buque, selected?.facturasImp, pagination, filtersHistorico)
  }, [pagination, filtersHistorico])

  const fetchUsers = useCallback(()=> {
    getUsers(setUsers, setLoadingUser)
  }, [])

  useEffect(()=> {
    fetchUsers()
  }, [fetchUsers])


  useEffect(()=> {
    fetchHistorico()
  }, [fetchHistorico])

  /* Paginaciones */
  const handlePagination = (item) => {
    if (pagination>0) {
      const newRender = pagination+item
      if(newRender==0) return
      if(newRender>historico.pagination.totalPages) return
      setPagination(newRender) 
    }
  }


  return (
    <>
      <div className="flex justify-between w-full gap-5 max-lg:flex-col mb-4">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Reportes: tolva</h1>
          <h1 className="text-gray-600 max-sm:text-sm">
            {" "}
            Análisis detallado de importaciones y gestión de silos
          </h1>
        </div>
        <div className="parte-der flex items-center justify-center gap-3 max-sm:text-sm max-sm:flex-col">
          <div className="flex gap-4 items-end item max-sm:flex-col">
            <div className="flex-1 items-center">
              <div className="relative">
                <div className="flex gap-1 max-md:flex-wrap">
                  <div className="flex gap-1 max-sm:flex-col">
                    <SelectFormImportaciones name={'buque'} data={buques?.sociosImp} fun={handleChangeFilters} val={selected.buque}/>
                    <SelectFormImportaciones name={'facturasImp'} data={buques?.facturasImp} fun={handleChangeFilters} val={selected.facturasImp}/>
                  </div>
                  <div className="flex gap-1 max-sm:flex-col">
                    <button onClick={handleReset} className="max-sm:col-span-1 max-sm:py-[1.22em] bg-gradient-to-r from-[#955e37] to-[#804e2b] text-white font-medium py-3 px-8 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
                      <RiResetRightFill />
                    </button>           
                    <button onClick={handleAplicarFiltro} className="max-sm:col-span-1 max-sm:py-[1.22em] bg-gradient-to-r from-[#955e37] to-[#804e2b] text-white font-medium py-3 px-8 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
                      <span className="flex items-center gap-2 max-sm:hidden">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Aplicar
                      </span>
                      <span className="items-center gap-2 hidden max-sm:block">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>                      
          </div>
        </div>
      </div>
      {loading && <div>Cargando...</div>}
      {console.log(data )}
      {data &&(
        <BaprosaSiloChart data={data?.data} onSiloAction={handleResetSilo} />
      )}  

      {/* Parte para colocar las estadisticas */}
      <StatsCardTolvaReports value={stats?.asignadas} loading={loadingStats} tiempos={stats?.tiempos}/>
      
      {/* Parte de descargadas */}
      <div className="bg-white rounded-md p-4 mt-6 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-500 mb-4"> Camiones descargados por usuario </h2>
        <TableComponentDescargados datos={stats?.descargadas} type={true}/>
      </div>

      {/* Parte de historico */}
      <div className="bg-white rounded-md p-4 mt-6 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-500 mb-2"> Historico {loadingHistorico ? 'Cargando...' : `${(historico?.pagination?.totalRecords || 0)} registros`} </h2>
        <div className="flex justify-between items-center gap-2 max-sm:flex-col max-sm:gap-1">
          <input name="search_historico" onChange={handleFilterHistorico} value={filtersHistorico.search_historico} type="text" placeholder="Buscar placa..." className="w-full appearance-none mb-4 bg-white text-gray-900 border border-gray-300 rounded-lg py-2 pl-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#955e37] focus:border-[#955e37] hover:border-gray-400 transition-colors duration-200"/>
          <select name="userInit_historico" onChange={handleFilterHistorico} value={filtersHistorico.userInit_historico} className="w-full appearance-none mb-4 bg-white text-gray-900 border border-gray-300 rounded-lg py-2 pl-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#955e37] focus:border-[#955e37] hover:border-gray-400 transition-colors duration-200">
            <option value="">Seleccione usuario inicial</option>
            {loadingUser && <option disabled value={-1}>Cargando...</option>}
            {(user && user.length > 0) ? (
              user.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))
            ) : (
              <option disabled value={-1}>Sin datos</option>
            )}
          </select>
          <select name="userEnd_historico" onChange={handleFilterHistorico} value={filtersHistorico.userEnd_historico} className="w-full appearance-none mb-4 bg-white text-gray-900 border border-gray-300 rounded-lg py-2 pl-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#955e37] focus:border-[#955e37] hover:border-gray-400 transition-colors duration-200">
            <option value="">Seleccione usuario final</option>
            {loadingUser && <option disabled value={-1}>Cargando...</option>}
            {(user && user.length > 0) ? (
              user.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))
            ) : (
              <option disabled value={-1}>Sin datos</option>
            )}
          </select>
          <select name="state_historico" onChange={handleFilterHistorico} value={filtersHistorico.state_historico} className="w-full appearance-none mb-4 bg-white text-gray-900 border border-gray-300 rounded-lg py-2 pl-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#955e37] focus:border-[#955e37] hover:border-gray-400 transition-colors duration-200">
            <option value="">Seleccione un estado</option>
            <option value={true}>Fuera de tiempo</option>
            <option value={false}>Tiempo Normal</option>
          </select>
        </div>
        {historico && historico?.data?.length > 0 ? (
          <>             
            <TableComponentDescargados datos={historico?.data} loading={loadingHistorico}/>
            <div className="bg-white mt-2 py-2">
              {historico && historico.pagination.totalPages > 1 && <Pagination pg={pagination} sp={setPagination} hp={handlePagination} dt={historico}/>}
            </div>
          </>
        ): (
          <div className="w-full flex items-center justify-center text-gray-500 h-[400px]">No hay datos</div>
        )}
      </div>
    </>
  );
};

export default TolvaReportes;