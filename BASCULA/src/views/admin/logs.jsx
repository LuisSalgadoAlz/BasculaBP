import { useEffect, useState } from "react";
import { TablesBD } from "../../components/admin/tables";
import { getLogs

 } from "../../hooks/admin/formDataAdmin";
import { BigSpinner, NoData } from "../../components/alerts";
const Logs = () => {
    const [tableLogs, setTablesLogs] = useState()
    const [isLoading, setIsLoading] = useState()
    useEffect(() => {
        getLogs(setTablesLogs, setIsLoading)
    }, [])
    
    return (
    <>
      <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Registros: Logs</h1>
          <h1 className="text-gray-600 max-sm:text-sm">
            {" "}
            Monitoreo de los Logs de los usuarios de la Bascula
          </h1>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {(isLoading && !tableLogs) ? <BigSpinner /> : (!tableLogs || tableLogs.length==0) ? (
            <NoData />
        ):(
            <TablesBD datos={tableLogs} />
        )}
      </div>
    </>
  );
};

export default Logs;
