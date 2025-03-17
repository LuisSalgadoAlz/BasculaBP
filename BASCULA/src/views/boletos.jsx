import ButtonAdd from "../components/buttons";

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
          <h1 className="text-gray-600"><span>Entradas (2000)</span> |  <span>Salidas (2000) |</span></h1>
          <ButtonAdd name="Nueva Boleta" fun={handleClik} />
        </div>
      </div>
      <div className="mt-6 bg-white px-6 py-7 shadow rounded-xl h-[700px]">
        <div className="filtros grid grid-rows-1 grid-flow-col">
          <input className="p-2.5 ms-2 text-sm font-medium text-gray-600  rounded-lg border-2 border-gray-400" type="text" placeholder="Buscar boletas por ID, placas o motorista..." />
          <div className="flex">
            <input className="p-2.5 ms-2 text-sm font-medium text-gray-600  rounded-lg border-2 border-gray-400" type="date" />
            <select className="p-2.5 ms-2 text-sm font-medium text-gray-600  rounded-lg border-2 border-gray-400">
              <option value="0">Estado</option>
            </select>
            <ButtonAdd name="Resetear" fun={handleClik} />
            <ButtonAdd name="Exportar" fun={handleClik} />
          </div>
        </div>
      </div>
    </>
  );
};
   
export default Boletas;
