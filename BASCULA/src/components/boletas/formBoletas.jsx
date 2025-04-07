import { useEffect, useState } from "react";
import SelectFormBoletas from "./select";
import { InputsFormBoletas, PartInputsPesos, PartInputsPesos2 } from "./inputs";
import { claseFormInputs, classFormSelct } from "../../constants/boletas";
import { ESTADOS_BOLETAS, URLWEBSOCKET } from "../../constants/global";

export const ModalBoletas = ({hdlClose, hdlChange, fillData, typeBol, typeStructure, formBol, boletas}) => {
  const [peso, setPeso] = useState('00lb');
  const [formState, setFormState] = useState(true)

  const getPesoIn = () => {
    formBol((prev)=> ({
      ...prev, 
      'pesoIn' : peso.replaceAll('lb', ''), 
    }))
  }

  const getPesoOut = () => {
    formBol((prev)=> ({
      ...prev, 
      'pesoOut' : peso.replaceAll('lb', ''), 
    }))
  } 


  useEffect(() => {
    const socket = new WebSocket(URLWEBSOCKET); 
    console.log(boletas.Proceso)
    socket.onmessage = (event) => {
      const newPeso = event.data;
      setPeso(newPeso); 
    };

    socket.onerror = () => {
      setPeso('No conectada')
    }

    return () => {
      socket.close();
    };
  }, []);  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 sm:p-6 min-h-screen bg-opa-50">
      <div className="bg-white w-full max-w-5xl rounded-2xl p-2 shadow-lg sm:w-[90%] md:w-[80%] lg:w-[60%] max-h-[95vh] overflow-y-auto boletas border-8 border-white">
        <div className="mb-1">
          <h2 className="text-2xl font-bold text-gray-800">Boletas</h2>
          <p className="text-sm text-gray-500">Creación de entrada y salida de material del {new Date().toLocaleDateString()}</p>
        </div>

        <div className="my-2 p-2 bg-gray-100 rounded-lg border border-gray-300">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900 max-sm:text-sm">Peso en tiempo real báscula:</span>
            <span className="text-lg font-bold text-gray-900 max-sm:text-sm">{peso}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 p-2 place-content-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 ">
            {["Proceso", "Placa", "Clientes", "Transportes", "Motoristas", "Producto", "Origen", "Destino", "Flete"].map((item) => (
              <SelectFormBoletas key={item} classCss={classFormSelct} name={item} data={fillData[item]} fun={hdlChange} stt={(boletas.Proceso==='' && item!=='Proceso')? true : false}/>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2  place-content-center">
            {typeStructure == 0 ? <PartInputsPesos fun={getPesoIn} hdlChange={hdlChange} val={boletas} /> : <PartInputsPesos2 fun={getPesoOut} hdlChange={hdlChange} val={boletas}/>}
            {typeBol==1 && <InputsFormBoletas data={claseFormInputs} name={'Orden de compra'} fun={hdlChange} />}
            {["Documento","Peso teorico", "Peso neto", "Desviacion", "Observacion"].map((item) => (
              <InputsFormBoletas key={item} data={claseFormInputs} name={item} fun={hdlChange} />
            ))}
            <label className="block mb-2 text-sm font-medium text-gray-900">Fecha de entrada</label>
            <input type="text" name='fechaIn' className={claseFormInputs} value={new Date()} disabled/>
            <label className="block mb-2 text-sm font-medium text-gray-900">Fecha de salida</label>
            <input type="text" name='fechaEntrada' className={claseFormInputs} value={'-----'} disabled/>
          </div>
        </div>
            
        <hr className="text-gray-300 mt-1" />

        <div className="mt-3 px-3 grid grid-cols-6 gap-2 justify-between max-sm:grid-rows-3 max-sm:grid-cols-1">
          <select name="Estado" className={`${claseFormInputs} col-span-3`} onChange={hdlChange}>
            {ESTADOS_BOLETAS.map((el)=>(
              <option key={el.id} value={el.id}>{el.nombre}</option>
            ))}
          </select>
          <button
            className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-400 transition-transform duration-300 ease-in-out hover:scale-105"
          >
            Limpiar
          </button>
          <button
            onClick={hdlClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-transform duration-300 ease-in-out hover:scale-105"
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-transform duration-300 ease-in-out hover:scale-105"
          >
            Guardar
          </button>
        </div>
    </div>
  </div>

  );
};
