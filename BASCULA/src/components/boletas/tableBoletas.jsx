import { IoExitOutline } from "react-icons/io5";
import { IoEyeSharp } from "react-icons/io5";
import { FaArrowUp } from "react-icons/fa6";
import { FaArrowDown } from "react-icons/fa6";
import { IoWarningOutline } from "react-icons/io5";
import { GoIssueClosed } from "react-icons/go";
import { MdOutlineCancel } from "react-icons/md";

export const TableBoletas = ({ datos = [{}], fun, tipo = 0, funCancel }) => {
  return (
    <>
      <div className="relative overflow-x-auto min-h-[400px]">
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
              {tipo == 0 && (
                <th scope="col" className="px-6 py-3 text-center">
                  Cancelar
                </th>
              )}
              <th scope="col" className="px-6 py-3 text-center">
                {tipo == 0 ? "Salida" : "Detalles"}
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
                        ) : tipo == 1 ? (
                          key == 2 ? (
                            el == "Entrada" ? (
                              <span className="flex items-center gap-1 font-bold">
                                <FaArrowDown />
                                {el}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 font-bold">
                                <FaArrowUp />
                                {el}
                              </span>
                            )
                          ) : key == 8 ? (
                            el == "Completo(Fuera de tolerancia)" ? (
                              <span className="text-red-700 font-black flex items-center gap-1">
                                <IoWarningOutline className="text-lg font-black"/>
                                {"Desviada"}
                              </span>
                            ) : (
                              el=="Cancelada" ? (
                                <span className="text-yellow-800 font-black flex items-center gap-1">
                                  <MdOutlineCancel className="text-lg font-black" />
                                  {el}
                                </span>
                              ): (
                                <span className="text-green-700 font-black flex items-center gap-1">
                                  <GoIssueClosed className="text-lg font-black"/>
                                  {el}
                                </span>
                              )
                            )
                          ) : (
                            el
                          )
                        ) : (
                          el
                        )}
                      </td>
                    )
                )}
                {tipo == 0 && (
                  <td className="py-3 text-center">
                    <button
                      className="font-medium text-gray-800 hover:underline text-center"
                      onClick={() => funCancel(fila)}
                    >
                      <span className="text-center">
                        <MdOutlineCancel className="text-2xl" />
                      </span>
                    </button>
                  </td>
                )}
                <td className="py-3 text-center">
                  <button
                    className="font-medium text-gray-800 hover:underline text-center"
                    onClick={() => fun(fila)}
                  >
                    <span className="text-center">
                      {tipo == 0 ? (
                        <IoExitOutline className="text-2xl" />
                      ) : (
                        <IoEyeSharp className="text-2xl" />
                      )}
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
