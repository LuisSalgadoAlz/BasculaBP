import { useState, useEffect, useCallback } from "react";
import { ButtonAdd } from "../buttons";
import { TableEmpresas } from "./tables";
import { getEmpresas, postEmpresas, getStatsEmpresas, verificarData } from "../../hooks/formDataEmpresas";
import {ModalEmpresas} from "./modal";
import { ModalErr, ModalSuccess } from '../alerts'

const Search = ({ sts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '', email: '', telefono: '', descripcion : '', idSocios: '', 
  });
  const [datos, setDatos] = useState();
  const [pagination, setPagination] = useState(1)
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState();

  /**
   * Se limpia el formdata cuando le de cancelar
   */
  const toggleModal = () => {
    handleClean()
    setIsOpen(!isOpen)
  };

  /**
   * 
   * @param {*} e obtiene el valor del elemento de los forms de forma dinamica
   * 
   */
  const handleData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Limpiar estaodos para no usar despues
   */

  const handleClean = () => {
    setFormData({nombre: '', email: '', telefono: '', descripcion : '', idSocios: '',})
  }

  /**
   * Funcion para agregar a una nueva empresa 
   * Falta validaciones
   */

  const handleSubmit = async () => {
    const isValid = verificarData(setErr, formData, setMsg)
    if(isValid){
      await postEmpresas(formData);
      setIsOpen(false);
      setMsg('agregar nueva empresa')
      setSuccess(true)
      fetchData(); 
      handleClean()
    }
  };

  /**
   * 
   * @param {*} e 
   * guarda el valor actual del textbox de busqueda para que en cuanto se actualice el GET con los 
   * parametros busque
   */
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

  const handleClose = () => {
    setErr(false)
    setSuccess(false)
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
      <div className="filtros grid grid-rows-1 grid-cols-12 grid-flow-col gap-1.5 max-sm:grid-rows-2 max-sm:grid-cols-2">
        <input className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 col-span-full" type="text"placeholder="Buscar empresa por nombre..." onChange={hanldeSearch} onKeyDown={handleResetPagination} />
        <select className="py-2.5 px-4 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 max-sm:hidden max-md:hidden max-lg:hidden" onKeyDown={handleResetPagination} onChange={handleFilterState}>
          <option value={-1}>Todos los socios</option>
          <option value='inactiva'>Inactivos</option>
          <option value='activa'>Activos</option>
        </select>
        <select className="py-2.5 px-4 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 max-sm:hidden max-md:hidden" onKeyDown={handleResetPagination} onChange={handleFilterState}>
          <option value={-1}>Seleccione un estado</option>
          <option value='inactiva'>Inactiva</option>
          <option value='activa'>Activa</option>
        </select>
        {/* Proximamente */}
        <ButtonAdd name="Exportar" />
        <ButtonAdd name="Agregar" fun={toggleModal} />
      </div>
      <div className="mt-7 text-center">
        {(!datos || datos.data.length ==0) ? <h1 className="ml-2">No hay datos</h1> : <TableEmpresas datos={datos.data} />}
        <hr className="text-gray-200 mt-7" />
        <button className="px-2 mt-5 text-gray-600  border py-1 rounded border-gray-400" onClick={()=>setPagination(1)}>{'<<'}</button>
        <button className="px-2 mt-5 text-gray-600 border py-1 ml-1 rounded border-gray-400" onClick={()=>handlePagination(-1)}>{'<'}</button>
        <span className="px-4 text-gray-600">{pagination} {' / '} {datos && datos.pagination.totalPages}</span>
        <button className="px-2 mt-5 text-gray-600 border py-1 ml-1 rounded border-gray-400" onClick={()=>handlePagination(1)}>{'>'}</button>
        <button className="px-2 mt-5 text-gray-600 border py-1 ml-1 rounded border-gray-400" onClick={()=>setPagination(datos && datos.pagination.totalPages)}>{'>>'}</button>
      </div>

      {isOpen && <ModalEmpresas hdlData={handleData} hdlSubmit={handleSubmit} tglModal={toggleModal} frDta={formData}/>}
      {err && <ModalErr name={msg} hdClose={handleClose} />}
      {success && <ModalSuccess name={msg} hdClose={handleClose} />}
    </>
  );
};

export default Search;
