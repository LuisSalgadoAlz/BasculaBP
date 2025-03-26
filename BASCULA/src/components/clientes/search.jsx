import { useState, useEffect, useCallback, use } from "react";
import { ButtonAdd } from "../buttons";
import { TableComponent } from "./tableClientes";
import {
  getClientes,
  postEmpresas,
  getStatsSocios,
  verificarData,
} from "../../hooks/formClientes";
import { ModalClientes } from "./modal";
import { ModalSuccess, ModalErr } from "../alerts";

const Search = ({ sts }) => {
  const [pagination, setPagination] = useState(1)
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: -1,
    correo: "",
    telefono: "",
    estado: 1,
  });

  const [datos, setDatos] = useState();
  const [success, setSuccess] = useState();
  const [msg, setMsg] = useState();
  const [err, setErr] = useState();

  /* limpieza de estados */
  const handleCleanState = () => {
    setFormData({ nombre: "", tipo: -1, correo: "", telefono: "", estado: 1 });
  };
  const toggleModal = () => {
    setIsOpen(!isOpen);
    handleCleanState();
  };

  const handleData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    /* Probandooo */
    const isValid = verificarData(setSuccess, setErr, formData, setMsg, "");
    if (isValid) {
      await postEmpresas(formData);
      setIsOpen(false);
      fetchData();
      getStatsSocios(sts);
      setSuccess(true);
    }
  };

  const handleClose = () => {
    setErr(false);
  };

  const handleCloseSuccess = () => {
    handleCleanState();
    setSuccess(false);
  };

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

  const handleSearch = (e) => {
    const {value} = e.target
    setSearch(value)
  }

  const fetchData = useCallback(() => {
    getClientes(setDatos, pagination, search);
    getStatsSocios(sts);
  }, [pagination, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="filtros grid grid-rows-1 grid-cols-12 grid-flow-col gap-1.5">
        <input
          className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 col-span-full"
          type="text"
          placeholder="Buscar boletas nombre de socios"
          onChange={handleSearch}
          onKeyDown={handleResetPagination}
        />
        <select className="py-2.5 px-4 text-sm font-medium text-gray-600  rounded-lg border border-gray-200">
          <option value="">Tipo de socio</option>
          <option value="0">Proveedor</option>
          <option value="1">Cliente</option>
        </select>
        <ButtonAdd name="Agregar" fun={toggleModal} />
      </div>
      <div className="mt-7">
        {!datos || datos.data.length == 0 ? (
          <h1 className="ml-2">No hay datos</h1>
        ) : (
          <TableComponent datos={datos.data} />
        )}
        <button className="mt-5 text-gray-600" onClick={()=>handlePagination(-1)}>Anterior</button>
        <span className="px-4 text-gray-600">{pagination} {' / '} {datos && datos.pagination.totalPages}</span>
        <button className="mt-5 text-gray-600" onClick={()=>handlePagination(1)}>Siguiente</button>
      </div>

      {isOpen && (
        <ModalClientes
          hdlData={handleData}
          hdlSubmit={handleSubmit}
          tglModal={toggleModal}
        />
      )}
      {success && (
        <ModalSuccess name={"agregar el socio"} hdClose={handleCloseSuccess} />
      )}
      {err && <ModalErr name={msg} hdClose={handleClose} />}
    </>
  );
};

export default Search;
