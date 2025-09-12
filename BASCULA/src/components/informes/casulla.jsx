import { useCallback, useEffect, useState } from "react";
import TableSheet, { CasullaStatsCards, TableComponentCasulla } from "./tables";
import { getDataCasulla, getDataCasullaDetalles } from "../../hooks/informes/casulla";
import { NoData } from "../alerts";

const Casulla = () => {
    const [filters, setfilters] = useState({dateIn: '', dateOut: ''})
    const [casulla, setCasulla] = useState([{}])
    const [isLoading, setIsLoading] =  useState(false)
    const [openSheet, setOpenSheet] = useState(false)
    const [tableData, setTableData] = useState([{}])
    const [isLoadingTableData, setIsLoadingTableData] = useState(false)

    const handleChangeFilters = (e) => {
        setfilters({...filters, [e.target.name]: e.target.value})
    }

    const handleOpenSheetData = (data) => {
        console.log(data)
        getDataCasullaDetalles(setTableData, setIsLoadingTableData,filters, data?.Socio, data?.Destino)
        setOpenSheet(true)
    }

    const fetchCasulla = useCallback(() => {
        getDataCasulla(setCasulla, setIsLoading, filters)
    }, [filters])

    useEffect(()=>{
        fetchCasulla()
    }, [fetchCasulla])


    const sheetProps = {
        openSheet, 
        setOpenSheet, 
        tableData,
        title: 'Detalles Casulla', 
        subtitle: `Visualización de los datos de Casulla: ${isLoadingTableData? 'Cargando...' : tableData[0]?.socio}`,
        isLoading:isLoadingTableData, 
    }

    return ( 
        <>
            <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
                <div className="parte-izq">
                    <h1 className="text-3xl font-bold titulo">Casulla</h1>
                    <h1 className="text-gray-600 max-sm:text-sm">
                        {" "}
                        Análisis detallado de casulla
                    </h1>
                </div>
                <div className="parte-der flex items-center justify-center gap-3 max-sm:text-sm max-sm:flex-col">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <div className="relative">
                                <div className="flex gap-2 max-sm:flex-col">
                                    <div className="flex flex-col">
                                        <label htmlFor="dateIn" className="text-gray-700">Inicio</label>
                                        <input name="dateIn" onChange={handleChangeFilters} value={filters?.dateIn} type="date" className=" w-48 bg-white text-gray-900 border border-gray-300 rounded-lg py-2.5 pl-4 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#955e37] focus:border-[#955e37 ] hover:border-gray-400 transition-colors duration-200" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="dateOut" className="text-gray-700">Fin</label>
                                        <input name="dateOut" onChange={handleChangeFilters} value={filters?.dateOut} type="date" className=" w-48 bg-white text-gray-900 border border-gray-300 rounded-lg py-2.5 pl-4 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#955e37] focus:border-[#955e37 ] hover:border-gray-400 transition-colors duration-200" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <CasullaStatsCards total={casulla?.total} />
            <div className="p-3 bg-white rounded-md shadow-sm">
                {!casulla || casulla?.data?.length === 0 ? (
                    <NoData />
                ) : (
                    <TableComponentCasulla datos={casulla['data']} total={casulla['total']} fun={handleOpenSheetData} />
                )}
            </div>
            <TableSheet {...sheetProps} />
        </>
    );
}
 
export default Casulla;