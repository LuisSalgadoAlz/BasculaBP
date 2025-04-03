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
} from "../../hooks/formClientes";
import { TableDirecciones } from "./tableClientes";
import { ModalSuccess, ModalErr, NoData } from "../alerts";
import { ModalDirecciones, ModalDireccionesEdit } from "./modal";

const EditClientes = () => {
  /* Estados / Datos del aplicativo */

  const [success, setSuccess] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [msg, setMsg] = useState();
  const [direcciones, setDirecciones] = useState();
  const [modalDirecciones, setModalDirecciones] = useState();
  const [modalDireccionesEdit, setModalDireccionesEdit] = useState();
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

  /* ID global */
  const { id } = useParams();

  /* Limpieza de componentes */
  const hanldeCleanState = () => {
    setFormData({ nombre: "", tipo: -1, descripcion: "", estado: 1 });
  };

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setSc((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClik = () => {
    navigate(-1);
  };

  const handleModalDirecciones = () => {
    setModalDirecciones(true);
  };

  const handleClose = () => {
    setErrorModal(false);
    setSuccess(false);
    setModalDirecciones(false);
    setModalDireccionesEdit(false);
    hanldeCleanState()
  };

  const handleSave = async () => {
    const response = verificarData(setSuccess, setErrorModal, sc, setMsg);
    if (response) {
      const callApi = await updateSocios(sc, id);
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
    const arr = { ...formData, id };
    const isValid = verificarDirecciones(setErrorModal, arr, setMsg);
    if (isValid) {
      await postDirecciones(arr);
      getDireccionesPorSocios(setDirecciones, id);
      setModalDirecciones(false);
      setMsg('agregar direccion')
      setSuccess(true)
      hanldeCleanState();
    }
  };

  const handleUpdateDireccionFinish = async () => {
    /* Falta validar */
    const isValid = verificarDirecciones(setErrorModal, dataDireccion, setMsg);
    console.log(isValid);
    if (isValid) {
      await updateDireccionesPorID(dataDireccion);
      getDireccionesPorSocios(setDirecciones, id);
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
    getDireccionesPorSocios(setDirecciones, id);
    getClientesPorID(setSc, id);
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
        <div className="container grid grid-cols-2 gap-2 max-md:grid-cols-1">
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
              value={sc.correo}
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
              value={sc.telefono}
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
          <ButtonSave name={"Guardar Cambios"} fun={handleSave} />
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
          {!direcciones || direcciones.length == 0 ? (
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
        />
      )}
      {modalDireccionesEdit && (
        <ModalDireccionesEdit
          tglModal={handleClose}
          hdlData={handleDataDirecciones}
          hdlSubmit={handleUpdateDireccionFinish}
          dtDir={dataDireccion}
        />
      )}
    </>
  );
};

export default EditClientes;
