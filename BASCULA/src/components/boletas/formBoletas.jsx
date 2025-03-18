import { useEffect, useState } from "react";

import InputsFormBoletas from "./inputs";
import SelectFormBoletas from "./select";
import getClientes from "../../hooks/fetchClientes";

import { hoy, claseFormInputs, classTextArea, tipoTransporte, cargando } from '../../constants/boletas'
import getTransporte from "../../hooks/fetchTransporte";

const FormBoletas = ({ opc }) => {
  /* Tengo que convertir esto en un hook */
  const [clientes, setClientes] = useState()
  const [transporte, setTransporte] = useState()

  useEffect(() => {
    getClientes(setClientes)
    getTransporte(setTransporte)
  }, []);

  console.log(clientes)

  return (
    <>
      <div className="bg-[#98591B] p-4 rounded-sm text-white border-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl">Boletas</h1>
          <h1 className="text-sm text-gray-100">
            Gestión de entrada y salida de material
          </h1>
        </div>
        <div>{hoy.toLocaleDateString()}</div>
      </div>
      <div className="mt-4">
        <form className="grid grid-flow-col grid-cols-2 grid-rows-1">
          <div className="mt-2 p-2">
            <div className="flex flex-wrap gap-2">
              <div className="grow">
                <InputsFormBoletas data={claseFormInputs} name={"Placa"} />
              </div>
              <div className="grow">
                <InputsFormBoletas data={claseFormInputs} name={"Remolque"} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <div className="grow-0">
                <SelectFormBoletas classCss={claseFormInputs} name= "Tipo de transporte" data={tipoTransporte}/>
              </div>
              <div className="grow-7">
                <SelectFormBoletas classCss={claseFormInputs} data={transporte ? transporte : cargando} name={'Transportes'}/>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <div className="grow">
                <SelectFormBoletas classCss={claseFormInputs} data={clientes ? clientes : cargando} name={'Clientes'}/>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <div className="grow">
                <InputsFormBoletas data={claseFormInputs} name={"Motorista"} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              <div className="grow">
                <label className="block mb-2 text-sm font-medium text-gray-900 ">Origen</label>
                <select name="" id="" className={claseFormInputs}>
                  <option value="0">Llenar</option>
                </select>
              </div>
              <div className="grow">
                <label className="block mb-2 text-sm font-medium text-gray-900 ">Destino</label>
                <select name="" id="" className={claseFormInputs}>
                  <option value="0">Llenar</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <div className="grow">
                <label className="block mb-2 text-sm font-medium text-gray-900 ">Tipo de producto</label>
                <select name="" id="" className={claseFormInputs}>
                  <option value="">Llenar</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mt-2 p-2">
            <div className="flex flex-wrap gap-3">
              <div className="grow">
                <label className="block mb-2 text-sm font-medium text-gray-900 ">Documento</label>
                <select name="" id="" className={claseFormInputs}>
                  <option value="">Llenar</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              <div className="grow">
                <InputsFormBoletas data={claseFormInputs} name={"Peso de entrada"} />
              </div>
              <div className="grow">
                <InputsFormBoletas data={claseFormInputs} name={"Peso de salida"} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              <div className="grow">
                <InputsFormBoletas data={claseFormInputs} name={"Peso teorico"} />
              </div>
              <div className="grow">
                <InputsFormBoletas data={claseFormInputs} name={"Peso neto"} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <div className="grow">
                <InputsFormBoletas data={claseFormInputs} name={"Desviacion"} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <div className="grow">
                <label className="block mb-2 text-sm font-medium text-gray-900 ">Observaciones</label>
                <textarea name="" id="" className={classTextArea} placeholder="Ingrese sus observaciones aqui"/>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <div className="grow">
                <button type="submit" className={claseFormInputs}>Cancelar</button>
              </div>
              <div className="grow">
                <button type="submit" className={claseFormInputs}>Guardar</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default FormBoletas;
