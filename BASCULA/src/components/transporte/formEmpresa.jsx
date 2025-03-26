import { useEffect, useState } from "react";
import { cargando, claseFormInputs, classFormSelct } from "../../constants/boletas";
import SelectFormBoletas from "../boletas/select";
import { getClientes } from "../../hooks/formClientes"

const FormEmpresa = ({ fun, data }) => {
  const [socios, setSocios] = useState()

  const handleChange = (e) => {
    console.log(value)
    getClientes(setSocios,1, value, '')
  }

  useEffect(() => {
    getClientes(setSocios,1, '', '')
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
        <label className="block mb-2 text-sm font-medium text-gray-900 ">
          Asignar a socio
        </label>
        <SelectFormBoletas classCss={classFormSelct} name= "socios" data={socios ? socios.data : cargando} fun={handleChange}/>
      </div>
    </>
  );
};

export default FormEmpresa;
