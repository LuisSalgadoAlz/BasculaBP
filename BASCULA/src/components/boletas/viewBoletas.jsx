import ButtonAdd from "../buttons";
import TableComponent from "../table";

const ViewBoletas = () => {
  return (
    <>
      <div className="filtros grid grid-rows-1 grid-cols-12 grid-flow-col gap-1.5">
        <input
          className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 col-span-full"
          type="text"
          placeholder="Buscar boletas por ID, placas o motorista..."
        />
        <input
          className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200"
          type="date"
        />
        <select className="py-2.5 px-4 text-sm font-medium text-gray-600  rounded-lg border border-gray-200">
          <option value="0">Tipo</option>
        </select>
        <ButtonAdd name="Resetear" />
        <ButtonAdd name="Exportar" />
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
        <TableComponent />
      </div>
    </>
  );
};

export default ViewBoletas;
