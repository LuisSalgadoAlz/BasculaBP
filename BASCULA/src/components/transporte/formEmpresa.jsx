import { useEffect, useState } from "react";
import { cargando, claseFormInputs, classFormSelct, tiposCamion } from "../../constants/boletas";
import { SelectSociosSave } from "../selects";
import { getSociosParaSelect } from "../../hooks/formDataEmpresas"

/**
 * TODO:  Form para agregar empresas
 */
export const FormEmpresa = ({ fun }) => {
  const [socios, setSocios] = useState()

  useEffect(() => {
    getSociosParaSelect(setSocios)
  }, [])
  

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
          Email
        </label>
        <input type="email" name={"email"} className={claseFormInputs} placeholder={`Ingrese Email`} required onChange={fun} />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Número
        </label>
        <input type="number" name={"telefono"} className={claseFormInputs} placeholder={`Ingrese Número`} required onChange={fun} />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Descripción
        </label>
        <input type="text" name={"descripcion"} className={claseFormInputs} placeholder={`Ingrese Descripción`} required onChange={fun} />
      </div>
      <div className="mt-5">
        <SelectSociosSave classCss={classFormSelct} name= "idSocios" data={socios ? socios : cargando} fun={fun}/>
      </div>
    </>
  );
};

/**
 * TODO: Form para agregar vehiculos
 * @param {*} param0 
 * @returns 
 */
export const FormVehiculos = ({ fun }) => {
  return (
    <>
      <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-x-3">
        <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Placa
          </label>
          <input type="text" name={"placa"} className={claseFormInputs} placeholder={`Ingrese Placa`} required onChange={fun}   />
        </div>
        <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Marca
          </label>
          <input type="email" name={"marca"} className={claseFormInputs} placeholder={`Ingrese Marca`} required onChange={fun} />
        </div>
        <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Modelo
          </label>
          <input type="email" name={"modelo"} className={claseFormInputs} placeholder={`Ingrese Modelo`} required onChange={fun} />
        </div>
        <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Peso Maximo
          </label>
          <input type="number" name={"pesoMaximo"} className={claseFormInputs} placeholder={`Ingrese Peso Maximo`} required onChange={fun} />
        </div>
        <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Tipo
          </label>
          <select name={"tipo"} className={claseFormInputs} onChange={fun}> 
              <option value={-1} className="text-gray-400">Seleccione un tipo</option>
              {tiposCamion.map((el)=>(
                <option value={el.id}>{el.nombre}</option>
              ))}
          </select>
        </div>
      </div>   
    </>
  );
};

/**
 * TODO: Form Para editar Vehiculos
 * @param {*} param0 
 * @returns 
 */
export const FormVehiculosEdit = ({ fun, data }) => {
  return (
    <>
    <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-x-3">
      <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Placa
          </label>
          <input type="text" name={"placa"} className={claseFormInputs} placeholder={`Ingrese Placa`} required onChange={fun} value={data && data.placa}  />
        </div>
        <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Marca
          </label>
          <input type="email" name={"marca"} className={claseFormInputs} placeholder={`Ingrese Marca`} required onChange={fun} value={data && data.marca} />
        </div>
        <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Modelo
          </label>
          <input type="email" name={"modelo"} className={claseFormInputs} placeholder={`Ingrese Modelo`} required onChange={fun} value={data && data.modelo} />
        </div>
        <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Peso Maximo
          </label>
          <input type="number" name={"pesoMaximo"} className={claseFormInputs} placeholder={`Ingrese Peso Maximo`} required onChange={fun} value={data && data.pesoMaximo}  />
        </div>
        <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Tipo
          </label>
          <select name={"tipo"} className={claseFormInputs} onChange={fun} value={data && data.tipo}> 
              <option value={-1} className="text-gray-400">Seleccione un tipo</option>
              <option value={0}>Liviano</option>
              <option value={1}>Mayoreo</option>
              <option value={2}>Detalle</option>
              <option value={3}>Importaciones</option>
          </select>
        </div>
        <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Estado
          </label>
          <select name={"estado"} className={claseFormInputs} onChange={fun} value={data && data.estado}> 
              <option value={-1} className="text-gray-400">Seleccione un estado</option>
              <option value={0}>🔴 Inactiva</option>
              <option value={1}>🟢 Activa</option>
          </select>
        </div>
      </div>
    </>
  );
};

/**
 * TODO: Form para agregar motoristas
 * @param {*} param0 
 * @returns 
 */
export const FormMotoristas = ({ fun }) => {
  return (
    <>
    <div className="grid grid-cols-1 max-sm:grid-cols-1 gap-y-3">
      <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Nombre
          </label>
          <input type="text" name={"nombre"} className={claseFormInputs} placeholder={`Ingrese Nombre`} required onChange={fun}/>
        </div>
        <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Telefono
          </label>
          <input type="number" name={"telefono"} className={claseFormInputs} placeholder={`Ingrese Telefono`} required onChange={fun}/>
        </div>
        <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Correo
          </label>
          <input type="text" name={"correo"} className={claseFormInputs} placeholder={`Ingrese Correo`} required onChange={fun}/>
        </div>
      </div>
    </>
  );
};

export const FormMotoristasEdit = ({ fun, data }) => {
  return (
    <>
    <div className="grid grid-cols-1 max-sm:grid-cols-1 gap-y-3">
      <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Nombre
          </label>
          <input type="text" name={"nombre"} className={claseFormInputs} placeholder={`Ingrese Nombre`} required onChange={fun} value={data && data.nombre}/>
        </div>
        <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Telefono
          </label>
          <input type="number" name={"telefono"} className={claseFormInputs} placeholder={`Ingrese Telefono`} required onChange={fun} value={data && data.telefono}/>
        </div>
        <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Correo
          </label>
          <input type="text" name={"correo"} className={claseFormInputs} placeholder={`Ingrese Correo`} required onChange={fun} value={data && data.correo}/>
        </div>
        <div className="mt-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Estado
          </label>
          <select name={"estado"} className={claseFormInputs} onChange={fun} value={data && data.estado}> 
              <option value={-1} className="text-gray-400">Seleccione un estado</option>
              <option value={0}>🔴 Inactiva</option>
              <option value={1}>🟢 Activa</option>
          </select>
        </div>
      </div>
    </>
  );
};
