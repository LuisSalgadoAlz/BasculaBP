import { useState } from "react";
import { BaprosaSiloChart, BaprosaSiloChart2 } from "../graficos/informes";
import { useCallback } from "react";
import { useEffect } from "react";
import { getInfoSilos, getInfoSilosDetails, postCreateNewReset } from "../../hooks/informes/tolva";
import TableSheet from "./tables";

const ReportesSilos = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [details, setDetails] = useState()
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [openSheet, setOpenSheet] = useState(false)
  const [selectedSilos, setSelectedSilos] = useState([])
  const [barView, setBarView] = useState(true)

  const fetchData = useCallback(() => {
    getInfoSilos(setData, setLoading);
  }, []);

  const handleResetSilo = async (name, action) => {
    const cuerpoSilo = { silo: name };
    const response = await postCreateNewReset(cuerpoSilo, setLoadingReset);
    fetchData();
  };

  const handleClickBar = (data) => {
    const siloData = data.activePayload[0].payload;
    console.log(siloData)
    getInfoSilosDetails(setDetails, setLoadingDetails, siloData.boletas)
    setSelectedSilos(siloData?.silo_nombre)
    setOpenSheet(true)
  }

  const handleUpdateBar = () => {
    fetchData()
  }

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sheetProps = {
    openSheet, 
    setOpenSheet, 
    tableData: details?.data,
    title: 'Detalles Silo', 
    subtitle: `Visualización de boletas ingresadas al silo: ${loadingDetails? 'Cargando...' : selectedSilos}`, 
    type: true,
    fixedColumns: ['#', 'numBoleta', 'placa', 'pesoNeto', 'pesoAcumulado', 'socio'], 
    storageKey: 'tolva-details', 
    isLoading: loadingDetails, 
    labelActive: false,
  }

  return (
    <>
      <div className="flex justify-between w-full gap-5 max-lg:flex-col mb-4">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Reportes: tolva</h1>
          <h1 className="text-gray-600 max-sm:text-sm">
            {" "}
            Análisis detallado de la gestión de silos
          </h1>
        </div>
         <div className="parte-der flex items-center justify-center gap-3 max-sm:text-sm max-sm:flex-col">
          <div className="flex items-end flex-col sm:flex-row gap-2">
            <div className="flex w-full sm:w-auto">
              <button 
                onClick={()=>setBarView(true)}
                className="px-5 py-3 bg-gradient-to-r from-[#955e37] to-[#804e2b] text-white 
                          font-medium rounded-l-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 
                          focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] 
                          active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none 
                          flex-1 sm:flex-none sm:min-w-fit">
                %%
              </button>
              <button 
                onClick={()=>setBarView(false)}
                className="px-5 py-3 bg-gradient-to-r from-[#955e37] to-[#804e2b] text-white 
                          font-medium rounded-r-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 
                          focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] 
                          active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none 
                          flex-1 sm:flex-none sm:min-w-fit -ml-px border-l border-[#7a4528]">
                QQ
              </button>
            </div>
            <button 
              onClick={handleUpdateBar}
              className="px-5 py-3 bg-gradient-to-r from-[#955e37] to-[#804e2b] text-white 
                        font-medium rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 
                        focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] 
                        active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full 
                        sm:w-auto min-w-fit">
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {barView ? (
        <BaprosaSiloChart2
          data={data?.data2}
          onSiloAction={handleResetSilo}
          isLoading={loading}
          handleClickBar={handleClickBar}
        />
      ) : (
        <BaprosaSiloChart
          data={data?.data}
          onSiloAction={handleResetSilo}
          isLoading={loading}
          handleBarClick={handleClickBar}
        />
      )}
      <TableSheet {...sheetProps} />
    </>
  );
};

export default ReportesSilos;
