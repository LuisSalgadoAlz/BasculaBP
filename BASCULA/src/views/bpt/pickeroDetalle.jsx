import { useParams } from "react-router";
import { ActionsButtones, ProductosAgrupadosTable } from "../../components/bpt/pickeroComponents";
import { useGetManifiestosDetalles, useManifiestosSocketCanal2, useNavigateBack, useStatePicking } from "../../hooks/bpt/hooks";
import { BaseHeader, Buttons, Cuerpo, DataContainer, DataLoading } from "../../components/molde";
import { useState } from "react";
import { useCallback } from "react";
import { getLastPickingForDocNum } from "../../hooks/bpt/requests";
import { useEffect } from "react";

const PickeroDetalleManifiesto = () => {
    /**
     * END - Variable Principal donde se obtiene 
     * END - el numero de manifiesto
     */

    const { DocNum } = useParams();

    /**
     * END - Hooks a utilizar
     */

    const { handleBack } = useNavigateBack()
    const {manifiesto,loadingManifiesto, menuOpen, setMenuOpen, manifiestoLocal, loadingManifiestoLocal, fetchDetallesLocal} = useGetManifiestosDetalles(DocNum)
    const {handleStartPicking, handleFinishPicking, userPicking, loadingPicking} = useStatePicking(DocNum, fetchDetallesLocal)
    const { logsDetector } = useManifiestosSocketCanal2(DocNum)
    
    /**
     * END - PROPS de los componentes 
     */

    const propsActionsButtons = {
        handleBack,
        setMenuOpen,
        menuOpen,
        handleStartPicking,
        handleFinishPicking,
        state: userPicking?.estado, 
        logs: logsDetector
    }

    return (
        <>
            <BaseHeader 
                title={`Manifiesto ${DocNum}`} 
                subtitle="Visualización del picking"
            >
                <Buttons>
                    <ActionsButtones {...propsActionsButtons} />
                </Buttons>
                <Cuerpo>
                    <DataLoading loading={loadingPicking}>
                        {userPicking?.estado === 'PND' ? (
                            <DataContainer loading={loadingManifiesto} data={manifiesto}>
                                <ProductosAgrupadosTable tableData={manifiesto} type={1} />
                            </DataContainer>
                        ) : userPicking?.estado === 'EPK' ? (
                            <DataContainer loading={loadingManifiestoLocal} data={manifiestoLocal}>
                                <ProductosAgrupadosTable tableData={manifiestoLocal} type={2} />
                            </DataContainer>
                        ) : null}
                    </DataLoading>
                </Cuerpo>
            </BaseHeader>
        </>
    );
};

export default PickeroDetalleManifiesto;