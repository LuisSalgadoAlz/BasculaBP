import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { getBoletasPorDia, getPorcentajeDeCumplimiento } from "../../hooks/informes/guardia";
import TableSheet, { TableComponentCasulla } from "./tables";
import { BigSpinner } from "../alerts";

const CalendarioPases = lazy(() =>
  import("../calendario/calendarioPases").then((module) => ({
    default: module.CalendarioPases, // <-- aquí se indica cuál export nombrado usar
  }))
);

const ReportesGuardia = () => {
    const [dataPorcentaje, setDataPorcentaje] = useState()
    const [loadingPorcentaje, setLoadingPorcentaje] = useState(false)
    const [openSheet, setOpenSheet] = useState(false)
    const [tableData, setTableData] = useState()
    const [loadingTableData, setIsLoadingTableData] = useState(false)
    const [selectedDate, setSelectedDate] = useState('Sin seleccionar')

    const fetchPorcentaje = useCallback(()=>{
        getPorcentajeDeCumplimiento(setDataPorcentaje, setLoadingPorcentaje)
    }, [])

    const fetchGetForDay = useCallback(()=>{
        getBoletasPorDia(setTableData, setIsLoadingTableData)
    }, [])
    
    const handleOpenSheet = (data) => {
        setOpenSheet(true)
        setSelectedDate(data?.fecha)
        getBoletasPorDia(setTableData, setIsLoadingTableData, data?.fecha)
    }

    useEffect(()=>{
        fetchGetForDay()
    }, [fetchGetForDay])

    useEffect(()=>{
        fetchPorcentaje()
    }, [fetchPorcentaje])

    const sheetProps = {
        openSheet, 
        setOpenSheet, 
        tableData: tableData?.boletas, 
        title: 'Detalles Pases De Salida', 
        subtitle: `Visualización de pases de salida del día: ${selectedDate}`, 
        type: true,
        fixedColumns: ['Boleta', 'Pase de Salida', 'Placa', 'Transporte'] 
    }

    return ( 
        <>
            <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
                <div className="parte-izq">
                    <h1 className="text-3xl font-bold titulo">Guardia</h1>
                    <h1 className="text-gray-600 max-sm:text-sm">
                        {" "}
                        Análisis detallado de salidas de vehiculos
                    </h1>
                </div>
            </div>
            <div className="mt-6 bg-white shadow rounded-lg px-6 py-7 border border-gray-300 max-h-[700px] overflow-auto body-components calendario">
                <Suspense fallback={<BigSpinner />}>
                    <CalendarioPases />
                </Suspense>
            </div>

            {loadingPorcentaje ? (
                <>Cargando...</> 
            ) : (
                dataPorcentaje && dataPorcentaje.length > 0 ? (
                    <div className="p-3 rounded-sm shadow-sm bg-white">
                        <TableComponentCasulla datos={dataPorcentaje} fun={handleOpenSheet} />
                    </div>
                ) : (
                    <>No hay datos</>
                )
            )}
            <TableSheet {...sheetProps} />
        </>
    );
}
 
export default ReportesGuardia;