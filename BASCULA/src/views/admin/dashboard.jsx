import { useEffect, useState } from "react";
import { getMetrics, getSpaceForTable } from "../../hooks/admin/formDataAdmin";
import { CiServer, CiDatabase } from "react-icons/ci";
import { MdMemory, MdOutlineDashboard, MdRefresh } from "react-icons/md";
import { PiMemoryDuotone } from "react-icons/pi";
import { TablesBD } from "../../components/admin/tables";

const DashboardAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadTable, setIsLoadTable] = useState(false);
  const [tables, setTables] = useState();
  const [metrics, setMetrics] = useState();
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleString());

  useEffect(() => {
    fetchData();

    // Actualizar datos cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = () => {
    setIsLoading(true);
    setIsLoadTable(true);

    Promise.all([
      getMetrics(setMetrics, setIsLoading),
      getSpaceForTable(setTables, setIsLoadTable),
    ]).then(() => {
      setLastUpdate(new Date().toLocaleString());
    });
  };

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Boletas</h1>
          <h1 className="text-gray-600 max-sm:text-sm">
            {" "}
            Generación y visualización de las boletas de Báscula
          </h1>
        </div>
        <div className="parte-der flex items-center justify-center gap-3 max-sm:text-sm max-sm:flex-col">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
            disabled={isLoading || isLoadTable}
          >
            <MdRefresh
              className={`${isLoading || isLoadTable ? "animate-spin" : ""}`}
            />
            {isLoading || isLoadTable ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>

      <div className="mt-6 shadow-md rounded-2xl">
        {/* System Metrics */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center text-gray-600">
              <CiServer className="mr-2" size={24} />
              Estado del API
            </h2>
            <span className="text-sm font-medium text-gray-500 flex items-center">
              <span className="mr-2">Última actualización:</span>
              <span className="py-1 px-3 rounded-full">
                {lastUpdate}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CPU Usage */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <MdMemory className="text-blue-600" size={24} />
                  </div>
                  <h3 className="ml-3 font-semibold text-lg text-gray-800">
                    CPU
                  </h3>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {metrics?.cpu?.usage}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full ${
                    metrics?.cpu?.usage > 80
                      ? "bg-red-500"
                      : metrics?.cpu?.usage > 60
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${metrics?.cpu?.usage || 0}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-600 flex justify-between">
                <span>Utilización</span>
                <span className="font-medium">
                  {metrics?.cpu?.usage}% usado de {metrics?.cpu?.cores}%
                </span>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <PiMemoryDuotone className="text-green-600" size={24} />
                  </div>
                  <h3 className="ml-3 font-semibold text-lg text-gray-800">
                    Memoria
                  </h3>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {metrics?.memory?.used && metrics?.memory?.total
                    ? Math.round(
                        (metrics.memory.used / metrics.memory.total) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full ${
                    metrics?.memory?.used &&
                    metrics?.memory?.total &&
                    (metrics.memory.used / metrics.memory.total) * 100 > 80
                      ? "bg-red-500"
                      : metrics?.memory?.used &&
                        metrics?.memory?.total &&
                        (metrics.memory.used / metrics.memory.total) * 100 > 60
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${
                      metrics?.memory?.used && metrics?.memory?.total
                        ? (metrics.memory.used / metrics.memory.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-600 flex justify-between">
                <span>Utilización</span>
                <span className="font-medium">
                  {metrics?.memory?.used} GB usado de {metrics?.memory?.total}{" "}
                  GB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Tables */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center text-gray-600">
              <CiDatabase className="mr-2" size={24} />
              Tablas de Base de Datos
            </h2>
            {isLoadTable && (
              <span className="text-sm text-blue-600 animate-pulse">
                Cargando datos...
              </span>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-10">
            {tables ? (
              <TablesBD datos={tables} />
            ) : (
              <div className="p-6 text-center text-gray-500">
                {isLoadTable
                  ? "Cargando tablas..."
                  : "No hay datos disponibles"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
