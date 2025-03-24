import { useState, useEffect, useCallback } from "react";
import { ButtonAdd } from "../buttons";
import TableComponent from "../table";
import { getEmpresas, postEmpresas } from "../../hooks/formDataEmpresas";
import ModalEmpresas from "./modal";

const Search = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState();
  const [datos, setDatos] = useState();

  const toggleModal = () => setIsOpen(!isOpen);

  const handleData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    await postEmpresas(formData);
    setIsOpen(false);
    fetchData();
  };

  const fetchData = useCallback(() => {
    getEmpresas(setDatos);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        <ButtonAdd name="Agregar" fun={toggleModal} />
      </div>
      <div className="mt-7">
        {(!datos || datos.length ==0) ? <h1 className="ml-2">No hay datos</h1> : <TableComponent datos={datos} />}
      </div>

      {isOpen && <ModalEmpresas hdlData={handleData} hdlSubmit={handleSubmit} tglModal={toggleModal} frDta={formData}/>}
    </>
  );
};

export default Search;
