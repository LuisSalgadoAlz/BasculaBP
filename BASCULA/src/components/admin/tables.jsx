const ALERTS_COLORS = {
  COMPLETO : 'bg-white', 
  ADVERTENCIA: 'bg-yellow-200', 
  ERROR: 'bg-red-200'
}
export const TablesBD = ({ datos = [{}], fun }) => {
  const handleGetInfo = (data) => {
    navigate(`./${data.id}`);
  };

  return (
    <>
      <div className="relative overflow-x-auto min-h-[400px]">
        <table className="w-full text-sm text-left rtl:text-right text-gray-700 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-[#FFFDF5]">
            <tr>
              {Object.keys(datos[0]).map((el, keys) => (
                <th key={keys} scope="col" className={`px-6 py-3 text-gray-700 ${keys === 0 ? 'text-left' : 'text-center'}`}>
                  {el}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.map((fila, index) => (
              <tr key={index} className={`${fila.categoria && ALERTS_COLORS[fila?.categoria]} border-b border-gray-200 hover:bg-[#FDF5D4] rounded-2xl`}>
                {Object.values(fila).map((el, key) => (
                  <td
                    key={key}
                    className={`px-6 py-3 text-gray-700 ${key === 0 ? 'text-left' : 'text-center'}`}
                  >
                    {el}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export const TableUsers = ({ datos = [{}], fun }) => {
  return (
    <>
      <div className="relative overflow-x-auto min-h-[400px]">
        <table className="w-full text-sm text-left rtl:text-right text-gray-700 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-[#FFFDF5]">
            <tr>
              {Object.keys(datos[0]).map((el, keys) => (
                <th key={keys} scope="col" className={`px-6 py-3 text-gray-700`}>
                  {el}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.map((fila, index) => (
              <tr key={index} className={`border-b border-gray-200 hover:bg-[#FDF5D4] rounded-2xl`}>
                {Object.values(fila).map((el, key) => (
                  <td
                    key={key}
                    className={`px-6 py-3 text-gray-700`}
                  >
                    {el}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};