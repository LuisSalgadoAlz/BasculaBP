import { useEffect, useState } from "react";
import { cargando, claseFormInputs, classFormSelct } from "../../constants/boletas";
import { SelectSociosSave } from "../selects";
import { getSociosParaSelect } from "../../hooks/formDataEmpresas"

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


export const FormVehiculos = ({ fun }) => {
  return (
    <>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Placa
        </label>
        <input type="text" name={"placa"} className={claseFormInputs} placeholder={`Ingrese Nombre`} required onChange={fun}   />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Marca
        </label>
        <input type="email" name={"marca"} className={claseFormInputs} placeholder={`Ingrese Email`} required onChange={fun} />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Modelo
        </label>
        <input type="email" name={"modelo"} className={claseFormInputs} placeholder={`Ingrese Email`} required onChange={fun} />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Peso Maximo
        </label>
        <input type="number" name={"pesoMaximo"} className={claseFormInputs} placeholder={`Ingrese Número`} required onChange={fun} />
      </div>
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Tipo
        </label>
        <select name={"tipo"} className={claseFormInputs} onChange={fun}> 
            <option value={-1} className="text-gray-400">Seleccione un tipo</option>
            <option value={0}>Liviano</option>
            <option value={1}>Mayoreo</option>
            <option value={1}>Detalle</option>
            <option value={1}>Importaciones</option>
        </select>
      </div>
    </>
  );
};
