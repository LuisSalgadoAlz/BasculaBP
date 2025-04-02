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
  const [tipo, setTipo] = useState()
  const [estado, setEstado] = useState()
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

  const toggleOpen = () => {
    setIsOpen(true);
    handleCleanState();
  }
  const toggleClose = () => {
    setIsOpen(false);
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
    const isValid = verificarData(setSuccess, setErr, formData, setMsg, "");
    if (isValid) {
      const response = await postEmpresas(formData);
      if(!response.msgErr) {
        setIsOpen(false);
        fetchData();
        getStatsSocios(sts);
        setSuccess(true);
        return
      }
      setMsg(response.msgErr)
      setErr(true)
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

  const handleFilterType = (e) => {
    const { value } = e.target
    setPagination(1)
    if (value==-1) {
      setTipo('')
      return
    } 
    setTipo(value)
  }

  const handleFilterState = (e) => {
    const {value} = e.target
    setPagination(1)
    if (value==-1) {
      setEstado('')
      return
    } 
    setEstado(value)
  }

  const fetchData = useCallback(() => {
    getClientes(setDatos, pagination, search, tipo, estado);
    getStatsSocios(sts);
  }, [pagination, search, tipo, estado]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="filtros grid grid-rows-1 grid-cols-12 grid-flow-col gap-1.5 max-sm:grid-rows-2 max-sm:grid-cols-2">
        <input
          className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 col-span-full"
          type="text"
          placeholder="Buscar socios por nombre...."
          onChange={handleSearch}
          onKeyDown={handleResetPagination}
        />
        <select className="py-2.5 px-4 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 max-sm:hidden max-md:hidden max-lg:hidden" onKeyDown={handleResetPagination} onChange={handleFilterState}>
          <option value={-1}>Estado de socio (todos)</option>
          <option value={'inactiva'}>Inactivo</option>
          <option value={'activa'}>Activo</option>
        </select>
        <select className="py-2.5 px-4 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 max-sm:hidden max-md:hidden " onKeyDown={handleResetPagination} onChange={handleFilterType}>
          <option value={-1}>Tipos de socio (todos)</option>
          <option value={0}>Proveedor</option>
          <option value={1}>Cliente</option>
        </select>
        {/* Proximamente */}
        <ButtonAdd name="Exportar"/>
        <ButtonAdd name="Agregar" fun={toggleOpen} />
      </div>
      <div className="mt-7 text-center">
        {!datos || datos.data.length == 0 ? (
          <h1 className="ml-2">No hay datos</h1>
        ) : (
          <TableComponent datos={datos.data} />
        )}
        <hr className="text-gray-200 mt-7" />
        <button className="px-2 mt-5 text-gray-600  border py-1 rounded border-gray-400" onClick={()=>setPagination(1)}>{'<<'}</button>
        <button className="px-2 mt-5 text-gray-600 border py-1 ml-1 rounded border-gray-400" onClick={()=>handlePagination(-1)}>{'<'}</button>
        <span className="px-2 text-gray-600 ml-1">{pagination} {' / '} {datos && datos.pagination.totalPages}</span>
        <button className="px-2 mt-5 text-gray-600 border py-1 ml-1 rounded border-gray-400" onClick={()=>handlePagination(1)}>{'>'}</button>
        <button className="px-2 mt-5 text-gray-600 border py-1 ml-1 rounded border-gray-400" onClick={()=>setPagination(datos && datos.pagination.totalPages)}>{'>>'}</button>
      </div>

      {isOpen && (
        <ModalClientes
          hdlData={handleData}
          hdlSubmit={handleSubmit}
          tglModal={toggleClose}
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
