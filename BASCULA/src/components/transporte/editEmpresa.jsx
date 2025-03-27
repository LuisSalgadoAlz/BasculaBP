import { useParams } from "react-router";
import { ButtonAdd, ButtonSave, ButtonVolver } from "../buttons";
import {
  cargando,
  claseFormInputs,
  classFormSelct,
} from "../../constants/boletas";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  getEmpresasPorId,
  getSociosParaSelect,
} from "../../hooks/formDataEmpresas";
import { SelectSociosEdit } from "../selects";

const EditTransporte = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const handleClik = () => {
    navigate(-1);
  };
  const [socios, setSocios] = useState();

  const [empresa, setEmpresa] = useState({
    nombre: "",
    email: "",
    telefono: "",
    descripcion: "",
    estado: "",
    idSocios: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpresa((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    getEmpresasPorId(setEmpresa, id);
    getSociosParaSelect(setSocios);
  }, []);

  return (
    <>
      <div className="mt-6 bg-white shadow rounded-xl px-6 py-7">
        <div className="flex justify-between w-full gap-5">
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
        <div className="mt-7 place-self-end">
          <ButtonSave name={"Guardar Cambios"} />
        </div>

        {/* Esta parte despues */}
        <hr className="text-gray-400 mt-7" />
        <div className="flex justify-between w-full gap-5 mt-7">
          <div className="parte-izq">
            <h1 className="text-3xl font-bold titulo">Agregar Vehiculos</h1>
            <h1 className="text-gray-600">
              {" "}
              Gestion de placas con las que cuenta la empresa.
            </h1>
          </div>
          <div className="parte-izq">
            <ButtonAdd name={"Agregar Dirección"} />
          </div>
        </div>
        <div className="gap-5 mt-7">{/* Aqui van las tablas */}</div>
        {/* Parte de motoristas */}
        <hr className="text-gray-400 mt-7" />
        <div className="flex justify-between w-full gap-5 mt-7">
          <div className="parte-izq">
            <h1 className="text-3xl font-bold titulo">Agregar Motorista</h1>
            <h1 className="text-gray-600">
              {" "}
              Gestion de placas con las que cuenta la empresa.
            </h1>
          </div>
          <div className="parte-izq">
            <ButtonAdd name={"Agregar Dirección"} />
          </div>
        </div>
        <div className="gap-5 mt-7">{/* Aqui van las tablas */}</div>
      </div>
    </>
  );
};

export default EditTransporte;
