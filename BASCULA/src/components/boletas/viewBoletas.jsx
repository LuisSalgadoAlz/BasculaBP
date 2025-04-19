import {ButtonAdd} from "../buttons";
import { NoData, Spinner } from "../alerts";
import { TableBoletas } from "./tableBoletas";

const ViewBoletas = ({ boletas, hdlOut, isLoad }) => {
  return (
    <>
      <div className="filtros grid grid-rows-1 grid-cols-5 grid-flow-col gap-2 max-md:grid-rows-2 max-md:grid-cols-2 max-sm:grid-rows-2 max-sm:grid-cols-1">
        <input
          className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 col-span-full"
          type="text"
          placeholder="Buscar boletas por ID, placas o motorista..."
        />
        <input
          className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 max-sm:hidden"
          type="date"
        />
        <ButtonAdd name="Exportar"/>
      </div>
      <div className="filtros grid grid-rows-1 grid-flow-col">
        <button className="p-2.5 text-sm font-medium text-gray-400 rounded-s-lg border border-gray-200 mt-2 bg-[#FDF5D4]">
          Entradas <span>5</span>
        </button>
        <button className="p-2.5 text-sm font-medium text-gray-400 rounded-e-lg border border-gray-200 mt-2 bg-[#FDF5D4]">
          Salidas
        </button>
      </div>
      <div className="mt-4">
        {isLoad && !boletas ? <Spinner /> : (!boletas || boletas.length == 0 ? <NoData /> : <TableBoletas datos={boletas} fun={hdlOut} />)}
      </div>
    </>
  );
};

export default ViewBoletas;
