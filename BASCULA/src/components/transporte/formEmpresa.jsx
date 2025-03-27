import { useEffect, useState } from "react";
import { cargando, claseFormInputs, classFormSelct } from "../../constants/boletas";
import { SelectSociosSave } from "../selects";
import { getSociosParaSelect } from "../../hooks/formDataEmpresas"

const FormEmpresa = ({ fun }) => {
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

export default FormEmpresa;
