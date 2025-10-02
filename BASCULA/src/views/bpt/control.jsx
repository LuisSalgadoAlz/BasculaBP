import { ManifiestosTable } from "../../components/bpt/supervisor";
import { ConfigurableTable } from "../../components/informes/tables";
import { useManifiestosSocket } from "../../hooks/bpt/hooks";

const ControlZone = () => {
  const { connectionStatus, manifiestos } = useManifiestosSocket();
  
  return (
    <>
      <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4 max-sm:mb-5">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Supervisor Bodega PT</h1>
          <h1 className="text-gray-600 max-sm:text-sm">
            {" "}
            Control detallado de manifiestos creados
          </h1>
        </div>
      </div>
      {connectionStatus === 'error' && (
        <div className="text-center p-4 text-red-500">
          Error de conexión - SAP CAIDO / NO HAY CONEXION
        </div>
      )}
      
      {connectionStatus === 'closed' && (
        <div className="text-center p-4 text-yellow-500">
          Conexión cerrada - Intente actualizar la página
        </div>
      )}
      
      {connectionStatus === 'connected' && manifiestos.length > 0 && (
        <ManifiestosTable tableData={manifiestos} />
      )}
      
      {connectionStatus === 'connected' && manifiestos.length === 0 && (
        <div className="text-center p-4">
          No hay manifiestos disponibles
        </div>
      )}
    </>
  );
};

export default ControlZone;