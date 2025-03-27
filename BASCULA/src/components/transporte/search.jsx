import { useState, useEffect, useCallback } from "react";
import { ButtonAdd } from "../buttons";
import TableComponent from "../table";
import { getEmpresas, postEmpresas, getStatsEmpresas } from "../../hooks/formDataEmpresas";
import ModalEmpresas from "./modal";

const Search = ({ sts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState();
  const [datos, setDatos] = useState();
  const [pagination, setPagination] = useState(1)
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState();

  const toggleModal = () => setIsOpen(!isOpen);

  const handleData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const cleanData = {
      ...formData, 
      idSocios : formData['Asignar a socio']
    }
    await postEmpresas(cleanData);
    setIsOpen(false);
    fetchData(); 
  };

  const hanldeSearch = (e) => {
    const {value} = e.target
    setSearch(value)
  }

  const handleFilterState = (e) => {
    const { value } = e.target
    setPagination(1)
    if (value==-1) {
      setEstado('')
      return
    } 
    setEstado(value)
  }

  const handlePagination = (item) => {
    if (pagination>0) {
      const newRender = pagination+item
      if(newRender==0) return
      if(newRender>datos.pagination.totalPages) return
      setPagination(newRender) 
    }
  } 

  const handleResetPagination = () => {
    setPagination(1)
  }

  const fetchData = useCallback(() => {
    getEmpresas(setDatos, pagination, search, estado);
    getStatsEmpresas(sts)
  }, [search, estado, pagination]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="filtros grid grid-rows-1 grid-cols-12 grid-flow-col gap-1.5">
        <input
          className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 col-span-full"
          type="text"
          placeholder="Buscar empresa por nombre..."
          onChange={hanldeSearch}
          onKeyDown={handleResetPagination}
        />
        <select className="py-2.5 px-4 text-sm font-medium text-gray-600  rounded-lg border border-gray-200" onKeyDown={handleResetPagination} onChange={handleFilterState}>
          <option value={-1}>Seleccione un estado</option>
          <option value='inactiva'>Inactiva</option>
          <option value='activa'>Activa</option>
        </select>
        <ButtonAdd name="Agregar" fun={toggleModal} />
      </div>
      <div className="mt-7">
        {(!datos || datos.data.length ==0) ? <h1 className="ml-2">No hay datos</h1> : <TableComponent datos={datos.data} />}
        <button className="mt-5 text-gray-600" onClick={()=>handlePagination(-1)}>Anterior</button>
        <span className="px-4 text-gray-600">{pagination} {' / '} {datos && datos.pagination.totalPages}</span>
        <button className="mt-5 text-gray-600" onClick={()=>handlePagination(1)}>Siguiente</button>
      </div>

      {isOpen && <ModalEmpresas hdlData={handleData} hdlSubmit={handleSubmit} tglModal={toggleModal} frDta={formData}/>}
    </>
  );
};

export default Search;
