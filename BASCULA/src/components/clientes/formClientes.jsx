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
            <option value={2}>Origen / Destino</option>
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
            <option value={2}>Origen / Destino</option>
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
            <option value={false}>🔴 Inactivo</option>
            <option value={true}>🟢 Activo</option>
        </select>
      </div>
    </>
  );
};

export const FormFacturas = ({ fun }) => {
  return (
    <>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Factura SAP
        </label>
        <input type="text" name={"factura"} className={claseFormInputs} placeholder={`Ingrese factura`} required onChange={fun}   />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Factura Proveedor
        </label>
        <input type="text" name={"facturaProveedor"} className={claseFormInputs} placeholder={`Ingrese factura`} required onChange={fun} />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Código Proveedor
        </label>
        <input type="text" name={"codigoProveedor"} className={claseFormInputs} placeholder={`Ingrese código de proveedor`} required onChange={fun}   />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Proveedor
        </label>
        <input type="text" name={"proveedor"} className={claseFormInputs} placeholder={`Ingrese proveedor`} required onChange={fun}   />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Cantidad
        </label>
        <input type="number" name={"cantidad"} className={claseFormInputs} placeholder={`Ingrese cantidad(TM)`} required onChange={fun} />
      </div>
    </>
  );
};

export const FormFacturasEdit = ({ fun, data, isLoadingData }) => {
  return (
    <>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Factura SAP
        </label>
        <input type="text" name={"factura"} className={claseFormInputs} placeholder={`Ingrese factura`} required onChange={fun} value={isLoadingData ? 'Cargando...' : data?.factura} disabled  />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Factura Proveedor
        </label>
        <input type="text" name={"facturaProveedor"} className={claseFormInputs} placeholder={`Ingrese factura`} required onChange={fun} value={isLoadingData ? 'Cargando...' : data?.facturaProveedor || 'No registrada.'} disabled/>
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Código Proveedor
        </label>
        <input type="text" name={"codigoProveedor"} className={claseFormInputs} placeholder={`Ingrese código de proveedor`} required onChange={fun} value={isLoadingData ? 'Cargando...' : data?.codigoProveedor} disabled />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Proveedor
        </label>
        <input type="text" name={"proveedor"} className={claseFormInputs} placeholder={`Ingrese proveedor`} required onChange={fun} value={isLoadingData ? 'Cargando...' : data?.proveedor} disabled/>
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Cantidad
        </label>
        <input type="number" name={"cantidad"} className={claseFormInputs} placeholder={`Ingrese cantidad(TM)`} required onChange={fun} value={isLoadingData ? 0 : data?.cantidad} disabled />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Cantidad
        </label>
        <select name="Proceso" className={claseFormInputs} onChange={fun} value={data?.Proceso} disabled={(data?.ProcesoTemp == 2 || data?.ProcesoTemp == 3) ? true : false} required>
          {isLoadingData && <option value="Cargando...">Cargando...</option>}
          <option value="1">Recibiendo</option>
          <option value="2">Completado</option>
          <option value="3">Cancelado</option>
        </select>
      </div>
    </>
  );
};
