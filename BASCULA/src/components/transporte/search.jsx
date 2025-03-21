import { useState, useEffect, useCallback } from "react";
import { ButtonAdd } from "../buttons";
import TableComponent from "../table";
import FormEmpresa from "./formEmpresa";
import { getEmpresas, postEmpresas } from "../../hooks/formDataEmpresas";

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

  const handleSubmit = () => {
    postEmpresas(formData)
    setIsOpen(false);
    fetchData()
  };

  const fetchData = useCallback(() => {
    getEmpresas(setDatos)
  }, []);

  useEffect(() => {
    fetchData()
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
      <div className="mt-7">{datos && <TableComponent datos={datos} />}</div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opa-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm border border-gray-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Añadir nueva empresa
            </h2>
            <div>
              <FormEmpresa fun={handleData} />
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={toggleModal}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg transition duration-300 ease-in-out transform hover:bg-gray-300 hover:scale-105"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Search;
