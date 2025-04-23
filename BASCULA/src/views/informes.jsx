import { useEffect, useState } from "react";
import { NoData, Spinner } from "../components/alerts";
import TableHistorial from "../components/historial/tables";
import { getHistorialBoletas } from "../hooks/formDataInformes";
import { ButtonAdd } from "../components/buttons";

const Informes = () => {
  const [data, setData] = useState()
  const [isLoad, setIsload] = useState(false)
  
  useEffect(() => {
    getHistorialBoletas(setData, setIsload)
    console.log(data)
  }, [])
  
  const handlePrint = (boleta) => {
    console.log(boleta)
  } 

  return (
    <>
      <div className="flex justify-between w-full gap-5">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Historial de boletas</h1>
          <h1 className="text-gray-600">
            {" "}
            Gestiona los informes generados en el sistema.
          </h1>
        </div>
      </div>
      <div  className={`mt-6 bg-white shadow rounded-lg px-6 py-7 border border-gray-300` }>
        <div className="filtros grid grid-rows-1 grid-cols-5 grid-flow-col gap-2 max-md:grid-rows-2 max-md:grid-cols-2 max-sm:grid-rows-2 max-sm:grid-cols-1">
            <input className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 col-span-full" type="text" placeholder="Buscar boletas por ID, placas o motorista..." />
            <input className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 max-sm:hidden" type="date"/>
            <ButtonAdd name="Exportar"/>
        </div>
        <div className="mt-4">
            {isLoad && !data ? <Spinner /> : (!data || data.length == 0 ? <NoData /> : <TableHistorial datos={data} imprimirCopia={handlePrint} />)}
        </div>
      </div>
    </>
  );
};

export default Informes;
