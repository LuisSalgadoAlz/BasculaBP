import { useState } from "react";
import { ButonDeAsingar, ManifiestosAsignadosTable, ManifiestosLogs, ManifiestosTable, ModalAsignar, ViewTabs } from "../../components/bpt/supervisor";
import { useGetUsersForManifiestos, useManifiestosSocket, useManifiestosSocketCanal2, useVerLogs } from "../../hooks/bpt/hooks";
import { Toaster } from "sonner";
import { WebSocketsMolde } from "../../components/bpt/moldes";

const ControlZone = () => {
  const [ selectedItems, setSelectedItems ] = useState(new Set());
  
  const { 
    connectionStatus, 
    manifiestos 
  } = useManifiestosSocket();

  const { 
    connectionStatusAsignados, 
    manifiestosAsignados 
  } = useManifiestosSocketCanal2();

  const {
    users, 
    laodingUsers, 
    open, 
    setOpen, 
    loadingAsignar,
    handleChecked, 
    openModalAsignar, 
    handleAsignarMasivamente, 
    handleLimpiarSeleccion 
  } = useGetUsersForManifiestos(setSelectedItems)
  
  const { 
    logs, 
    openLogs, 
    setOpenLogs, 
    handleOpenLogs,
    loadingLogs,
    selectedLog,  
  } = useVerLogs()

  const [view, setView] = useState(1)
  
  const propsModal = {
    isOpen: open,  
    setIsOpen: setOpen, 
    usuarios: users, 
    loadingUsers: laodingUsers, 
    handleAsignarMasivamente,
    loadingAsignar, 
  }

  const propsViewTabs = {
    view, 
    setView:setView, 
    manifiestos:manifiestos, 
    manifiestosAsignados:manifiestosAsignados, 
    connectionStatus:connectionStatus,
  }

  const propsTablesLibres = {
    tableData: manifiestos, 
    handleChecked, 
    openModalAsignar,
    handleLimpiarSeleccion, 
    selectedItems,
    setSelectedItems,
  }

  const propsTableAsignadas = {
    tableData: manifiestosAsignados,
    handleOpenLogs, 
    loadingLogs, 
    selectedLog,
  }

  const propsBotonAsingar = {
    handleLimpiarSeleccion: handleLimpiarSeleccion,
    openModalAsignar: openModalAsignar
  }

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
        <div className="flex justify-between w-full gap-5">
          <ViewTabs {...propsViewTabs}/>
          <ButonDeAsingar {...propsBotonAsingar}/>
        </div>
        {view===1 && (
          <>
            <WebSocketsMolde connectionStatus={connectionStatus} itsValid={manifiestos.length>0}>
              <ManifiestosTable {...propsTablesLibres}/>
              <ModalAsignar {...propsModal} />
            </WebSocketsMolde>
          </>
        )}
        {view===2 && (
          <>
            <WebSocketsMolde connectionStatus={connectionStatusAsignados} itsValid={manifiestosAsignados.length>0}>
              <ManifiestosAsignadosTable {...propsTableAsignadas} />
              <ManifiestosLogs data={logs.data} isOpen={openLogs} setIsOpen={setOpenLogs} />
            </WebSocketsMolde>
          </>
        )}
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#333', // estilo general
            color: 'white',
          },
        }}
      />
    </>
  );
};

export default ControlZone;