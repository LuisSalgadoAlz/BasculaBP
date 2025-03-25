import { claseFormInputs } from "../../constants/boletas";

export const FormClientes = ({ fun }) => {
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

export const FormDirecciones = ({ fun, data }) => {
  return (
    <>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Nombre
        </label>
        <input type="text" name={"nombre"} className={claseFormInputs} placeholder={`Ingrese Nombre`} required value={data && data.nombre} onChange={fun}   />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Tipo
        </label>
        <select name={"tipo"} className={claseFormInputs} onChange={fun}> 
            <option value={-1} className="text-gray-400">Seleccione un tipo</option>
            <option value={0}>Origen</option>
            <option value={1}>Destino</option>
        </select>
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Descripcion
        </label>
        <input type="email" name={"descripcion"} className={claseFormInputs} placeholder={`Ingrese descripcion`} required onChange={fun} />
      </div>
    </>
  );
};


export const FormDireccionesEdit = ({ fun, data }) => {
  return (
    <>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Nombre
        </label>
        <input type="text" name={"nombre"} className={claseFormInputs} placeholder={`Ingrese Nombre`} required value={data && data.nombre} onChange={fun}   />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Tipo
        </label>
        <select name={"tipo"} className={claseFormInputs} onChange={fun} value={data && data.tipo}> 
            <option value={-1} className="text-gray-400">Seleccione un tipo</option>
            <option value={0}>Origen</option>
            <option value={1}>Destino</option>
        </select>
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Descripcion
        </label>
        <input type="email" name={"descripcion"} className={claseFormInputs} placeholder={`Ingrese descripcion`} required onChange={fun} value={data && data.descripcion} />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Estado
        </label>
        <select name={"estado"} className={claseFormInputs} onChange={fun} value={data && data.estado}> 
            <option value={-1} className="text-gray-400">Seleccione un tipo</option>
            <option value={false}>Inactivo</option>
            <option value={true}>Activo</option>
        </select>
      </div>
    </>
  );
};



