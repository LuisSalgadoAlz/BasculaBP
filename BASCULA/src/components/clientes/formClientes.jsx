import { claseFormInputs } from "../../constants/boletas";

const FormClientes = ({ fun }) => {
  return (
    <>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Nombre
        </label>
        <input type="text" name={"nombre"} className={claseFormInputs} placeholder={`Ingrese Nombre`} required onChange={fun}   />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Tipo
        </label>
        <select name={"tipo"} className={claseFormInputs} onChange={fun}> 
            <option value={-1} className="text-gray-400">Seleccione un tipo</option>
            <option value={0}>Proveedor</option>
            <option value={1}>Cliente</option>
        </select>
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Email
        </label>
        <input type="email" name={"correo"} className={claseFormInputs} placeholder={`Ingrese Email`} required onChange={fun} />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Número
        </label>
        <input type="number" name={"telefono"} className={claseFormInputs} placeholder={`Ingrese Número`} required onChange={fun} />
      </div>
    </>
  );
};

export default FormClientes;
