import { useState, useCallback, useEffect } from "react";
import { BaprosaSiloChart } from "../graficos/informes";
import { getHistoricoViajes, getInfoSilos, getStatsSilosForBuques, postCreateNewReset } from "../../hooks/informes/tolva";
import { SelectFormImportaciones, StatsCardTolvaReports, TableComponentDescargados } from "./tables";
import { getBuquesDetalles, getDataForSelect, getResumenBFH } from "../../hooks/informes/granza";
import { RiResetRightFill } from "react-icons/ri";

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

  const handleReset = () => {
    setBuqueSelected({ typeImp: 2, buque: '', facturasImp: '' })
    getStatsSilosForBuques(setStats,setLoadingStats, '', '')
  }

  const handleAplicarFiltro = () => {
    getStatsSilosForBuques(setStats,setLoadingStats, selected?.buque, selected?.facturasImp)
    getHistoricoViajes(setHistorico, setLoadingHistorico, selected?.buque, selected?.facturasImp)
  }

  const fetchBuques = useCallback(()=>{
    getDataForSelect(setBuques, setIsLoadingBuques, selected)
  }, [selected])
  
  useEffect(()=> {
    fetchBuques()
  }, [fetchBuques])


  const fetchHistorico = useCallback(()=> {
    getHistoricoViajes(setHistorico, setLoadingHistorico, selected?.buque, selected?.facturasImp)
  }, [])

  useEffect(()=> {
    fetchHistorico()
  }, [])



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
      <div className="bg-white rounded-sm p-1">
        <TableComponentDescargados datos={stats?.descargadas}/>
      </div>
      <div className="bg-white rounded-sm p-1 mt-6">
        {historico && historico.length > 0 && (
          <TableComponentDescargados datos={historico}/>
        )}
      </div>
    </>
  );
};

export default TolvaReportes;