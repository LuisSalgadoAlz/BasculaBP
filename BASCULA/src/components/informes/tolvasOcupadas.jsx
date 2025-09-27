import { useState } from "react";
import { TolvaSection } from "../tolva/table";
import { useCallback } from "react";
import { useEffect } from "react";
import { getTolvasOcupadas } from "../../hooks/informes/tolva";
import { TolvasDashboard } from "./tables";
import { buttonNormal } from "../../constants/boletas";

const TolvasOcupadas = () => {
    const [tolva, setTolva] = useState()
    const [loadingTolvas, setLoadingTolvas] = useState(false)

    const fetchData = useCallback(()=>{
        getTolvasOcupadas(setTolva, setLoadingTolvas)
    }, [])

    const updateZonas = () => {
        fetchData()
    }

    useEffect(()=>{
        fetchData()
    }, [])

    return (
        <>
            <div className="flex justify-between w-full gap-5 max-sm:flex-col max-xl:flex-col mb-4">
                <div className="parte-izq">
                <h1 className="text-3xl font-bold titulo">Ocupación Tolvas</h1>
                <h1 className="text-gray-600 max-sm:text-sm">
                    {" "}
                    Análisis detallado de las tolvas de descarga actuales
                </h1>
                </div>
                <div className="parte-der flex items-center justify-center gap-3 max-sm:text-sm max-sm:flex-col">
                    <div className="flex items-end flex-col sm:flex-row gap-2">
                        <button onClick={updateZonas} className={buttonNormal}>
                            {loadingTolvas ? 'Actualizando...' : 'Actualizar'}
                        </button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2 bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden min-h-[450px]">
                <div className="col-span-3">
                    <TolvasDashboard datos={tolva?.tolvas} loadingTolvas={loadingTolvas} camionesEspera={tolva?.pendientes}/>
                </div>
            </div>
        </>
    );
};

export default TolvasOcupadas;
