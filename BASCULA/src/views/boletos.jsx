import { useState } from "react";
import {ButtonAdd} from "../components/buttons";
import ViewBoletas from "../components/boletas/viewBoletas";
import FormBoletas from "../components/boletas/formBoletas";

const Boletas = () => {
  const [openModelForm, setOpenModalForm] = useState(false)

  const handleClik = () => {
    setOpenModalForm(!openModelForm)
  }
  
  return (
    <>
      <div className="flex justify-between w-full gap-5">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Boletas</h1>
          <h1 className="text-gray-600"> Generación y visualización de las boletas de Báscula</h1>
        </div>
        <div className="parte-der flex items-center justify-center gap-3">
          <h1 className="text-gray-600"><span>Entradas (2000)</span> |  <span>Salidas (2000)</span></h1>
          {openModelForm ? <ButtonAdd name="Volver" fun={handleClik} /> : <ButtonAdd name="Nueva Boleta" fun={handleClik} />}
        </div>
      </div>
      <div className="mt-6 bg-white shadow rounded-xl px-6 py-7">
        {openModelForm ? <FormBoletas/> : <ViewBoletas opc = {1} />}
      </div>
    </>
  );
};
   
export default Boletas;
