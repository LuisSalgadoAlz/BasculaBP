import { useCallback, useEffect, useState } from "react";
import { getBoletasServicioBascula, getStatsServicioBascula } from "../../hooks/informes/guardia";
import { StatsCardServicioBascula, TableComponentCasulla } from "./tables";
import { NoData } from "../alerts";

const ServicioBascula = () => {
  const [stats, setStats] = useState()
  const [loadingStats, setLoadingStats] = useState(false)
  const [boletas, setBoletas] = useState()
  const [loadingBoletas, setLoadingBoletas] = useState(false)

  const [filters, setFilters] = useState({
    dateIn: "",
    dateOut: "",
  });

  const handleChangeFilters = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const fetchStats = useCallback(()=>{
    getStatsServicioBascula(setStats, setLoadingStats, filters)
    getBoletasServicioBascula(setBoletas, setLoadingBoletas, filters)
  }, [filters])

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
      <div className="p-3 bg-white rounded-md shadow-sm mt-5">
        {!boletas || boletas?.data?.length === 0 ? (
            <NoData />
        ) : (
            <TableComponentCasulla datos={boletas['data']} type={false} />
        )}
      </div>
    </>
  );
};

export default ServicioBascula;
