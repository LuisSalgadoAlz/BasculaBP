import { useState } from "react";
import { ManifiestosAsignadosTable, ManifiestosTable, ModalAsignar, ViewTabs } from "../../components/bpt/supervisor";
import { useGetUsersForManifiestos, useManifiestosSocket, useManifiestosSocketCanal2 } from "../../hooks/bpt/hooks";

const ControlZone = () => {
  const { connectionStatus, manifiestos } = useManifiestosSocket();
  const { connectionStatusAsignados, manifiestosAsignados } = useManifiestosSocketCanal2();
  const { users, laodingUsers, open, setOpen, handleModal, handleAsignar } = useGetUsersForManifiestos()
  const [view, setView] = useState(1)
  
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
      <div className="bg-white rounded-2xl p-4 shadow-2xl">
        <ViewTabs view={view} setView={setView} manifiestos={manifiestos} manifiestosAsignados={manifiestosAsignados} connectionStatus={connectionStatus}/>
        {view===1 && (
          <>
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
              <ManifiestosTable tableData={manifiestos} handleOpenModal={handleModal} />
            )}
            
            {connectionStatus === 'connected' && manifiestos.length === 0 && (
              <div className="text-center p-4">
                No hay manifiestos disponibles
              </div>
            )}

            <ModalAsignar isOpen={open} setIsOpen={setOpen} usuarios={users} loadingUsers={laodingUsers} handleAsignar={handleAsignar} />
          </>
        )}
        {view===2 && (
          <>
            {connectionStatusAsignados === 'error' && (
              <div className="text-center p-4 text-red-500">
                Error de conexión - SAP CAIDO / NO HAY CONEXION
              </div>
            )}
            
            {connectionStatusAsignados === 'closed' && (
              <div className="text-center p-4 text-yellow-500">
                Conexión cerrada - Intente actualizar la página
              </div>
            )}
            
            {connectionStatusAsignados === 'connected' && manifiestosAsignados.length > 0 && (
              <ManifiestosAsignadosTable tableData={manifiestosAsignados} handleOpenModal={handleModal} />
            )}
            
            {connectionStatusAsignados === 'connected' && manifiestosAsignados.length === 0 && (
              <div className="text-center p-4">
                No hay manifiestos disponibles
              </div>
            )}

            <ModalAsignar isOpen={open} setIsOpen={setOpen} usuarios={users} loadingUsers={laodingUsers} handleAsignar={handleAsignar} />
          </>
        )}
      </div>
    </>
  );
};

export default ControlZone;