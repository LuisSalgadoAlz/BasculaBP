import { useEffect, useState } from "react";
import SelectFormBoletas from "./select";
import { InputsFormBoletas, PartInputsPesos, PartInputsPesos2, PartPesosDeSalida, TransladoExterno, TransladoInterno, TransladoNormal } from "./inputs";
import { buttonCalcular, buttonCancel, buttonClean, buttonSave, claseFormInputs, classFormSelct, } from "../../constants/boletas";
import { URLWEBSOCKET } from "../../constants/global";
import { ModalPrevisual } from "../alerts";

const formInputSelect = ['Transportes', 'Placa', 'Motoristas']

/**
 * ! Sin uso, por los momentos
 * @param {*} param0 
 * @returns 
 */
export const ModalBoletas = ({hdlClose, hdlChange, fillData, formBol, boletas, hdlSubmit, clean, isLoading}) => {
  const [peso, setPeso] = useState('00lb');
  const newClient = fillData?.Clientes.filter(({id})=>id!=-999)

  const getPesoOut = () => {
    formBol((prev)=> ({
      ...prev, 
      'pesoOut' : peso.replaceAll('lb', ''), 
    }))
  } 

  useEffect(() => {
    const socket = new WebSocket(URLWEBSOCKET); 
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
          <h2 className="text-2xl font-bold text-gray-800">Boleta tipo: Casulla</h2>
          <p className="text-sm text-gray-500">Creación de entrada y salida de material del {new Date().toLocaleDateString()}</p>
        </div>

        <div className="my-2 p-2 bg-gray-100 rounded-lg border border-gray-300">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900 max-sm:text-sm">Peso en tiempo real báscula:</span>
            <span className="text-lg font-bold text-gray-900 max-sm:text-sm">{peso}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 p-2 place-content-center">
          <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2 ">
            <SelectFormBoletas classCss={classFormSelct} name={'Proceso'} data={fillData['Proceso']} fun={hdlChange} val={boletas?.Proceso} stt={true}/>
            <SelectFormBoletas key={clean} classCss={classFormSelct} name={'Socios'} data={newClient} fun={hdlChange} stt={(boletas.Proceso==='')? true : false}/>
            {boletas?.Socios==-998 && <InputsFormBoletas data={claseFormInputs} name={'Cliente'} fun={hdlChange} />}
            {boletas?.Socios==-999 && <InputsFormBoletas data={claseFormInputs} name={'Proveedor'} fun={hdlChange} />}
            {formInputSelect.map((field) => (boletas?.Socios !=-998 && boletas?.Socios !=-999) ? 
              (
                <SelectFormBoletas key={field} classCss={classFormSelct} name={field} data={fillData[field]} fun={hdlChange} />
                ) : (
                <InputsFormBoletas key={field} data={claseFormInputs} name={field} fun={hdlChange} val={boletas?.[field]} /> 
              )
            )}
            <SelectFormBoletas classCss={classFormSelct} name={'Producto'} data={fillData['Producto']} val={boletas?.Producto} fun={hdlChange} stt={true}/>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 place-content-start">
            <SelectFormBoletas classCss={classFormSelct} name={'Movimiento'} data={fillData['FleteS']} fun={hdlChange} val={boletas?.Movimiento} stt={true}/>
            <TransladoNormal bol={boletas} hdl={hdlChange} fill={fillData} />
            <PartInputsPesos2 fun={getPesoOut} hdlChange={hdlChange} val={boletas}/>
            <InputsFormBoletas data={claseFormInputs} name={'Observaciones'} fun={hdlChange} />
          </div>
        </div>
   
        <hr className="text-gray-300 mt-1" />

        <div className="mt-3 px-3 grid grid-cols-2 gap-2 justify-between max-sm:grid-rows-3 max-sm:grid-cols-1">
          <button onClick={hdlClose} className={buttonCancel} disabled={isLoading}>
            Cancelar
          </button>
          <button onClick={hdlSubmit} className={buttonSave} disabled={isLoading}>
            {isLoading ? 'Guardando...' : "Guardar"}
          </button>
        </div>
    </div>
    </div>
  );
};

export const ModalNormal= ({hdlClose, hdlChange, fillData, formBol, boletas, hdlClean, hdlSubmit, clean, isLoading}) => {
  const [peso, setPeso] = useState('00lb');
  const getPesoIn = () => {
    formBol((prev)=> ({
      ...prev, 
      'pesoIn' : parseInt(peso.replaceAll('lb', '')), 
    }))
  }

  useEffect(() => {
    const socket = new WebSocket(URLWEBSOCKET); 
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
      <div className="bg-white w-full max-w-xl rounded-2xl p-2 shadow-lg sm:w-[90%] md:w-[80%] lg:w-[60%] max-h-[95vh] overflow-y-auto boletas border-8 border-white">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 p-2 place-content-center">
          <SelectFormBoletas key={clean} classCss={classFormSelct} name={'Socios'} data={fillData['Clientes']} fun={hdlChange}/>
          {boletas?.Socios==-998 && <InputsFormBoletas data={claseFormInputs} name={'Cliente'} fun={hdlChange}/>}
          {boletas?.Socios==-999 && <InputsFormBoletas data={claseFormInputs} name={'Proveedor'} fun={hdlChange}/>}
          {formInputSelect.map((field) => (
            (boletas?.Socios !=-998 && boletas?.Socios !=-999) ? (<SelectFormBoletas key={field} classCss={classFormSelct} name={field} data={fillData[field]} fun={hdlChange}  /> )
            : (<InputsFormBoletas key={field} data={claseFormInputs} name={field} fun={hdlChange} val={field=='Transportes' ? 'Transportes X' : undefined} stt={field=='Transportes' ? true : false}/>) 
          ))}
          <PartInputsPesos fun={getPesoIn} hdlChange={hdlChange} val={boletas}/>
        </div>
   
        <hr className="text-gray-300 mt-1" />

        <div className="mt-3 px-3 grid grid-cols-3 gap-2 justify-between max-sm:grid-rows-3 max-sm:grid-cols-1">
          <button onClick={hdlClean} className={buttonClean} disabled={isLoading} >
            Limpiar
          </button>
          <button onClick={hdlClose} className={buttonCancel} disabled={isLoading} >
            Cancelar
          </button>
          <button onClick={hdlSubmit} className={buttonSave} disabled={isLoading} >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
    </div>
    </div>
  );
};

export const ModalOut = (props) => {
  const {
    hdlClose, 
    hdlChange, 
    fillData, 
    typeBol, 
    typeStructure, 
    formBol, 
    boletas, 
    hdlSubmit, 
    move, 
    clean, 
    isLoading, 
    proceso
  } = props;
  
  const [peso, setPeso] = useState('00lb');
  const [modal, setModal] = useState(false)
  const [dataPrev, setDataPrev] = useState()

  const getPesoOut = () => {
    formBol((prev)=> ({
      ...prev, 
      'pesoOut' : peso.replaceAll('lb', ''), 
    }))
  } 

  const hdlPrevisualizar = () => {
    const pesoNeto = boletas?.pesoOut - boletas?.pesoIn;
    const tolerancia = boletas['Peso Teorico'] * 0.005;
    const desviacion = Math.abs(pesoNeto) - boletas['Peso Teorico'];
    const absDesviacion = Math.abs(Math.abs(pesoNeto) - boletas['Peso Teorico']);
      
    const data = {
      pesoNeto: Math.abs(pesoNeto),
      tolerancia: tolerancia,
      desviacion: desviacion,
      pesoInicial: boletas?.pesoIn
    };

    data.fueraTol = absDesviacion > tolerancia
    setModal(true)
    setDataPrev(data)
  };

  useEffect(() => {
    const socket = new WebSocket(URLWEBSOCKET); 
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
          <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
            <SelectFormBoletas classCss={classFormSelct} name={'Proceso'} data={fillData['Proceso']} fun={hdlChange}/>
            <SelectFormBoletas classCss={classFormSelct} name={'Producto'} data={fillData['Producto']} fun={hdlChange}/>
            <SelectFormBoletas key={clean} classCss={classFormSelct} name={'Socios'} val={boletas?.Socios} data={fillData['Clientes']} fun={hdlChange} stt={true} />
            {boletas?.Socios==-998 && <InputsFormBoletas data={claseFormInputs} name={'Cliente'} fun={hdlChange} val={boletas?.valueSocio} stt={true}/>}
            {boletas?.Socios==-999 && <InputsFormBoletas data={claseFormInputs} name={'Proveedor'} fun={hdlChange} val={boletas?.valueSocio}  stt={true}/>}
            {formInputSelect.map((field) => (boletas?.Socios !=-998 && boletas?.Socios !=-999) ? (
              <SelectFormBoletas key={field} classCss={classFormSelct} name={field} val={boletas?.[field]} data={fillData[field]} fun={hdlChange} stt={true}/>
              ) : (<InputsFormBoletas key={field} data={claseFormInputs} name={field} fun={hdlChange} val={boletas?.[field]} stt={true} /> )
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 place-content-start">
            <SelectFormBoletas classCss={classFormSelct} name={'Movimiento'} data={(boletas.Proceso===0) ? fillData['Flete'] : fillData['FleteS']} fun={hdlChange} stt={(boletas.Proceso==='')? true : false}/>
            
            {move == 'Traslado Interno' ? (
              <TransladoInterno bol={boletas} hdl={hdlChange} fill={fillData} />
            ) : move == 'Traslado Externo' ? (
              <TransladoExterno bol={boletas} hdl={hdlChange} fill={fillData} />
            ) : (
              <TransladoNormal bol={boletas} hdl={hdlChange} fill={fillData} tipo = {proceso} />
            )}
            <PartPesosDeSalida fun={getPesoOut} hdlChange={hdlChange} val={boletas} />
            <InputsFormBoletas data={claseFormInputs} name={'Peso Teorico'} fun={hdlChange} />
            {typeStructure == 0 ? typeBol==0 ? <InputsFormBoletas data={claseFormInputs} name={'Orden de compra'} fun={hdlChange} /> : <InputsFormBoletas data={claseFormInputs} name={'Documento'} fun={hdlChange} />:  ''}
            {(move == 'Traslado Interno' || move == 'Traslado Externo') ? <InputsFormBoletas data={claseFormInputs} name={'Orden de Transferencia'} fun={hdlChange} /> : ''}
            <InputsFormBoletas data={claseFormInputs} name={'Observaciones'} fun={hdlChange} />
          </div>
        </div>
        <button onClick={hdlPrevisualizar} className={buttonCalcular}>Previsualizar</button>
   
        <hr className="text-gray-300 mt-1" />

        <div className="mt-3 px-3 grid grid-cols-2 gap-2 justify-between max-sm:grid-rows-3 max-sm:grid-cols-1">
          <button onClick={hdlClose} className={buttonCancel} disabled={isLoading}>
            Cancelar
          </button>
          <button onClick={hdlSubmit} className={buttonSave} disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
    </div>
    {modal && <ModalPrevisual name={'Previsualizacion'} data={dataPrev} hdClose={()=>setModal(false)} />}
    </div>
  );
};
