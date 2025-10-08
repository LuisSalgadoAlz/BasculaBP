import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ButtonAdd, ButtonSave, ButtonVolver } from "../buttons";
import { claseFormInputs } from "../../constants/boletas";
import {
  getClientesPorID,
  verificarData,
  verificarDirecciones,
  updateSocios,
  getDireccionesPorSocios,
  postDirecciones,
  getDireccionesPorID,
  updateDireccionesPorID,
  postCrearFactura,
  getFacturasPorSocio,
  getFacturaInfo,
  updateFacturaProceso,
} from "../../hooks/formClientes";
import { TableComponent, TableDirecciones, TableFacturas } from "./tableClientes";
import { ModalSuccess, ModalErr, NoData, Spinner } from "../alerts";
import { ModalDirecciones, ModalDireccionesEdit, ModalFacturas, ModalFacturasEdit } from "./modal";

const EditClientes = () => {
  /* Estados / Datos del aplicativo */
  const [isLoadDireccion, setIsLoadDireccion] = useState(false)
  const [isLoadingSaveDirection, setIsLoadingSaveDirection] = useState(false)
  const [isLoadingUpdateSocios, setIsLoadingUpdateSocios] = useState(false)
  const [isLoadingUpdateDirection, setIsLoadingUpdateDirection] = useState(false)
  const [success, setSuccess] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [msg, setMsg] = useState();
  const [direcciones, setDirecciones] = useState();
  const [modalDirecciones, setModalDirecciones] = useState();
  const [modalDireccionesEdit, setModalDireccionesEdit] = useState();
  const [modalFacturas, setModalFacturas] = useState(false)
  const [modalFacturasEdit, setModalFacturasEdit] = useState(false)
  const [isLoadingInfoFactura, setIsLoadingInforFactura] = useState(false)
  const [isLoadingSaveFactura, setIsLoadingSaveFactura] = useState(false)
  const [isLoadingUpdateFactura, setIsLoadingUpdateFactura] = useState(false)
  const [dataFacturas, setDataFacturas] = useState()
  const [isLoadDataFacturas, setIsLoadDataFacturas] = useState(false)
  const [dataDireccion, setDataDireccion] = useState({});
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: -1,
    descripcion: "",
    estado: 1,
  });
  const [sc, setSc] = useState({
    nombre: "Cargando...",
    tipo: -1,
    correo: "Cargando...",
    estado: "",
    telefono: "",
  });
  const [facturas, setFacturas] = useState({
    factura: "",
    codigoProveedor: "",
    proveedor: "",
    cantidad: 0,
  })

  /* ID global */
  const { id } = useParams();

  /* Limpieza de componentes */
  const hanldeCleanState = () => {
    setFormData({ nombre: "", tipo: -1, descripcion: "", estado: 1 });
    setFacturas({ factura: "", codigoProveedor: "", proveedor: "", cantidad: 0, })
  };

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setSc((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeFacturas = (e) => {
    const {value, name} = e.target;

    setFacturas((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const verificarFactura = (facturas) => {
    if(!facturas.factura || !facturas.codigoProveedor || !facturas.proveedor || !facturas.cantidad || !facturas.facturaProveedor){
      setErrorModal(true)
      setMsg('No deben de haber campos vacios en el formulario de facturas. Intente denuevo.')
      return false
    }
     // Validación para factura: solo números, 9-10 dígitos
    const facturaRegex = /^\d{9,10}$/;
    if(!facturaRegex.test(facturas.factura)){
      setErrorModal(true)
      setMsg('El número de factura debe contener únicamente dígitos numéricos y tener entre 9 y 10 dígitos. No se permiten símbolos especiales.')
      return false
    }
    
    if(facturas.cantidad <= 0) {
      setErrorModal(true) 
      setMsg('La cantidad no puede ser negativa o cero. Revise la cantidad e intente denuevo.')
      return false
    }
    /* No se agregaron mas validaciones porque se espera que surgan mas en las reuniones */
    return true
  }

  const handleSaveFacturas = async() => {
    const isCorrect = verificarFactura(facturas)
    if(isCorrect) {
      const arrSendFactura = {...facturas, idSocio: id}
      const crearFactura = await postCrearFactura(arrSendFactura, setIsLoadingSaveFactura)
      if(crearFactura?.err){
        setErrorModal(true)
        setMsg(crearFactura?.err)
        return
      }
      setMsg(crearFactura?.msg)
      getFacturasPorSocio(setDataFacturas, setIsLoadDataFacturas, id)
      setModalFacturas(false)
      setSuccess(true)
    }
  }

  const handleOpenModalFacturasEdit = async(item) => {
    setModalFacturasEdit(true)
    const resposne = await getFacturaInfo(setFacturas, setIsLoadingInforFactura, item.id)
  }

  const handleUpdateFactura = async()=>{
    if(facturas?.ProcesoTemp === 2 || facturas?.ProcesoTemp === 3){
      setErrorModal(true)
      setMsg('No es posible modificar una factura completada o cancelada.')
      return
    }
    if (facturas?.ProcesoTemp === facturas?.Proceso) {
      setErrorModal(true)
      setMsg('No ha modificado el proceso de la factura. Intente denuevo')
      return
    }
    const statusRequest = await updateFacturaProceso(facturas, setIsLoadingUpdateFactura)
    if(statusRequest.err) {
      setErrorModal(true)
      setMsg(statusRequest.err)
      return
    }
    setMsg(statusRequest.msg)
    setSuccess(true)
    getFacturasPorSocio(setDataFacturas, setIsLoadDataFacturas, id)
  }

  const handleClik = () => {
    navigate(-1);
  };

  const handleModalDirecciones = () => {
    setModalDirecciones(true);
  };

  const handleModalFacturas =() => {
    setModalFacturas(true)
  }

  const handleClose = () => {
    setErrorModal(false);
    setSuccess(false);
    setModalDirecciones(false);
    setModalDireccionesEdit(false);
    setModalFacturas(false)
    setModalFacturasEdit(false)
    hanldeCleanState()
  };

  const handleSave = async () => {
    if(isLoadingUpdateSocios) return
    const response = verificarData(setSuccess, setErrorModal, sc, setMsg);
    if (response) {
      const callApi = await updateSocios(sc, id, setIsLoadingUpdateSocios);
      if (!callApi.msgErr) {
        setMsg('guardar los datos')
        setSuccess(true);
        return
      }
      setMsg(callApi.msgErr)
      setErrorModal(true)
    }
  };

  const handleDataDirecciones = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setDataDireccion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* Metodos put y post de direcciones */
  const handleSaveDirecciones = async () => {
    if(isLoadingSaveDirection) return
    const arr = { ...formData, id };
    const isValid = verificarDirecciones(setErrorModal, arr, setMsg);
    if (isValid) {
      await postDirecciones(arr, setIsLoadingSaveDirection);
      getDireccionesPorSocios(setDirecciones, id, setIsLoadDireccion);
      setModalDirecciones(false);
      setMsg('agregar direccion')
      setSuccess(true)
      hanldeCleanState();
    }
  };

  const handleUpdateDireccionFinish = async () => {
    if(isLoadingUpdateDirection) return
    const isValid = verificarDirecciones(setErrorModal, dataDireccion, setMsg);
    console.log(isValid);
    if (isValid) {
      await updateDireccionesPorID(dataDireccion, setIsLoadingUpdateDirection);
      getDireccionesPorSocios(setDirecciones, id, setIsLoadDireccion);
      setModalDireccionesEdit(false);
      setMsg('modificar direccion')
      setSuccess(true)
    }
  };

  /* Obtener data de las direcciones  */

  const handleUpdateDireccion = async (data) => {
    await getDireccionesPorID(setDataDireccion, data.id);
    setModalDireccionesEdit(true);
  };

  const handleCloseAlertsModals = () => {
    setErrorModal(false);
  };

  const fetchData = useCallback(() => {
    getDireccionesPorSocios(setDirecciones, id, setIsLoadDireccion);
    getClientesPorID(setSc, id);
    getFacturasPorSocio(setDataFacturas, setIsLoadDataFacturas, id)
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="mt-6 bg-white shadow rounded-xl px-6 py-7">
        <div className="flex justify-between w-full gap-5 max-sm:flex-col">
          <div className="parte-izq">
            <h1 className="text-3xl font-bold titulo">Editar Socio</h1>
            <h1 className="text-gray-600">
              {" "}
              Edita información básica del socio.{" "}
            </h1>
          </div>
          <div className="parte-der flex items-center justify-center gap-3">
            <ButtonVolver name={"Volver"} fun={handleClik} />
          </div>
        </div>
        <div className="w-full grid grid-cols-2 gap-2 max-md:grid-cols-1">
          <div className="mt-5">
            <label className="block mb-2 text-sm font-medium text-gray-900 ">
              Nombre
            </label>
            <input
              type="text"
              name={"nombre"}
              className={claseFormInputs}
              placeholder={`Ingrese Nombre`}
              required
              onChange={handleChange}
              value={sc.nombre}
            />
          </div>
          <div className="mt-5">
            <label className="block mb-2 text-sm font-medium text-gray-900 ">
              Tipo
            </label>
            <select
              name={"tipo"}
              className={claseFormInputs}
              onChange={handleChange}
              value={sc.tipo}
            >
              <option value={-1} className="text-gray-400">
                Seleccione un tipo
              </option>
              <option value={0}>Proveedor</option>
              <option value={1}>Cliente</option>
            </select>
          </div>
          <div className="mt-5">
            <label className="block mb-2 text-sm font-medium text-gray-900 ">
              Email
            </label>
            <input
              type="email"
              name={"correo"}
              className={claseFormInputs}
              placeholder={`Ingrese Email`}
              required
              value={sc.correo ? sc.correo : ''}
              onChange={handleChange}
            />
          </div>
          <div className="mt-5">
            <label className="block mb-2 text-sm font-medium text-gray-900 ">
              Número
            </label>
            <input
              type="number"
              name={"telefono"}
              className={claseFormInputs}
              placeholder={`Ingrese Número`}
              required
              value={sc.telefono ? sc.telefono : ''}
              onChange={handleChange}
            />
          </div>
          <div className="mt-5">
            <label className="block mb-2 text-sm font-medium text-gray-900 ">
              Estado
            </label>
            <select
              name={"estado"}
              className={claseFormInputs}
              onChange={handleChange}
              value={sc.estado}
            >
              <option value={-1} className="text-gray-400">
                Seleccione un estado
              </option>
              <option value={false}>🔴 Desactivado</option>
              <option value={true}>🟢 Activado</option>
            </select>
          </div>
        </div>
        <div className="mt-7 place-self-end max-sm:place-self-center">
          <ButtonSave name={`${isLoadingUpdateSocios ? 'Guardando Cambios...' : 'Guardar Cambios'}`} fun={handleSave} />
        </div>
        <hr className="text-gray-400 mt-7" />
        <div className="flex justify-between gap-5 mt-7 max-sm:flex-col">
          <div className="parte-izq">
            <h1 className="text-3xl font-bold titulo">Agregar Facturas</h1>
            <h1 className="text-gray-600">
              {" "}
              Gestión de facturas activas de socios
            </h1>
          </div>
          <div className="parte-izq self-center">
            <ButtonAdd
              name={"Agregar Factura"}
              fun={handleModalFacturas}
            />
          </div>
        </div>
        <div className="gap-5 mt-7">
          {(isLoadDataFacturas && !dataFacturas) ? <Spinner /> : (!dataFacturas || dataFacturas.length == 0) ? (
            <NoData />
          ) : (
            <TableFacturas datos={dataFacturas} fun={handleOpenModalFacturasEdit} />
          )}
        </div>
        <hr className="text-gray-400 mt-7" />
        <div className="flex justify-between gap-5 mt-7 max-sm:flex-col">
          <div className="parte-izq">
            <h1 className="text-3xl font-bold titulo">Agregar Direcciones</h1>
            <h1 className="text-gray-600">
              {" "}
              Origenes y destinos posibles de los socios.
            </h1>
          </div>
          <div className="parte-izq self-center">
            <ButtonAdd
              name={"Agregar Dirección"}
              fun={handleModalDirecciones}
            />
          </div>
        </div>
        <div className="gap-5 mt-7">
          {(isLoadDireccion && !direcciones) ? <Spinner /> : (!direcciones || direcciones.length == 0) ? (
            <NoData />
          ) : (
            <TableDirecciones datos={direcciones} fun={handleUpdateDireccion} />
          )}
        </div>
      </div>

      {/* Area de los modals */}
      {success && (
        <ModalSuccess name={msg} hdClose={handleClose} />
      )}
      {errorModal && <ModalErr name={msg} hdClose={handleCloseAlertsModals} />}

      {/* Modal de direcciones */}
      {modalDirecciones && (
        <ModalDirecciones
          tglModal={handleClose}
          hdlData={handleDataDirecciones}
          hdlSubmit={handleSaveDirecciones}
          isLoading={isLoadingSaveDirection}
        />
      )}
      {modalDireccionesEdit && (
        <ModalDireccionesEdit
          tglModal={handleClose}
          hdlData={handleDataDirecciones}
          hdlSubmit={handleUpdateDireccionFinish}
          dtDir={dataDireccion}
          isLoading={isLoadingUpdateDirection}
        />
      )}
      {modalFacturas && (
        <ModalFacturas
          tglModal={handleClose}
          hdlData={handleChangeFacturas}
          hdlSubmit={handleSaveFacturas}
          isLoading={isLoadingSaveFactura}
        />
      )}
      {modalFacturasEdit && (
        <ModalFacturasEdit
          tglModal={handleClose}
          hdlData={handleChangeFacturas}
          hdlSubmit={handleUpdateFactura}
          isLoading={isLoadingUpdateFactura}
          isLoadingData={isLoadingInfoFactura}
          data={facturas}
        />
      )}
    </>
  );
};

export default EditClientes;
