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
    isLoading: loadingDetails
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
      </div>
      {loading && <div>Cargando...</div>}
      {data && (
        <>
          <BaprosaSiloChart2
            data={data?.data2}
            onSiloAction={handleResetSilo}
            isLoading={loading}
            handleClickBar={handleClickBar}
          />
          <BaprosaSiloChart
            data={data?.data}
            onSiloAction={handleResetSilo}
            isLoading={loading}
            handleBarClick={handleClickBar}
          />
        </>
      )}
      <TableSheet {...sheetProps} />
    </>
  );
};

export default ReportesSilos;
