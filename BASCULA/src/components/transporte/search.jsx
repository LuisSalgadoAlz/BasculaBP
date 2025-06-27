import { useState, useEffect, useCallback, useMemo } from "react";
import { ButtonAdd, Pagination } from "../buttons";
import { TableEmpresas } from "./tables";
import { getEmpresas, postEmpresas, getStatsEmpresas, verificarData } from "../../hooks/formDataEmpresas";
import {ModalEmpresas} from "./modal";
import { ModalErr, ModalSuccess, NoData, Spinner } from '../alerts'
import debounce from 'lodash/debounce';

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
  const [isLoad, setIsload] = useState(false)
  /**
   * Se limpia el formdata cuando le de cancelar
   */
  const toggleModalClose = () => {
    handleClean()
    setIsOpen(false)
  };

  const toggleModalOpen = () => {
    handleClean()
    setIsOpen(true)
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
   */

  const handleSearchDebounced = useMemo(
    () =>
      debounce((value) => {
        setSearch(value)
      }, 350), // 300 ms de espera
    []
  );
  
  const hanldeSearch = (e) => {
    const {value} = e.target
    handleSearchDebounced(value)
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
    getEmpresas(setDatos, pagination, search, estado, setIsload);
    getStatsEmpresas(sts)
  }, [search, estado, pagination]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="filtros grid grid-rows-1 grid-cols-12 grid-flow-col gap-1.5 max-sm:grid-rows-2 max-sm:grid-cols-2">
        <input className="p-2.5 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 col-span-full" type="text"placeholder="Buscar empresa por nombre..." onChange={hanldeSearch} onKeyDown={handleResetPagination} />
        <select className="py-2.5 px-4 text-sm font-medium text-gray-600  rounded-lg border border-gray-200 max-sm:hidden max-md:hidden" onKeyDown={handleResetPagination} onChange={handleFilterState}>
          <option value={-1}>Estado empresa (todos)</option>
          <option value='inactiva'>Inactiva</option>
          <option value='activa'>Activa</option>
        </select>
        {/* Proximamente */}
        <ButtonAdd name="Exportar" />
        <ButtonAdd name="Agregar" fun={toggleModalOpen} />
      </div>
      <div className="mt-7 text-center">
        { isLoad && !datos ? <Spinner /> : (!datos || datos.data.length ==0) ? <NoData /> : <TableEmpresas datos={datos.data} />}
        <hr className="text-gray-200 mt-7 mb-4"/>
        {datos && datos.pagination.totalPages > 1 && <Pagination pg={pagination} sp={setPagination} hp={handlePagination} dt={datos}/>}
      </div>

      {isOpen && <ModalEmpresas hdlData={handleData} hdlSubmit={handleSubmit} tglModal={toggleModalClose} frDta={formData}/>}
      {err && <ModalErr name={msg} hdClose={handleClose} />}
      {success && <ModalSuccess name={msg} hdClose={handleClose} />}
    </>
  );
};

export default Search;
