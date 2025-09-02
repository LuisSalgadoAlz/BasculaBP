import { useState, useCallback, useEffect } from "react";
import { BaprosaSiloChart } from "../graficos/informes";
import { getInfoSilos, postCreateNewReset } from "../../hooks/informes/tolva";

const TolvaReportes = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingReset, setLoadingReset] =  useState(false)
  
  const fetchData = useCallback(() => {
    getInfoSilos(setData, setLoading);
  }, []);

  const handleResetSilo = async (name, action) => {
    const cuerpoSilo = { silo: name }
    const response = await postCreateNewReset(cuerpoSilo, setLoadingReset)
    fetchData()
  }

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 30000); // cada 30 segundos

    return () => clearInterval(interval); // limpiar cuando se desmonte
  }, [fetchData]);

  return (
    <>
      {loading && <div>Cargando...</div>}
      {console.log(data )}
      {data &&(
        <BaprosaSiloChart data={data?.data} onSiloAction={handleResetSilo} />
      )}  

      {/* Parte para colocar las estadisticas */}

      Hola
    </>
  );
};

export default TolvaReportes;