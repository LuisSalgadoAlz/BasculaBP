import { useState } from "react";
import { URLWEBSOCKET } from "../../constants/global";
import { useManifiestosAsignados, useUsers } from "../../hooks/bpt/hooks";
import { useEffect } from "react";
import { PickingAsignadosTable } from "../../components/bpt/pickeroComponents";
import { WebSocketsMolde } from "../../components/bpt/moldes";
import { BaseHeader, Cuerpo } from "../../components/molde";

const HomePickero = () => {
    const { user } = useUsers()
    const { manifiestos, connectionStatus } = useManifiestosAsignados( user )

    const propsTablesLibres = {
      tableData: manifiestos,
    }

    return (
    <>
      <BaseHeader title={`Registros de: ${user?.nombre || "Cargando..."}`} subtitle={`Sistema de gestión de picking.`}>
        <Cuerpo>
          <div className="bg-white rounded-2xl p-4 shadow-2xl">
            <WebSocketsMolde connectionStatus={connectionStatus} itsValid={manifiestos.length > 0}>
              <PickingAsignadosTable {...propsTablesLibres} />
            </WebSocketsMolde>
          </div>
        </Cuerpo>
      </BaseHeader>
    </>
  );
};

export default HomePickero;
