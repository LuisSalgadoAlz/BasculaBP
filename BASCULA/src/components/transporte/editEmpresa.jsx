import { useParams } from "react-router";
import { ButtonAdd, ButtonSave, ButtonVolver } from "../buttons";
import {
  cargando,
  claseFormInputs,
  classFormSelct,
} from "../../constants/boletas";
import { useNavigate } from "react-router";
import { useCallback, useEffect, useState } from "react";
import {
  getEmpresasPorId,
  getSociosParaSelect,
  updateEmpresas,
  verificarData, 
  getVehiculosPorEmpresas
} from "../../hooks/formDataEmpresas";
import { SelectSociosEdit } from "../selects";
import { ModalErr, ModalSuccess } from "../alerts"
import { TableVehiculos } from './tables'
import { ModalVehiculos } from "./modal";
/* Comienzo de la funcion  */

const EditTransporte = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const handleClik = () => {
    navigate(-1);
  };
  const [socios, setSocios] = useState();
  const [err, setErr] = useState()
  const [success, setSuccess] = useState()
  const [msg, setMsg] = useState()
  const [vehiculos, setVehiculos] = useState()
  const [mdlVehiculos, setMdlVehiculos] = useState()
  const [formVehiculos, setFormVehiculos] = useState({
    placa: '', modelo: '', marca: '', tipo: '', pesoMaximo: '', estado: true, 
  })
  /**
   * Estado inicial del form de empresa
   */
  const [empresa, setEmpresa] = useState({
    nombre: "",
    email: "",
    telefono: "",
    descripcion: "",
    estado: "",
    idSocios: "",
  });

  /**
   * 
   * @param {*} e obtener valores del form de manera dinamica
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpresa((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Funcion para actualizar la empresa actual
   */

  const handleUpdate = () => {
    /**
     * Verifica la info valida
     */
    const isValid = verificarData(setErr, empresa, setMsg)
    if (isValid) {
      updateEmpresas(empresa, id)
      setSuccess(true)
      setMsg("modificar empresa.")
    }
  }

  /* Cierre de modals y limpieza de data */
  const handleCloseErr = () => {
    setErr(false)
  }

  const handleCloseSuccess = ()=> {
    setSuccess(false)
  }

  /**
   * Parte de vehiculos
   * -------------------------------
   */

  const handleShowModalVehiculos = () => {
    setMdlVehiculos(true)
  }

  const handleCancelModalVehiculos = () => {
    setFormVehiculos({placa: '', modelo: '', marca: '', tipo: '', pesoMaximo: '', estado: true, })
    setMdlVehiculos(false)
  }

  const handleChangeFormVehiculos = (e) => {
    const {name, value} = e.target
    setFormVehiculos((prev)=>({
      ...prev, 
      [name] : value
    }))
  }

  const handleSaveVehiculos = () => {
    console.log(formVehiculos)
  }

  /**
   * Calback que almacena los valores de las tablas para maximizar el rendimiento 
   */

  const fetchData = useCallback(() => {
    getVehiculosPorEmpresas(setVehiculos, id)
    getEmpresasPorId(setEmpresa, id);
    getSociosParaSelect(setSocios);
  },[])
  

  /**
   * Cargar valores del callback
   */

  useEffect(() => {
    fetchData()
  }, [fetchData]);

  /**
   * JSX inicial
   */

  return (
    <>
      <div className="mt-6 bg-white shadow rounded-xl px-6 py-7">
        <div className="flex justify-between w-full gap-5 max-sm:flex-col">
          <div className="parte-izq">
            <h1 className="text-3xl font-bold titulo">Editar Empresas</h1>
            <h1 className="text-gray-600">
              {" "}
              Edita información básica de la empresas.{" "}
            </h1>
          </div>
          <div className="parte-der flex items-center justify-center gap-3">
            <ButtonVolver name={"Volver"} fun={handleClik} />
          </div>
        </div>
        <div className="container grid grid-cols-2 gap-2 max-md:grid-cols-1">
          <div className="mt-5">
            <label className="block mb-2 text-sm font-medium text-gray-900 ">
              Nombre:
            </label>
            <input
              type="text"
              name={"nombre"}
              className={claseFormInputs}
              placeholder={`Ingrese Nombre`}
              onChange={handleChange}
              value={empresa.nombre}
              required
            />
          </div>
          <div className="mt-5">
            <label className="block mb-2 text-sm font-medium text-gray-900 ">
              Email:
            </label>
            <input
              type="text"
              name={"email"}
              className={claseFormInputs}
              placeholder={`Ingrese email`}
              onChange={handleChange}
              value={empresa.email}
              required
            />
          </div>
          <div className="mt-5">
            <label className="block mb-2 text-sm font-medium text-gray-900 ">
              Telefono:
            </label>
            <input
              type="text"
              name={"telefono"}
              className={claseFormInputs}
              placeholder={`Ingrese teelefono`}
              onChange={handleChange}
              value={empresa.telefono}
              required
            />
          </div>
          <div className="mt-5">
            <label className="block mb-2 text-sm font-medium text-gray-900 ">
              Descripcion:
            </label>
            <input
              type="text"
              name={"descripcion"}
              className={claseFormInputs}
              placeholder={`Ingrese descripcion`}
              onChange={handleChange}
              value={empresa.descripcion}
              required
            />
          </div>
          <div className="mt-5">
            <label className="block mb-2 text-sm font-medium text-gray-900 ">
              Estado:
            </label>
            <select
              name={"estado"}
              className={claseFormInputs}
              onChange={handleChange}
              value={empresa.estado}
            >
              <option value={-1} className="text-gray-400">
                Seleccione un estado
              </option>
              <option value={false}>Desactivado</option>
              <option value={true}>Activado</option>
            </select>
          </div>
          <div className="mt-5">
            <SelectSociosEdit
              classCss={classFormSelct}
              name="idSocios"
              data={socios ? socios : cargando}
              fun={handleChange}
              val={empresa.idSocios}
            />
          </div>
        </div>
        <div className="mt-7 place-self-end max-sm:place-self-center">
          <ButtonSave name={"Guardar Cambios"} fun={handleUpdate}/>
        </div>























        {/* Esta parte despues */}
        <hr className="text-gray-400 mt-7" />
        <div className="flex justify-between w-full gap-5 mt-7 max-sm:flex-col">
          <div className="parte-izq">
            <h1 className="text-3xl font-bold titulo">Agregar Vehiculos</h1>
            <h1 className="text-gray-600">
              {" "}
              Gestion de placas con las que cuenta la empresa.
            </h1>
          </div>
          <div className="parte-izq max-sm:place-self-center">
            <ButtonAdd name={"Agregar Vehiculos"} fun={handleShowModalVehiculos}/>
          </div>
        </div>
        <div className="gap-5 mt-7">
          {!vehiculos || vehiculos.length == [] ? 'No hay datos' : <TableVehiculos datos={vehiculos}/>}
        </div>









        {/* Parte de motoristas */}
        <hr className="text-gray-400 mt-7" />
        <div className="flex justify-between w-full gap-5 mt-7 max-sm:flex-col">
          <div className="parte-izq">
            <h1 className="text-3xl font-bold titulo">Agregar Motorista</h1>
            <h1 className="text-gray-600">
              {" "}
              Gestion de placas con las que cuenta la empresa.
            </h1>
          </div>
          <div className="parte-izq max-sm:place-self-center">
            <ButtonAdd name={"Agregar Dirección"} />
          </div>
        </div>
        <div className="gap-5 mt-7">{/* Aqui van las tablas */}</div>
      </div>

      {/* Modals del alertas */}
      {err && <ModalErr name={msg} hdClose={handleCloseErr} />}
      {success && <ModalSuccess name={msg} hdClose={handleCloseSuccess}/>}

      {/* Modals de agregar */}
      {mdlVehiculos && <ModalVehiculos tglModal={handleCancelModalVehiculos} hdlData={handleChangeFormVehiculos} hdlSubmit={handleSaveVehiculos}/>}
    </>
  );
};

export default EditTransporte;
