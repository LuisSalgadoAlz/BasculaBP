import ButtonAdd from "../components/buttons";
import TableComponent from "../components/table";

const Boletas = () => {
  const handleClik = () => {

  }
  return (
    <>
      <div className="flex justify-between w-full gap-5">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Boletas</h1>
          <h1 className="text-gray-600"> Generación y visualización de las boletas de Bascula</h1>
        </div>
        <div className="parte-der flex items-center justify-center gap-3">
          <h1 className="text-gray-600"><span>Entradas (2000)</span> |  <span>Salidas (2000)</span></h1>
          <ButtonAdd name="Nueva Boleta" fun={handleClik} />
        </div>
      </div>
      <div className="mt-6 bg-white px-6 py-7 shadow rounded-xl h-[700px]">
        <div className="filtros grid grid-rows-1 grid-cols-12 grid-flow-col gap-1.5">
          <input className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 col-span-full" type="text" placeholder="Buscar boletas por ID, placas o motorista..." />
          <input className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200" type="date" />
          <select className="py-2.5 px-4 text-sm font-medium text-gray-600  rounded-lg border border-gray-200">
            <option value="0">Tipo</option>
          </select>
          <ButtonAdd name="Resetear" fun={handleClik} />
          <ButtonAdd name="Exportar" fun={handleClik} />
        </div>
        <div className="filtros grid grid-rows-1 grid-flow-col">
          <button className="p-2.5 text-sm font-medium text-gray-400 rounded-s-lg border border-gray-200 mt-2 bg-[#FDF5D4]">Entradas <span>5</span></button>
          <button className="p-2.5 text-sm font-medium text-gray-400 rounded-e-lg border border-gray-200 mt-2 bg-[#FDF5D4]">Salidas</button>
        </div>
        <div className="mt-4">
          <TableComponent />
        </div>
      </div>
    </>
  );
};
   
export default Boletas;
