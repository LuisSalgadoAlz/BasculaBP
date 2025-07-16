import { use, useCallback, useEffect } from "react";
import { useState } from "react";
import { getBuquesDetalles, getDataForSelect, getResumenBFH, getStatsBuque } from "../../hooks/informes/granza";
import { BuqueDetalles, BuqueDetallesLoader, ModalReportes, TablaResumenBFH, TablaResumenBFHLoader } from "./tables";
import { Pagination, StatCard } from "../../components/buttons";
import { FiCalendar, FiClock } from "react-icons/fi";
import { 
  AiOutlineTeam, 
  AiOutlineDollarCircle, 
} from 'react-icons/ai';
import { LuPackage2 } from "react-icons/lu";
import { IoAlertSharp } from "react-icons/io5";

const Importaciones = () => {
  const [buques, setBuques] = useState([])
  const [isLoadingBuques, setIsLoadingBuques] = useState(false)
  const [resumenBFH, setResumenBFH] = useState([{}])
  const [resumenBFHLoad, setResumenBFHLoad] = useState(false)
  const [buquesDetails, setBuquesDetails] = useState([{}])
  const [isLoadingBuquesDetails, setIsLoadingBuquesDetails] = useState(false)
  const [selected, setBuqueSelected] = useState()
  const [stats, setStats] = useState()
  const [isLoadStats, setIsLoadStats] = useState(false)
  const [pagination, setPagination] = useState(1)
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = () => {
    setIsOpen(false);
  };
  
  const handleChangeBuque = (e) => {
    setBuqueSelected(e.target.value)
  }

  const fetchBuques = useCallback(()=>{
    getDataForSelect(setBuques, setIsLoadingBuques)
  }, [])

  const fetchResumenBFH = useCallback(()=>{
    getResumenBFH(setResumenBFH, setResumenBFHLoad)
  }, [])

  const fetchBuquesDetalles = useCallback(()=> {
    getBuquesDetalles(setBuquesDetails, setIsLoadingBuquesDetails, selected, pagination)
  }, [pagination])

  const fetchStats = useCallback(()=>{
    getStatsBuque(setStats, setIsLoadStats)
  }, [])

  const handleApplicarFiltro = () => {
    getResumenBFH(setResumenBFH, setResumenBFHLoad, selected)
    getBuquesDetalles(setBuquesDetails, setIsLoadingBuquesDetails, selected)
    getStatsBuque(setStats, setIsLoadStats, selected)
  }

  const handlePagination = (item) => {
    if (pagination>0) {
      const newRender = pagination+item
      if(newRender==0) return
      if(newRender>buquesDetails.pagination.totalPages) return
      setPagination(newRender) 
    }
  }
  
  useEffect(()=>{
    fetchBuquesDetalles()
  }, [fetchBuquesDetalles])

  useEffect(()=>{
    setBuqueSelected('')
    fetchBuques()
    fetchResumenBFH()
    fetchStats()
  }, [])
  
  const reports = [
    {
      id: 1,
      title: "Importaciones",
      description: "Análisis de importaciones",
      icon: LuPackage2,
      category: "Financiero",
      color: "bg-gray-500"
    },
    {
      id: 2,
      title: "Liquidacion",
      description: "Liquidacion de importaciones (Desarrollo)",
      icon: AiOutlineDollarCircle,
      category: "Financiero",
      color: "bg-gray-500"
    },
    {
      id: 3,
      title: "Desviaciones",
      description: "Camiones arriba de 200 QQ (No desarrollado)",
      icon: IoAlertSharp,
      category: "Financiero",
      color: "bg-gray-500"
    },
  ];
  
  const statsdata = [
      {
        icon: <FiCalendar size={24} className="text-white" />,
        title: "Peso Neto (TM)",
        value:  stats?.pesoNeto || 0,
        color: "bg-blue-500",
      },
      {
        icon: <FiClock size={24} className="text-white" />,
        title: "TM TEH (TM)",
        value:  stats?.pesoTeorico || 0,
        color: "bg-amber-500",
      },
      {
        icon: <FiClock size={24} className="text-white" />,
        title: "Desviacion Total (TM)",
        value:  stats?.desviacion || 0,
        color: "bg-amber-500",
      },
      {
        icon: <FiClock size={24} className="text-white" />,
        title: "Desviacion (%)",
        value:  stats?.porcentaje || 0,
        color: "bg-amber-500",
      },
  ];

  return (
    <>
      <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Importacion: Granza</h1>
          <h1 className="text-gray-600 max-sm:text-sm">
            {" "}
            Análisis detallado de importaciones - Período Actual {new Date().getFullYear()}
          </h1>
        </div>
        <div className="parte-der flex items-center justify-center gap-3 max-sm:text-sm max-sm:flex-col">
          <div className="flex gap-4 items-end">
              <div className="flex-1">
              <div className="relative">
                  <select 
                  name="socio"
                  onChange={handleChangeBuque}
                  value={selected}
                  disabled={isLoadingBuques} 
                  className="appearance-none w-full bg-white text-gray-900 border border-gray-300 rounded-lg py-3 pl-4 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#955e37] focus:border-[#955e37 ] hover:border-gray-400 transition-colors duration-200"
                  >
                  <option value="">{isLoadingBuques ? 'Cargando...' : 'Seleccione un buque'}</option>
                  {buques.map((item)=>(
                    <option key={item?.idSocio} value={item?.idSocio}>{item?.socio}</option>
                  ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  </div>
              </div>
              </div>

              <button disabled={selected === '' ? true: false} onClick={()=>setIsOpen(true)} className="bg-gradient-to-r from-[#955e37] to-[#804e2b] text-white font-medium py-3 px-8 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
                <span className="flex items-center gap-2">
                    <svg className="w-4 h-6" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
                      <path fill="white" d="M 16 4 C 14.35 4 13 5.35 13 7 L 13 11 L 15 11 L 15 7 C 15 6.45 15.45 6 16 6 L 30 6 L 30 14 L 26.509766 14 C 26.799766 14.61 26.970234 15.28 26.990234 16 L 30 16 L 30 24 L 27 24 L 27 26 L 30 26 L 30 34 L 26.990234 34 C 26.970234 34.72 26.799766 35.39 26.509766 36 L 30 36 L 30 44 L 16 44 C 15.45 44 15 43.55 15 43 L 15 39 L 13 39 L 13 43 C 13 44.65 14.35 46 16 46 L 46 46 C 47.65 46 49 44.65 49 43 L 49 7 C 49 5.35 47.65 4 46 4 L 16 4 z M 32 6 L 46 6 C 46.55 6 47 6.45 47 7 L 47 14 L 32 14 L 32 6 z M 4.1992188 13 C 2.4437524 13 1 14.443752 1 16.199219 L 1 33.800781 C 1 35.556248 2.4437524 37 4.1992188 37 L 21.800781 37 C 23.556248 37 25 35.556248 25 33.800781 L 25 16.199219 C 25 14.443752 23.556248 13 21.800781 13 L 4.1992188 13 z M 4.1992188 15 L 21.800781 15 C 22.475315 15 23 15.524685 23 16.199219 L 23 33.800781 C 23 34.475315 22.475315 35 21.800781 35 L 4.1992188 35 C 3.5246851 35 3 34.475315 3 33.800781 L 3 16.199219 C 3 15.524685 3.5246851 15 4.1992188 15 z M 32 16 L 47 16 L 47 24 L 32 24 L 32 16 z M 7.96875 19 L 11.462891 24.978516 L 7.6308594 31 L 10.494141 31 L 13.015625 26.283203 L 15.548828 31 L 18.369141 31 L 14.599609 25 L 18.285156 19 L 15.609375 19 L 13.154297 23.505859 L 10.830078 19 L 7.96875 19 z M 32 26 L 47 26 L 47 34 L 32 34 L 32 26 z M 32 36 L 47 36 L 47 43 C 47 43.55 46.55 44 46 44 L 32 44 L 32 36 z"></path>
                    </svg>
                </span>
              </button>
              
              <button onClick={handleApplicarFiltro} className="bg-gradient-to-r from-[#955e37] to-[#804e2b] text-white font-medium py-3 px-8 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
                <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Aplicar
                </span>
              </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {statsdata?.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              color={stat.color}
            />
          ))}
      </div>
      <div>
        {resumenBFHLoad ? (
          <TablaResumenBFHLoader />
        ):(
          <TablaResumenBFH datos={resumenBFH} />
        )}
      </div>
      <div>
        {isLoadingBuquesDetails ? (
          <BuqueDetallesLoader page={pagination} />
        ):(
          <div className="max-h-[700px]">
            <BuqueDetalles datos={buquesDetails?.data} />
            {buquesDetails && buquesDetails?.pagination?.totalPages > 1 && <Pagination pg={pagination} sp={setPagination} hp={handlePagination} dt={buquesDetails}/>}
          </div>
        )}
      </div>
      {isOpen && <ModalReportes reports={reports} hdlClose={handleClose}/>}
    </>
  );
};

export default Importaciones;
