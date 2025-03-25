import { CiEdit } from "react-icons/ci";
import { useNavigate } from "react-router";

export const TableComponent = ({ datos = [{}], fun }) => {
  const navigate = useNavigate();

  const handleGetInfo = (data) => {
    navigate(`./${data.id}`);
  };

  return (
    <>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-700 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-[#FFFDF5]">
            <tr>
              {Object.keys(datos[0]).map((el, keys) =>
                keys === 0 ? null : (
                  <th key={keys} scope="col" className="px-6 py-3">
                    {el}
                  </th>
                )
              )}
              <th scope="col" className="px-6 py-3 text-center">
                Editar
              </th>
            </tr>
          </thead>
          <tbody>
            {datos.map((fila, index) => (
              <tr
                key={index}
                className="bg-white border-b  border-gray-200 hover:bg-[#FDF5D4]"
              >
                {Object.values(fila).map(
                  (el, key) =>
                    key != 0 && (
                      <td key={key} className="px-6 py-3 text-gray-700">
                        {key == 0 ? (
                          ""
                        ) : typeof el === "boolean" ? (
                          el == 1 ? (
                            <h1 className="text-green-600 border rounded-2xl text-center ">
                              Activos
                            </h1>
                          ) : (
                            <h1 className="text-red-600 border rounded-2xl text-center">
                              Inactivo
                            </h1>
                          )
                        ) : (
                          el
                        )}
                      </td>
                    )
                )}
                <td className="py-3 text-center">
                  <button
                    className="font-medium text-gray-800 hover:underline text-center"
                    onClick={() => handleGetInfo(fila)}
                  >
                    <span className="text-center">
                      <CiEdit className="text-xl" />
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export const TableDirecciones = ({ datos = [{}], fun }) => {
  return (
    <>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-700 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-[#FFFDF5]">
            <tr>
              {Object.keys(datos[0]).map((el, keys) =>
                keys === 0 ? null : (
                  <th key={keys} scope="col" className="px-6 py-3">
                    {el}
                  </th>
                )
              )}
              <th scope="col" className="px-6 py-3 text-center">
                Editar
              </th>
            </tr>
          </thead>
          <tbody>
            {datos.map((fila, index) => (
              <tr
                key={index}
                className="bg-white border-b  border-gray-200 hover:bg-[#FDF5D4]"
              >
                {Object.values(fila).map(
                  (el, key) =>
                    key != 0 && (
                      <td key={key} className="px-6 py-3 text-gray-700">
                        {key == 0
                          ? ""
                          : key != 2
                          ? el
                          : el == 0
                          ? "Origen"
                          : "Destino"}
                      </td>
                    )
                )}
                <td className="py-3 text-center">
                  <button
                    className="font-medium text-gray-800 hover:underline text-center"
                    onClick={() => fun(fila)}
                  >
                    <span className="text-center">
                      <CiEdit className="text-xl" />
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
