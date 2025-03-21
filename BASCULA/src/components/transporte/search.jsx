import { useState } from "react";
import {ButtonAdd} from "../buttons";
import TableComponent from "../table";

const Search = () => {
    const [isOpen, setIsOpen] = useState()

    const handleClick = () => {
        setIsOpen(!isOpen)
    }

    return (
    <>
      <div className="filtros grid grid-rows-1 grid-cols-12 grid-flow-col gap-1.5">
        <input
          className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 col-span-full"
          type="text"
          placeholder="Buscar boletas por ID, placas o motorista..."
        />
        <select className="py-2.5 px-4 text-sm font-medium text-gray-600  rounded-lg border border-gray-200">
          <option value="0">Tipo</option>
        </select>
        <ButtonAdd name="Agregar" />
      </div>
      <div className="mt-7">
        <TableComponent />
      </div>

    </>
  );
};

export default Search;
