import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ButtonSave, ButtonVolver } from "../buttons";
import { claseFormInputs } from "../../constants/boletas";
import { getClientesPorID,  verificarData, updateSocios} from "../../hooks/formClientes";
import { ModalSuccess, ModalErr } from "../alerts";

const EditClientes = () => {
  const [success, setSuccess] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [msg, setMsg] = useState();

  const [sc, setSc] = useState({
    nombre: "Cargando...",
    tipo: -1,
    correo: "Cargando...",
    estado: "",
    telefono: "Cargando...",
  });

  const { id } = useParams();
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

  const handleClose = () => {
    setErrorModal(false);
    setSuccess(false);
  };

  const handleSave = async () => {
    const response = verificarData(setSuccess, setErrorModal, sc, setMsg);
    if (response) {
      const callApi = await updateSocios(sc, id);
      if (callApi) {
        setSuccess(true)
      }
    }
  };

  const fetchData = useCallback(() => {
    getClientesPorID(setSc, id);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="mt-6 bg-white shadow rounded-xl px-6 py-7">
        <div className="flex justify-between w-full gap-5">
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
              <option value={false}>Desactivado</option>
              <option value={true}>Activado</option>
            </select>
          </div>
        </div>
        <div className="mt-7 place-self-end">
          <ButtonSave name={"Guardar Cambios"} fun={handleSave} />
        </div>
        <hr className="text-gray-400 mt-7" />
        <div className="flex justify-between w-full gap-5 mt-5">
          <div className="parte-izq">
            <h1 className="text-3xl font-bold titulo">Agregar Direcciones</h1>
            <h1 className="text-gray-600">
              {" "}
              Origenes y destinos posibles de los socios.
            </h1>
          </div>
        </div>
      </div>

      {/* Area de los modals */}
      {success && (
        <ModalSuccess name={"modificar el socio"} hdClose={handleClose} />
      )}
      {errorModal && (
        <ModalErr name={msg} hdClose={handleClose} />
      )}
    </>
  );
};

export default EditClientes;
