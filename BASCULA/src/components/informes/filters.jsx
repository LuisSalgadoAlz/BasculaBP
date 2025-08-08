export const FiltrosReporteria = ({
  handleChange,
  dataSelect,
  handlePushFilter,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha inicial
          </label>
          <input
            name="dateIn"
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 max-sm:hidden"
            type="date"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Final
          </label>
          <input
            name="dateOut"
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 max-sm:hidden"
            type="date"
          />
        </div>

        {/* Nuevo para socio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Socio
          </label>
          <select name="socio" onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" defaultValue={0}>
            <option disabled value={0}> Ingrese un socio </option>
            {dataSelect &&
              Object.keys(dataSelect).length > 0 &&
              dataSelect.socios?.map(({ socio }) => (
                <option key={socio} value={socio}>
                  {socio}
                </option>
              ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Productos
          </label>
          <select
            name="producto"
            onChange={handleChange}
            defaultValue={0}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option disabled value={0}>
              Ingrese un producto
            </option>
            {dataSelect && Object.keys(dataSelect).length > 0 &&
              dataSelect.producto?.map(({ id, nombre})=>(
                <option key={id} value={nombre}>
                  {nombre}
                </option>
              ))
            }
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Movimiento
          </label>
          <select
            name="movimiento"
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            defaultValue={0}
          >
            <option disabled value={0}>
              Ingrese un movimiento
            </option>

            {dataSelect && Object.keys(dataSelect).length > 0 &&
              dataSelect.movimiento?.map(({ id, nombre})=>(
                <option key={id} value={nombre}>
                  {nombre}
                </option>
              ))
            }
          </select>
        </div>
        
        <div className="flex items-center justify-end col-span-5">
          {/* Area de los botones de filtros que sirve tanto para la exportacion comoo a la tabla */}
          <div className="flex justify-end mt-4">
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 mr-2 text-sm font-medium">
              Limpiar Filtros
            </button>
            <button
              onClick={handlePushFilter}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
      <hr className="mt-10 mb-4 text-gray-200" />
    </>
  );
};
