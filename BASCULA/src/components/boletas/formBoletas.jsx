import { use, useEffect, useState } from "react";

import InputsFormBoletas from "./inputs";
import SelectFormBoletas from "./select";

import { getClientes, getMotoristas, getPlacas, getTransporte, getProcesos, getDestino, getOrigen, getProductos } from '../../hooks/formsBoletas'
import { hoy, claseFormInputs, classFormSelct, classTextArea, tipoTransporte, cargando } from '../../constants/boletas'

const FormBoletas = ({ opc }) => {
  /* Tengo que convertir esto en un hook */

  const [clientes, setClientes] = useState()
  const [procesos, setProcesos] = useState()
  const [transporte, setTransporte] = useState()
  const [motoristas, setMotoristas] = useState()
  const [origen, setOrigen] = useState()
  const [destino, setDestino] = useState()
  const [producto, setProducto] = useState()

  const [formData, setFormData] = useState()
  const [placa, setPlaca] = useState('')
  const [placas, setPlacas] = useState()

  const handleChange = (e) => {
    const { name, value } = e.target;
    if(name=='Placa') {
      placaXtransporte(value)
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const placaXtransporte = (value) => {
    setPlaca(value)
  }

  useEffect(() => {
    getClientes(setClientes)
    getMotoristas(setMotoristas)
    getPlacas(setPlacas)
    getTransporte(setTransporte, placa)
    getProcesos(setProcesos)
    getDestino(setDestino)
    getOrigen(setOrigen)
    getProductos(setProducto)
    console.log(formData)
  }, [formData, placa]);

  

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
                <SelectFormBoletas classCss={classFormSelct} name= "Proceso" data={procesos ? procesos : cargando} fun={handleChange}/>
              </div>
              <div className="grow">
                <SelectFormBoletas classCss={classFormSelct} name= "Placa" data={placas ? placas : cargando} fun={handleChange}/>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <div className="grow-0">
                <SelectFormBoletas classCss={classFormSelct} name= "Tipo de transporte" data={tipoTransporte} fun={handleChange}/>
              </div>
              <div className="grow-7">
                <SelectFormBoletas classCss={classFormSelct} data={transporte ? transporte : cargando} name={'Transportes'} fun={handleChange}/>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <div className="grow">
                <SelectFormBoletas classCss={classFormSelct} data={clientes ? clientes : cargando} name={'Clientes'} fun={handleChange}/>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <div className="grow">
                <SelectFormBoletas classCss={classFormSelct} data={motoristas ? motoristas : cargando} name={'Motoristas'} fun={handleChange}/> 
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <div className="grow">
                <SelectFormBoletas classCss={classFormSelct} data={producto ? producto : cargando} name={'Tipo de producto'} fun={handleChange}/>
              </div>
              <div className="grow">
                <SelectFormBoletas classCss={classFormSelct} data={producto ? producto : cargando} name={'Tipo de peso'} fun={handleChange}/>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              <div className="grow">
                <SelectFormBoletas classCss={classFormSelct} data={origen ? origen : cargando} name={'Origen'} fun={handleChange}/>
              </div>
              <div className="grow">
                <SelectFormBoletas classCss={classFormSelct} data={destino ? destino : cargando} name={'Destino'} fun={handleChange}/>
              </div>
            </div>
          </div>
          <div className="mt-2 p-2">
            <div className="flex flex-wrap gap-3">
              <div className="grow">
                <InputsFormBoletas data={claseFormInputs} name={"Documento"} />
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
