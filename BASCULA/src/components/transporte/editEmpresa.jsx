import { useParams } from "react-router";
import { ButtonAdd, ButtonSave, ButtonVolver } from "../buttons";
import { cargando, claseFormInputs, classFormSelct } from "../../constants/boletas";
import { useNavigate } from "react-router";
import { useCallback, useEffect, useState } from "react";
import { getEmpresasPorId, getSociosParaSelect, updateEmpresas, verificarData, getVehiculosPorEmpresas, postVehiculosPorEmpresas, updateVehiculosPorEmpresas,
  verificarDataVehiculos, verificarListadoDeVehiculos, getMotoristasPorEmpresas, postMotoristasDeLaEmpresa, verificarDataDeMotoristas, updateMotoristasPorEmpresa
} from "../../hooks/formDataEmpresas";
import { SelectSociosEdit } from "../selects";
import { ModalErr, ModalSuccess, ModalVehiculoDuplicado, ModalVehiculoDuplicadoEdit, NoData, Spinner } from "../alerts";
import { TableMotoristas, TableVehiculos } from "./tables";
import { ModalMotoristas, ModalMotoristasEdit, ModalVehiculos, ModalVehiculosEdit } from "./modal";

/**
 * TODO : Comienzo  del componente de la pagina de edit de
 * TODO : transporte
 * @returns JSX
 */

const EditTransporte = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const handleClik = () => {
    navigate(-1);
  };
  const [socios, setSocios] = useState();
  const [err, setErr] = useState();
  const [success, setSuccess] = useState();
  const [isLoadMotorista, setIsloadMotorista] = useState(false)
  const [isLoadVehiculos, setIsLoadVehiculos] = useState(false)
  const [msg, setMsg] = useState();
  const [vehiculos, setVehiculos] = useState();
  const [mdlVehiculos, setMdlVehiculos] = useState();
  const [modalVehiculosEdit, setModalVehiculosEdit] = useState();
  const [mdlVehiculoDuplicado, setMdlVehiculoDuplicado] = useState()
  const [mdlVehiculoDuplicadoEdit, setMdlVehiculoDuplicadoEdit] = useState()
  const [motoristas, setMotoristas] = useState()
  const [modalMotoristas, setModalMotoristas] = useState()
  const [modalMotoristasEdit, setModalMotoristasEdit] = useState()
  const [formMotoristas,  setFormMotoristas] = useState({
    nombre : '', telefono: '', correo: '', id: id
  })
  const [placaAnterior, setPlacaAnterior] = useState()
  const [formVehiculos, setFormVehiculos] = useState({
    placa: "",
    modelo: "",
    marca: "",
    tipo: -1,
    pesoMaximo: "",
    estado: true,
    id: id,
  });

  /**
   *  ? Estado inicial del form de empresa
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
   * Aqui se obtienen constantemente cuando el usuario cambia de valor algun
   * valor de los elementos del form
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
    const isValid = verificarData(setErr, empresa, setMsg);
    if (isValid) {
      updateEmpresas(empresa, id);
      setSuccess(true);
      setMsg("modificar empresa.");
    }
  };

  /* Cierre de modals y limpieza de data */
  const handleCloseErr = () => {
    setErr(false);
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
  };

  /**
   * TODO Parte de vehiculos
   * -------------------------------
   * 
   */

  const handleShowModalVehiculos = () => {
    setMdlVehiculos(true);
  };

  const handleCleanForms = () => {
    setFormVehiculos({
      placa: "",
      modelo: "",
      marca: "",
      tipo: -1,
      pesoMaximo: "",
      estado: true,
      id: id,
    });
  }

  const handleCancelModalVehiculos = () => {
    handleCleanForms()
    setMdlVehiculos(false);
  };

  const handleChangeFormVehiculos = (e) => {
    const { name, value } = e.target;
    setFormVehiculos((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveVehiculos = async () => {
    /**
     * Validacion de datos
     */
    const isValid = verificarDataVehiculos(setErr, formVehiculos, setMsg);
    if (isValid) {
      const {msgList, existHere} = await verificarListadoDeVehiculos(formVehiculos.placa, id);
      if (existHere) {
        setMsg('placa ya existe en esta empresa.')
        setErr(true)
        return
      }
      
      if (!msgList){
        addVehiculoPorEmpresa()
        return
      }
      setMsg(msgList)
      setMdlVehiculoDuplicado(true)
    }
  };

  const addVehiculoPorEmpresa = async() => {
      await postVehiculosPorEmpresas(formVehiculos);
      setMsg("agregar vehiculos");
      setSuccess(true);
      setMdlVehiculos(false)
      fetchData();
      setMdlVehiculoDuplicado(false)
      handleCleanForms()
  }

  const editVehiculoEmpresa = async() => {
    await updateVehiculosPorEmpresas(formVehiculos, id)
    fetchData()
    setMsg('modificar vehiculo')
    setMdlVehiculoDuplicadoEdit(false)
    setModalVehiculosEdit(false)
    handleCleanForms()
    setSuccess(true)
  }

  const handleCancelAdvertencia = () => {
    setMdlVehiculoDuplicado(false)
    setMdlVehiculoDuplicadoEdit(false)
  }

  const handleGetVehiculo = (data) => {
    setFormVehiculos(data)
    setPlacaAnterior(data.placa)
    setModalVehiculosEdit(true)
  }

  const handleCloseModalVehiculosEdit = () => {
    setModalVehiculosEdit(false)
    handleCleanForms()
  }

  const handleSubmitEditFinish = async () => {
    const isValid = verificarDataVehiculos(setErr, formVehiculos, setMsg);
    if (isValid) {
      const {msgList, existHere} = await verificarListadoDeVehiculos(formVehiculos.placa, id);
      if (existHere && formVehiculos.placa != placaAnterior) {
        setMsg('placa ya existe en esta empresa.')
        setErr(true)
        return
      }
      
      if (msgList && formVehiculos.placa != placaAnterior){
        setMsg(msgList)
        setMdlVehiculoDuplicadoEdit(true)
        return
      }

      editVehiculoEmpresa()
      return
    }
  }

   /**
   * TODO: Parte de motoristas
   * -------------------------------
   */

  const handleShowModalMotoristas = () => {
    setModalMotoristas(true)
  }
  
  const handleCleanFormsMotoristas = () => {
    setFormMotoristas({nombre : '', telefono: '', correo: '', id: id})
  }
  
  const handleChangeFormMotoristas = (e) => {
    const { name, value } = e.target
    setFormMotoristas((prev)=> ({
      ...prev,
      [name] : value
    }))
  }

  const handleToggleModalMotoristas = () => {
    setModalMotoristas(false)
    setModalMotoristasEdit(false)
    handleCleanFormsMotoristas()
  }

  const handleSaveMotoristas = async () => {
    const isValid = verificarDataDeMotoristas(setErr, formMotoristas, setMsg)
    if (isValid) {
      const { msgErr } = await postMotoristasDeLaEmpresa(formMotoristas)
      if (!msgErr) {
        fetchData()
        setModalMotoristas(false)
        handleCleanFormsMotoristas()
        setMsg('agregar motorista')
        setSuccess(true) 
        return
      }
      setMsg(msgErr)
      setErr(true)      
    }
  }

  const handleGetMotoristasEdit = (data) => {
    setFormMotoristas(data)
    setModalMotoristasEdit(true)
  }

  const handleUpdateMotoristas = async () => {
    const isValid = verificarDataDeMotoristas(setErr, formMotoristas, setMsg)
    if (isValid){
      const { msgErr } = await updateMotoristasPorEmpresa(formMotoristas, id)
      if(!msgErr){
        setMsg('modificar usuario')
        setSuccess(true)
        handleCleanFormsMotoristas()
        setModalMotoristasEdit(false)
        fetchData()
        return
      }
      setMsg(msgErr)
      setErr(true)
    }
  }

  /**
   *  ? Calback que almacena los valores de las tablas para maximizar el rendimiento
   *  ? datos que se almacenan en el cache
   */

  const fetchData = useCallback(() => {
    getVehiculosPorEmpresas(setVehiculos, id, setIsLoadVehiculos);
    getMotoristasPorEmpresas(setMotoristas, id, setIsloadMotorista)
    getEmpresasPorId(setEmpresa, id);
    getSociosParaSelect(setSocios);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * TODO JSX inicial
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
              <option value={false}>🔴 Desactivada</option>
              <option value={true}>🟢 Activada</option>
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
          <ButtonSave name={"Guardar Cambios"} fun={handleUpdate} />
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
            <ButtonAdd
              name={"Agregar Vehiculos"}
              fun={handleShowModalVehiculos}
            />
          </div>
        </div>
        <div className="gap-5 mt-7">
          {(isLoadVehiculos && !vehiculos) ? <Spinner /> : (!vehiculos || vehiculos.length == []) ? (
            <NoData />
          ) : (
            <TableVehiculos datos={vehiculos} fun={handleGetVehiculo} />
          )}
        </div>

        {/* Parte de motoristas */}
        <hr className="text-gray-400 mt-7" />
        <div className="flex justify-between w-full gap-5 mt-7 max-sm:flex-col">
          <div className="parte-izq">
            <h1 className="text-3xl font-bold titulo">Agregar Motorista</h1>
            <h1 className="text-gray-600">
              {" "}
              Gestion de motoristas de la empresa.
            </h1>
          </div>
          <div className="parte-izq max-sm:place-self-center">
            <ButtonAdd name={"Agregar Motoristas"} fun={handleShowModalMotoristas}/>
          </div>
        </div>
        <div className="gap-5 mt-7">{(isLoadMotorista && !motoristas) ? <Spinner /> :(!motoristas || motoristas.length == []) ? <NoData /> : <TableMotoristas datos={motoristas} fun={handleGetMotoristasEdit} />}</div>
        <hr className="text-gray-400 mt-7" />
      </div>

      {/* !Modals del alertas */}
      {err && <ModalErr name={msg} hdClose={handleCloseErr} />}
      {success && <ModalSuccess name={msg} hdClose={handleCloseSuccess} />}

      {/* Modals de agregar */}
      {mdlVehiculos && ( <ModalVehiculos tglModal={handleCancelModalVehiculos} hdlData={handleChangeFormVehiculos} hdlSubmit={handleSaveVehiculos} />)}
      
      {/* Modals del apartado de vehiculos */}
      {mdlVehiculoDuplicadoEdit && <ModalVehiculoDuplicadoEdit name={msg} hdClose={handleCancelAdvertencia} hdlSubmit={editVehiculoEmpresa}/>}
      {mdlVehiculoDuplicado && <ModalVehiculoDuplicado name={msg} hdClose={handleCancelAdvertencia} hdlSubmit={addVehiculoPorEmpresa}/>}
      {modalVehiculosEdit && <ModalVehiculosEdit hdlSubmit={handleSubmitEditFinish} hdlData={handleChangeFormVehiculos} frDta={formVehiculos} tglModal={handleCloseModalVehiculosEdit} />}
      
      {/* Modals del apartado de motoristas */}
      {modalMotoristas && <ModalMotoristas hdlData={handleChangeFormMotoristas} tglModal={handleToggleModalMotoristas} hdlSubmit={handleSaveMotoristas}/>}
      {modalMotoristasEdit && <ModalMotoristasEdit hdlData={handleChangeFormMotoristas} tglModal={handleToggleModalMotoristas} hdlSubmit={handleUpdateMotoristas} frDta={formMotoristas} />}
    </>
  );
};

export default EditTransporte;
