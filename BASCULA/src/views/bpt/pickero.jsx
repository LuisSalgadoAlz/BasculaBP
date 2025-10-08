import { useState } from "react";
import { URLWEBSOCKET } from "../../constants/global";
import { useManifiestosAsignados, useUsers } from "../../hooks/bpt/hooks";
import { useEffect } from "react";
import { PickingAsignadosTable } from "../../components/bpt/pickeroComponents";
import { WebSocketsMolde } from "../../components/bpt/moldes";

const HomePickero = () => {
    const { user } = useUsers()
    const { manifiestos, connectionStatus } = useManifiestosAsignados( user )

    const propsTablesLibres = {
      tableData: manifiestos,
    }

    return (
    <>
      <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo max-sm:text-xl">
            Registros de: {user?.nombre || "Cargando..."}{" "}
          </h1>
          <h1 className="text-gray-600 max-sm:text-sm">
            {" "}
            Sistema de gestión de picking.
          </h1>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-2xl">
        <WebSocketsMolde connectionStatus={connectionStatus} itsValid={manifiestos.length > 0}>
          <PickingAsignadosTable {...propsTablesLibres} />
        </WebSocketsMolde>
      </div>
    </>
  );
};

export default HomePickero;
