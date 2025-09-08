import { useCallback, useEffect } from "react";
import { useState } from "react";
import { getBuquesDetalles, getDataForSelect, getResumenBFH, getStatsBuque } from "../../hooks/informes/granza";
import { BuqueDetalles, BuqueDetallesLoader, ModalReportes, SelectFormImportaciones, TablaResumenBFH, TablaResumenBFHLoader } from "./tables";
import { Pagination, StatCard } from "../../components/buttons";
import { AiOutlineDollarCircle } from 'react-icons/ai';
import { LuPackage2 } from "react-icons/lu";
import { Toaster, toast } from "sonner";
import { IoIosStats } from "react-icons/io";
import { FaSpinner } from "react-icons/fa";
import { formatNumber } from "../../constants/global";

const Importaciones = () => {
  const [buques, setBuques] = useState({sociosImp: [], facturasImp: []})
  const [isLoadingBuques, setIsLoadingBuques] = useState(false)
  const [resumenBFH, setResumenBFH] = useState([{}])
  const [resumenBFHLoad, setResumenBFHLoad] = useState(false)
  const [buquesDetails, setBuquesDetails] = useState([{}])
  const [isLoadingBuquesDetails, setIsLoadingBuquesDetails] = useState(false)
  const [selected, setBuqueSelected] = useState({ typeImp: '', buque: '' })
  const [selectedName, setSelectedName] = useState('')
  const [stats, setStats] = useState()
  const [isLoadStats, setIsLoadStats] = useState(false)
  const [pagination, setPagination] = useState(1)
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = () => {
    setIsOpen(false);
  };
  
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
    
    setPagination(1);
  };

  const fetchBuques = useCallback(()=>{
    getDataForSelect(setBuques, setIsLoadingBuques, selected)
  }, [selected])

  const fetchResumenBFH = useCallback(()=>{
    getResumenBFH(setResumenBFH, setResumenBFHLoad)
  }, [])

  const fetchBuquesDetalles = useCallback(()=> {
    const { typeImp, buque, facturasImp } = selected
    getBuquesDetalles(setBuquesDetails, setIsLoadingBuquesDetails,buque, pagination, facturasImp, typeImp)
  }, [pagination])

  const fetchStats = useCallback(()=>{
    getStatsBuque(setStats, setIsLoadStats)
  }, [])

  const handleApplicarFiltro = () => {
    if(resumenBFHLoad || isLoadingBuquesDetails) return toast.error('Cargando busqueda anterior...', {style:{background:'#ff4d4f'}, id:'error'});
    const { typeImp, buque, facturasImp } = selected
    if ((!buque || buque == -99) && typeImp !== '') return toast.error('Filtros vacios (socio)', {style:{background:'#ff4d4f'}, id:'error'});
    if ((!facturasImp || facturasImp == -99) && typeImp !== '') return toast.error('Filtros vacios (facturas)', {style:{background:'#ff4d4f'}, id:'error'}); 
    getResumenBFH(setResumenBFH, setResumenBFHLoad, buque, facturasImp, typeImp)
    getBuquesDetalles(setBuquesDetails, setIsLoadingBuquesDetails,buque, pagination, facturasImp, typeImp)
    getStatsBuque(setStats, setIsLoadStats, buque, facturasImp, typeImp)
    setPagination(1)
    if(typeImp===''){
      setSelectedName('')
      return toast.success('Reset completo.', {style:{background:'#4CAF50'}, id:'completado'});
    }
    
    const selectSocio = buques?.sociosImp.find((item)=>item.idSocio==buque)?.socio
    const selectFactura = buques?.facturasImp.find((item)=>item.factura==facturasImp)?.factura
    /* Colocar nombre en el progress bar */
    setSelectedName(`${selectSocio} - SAP ${selectFactura}`)

    return toast.success('Busqueda completa.', {style:{background:'#4CAF50'}, id:'completado'});
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

  useEffect(()=> {
    fetchBuques()
  }, [fetchBuques])

  useEffect(()=>{
    setBuqueSelected('')
    fetchResumenBFH()
    fetchStats()
  }, [])
  
  const reports = [
    {
      id: 1,
      title: "Registros: Granza ",
      description: "Importación a Granel",
      icon: LuPackage2,
      category: "Financiero",
      color: "bg-gray-500"
    },
    {
      id: 2,
      title: "Liquidacion",
      description: "Liquidacion de importaciones",
      icon: AiOutlineDollarCircle,
      category: "Financiero",
      color: "bg-gray-500"
    },
  ];

  const reportsContenerizada = [
    {
      id: 3,
      title: "Registros: Importación contenerizada",
      description: "Análisis de importaciones",
      icon: LuPackage2,
      category: "Financiero",
      color: "bg-gray-500"
    },
  ];
  
  const statsdata = [
  ...(selected.typeImp == 2 ? [
    {
      icon: <IoIosStats size={24} className="text-white" />,
      title: "Bascula - Puerto",
      value: `${formatNumber(stats?.pesoNeto)} TM - ${formatNumber(stats?.pesoTeorico)} TM`,
      color: "bg-blue-500",
    },
    {
      icon: <IoIosStats size={24} className="text-white" />,
      title: "Desviacion Total (TM) (%)",
      value: `${formatNumber(stats?.desviacion)} (${formatNumber(stats?.porcentaje)}%)`,
      color: "bg-amber-500",
      status: (Number(stats?.desviacion) || 0) >= 0 ? 'text-green-700' : 'text-red-700'
    },
  ] : [
    {
      icon: <IoIosStats size={24} className="text-white" />,
      title: "Sacos Recibidos - Sacos Teóricos",
      value: `${formatNumber(stats?.sacosDescargados)} - ${formatNumber(stats?.sacosTeroicos)}`,
      color: "bg-blue-500",
    },
    {
      icon: <IoIosStats size={24} className="text-white" />,
      title: "Desviacion Total (Unidad Sacos) (%)",
      value: `${formatNumber(stats?.diferenciaSacos)} (${formatNumber(stats?.porcentajeSacosDiff)}%)`,
      color: "bg-amber-500",
      status: (Number(stats?.diferenciaSacos) || 0) >= 0 ? 'text-green-700' : 'text-red-700'
    },
  ]),
  {
    icon: <IoIosStats size={24} className="text-white" />,
    title: "Bascula - Factura",
    value: `${formatNumber(stats?.pesoNeto)} TM - ${formatNumber(stats?.cantidad)} TM`,
    color: "bg-blue-500",
  },
  {
    icon: <IoIosStats size={24} className="text-white" />,
    title: "Desviacion Total (TM) (%)",
    value: (() => {
      const pesoNeto = Number(stats?.pesoNeto) || 0;
      const cantidad = Number(stats?.cantidad) || 0;
      const diferencia = pesoNeto - cantidad;
      const porcentaje = cantidad !== 0 ? (diferencia / cantidad) * 100 : 0;

      return `${formatNumber(diferencia)} (${formatNumber(porcentaje)}%)`;
    })(),
    color: "bg-amber-500",
    status: (() => {
      const pesoNeto = Number(stats?.pesoNeto) || 0;
      const cantidad = Number(stats?.cantidad) || 0;
      const diferencia = pesoNeto - cantidad;

      return diferencia >= 0 ? 'text-green-700' : 'text-red-700';
    })()
  },
];

  return (
    <>
      <div className="flex justify-between w-full gap-5 max-sm:flex-col max-xl:flex-col mb-4">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Importaciones</h1>
          <h1 className="text-gray-600 max-sm:text-sm">
            {" "}
            Análisis detallado de importaciones
          </h1>
        </div>
        <div className="parte-der flex items-center justify-center gap-3 max-sm:text-sm">
          <div className="flex gap-4 item max-sm:flex-col max-sm:w-full">
            <div className="flex-1 items-center">
              <div className="relative">
                <div className="flex gap-1 flex-wrap">
                  <select 
                    name="typeImp"
                    onChange={handleChangeFilters}
                    className="appearance-none max-md:[300px] max-lg:w-[400px] w-[300px] bg-white text-gray-900 border border-gray-300 rounded-lg py-3 pl-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#955e37] focus:border-[#955e37] hover:border-gray-400 transition-colors duration-200"
                    value={selected.typeImp}
                  >
                    <option value=''>Tipo de importacion</option>
                    <option value={2}>A Granel</option>
                    <option value={15}>Contenerizada</option>
                  </select>
                  <div className="flex max-sm:flex-col gap-1">
                    <SelectFormImportaciones 
                      name={'buque'} 
                      data={buques?.sociosImp} 
                      fun={handleChangeFilters} 
                      val={selected.buque}
                    />
                    <SelectFormImportaciones 
                      name={'facturasImp'} 
                      data={buques?.facturasImp} 
                      fun={handleChangeFilters} 
                      val={selected.facturasImp}
                    />
                  </div>
                  <div className="flex gap-1 max-sm:flex-col ">
                    <button 
                      disabled={(!selected.buque || !selected.typeImp || !selected.facturasImp || selected.buque == -99 || selected.facturasImp == -99 ||selected.typeImp == '') ? true: false} 
                      onClick={()=>setIsOpen(true)} 
                      className="max-sm:px-5 max-sm:py-[0.95em] bg-gradient-to-r from-[#955e37] to-[#804e2b] text-white font-medium py-3 px-6 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-auto min-w-fit"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-6" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
                          <path fill="white" d="M 16 4 C 14.35 4 13 5.35 13 7 L 13 11 L 15 11 L 15 7 C 15 6.45 15.45 6 16 6 L 30 6 L 30 14 L 26.509766 14 C 26.799766 14.61 26.970234 15.28 26.990234 16 L 30 16 L 30 24 L 27 24 L 27 26 L 30 26 L 30 34 L 26.990234 34 C 26.970234 34.72 26.799766 35.39 26.509766 36 L 30 36 L 30 44 L 16 44 C 15.45 44 15 43.55 15 43 L 15 39 L 13 39 L 13 43 C 13 44.65 14.35 46 16 46 L 46 46 C 47.65 46 49 44.65 49 43 L 49 7 C 49 5.35 47.65 4 46 4 L 16 4 z M 32 6 L 46 6 C 46.55 6 47 6.45 47 7 L 47 14 L 32 14 L 32 6 z M 4.1992188 13 C 2.4437524 13 1 14.443752 1 16.199219 L 1 33.800781 C 1 35.556248 2.4437524 37 4.1992188 37 L 21.800781 37 C 23.556248 37 25 35.556248 25 33.800781 L 25 16.199219 C 25 14.443752 23.556248 13 21.800781 13 L 4.1992188 13 z M 4.1992188 15 L 21.800781 15 C 22.475315 15 23 15.524685 23 16.199219 L 23 33.800781 C 23 34.475315 22.475315 35 21.800781 35 L 4.1992188 35 C 3.5246851 35 3 34.475315 3 33.800781 L 3 16.199219 C 3 15.524685 3.5246851 15 4.1992188 15 z M 32 16 L 47 16 L 47 24 L 32 24 L 32 16 z M 7.96875 19 L 11.462891 24.978516 L 7.6308594 31 L 10.494141 31 L 13.015625 26.283203 L 15.548828 31 L 18.369141 31 L 14.599609 25 L 18.285156 19 L 15.609375 19 L 13.154297 23.505859 L 10.830078 19 L 7.96875 19 z M 32 26 L 47 26 L 47 34 L 32 34 L 32 26 z M 32 36 L 47 36 L 47 43 C 47 43.55 46.55 44 46 44 L 32 44 L 32 36 z"></path>
                        </svg>
                      </span>
                    </button>
                    
                    <button 
                      onClick={handleApplicarFiltro} 
                      className="max-sm:px-5 max-sm:py-[1.1em] bg-gradient-to-r from-[#955e37] to-[#804e2b] text-white font-medium py-3 px-6 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto min-w-fit"
                    >
                      <span className="flex items-center justify-center gap-2 max-md:hidden">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="100" height="100">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Aplicar
                      </span>
                      <span className="hidden items-center justify-center gap-2 max-md:block">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="100" height="100">
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
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <ProgressBar current={stats?.pesoNeto || 0} limit={stats?.cantidad || 0} status={stats?.status} unit="Toneladas" label={`${selectedName ? selectedName : 'Seleccione un buque'}`}/>        
          {statsdata?.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              color={stat.color}
              status={stat.status}
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
            <BuqueDetalles datos={buquesDetails?.data}  />
            <div className="bg-white p-4 rounded-b-sm">
              {buquesDetails && buquesDetails?.pagination?.totalPages > 1 && <Pagination pg={pagination} sp={setPagination} hp={handlePagination} dt={buquesDetails}/>}
            </div>
          </div>
        )}
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#333', // estilo general
            color: 'white',
          },
          error: {
            style: {
              background: '#ff4d4f', // rojo fuerte
              color: '#fff',
            },
          },
        }}
      />
      {isOpen && <ModalReportes reports={selected.typeImp==2 ? reports : reportsContenerizada} buque={selected.buque} factura={selected.facturasImp} handleClose={handleClose} hdlClose={handleClose}/>}
    </>
  );
};

function ProgressBar({ current, limit, label = "Progreso", unit = "productos", status }) {
  const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
  
  return (
    <div className="w-full mx-auto row-span-2 col-span-2 lg:col-span-1">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-7 py-7">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
          <div className="flex items-center space-x-2 ML-">
            <span className="text-2xl font-bold text-[#5a3f27]">
              {percentage.toFixed(2)}%
            </span>
            <span className="text-sm text-gray-500">Recibido</span>
          </div>
        </div>
        
        {/* Progress Bar Container */}
        <div className="mb-4">
          <div className="relative w-full bg-gray-100 rounded-full h-6 overflow-hidden shadow-inner">
            {/* Progress Fill */}
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#5a3f27] via-[#5a3f27] to-[#5a3f27] transition-all duration-700 ease-out rounded-full shadow-sm"
              style={{ width: `${percentage}%` }}
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
            </div>
            
            {/* Progress Text Overlay */}
            {percentage > 15 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-sm font-medium drop-shadow-sm">
                  {percentage.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#5a3f27] rounded-full"></div>
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{formatNumber(current)}</span> de{' '}
              <span className="font-semibold text-gray-800">{formatNumber(limit)}</span>
            </span>
          </div>
          <span className="text-sm text-gray-500 capitalize">{unit}</span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span className={`${status === 1 ? 'text-red-500' : status === 2 ? 'text-green-700 text-sm font-bold' : ''}`}>
              {status === 1 ? (
                <span className="text-[#955e37] font-bold flex items-center gap-2 text-sm">
                  <FaSpinner className="animate-spin text-xs" />
                  Recibiendo
                </span>
              ) : status === 2 ? 'Completado' : '-'}
            </span>
            <span className="text-sm font-bold text-gray-600">
              {
                status === 1 ? (percentage >= 100 ? ' - ' : `${(100 - percentage).toFixed(2)}% por completar`) : 
                status === 2 ? (percentage >= 100 ? ` - ` : ` - `) : 
                status === 3 ? 'Cancelado' : '-'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Importaciones;
