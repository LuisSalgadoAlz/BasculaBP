import { useEffect, useState } from "react";
import { getMetrics, getSpaceForTable } from "../../hooks/admin/formDataAdmin";
import { CiServer, CiDatabase } from "react-icons/ci";
import { MdMemory } from "react-icons/md";
import { PiMemoryDuotone } from "react-icons/pi";
import { TablesBD } from "../../components/admin/tables";

const DashboardAdmin = () => {
  const [isLoading, setIsLoading] = useState(false)
    const [isLoadTable, setIsLoadTable] = useState(false)

  // Estado para los datos de tablas
  const [tables, setTables] = useState([
    {
      id: 1,
      name: "Empresas",
      rows: 4,
      reserved: "72 KB",
      data: "8 KB",
      index_size: "8 KB",
      unused: "56 KB",
    },
    {
      id: 2,
      name: "Movimientos",
      rows: 12,
      reserved: "72 KB",
      data: "8 KB",
      index_size: "8 KB",
      unused: "56 KB",
    },
    {
      id: 3,
      name: "Producto",
      rows: 25,
      reserved: "72 KB",
      data: "8 KB",
      index_size: "8 KB",
      unused: "56 KB",
    },
    {
      id: 4,
      name: "Rol",
      rows: 6,
      reserved: "72 KB",
      data: "8 KB",
      index_size: "8 KB",
      unused: "56 KB",
    },
    {
      id: 5,
      name: "Traslado",
      rows: 12,
      reserved: "72 KB",
      data: "8 KB",
      index_size: "8 KB",
      unused: "56 KB",
    },
    {
      id: 6,
      name: "Usuario",
      rows: 2,
      reserved: "144 KB",
      data: "8 KB",
      index_size: "8 KB",
      unused: "128 KB",
    },
    {
      id: 7,
      name: "Vehiculo",
      rows: 5,
      reserved: "72 KB",
      data: "8 KB",
      index_size: "8 KB",
      unused: "56 KB",
    },
  ]);

  // Estado para métricas del sistema
  const [metrics, setMetrics] = useState();

  // Simular actualización de métricas cada 5 segundos
  useEffect(() => {
    getMetrics(setMetrics, setIsLoading)
    getSpaceForTable(setTables, setIsLoadTable)
  }, []);

  return (
    <>
      <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Dashboard</h1>
          <h1 className="text-gray-600 max-sm:text-sm">
            {" "}
            Visualización del estado de Sistema de bascula
          </h1>
        </div>
      </div>
      <div className="mt-6 bg-white shadow rounded-xl px-6 py-7">
        <div className="container mx-auto px-4 py-6">
          {/* Tarjetas de métricas del sistema */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
              <CiServer className="mr-2" size={20} />
              Estado del API
              <span className="ml-2 text-sm font-normal text-gray-500">
                Última actualización: {new Date().toLocaleString()}
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CPU Usage */}
              <>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <MdMemory className="text-blue-500 mr-2" size={20} />
                      <h3 className="font-medium">CPU</h3>
                    </div>
                    <span className="text-lg font-semibold">
                      {metrics?.cpu?.usage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full"
                      style={{ width: `${metrics?.cpu?.usage}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {metrics?.cpu?.usage}% usado de {metrics?.cpu?.cores}%
                  </div>
                </div>

                {/* Memory Usage */}
                <div className="bg-white rounded-lg shadow p-4 bgr">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <PiMemoryDuotone
                        className="text-green-500 mr-2"
                        size={20}
                      />
                      <h3 className="font-medium">Memoria</h3>
                    </div>
                    <span className="text-lg font-semibold">
                      {Math.round(
                        (metrics?.memory?.used / metrics?.memory?.total) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{
                        width: `${
                          (metrics?.memory?.used / metrics?.memory?.total) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {metrics?.memory?.used} GB usado de {metrics?.memory?.total} GB
                  </div>
                </div>
              </>

            </div>
          </div>

          {/* Tabla de datos */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
              <CiDatabase className="mr-2" size={20} />
              Tablas de Base de Datos
            </h2>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <TablesBD datos={tables}/>
            </div>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default DashboardAdmin;
