import { useParams } from "react-router";
import { ButtonAdd, ButtonSave, ButtonVolver, Pagination } from "../buttons";
import { cargando, claseFormInputs, classFormSelct } from "../../constants/boletas";
import { useNavigate } from "react-router";
import { useCallback, useEffect, useState, useMemo } from "react";
import { getEmpresasPorId, getSociosParaSelect, updateEmpresas, verificarData, getVehiculosPorEmpresas, postVehiculosPorEmpresas, updateVehiculosPorEmpresas,
  verificarDataVehiculos, verificarListadoDeVehiculos, getMotoristasPorEmpresas, postMotoristasDeLaEmpresa, verificarDataDeMotoristas, updateMotoristasPorEmpresa
} from "../../hooks/formDataEmpresas";
import { SelectSociosEdit } from "../selects";
import { ModalErr, ModalSuccess, ModalVehiculoDuplicado, ModalVehiculoDuplicadoEdit, NoData, Spinner } from "../alerts";
import { TableMotoristas, TableVehiculos } from "./tables";
import { ModalMotoristas, ModalMotoristasEdit, ModalVehiculos, ModalVehiculosEdit } from "./modal";
import { debounce } from "lodash";

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
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false)
  const [isLoadingSaveVehicle, setIsLoadingSaveVehicle] = useState(false)
  const [isLoadingSaveMotorista, setIsLoadingSaveMotorista] = useState(false)
  const [isLoadingUpdateMoto, setIsLoadingUpdateMoto] = useState(false)
  const [msg, setMsg] = useState();
  const [vehiculos, setVehiculos] = useState();
  const [mdlVehiculos, setMdlVehiculos] = useState();
  const [modalVehiculosEdit, setModalVehiculosEdit] = useState();
  const [mdlVehiculoDuplicado, setMdlVehiculoDuplicado] = useState()
  const [mdlVehiculoDuplicadoEdit, setMdlVehiculoDuplicadoEdit] = useState()
  const [motoristas, setMotoristas] = useState()
  const [modalMotoristas, setModalMotoristas] = useState()
  const [modalMotoristasEdit, setModalMotoristasEdit] = useState()
  const [paginationVehiculos, setPaginationVehiculos] = useState(1)
  const [searchPlaca, setSearchPlaca] = useState('')
  const [paginactionMotorista, setPaginationMotoristas] = useState(1)
  const [searchMotorista, setSearchMotorista] = useState('')

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

  const handleUpdate = async() => {
    /**
     * Verifica la info valida
     */
    if(isLoadingUpdate) return
    const isValid = verificarData(setErr, empresa, setMsg);
    if (isValid) {
      await updateEmpresas(empresa, id, setIsLoadingUpdate);
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
    if(isLoadingSaveVehicle) return
    setIsLoadingSaveVehicle(true)
    try{
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
          await addVehiculoPorEmpresa()
          return
        }
        setMsg(msgList)
        setMdlVehiculoDuplicado(true)
      }
    }catch(err){
      console.log(err)
    } finally{
      setIsLoadingSaveVehicle(false)
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
    fetchVehiculos()
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

  const handlePaginationVehiculos = (item) => {
    if (paginationVehiculos>0) {
      const newRender = paginationVehiculos+item
      if(newRender==0) return
      if(newRender>vehiculos.pagination.totalPages) return
      setPaginationVehiculos(newRender) 
    }
  }

  const handleSearchDebouncedVehiculo = useMemo(
    () =>
      debounce((value) => {
        setSearchPlaca(value)
      }, 350), // 300 ms de espera
    []
  );
  
  const handleSearhPlaca = (e) => {
    const { value } = e.target
    setPaginationVehiculos(1)
    handleSearchDebouncedVehiculo(value)
  }

  /* Parte de los motoristas */
  const handlePaginationMotoristas = (item) => {
    if (paginactionMotorista>0) {
      const newRender = paginactionMotorista+item
      if(newRender==0) return
      if(newRender>motoristas.pagination.totalPages) return
      setPaginationMotoristas(newRender) 
    }
  }

  const handleSearchDebouncedMotorista = useMemo(
    () =>
      debounce((value) => {
        setSearchMotorista(value)
      }, 350), // 300 ms de espera
    []
  );

  const handleSearhMotorista = (e) => {
    const { value } = e.target
    setPaginationMotoristas(1)
    handleSearchDebouncedMotorista(value)
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
    if (isLoadingSaveMotorista) return
    const isValid = verificarDataDeMotoristas(setErr, formMotoristas, setMsg)
    if (isValid) {
      const { msgErr } = await postMotoristasDeLaEmpresa(formMotoristas, setIsLoadingSaveMotorista)
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
    if(isLoadingUpdateMoto) return
    const isValid = verificarDataDeMotoristas(setErr, formMotoristas, setMsg)
    if (isValid){
      const { msgErr } = await updateMotoristasPorEmpresa(formMotoristas, id, setIsLoadingUpdateMoto)
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

  const fetchVehiculos = useCallback(() => {
    getVehiculosPorEmpresas(setVehiculos, id, setIsLoadVehiculos, paginationVehiculos, searchPlaca);
  }, [paginationVehiculos, searchPlaca])

  const fetchData = useCallback(() => {
    getMotoristasPorEmpresas(setMotoristas, id, setIsloadMotorista, paginactionMotorista, searchMotorista)
  }, [paginactionMotorista, searchMotorista]);

  const fechOnlyData = useCallback(() => {
    getEmpresasPorId(setEmpresa, id);
    getSociosParaSelect(setSocios);
  }, [])

  useEffect(()=>{
    fechOnlyData()
  }, [fechOnlyData])

  useEffect(()=> {
    fetchVehiculos();
  }, [fetchVehiculos])

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
        <div className="w-full grid grid-cols-2 gap-2 max-md:grid-cols-1">
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
          <ButtonSave name={`${isLoadingUpdate ? 'Guardando Cambios...' : 'Guardar Cambios'}`} fun={handleUpdate} />
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
         <div className="relative mb-4 p-2">
           <input className="w-full p-3 pl-12 text-sm bg-white border rounded-lg  border-gray-200" onChange={handleSearhPlaca} type="text" placeholder="Buscar placa" />
            <div className="absolute inset-y-0 left-0 flex items-center pl-7 pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
         </div>
          <div className="min-h-[400px]">
            {(isLoadVehiculos && !vehiculos) ? <Spinner /> : (!vehiculos || vehiculos.data.length == []) ? (
              <NoData />
            ) : (
              <TableVehiculos datos={vehiculos?.data} fun={handleGetVehiculo} />
            )}
          </div>
          <div className="p-4 mt-4">
            {vehiculos && vehiculos.pagination.totalPages > 1 && <Pagination pg={paginationVehiculos} sp={setPaginationVehiculos} hp={handlePaginationVehiculos } dt={vehiculos}/>}
          </div>
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
          <div className="relative mb-4 p-2 mt-7">
           <input className="w-full p-3 pl-12 text-sm bg-white border rounded-lg  border-gray-200" onChange={handleSearhMotorista} type="text" placeholder="Buscar motorista" />
            <div className="absolute inset-y-0 left-0 flex items-center pl-7 pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        <div className="gap-5 mt-7 min-h-[400px]">
          {(isLoadMotorista && !motoristas) ? <Spinner /> :(!motoristas || motoristas.data.length == []) ? <NoData /> : <TableMotoristas datos={motoristas.data} fun={handleGetMotoristasEdit} />}
        </div>
        <div className="mt-4 p-4">
          {motoristas && motoristas.pagination.totalPages > 1 && <Pagination pg={paginactionMotorista} sp={setPaginationMotoristas} hp={handlePaginationMotoristas } dt={motoristas}/>}
        </div>
        <hr className="text-gray-400 mt-7" />
      </div>

      {/* !Modals del alertas */}
      {err && <ModalErr name={msg} hdClose={handleCloseErr} />}
      {success && <ModalSuccess name={msg} hdClose={handleCloseSuccess} />}

      {/* Modals de agregar */}
      {mdlVehiculos && ( <ModalVehiculos isLoading={isLoadingSaveVehicle} tglModal={handleCancelModalVehiculos} hdlData={handleChangeFormVehiculos} hdlSubmit={handleSaveVehiculos} />)}
      
      {/* Modals del apartado de vehiculos */}
      {mdlVehiculoDuplicadoEdit && <ModalVehiculoDuplicadoEdit name={msg} hdClose={handleCancelAdvertencia} hdlSubmit={editVehiculoEmpresa}/>}
      {mdlVehiculoDuplicado && <ModalVehiculoDuplicado name={msg} hdClose={handleCancelAdvertencia} hdlSubmit={addVehiculoPorEmpresa}/>}
      {modalVehiculosEdit && <ModalVehiculosEdit hdlSubmit={handleSubmitEditFinish} hdlData={handleChangeFormVehiculos} frDta={formVehiculos} tglModal={handleCloseModalVehiculosEdit} />}
      
      {/* Modals del apartado de motoristas */}
      {modalMotoristas && <ModalMotoristas isLoading={isLoadingSaveMotorista} hdlData={handleChangeFormMotoristas} tglModal={handleToggleModalMotoristas} hdlSubmit={handleSaveMotoristas}/>}
      {modalMotoristasEdit && <ModalMotoristasEdit isLoading={isLoadingUpdateMoto} hdlData={handleChangeFormMotoristas} tglModal={handleToggleModalMotoristas} hdlSubmit={handleUpdateMotoristas} frDta={formMotoristas} />}
    </>
  );
};

export default EditTransporte;
