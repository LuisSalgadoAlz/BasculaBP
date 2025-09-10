import { useState } from "react";
import { BaprosaSiloChart, BaprosaSiloChart2 } from "../graficos/informes";
import { useCallback } from "react";
import { useEffect } from "react";
import { getInfoSilos, postCreateNewReset } from "../../hooks/informes/tolva";

const ReportesSilos = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const fetchData = useCallback(() => {
    getInfoSilos(setData, setLoading);
  }, []);

  const handleResetSilo = async (name, action) => {
    const cuerpoSilo = { silo: name };
    const response = await postCreateNewReset(cuerpoSilo, setLoadingReset);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          />
          <BaprosaSiloChart
            data={data?.data}
            onSiloAction={handleResetSilo}
            isLoading={loading}
          />
        </>
      )}
    </>
  );
};

export default ReportesSilos;
