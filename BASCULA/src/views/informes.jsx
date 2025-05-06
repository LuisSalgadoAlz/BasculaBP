import { useEffect, useState } from "react";
import { NoData, Spinner } from "../components/alerts";
import TableHistorial from "../components/historial/tables";
import { getHistorialBoletas, getDataForSelect } from "../hooks/formDataInformes";
import { ButtonAdd } from "../components/buttons";
import { Card } from "../components/graficos/informes";

const Informes = () => {
  const [data, setData] = useState()
  const [isLoad, setIsload] = useState(false)
  const [dataSelect, setDataSelect] = useState({})
  const [formFiltros, setFormFiltros] = useState({movimiento:'', producto:''})
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (e)=>{
    const { name, value} = e.target
    setFormFiltros((prev)=>({
      ...prev, [name] : value
    }))
  }
  useEffect(() => {
    getDataForSelect(setDataSelect)
  }, [])
  
  const handlePrint = (boleta) => {
    console.log(boleta)
  } 

  const handlePushFilter = () => {
    getHistorialBoletas(setData, formFiltros,setIsload)
  }

  const handleExportToExcel = () => {
    console.log(formFiltros)
  }


  return (
    <>
      <div className="flex justify-between w-full gap-5">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Reportes de boletas</h1>
          <h1 className="text-gray-600">
            {" "}
            Gestiona los informes generados en el sistema.
          </h1>
        </div>
      </div>
      <div  className={`mt-6 bg-white shadow rounded-lg px-6 py-7 border border-gray-300` }>
        <div className="filtros grid grid-rows-1 grid-cols-5 grid-flow-col gap-2 max-md:grid-rows-2 max-md:grid-cols-2 max-sm:grid-rows-2 max-sm:grid-cols-1 mb-4">
            <input className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 col-span-full" type="text" placeholder="Buscar boletas por ID, placas o motorista..." />
            <ButtonAdd name="Exportar PDF"/>
            <ButtonAdd name="Exportar EXCEL"/>
        </div>
        <div className="p-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Filtros de Reporte</h3>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            </button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicial</label>
                <input name="dateIn" onChange={handleChange} className="w-full px-3 py-2 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 max-sm:hidden" type="date"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Final</label>
                <input name="dateOut" onChange={handleChange} className="w-full px-3 py-2 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 max-sm:hidden" type="date"/>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Movimiento</label>
                <select name="movimiento" onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option disabled selected={true}>Ingrese un movimiento</option>
                  {dataSelect !={} && dataSelect && dataSelect?.movimiento.map(({id, nombre})=>(<option key={id} value={nombre}>{nombre}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Productos</label>
                <select name="producto" onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option disabled selected={true}>Ingrese un producto</option>
                  {dataSelect !={} && dataSelect && dataSelect?.producto.map(({id, nombre})=>(<option key={id} value={nombre}>{nombre}</option>))}
                </select>
              </div>
            </div>
          )}
          {showFilters && (
            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 mr-2 text-sm font-medium">
                Limpiar Filtros
              </button>
              <button onClick={handlePushFilter} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                Aplicar Filtros
              </button>
            </div>
          )}
        </div>
        {showFilters && <hr className="mt-10 mb-4 text-gray-400" />}
        <div className="mt-4">
            {isLoad && !data ? <Spinner /> : (!data || data.length == 0 ? <NoData /> : <TableHistorial datos={data} imprimirCopia={handlePrint} />)}
        </div>
      </div>
    </>
  );
};

export default Informes;
