import { useState } from "react";
import { IoIosSend } from "react-icons/io";

const TableComponent = () => {
  const [datos, setDatos] = useState([
    {
      boleta: "#058289",
      tipo: "Entrada",
      fechaHora: "06/03/2025 07:17",
      transporte: "TRANSP. INTERIANO",
      placas: "TCI0173",
      origen: "BAPROSA IMSA",
      motorista: "ORLANDO LOPEZ",
      pesoNeto: 15620.0,
    },
  ]);

  return (
    <>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-700 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-[#FFFDF5]">
            <tr>
              {Object.keys(datos[0]).map((el, keys) => (
                <th key={keys} scope="col" className="px-6 py-3">
                  {el}
                </th>
              ))}
              <th scope="col" className="px-6 py-3">
                Salida
              </th>
            </tr>
          </thead>
          <tbody>
            {datos.map((fila, index) => (
              <tr key={index} className="bg-white border-b  border-gray-200 hover:bg-[#FDF5D4]">
                {Object.values(fila).map((el, key) => (
                  <td key={key} className="px-6 py-3 text-gray-700">
                    {el}
                  </td>
                ))}
                <td className="py-3 text-center">
                  <button className="font-medium text-gray-800 hover:underline text-center">
                    <span>
                      <IoIosSend className="text-xl" />
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

export default TableComponent;
