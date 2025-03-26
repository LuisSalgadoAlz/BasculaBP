import { useState, useEffect, useCallback, use } from "react";
import { ButtonAdd } from "../buttons";
import {TableComponent} from "./tableClientes";
import { getClientes, postEmpresas, getStatsSocios, verificarData} from "../../hooks/formClientes";
import { ModalClientes } from "./modal";
import {ModalSuccess, ModalErr} from '../alerts'

const Search = ({ sts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({nombre:'', tipo: -1, correo: '', telefono: '', estado: 1});
  const [datos, setDatos] = useState();
  const [success, setSuccess] = useState()
  const [msg, setMsg] = useState()
  const [err, setErr] = useState()

  const toggleModal = () => setIsOpen(!isOpen);

  const handleData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit =  async() => {
    /* Probandooo */
    const isValid = verificarData(setSuccess, setErr, formData, setMsg, '')
    if (isValid) {
      await postEmpresas(formData)
      setIsOpen(false)
      fetchData()
      getStatsSocios(sts);
      setSuccess(true)
    }
  };
  const handleClose = () => { 
    setSuccess(false);
    setErr(false);
  };

  const fetchData = useCallback(() => {
    getClientes(setDatos);
    getStatsSocios(sts);
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

      {isOpen && <ModalClientes hdlData={handleData} hdlSubmit={handleSubmit} tglModal={toggleModal} />}
      {success && (
        <ModalSuccess name={"agregar el socio"} hdClose={handleClose} />
      )}
      {err && (
        <ModalErr name={msg} hdClose={handleClose} />
      )}
    </>
  );
};

export default Search;