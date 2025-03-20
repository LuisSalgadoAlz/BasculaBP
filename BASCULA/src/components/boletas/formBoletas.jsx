import { useCallback, useEffect, useState } from "react";

import { InputsFormBoletas, PartInputsPesos, PartInputsPesos2 } from "./inputs";
import SelectFormBoletas from "./select";

import { getClientes, getMotoristas, getPlacas, getTransporte, getProcesos, getDestino, getOrigen, getProductos, getTipoDePeso, getPeso } from '../../hooks/formsBoletas'
import { hoy, claseFormInputs, classFormSelct, tipoTransporte, cargando } from '../../constants/boletas'


const FormBoletas = ({ opc }) => {
  /* Tengo que convertir esto en un hook */

  const [clientes, setClientes] = useState()
  const [procesos, setProcesos] = useState()
  const [transporte, setTransporte] = useState()
  const [motoristas, setMotoristas] = useState()
  const [origen, setOrigen] = useState()
  const [destino, setDestino] = useState()
  const [producto, setProducto] = useState()
  const [pesoEntrada, setPesoEntrada] = useState()
  const [pesoSalida, setPesoSalida] = useState()
  const [tipoDePeso, setTipoDePeso] = useState()
  const [formData, setFormData] = useState()
  const [placa, setPlaca] = useState('')
  const [placas, setPlacas] = useState()
  const [op, setOp] = useState(1)

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name=='Placa') placaXtransporte(value)

    if (name=='Proceso') setOp(value)
    
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const placaXtransporte = (value) => {
    setPlaca(value)
  }

  /* Parte de rendimiendo de obtencion de datos */
  const fetchData = useCallback(() => {
    getClientes(setClientes);
    getMotoristas(setMotoristas);
    getPlacas(setPlacas);
    getTransporte(setTransporte, placa);
    getProcesos(setProcesos);
    getDestino(setDestino);
    getOrigen(setOrigen);
    getProductos(setProducto);
    getTipoDePeso(setTipoDePeso);
  }, [placa, formData]); 

  useEffect(() => { 
    console.log(formData)
    fetchData()
  }, [fetchData]);

  const handleClickPesoEntrada = (e) => {
    e.preventDefault()
    getPeso(setPesoEntrada)
  }

  const handleClickSalida = (e) => {
    e.preventDefault()
    getPeso(setPesoSalida)
  }

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
            <div className="flex flex-wrap gap-3">
              <div className="flex-1">
                <SelectFormBoletas classCss={classFormSelct} name= "Proceso" data={procesos ? procesos : cargando} fun={handleChange}/>
              </div>
              <div className="flex-1">
                <SelectFormBoletas classCss={classFormSelct} name= "Placa" data={placas ? placas : cargando} fun={handleChange}/>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5">
              <div className="flex-1 max-sm:flex-auto">
                <SelectFormBoletas classCss={classFormSelct} name= "Tipo transporte" data={tipoTransporte} fun={handleChange}/>
              </div>
              <div className="flex-1 max-sm:flex-auto">
                <SelectFormBoletas classCss={classFormSelct} data={transporte ? transporte : cargando} name={'Transportes'} fun={handleChange}/>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5">
              <div className="grow">
                <SelectFormBoletas classCss={classFormSelct} data={clientes ? clientes : cargando} name={'Clientes'} fun={handleChange}/>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5">
              <div className="grow">
                <SelectFormBoletas classCss={classFormSelct} data={motoristas ? motoristas : cargando} name={'Motoristas'} fun={handleChange}/> 
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5">
              <div className="flex-1 min-sm:flex-auto">
                <SelectFormBoletas classCss={classFormSelct} data={producto ? producto : cargando} name={'Tipo de producto'} fun={handleChange}/>
              </div>
              <div className="flex-1 min-sm:flex-auto">
                <SelectFormBoletas classCss={classFormSelct} data={tipoDePeso ? tipoDePeso : cargando} name={'Tipo de peso'} fun={handleChange}/>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5">
              <div className="flex-1">
                <SelectFormBoletas classCss={classFormSelct} data={origen ? origen : cargando} name={'Origen'} fun={handleChange}/>
              </div>
              <div className="flex-1">
                <SelectFormBoletas classCss={classFormSelct} data={destino ? destino : cargando} name={'Destino'} fun={handleChange}/>
              </div>
            </div>
          </div>
          <div className="mt-2 p-2">
            <div className="flex flex-wrap gap-3">
              <div className="grow">
                <InputsFormBoletas data={claseFormInputs} fun={handleChange} name={"Documento"} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5">
              {op==1 && <PartInputsPesos css={claseFormInputs} fun1={handleChange} id={"Peso entrada"} data={pesoEntrada} fun2={handleClickPesoEntrada} />}
              {op==2 && <PartInputsPesos2 css={claseFormInputs} fun1={handleChange} id={"Peso salida"} data={pesoSalida} fun2={handleClickSalida} />}
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5">
              <div className="grow">
                <InputsFormBoletas data={claseFormInputs} name={"Peso teorico"} />
              </div>
              <div className="grow">
                <InputsFormBoletas data={claseFormInputs} name={"Peso neto"} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5">
              <div className="grow">
                <InputsFormBoletas data={claseFormInputs} name={"Desviacion"} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5">
              <div className="grow">
                <InputsFormBoletas data={claseFormInputs} name={"Observaciones"} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5">
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
