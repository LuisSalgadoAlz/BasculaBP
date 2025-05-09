import { useEffect, useState } from "react";
import SelectFormBoletas from "./select";
import { InputsFormBoletas, PartInputsPesos, PartInputsPesos2, PartPesosDeSalida, TransladoExterno, TransladoInterno, TransladoNormal } from "./inputs";
import { buttonCalcular, buttonCancel, buttonClean, buttonDanger, buttonSave, claseFormInputs, classFormSelct, } from "../../constants/boletas";
import { propsMotionHijo, propsMotionPadre, URLHOST, URLWEBSOCKET } from "../../constants/global";
import { MiniSpinner, ModalPrevisual } from "../alerts";
import { motion } from "framer-motion";
import { IoCloseSharp } from "react-icons/io5";
import { ButtonPrint } from "../buttons";
import { getConvertPdf, getPrintEpson } from "../../hooks/formDataBoletas";

const clsColumn2 = 'grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-4 p-2 place-content-center'
const clsColumn1 = 'grid grid-cols-1 md:grid-cols-1 gap-x-2 gap-y-4 p-2 place-content-center'
const formInputSelect = ['Transportes', 'Placa', 'Motoristas']

const AcordeonSeccion = ({ titulo, children }) => {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="border rounded-xl mb-4">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-t-xl"
      >
        <span className="font-semibold text-gray-700">{titulo}</span>
        <span>{abierto ? "▲" : "▼"}</span>
      </button>
      {abierto && <div className="p-4 bg-white border-t">{children}</div>}
    </div>
  );
};

/**
 * Todo: Boleta espcial de casulla
 * @param {*} param0 
 * @returns 
 */
export const ModalBoletas = ({hdlClose, hdlChange, fillData, formBol, boletas, hdlSubmit, clean, isLoading, proceso}) => {
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
            <SelectFormBoletas classCss={classFormSelct} name={'Producto'} data={fillData['Producto']} fun={hdlChange}/>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 place-content-start">
            <SelectFormBoletas classCss={classFormSelct} name={'Movimiento'} data={fillData['FleteS']} fun={hdlChange} val={boletas?.Movimiento} stt={true}/>
            <TransladoNormal bol={boletas} hdl={hdlChange} fill={fillData} tipo = {proceso}/>
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

export const ModalNormal = ({ hdlClose, hdlChange, fillData, formBol, boletas, hdlClean, hdlSubmit, clean, isLoading }) => {
  const [peso, setPeso] = useState('00lb');

  const getPesoIn = () => {
    formBol((prev) => ({
      ...prev,
      'pesoIn': parseInt(peso.replaceAll('lb', '')),
    }));
  };

  useEffect(() => {
    const socket = new WebSocket(URLWEBSOCKET);
    socket.onmessage = (event) => {
      setPeso(event.data);
    };
    socket.onerror = () => setPeso('No conectada');
    return () => socket.close();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opa-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-300 space-y-5">
        
        {/* Encabezado */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Boletas</h2>
          <p className="text-sm text-gray-500">Entrada/Salida de material del {new Date().toLocaleDateString()}</p>
        </div>

        {/* Peso en tiempo real */}
        <div className="p-3 bg-gray-100 rounded-lg border text-base font-medium text-gray-700 flex justify-between">
          <span>Peso en tiempo real báscula:</span>
          <span className="font-bold text-gray-900">{peso}</span>
        </div>

        {/* Formulario principal */}
        <div className={`${boletas?.Proceso === 0 ? clsColumn2 : clsColumn1} gap-4`}>
          {/* Select Proceso */}
          <div className="col-span-2">
            <SelectFormBoletas classCss={classFormSelct} name="Proceso" data={fillData['Proceso']} fun={hdlChange} />
          </div>

          {/* Cliente / Proveedor / Socios */}
          <div className="space-y-3">
            <SelectFormBoletas key={clean} classCss={classFormSelct} name="Socios" data={fillData['Clientes']} fun={hdlChange} />

            {boletas?.Socios === -998 && ( <InputsFormBoletas data={claseFormInputs} name="Cliente" fun={hdlChange} /> )}
            {boletas?.Socios === -999 && (<InputsFormBoletas data={claseFormInputs} name="Proveedor" fun={hdlChange} /> )}

            {formInputSelect.map((field) => boletas?.Socios !== -998 && boletas?.Socios !== -999 ? (
                <SelectFormBoletas key={field} classCss={classFormSelct} name={field} data={fillData[field]} fun={hdlChange} />
              ) : (
                <InputsFormBoletas key={field} data={claseFormInputs} name={field} fun={hdlChange} val={field === 'Transportes' ? 'Transportes X' : undefined} stt={field === 'Transportes'} />
              )
            )}
          </div>
          {/* Extra inputs si Proceso === 0 */}
          {boletas?.Proceso === 0 && (
            <div className="space-y-3">
              <SelectFormBoletas classCss={classFormSelct} name="Movimiento" data={fillData['Flete']} fun={hdlChange} />
              <SelectFormBoletas classCss={classFormSelct} name="Origen" data={fillData['Origen']} fun={hdlChange} stt={!boletas?.Socios} />
              <SelectFormBoletas classCss={classFormSelct} name="Producto" data={fillData['Producto']} fun={hdlChange} />
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div>
                  <label htmlFor="NSalida" className="block text-sm text-gray-600"># Salida</label>
                  <input name="NSalida" onChange={hdlChange} className={claseFormInputs} />
                </div>
                <div>
                  <label htmlFor="NViajes" className="block text-sm text-gray-600"># Viaje</label>
                  <input name="NViajes" onChange={hdlChange} className={claseFormInputs} />
                </div>
              </div>
            </div>
          )}
          <div className="col-span-2">
            <PartInputsPesos fun={getPesoIn} hdlChange={hdlChange} val={boletas} />
          </div>
        </div>

        {/* Botones */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <button onClick={hdlClean} className={buttonClean} disabled={isLoading}>Limpiar</button>
          <button onClick={hdlClose} className={buttonCancel} disabled={isLoading}>Cancelar</button>
          <button onClick={hdlSubmit} className={buttonSave} disabled={isLoading}>
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
            {typeStructure == 0 ? typeBol==0 ? <InputsFormBoletas data={claseFormInputs} name={'Orden de compra'} fun={hdlChange} val={boletas['Orden de compra']} /> : <InputsFormBoletas data={claseFormInputs} name={'Documento'} val={boletas['Documento']} fun={hdlChange} />:  ''}
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

export const VisualizarBoletas = (props) => {
  const { hdlClose, boletas } = props;
  const [isLoadImpresion, setIsLoadImpresion] = useState(false)
  const opt = ['Entrada de material', 'Salida de material']
  const isNullData =  'Vacio'
  const pesoTolerado = boletas?.pesoTeorico * 0.005

  const handleConvertPdf = async() => {
    console.log(boletas)
    const url = `${URLHOST}boletas/pdf/bol/${boletas?.id}`;
    window.open(url, '_blank');
  }

  const handlePrint = async() => {
    const response = await getPrintEpson(boletas?.id, setIsLoadImpresion)
    console.log('Imprimiendo...')
    if(response?.msg) {
      console.log('Impresion exitosa')
    }
  } 

  const tiempoDeEstadia = () => {
    const inicio = new Date(boletas?.fechaInicio);
    const fin = new Date(boletas?.fechaFin);
  
    if (isNaN(inicio) || isNaN(fin)) return '00:00:00';
  
    const TIEMPOPROCESO = fin - inicio;
    const totalSegundos = Math.floor(TIEMPOPROCESO / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
  
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  };
  
  const TARA = (boletas?.pesoInicial && boletas?.pesoFinal) ? boletas?.proceso == 0 ? boletas?.pesoFinal : boletas?.pesoInicial : 0
  const PESOBRUTO = (boletas?.pesoInicial && boletas?.pesoFinal) ? boletas?.proceso == 0 ? boletas?.pesoInicial : boletas?.pesoFinal : 0

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 min-h-screen overflow-auto ">
      <motion.div
        initial={{ scale: 0.1, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.4, opacity: 0, y: 50 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white w-full min-w-[100vw] min-h-[100vh] max-sm:overflow-auto max-sm:min-h-[0px] shadow-lg overflow-y-auto boletas border-8 border-white p-20 max-sm:p-10"
      >
        <div className="mb-1 flex items-center justify-between gap-7">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Boleta - # {boletas?.id}</h2>
            <p className="text-sm text-gray-500">Visualización general de la boleta</p>
          </div>
          <button className="text-4xl" onClick={hdlClose}><IoCloseSharp /></button>
        </div>

        <div className="my-2 p-2 bg-gray-100 rounded-lg border border-gray-300">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-700 max-sm:text-sm">Creacion de la boleta: {boletas?.fechaFin ? new Date(boletas?.fechaFin).toLocaleString('es-ES'): 'Cargando...'}</span>
          </div>
        </div>

        {/* Contenido */}
        <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-5">
          <div className="p-4 border-2 border-gray-300 rounded-lg">
            <div className="flex flex-col gap-1">
              <span className="text-md font-bold text-gray-700">Datos de la boleta:</span>
              <hr className="text-gray-400 mb-4" />
              <span className="text-md text-gray-700">Socio: {boletas?.socio ? boletas?.socio : 'Cargando...'}</span>
              <span className="text-md text-gray-700">Transporte: {boletas?.empresa ? boletas?.empresa : 'Cargando...'}</span>
              <span className="text-md text-gray-700">Placa: {boletas?.placa ? boletas?.placa: 'Cargando...'}</span>
              <span className="text-md text-gray-700">Conductor: {boletas?.motorista? boletas?.motorista:'Cargando...'}</span>  
            </div>

            <div className="flex flex-col gap-1 mt-4">
              <span className="text-md font-bold text-gray-700">Ruta:</span>
              <hr className="text-gray-400 mb-4" />
              <span className="text-md text-gray-700">Origen : {boletas?.origen ? boletas?.origen : isNullData}</span>
              <span className="text-md text-gray-700">Destino: {boletas?.destino ? boletas?.destino : isNullData}</span>

              <span className="text-md font-bold text-gray-700 mt-4">Traslado:</span>
              <hr className="text-gray-400 mb-2" />
              <span className="text-md text-gray-700">Origen : {boletas?.trasladoOrigen ? boletas?.trasladoOrigen : isNullData}</span>
              <span className="text-md text-gray-700">Destino: {boletas?.trasladoDestino ? boletas?.trasladoDestino : isNullData}</span>
              <span className="text-md text-gray-700">Orden de transferencia: {boletas?.ordenDeTransferencia ? boletas?.ordenDeTransferencia : isNullData}</span>

            </div>
          </div>
         
          <div className="p-4 border-2 border-gray-300 rounded-lg">
            <div className="flex flex-col gap-1">
              <span className="text-md font-bold text-gray-700">Datos de la boleta:</span>
              <hr className="text-gray-400 mb-4" />
              <span className="text-md text-gray-700 border-2 p-4 rounded-sm mb-4">{parseInt(boletas?.proceso)===0 || parseInt(boletas?.proceso)===1 ? opt[parseInt(boletas?.proceso)]  : isNullData}</span>
              <span className="text-md text-gray-700">Producto: {boletas?.producto ? boletas?.producto : isNullData}</span>
              <span className="text-md text-gray-700">Movimiento: {boletas?.movimiento ? boletas?.movimiento : isNullData}</span>
              <span className="text-md text-gray-700">Manifiesto: {boletas?.manifiesto ? boletas?.manifiesto: isNullData}</span>
              <span className="text-md text-gray-700">Orden de Compra: {boletas?.ordenDeCompra ? boletas?.ordenDeCompra:isNullData}</span>
              <hr className="text-gray-400 my-4"/>
              <span className="text-md font-bold text-gray-700">Tiempos:</span>
              <span className="text-md text-gray-700">Fecha Inicial: {boletas?.fechaInicio ? new Date(boletas?.fechaInicio).toLocaleString(): isNullData}</span>
              <span className="text-md text-gray-700">Fecha Inicial: {boletas?.fechaInicio ? new Date(boletas?.fechaFin).toLocaleString(): isNullData}</span>
              <span className="text-md text-gray-700">Duracion del proceso: {tiempoDeEstadia()}</span>
            </div>
          </div>
          <div className="p-4 border-2 border-gray-300 rounded-lg">
            <div className="flex flex-col gap-1">
              <span className="text-md font-bold text-gray-700">Datos del Peso:</span>
              <hr className="text-gray-400 mb-4" />

              {boletas?.estado =='Completado' ? (
                <span className="text-md text-white border-2 p-4 bg-green-900 rounded-sm mb-4">{boletas?.estado}</span>
              ):(boletas?.estado=='Cancelada' ? (<span className="text-md text-white border-2 p-4 bg-yellow-900 rounded-sm mb-4">{boletas?.estado}</span>):(<span className="text-md text-white border-2 p-4 bg-red-900 rounded-sm mb-4">{boletas?.estado}</span>))}

              <span className="text-md text-gray-700 flex justify-between"><span>Peso Tara:</span><span>{TARA} lb</span></span>
              <span className="text-md text-gray-700 flex justify-between"><span>Peso Bruto:</span><span>{PESOBRUTO} lb</span></span>
              <hr className="text-gray-400"/>
              <span className="text-md text-gray-700 flex justify-between"><span>Peso Neto:</span><span>{boletas?.pesoNeto ? boletas?.pesoNeto :0} lb</span></span>
              <span className="text-md text-gray-700 flex justify-between"><span>Peso Teorico:</span><span>{boletas?.pesoTeorico ? boletas?.pesoTeorico: 0} lb</span></span>
              <hr className="text-gray-400" />
              <span className="text-md text-gray-700 flex justify-between"><span>Desviación:</span><span>{boletas?.desviacion ? boletas?.desviacion:0} lb</span></span>
              <hr className="text-gray-400 my-2" />
              <span className="text-md text-gray-700 flex justify-between"><span>(Nota: Peso Tolerado)</span><span>± {pesoTolerado}</span></span>
              <span className="text-md text-gray-700 mt-8">Observaciones: </span>  
              <span className="text-md text-gray-700 border-2 border-gray-200 p-2">🔺{boletas?.observaciones ? boletas?.observaciones : isNullData}</span>
            </div>
          </div>
        </div>

        {/* Impresiones */}
        <div className="flex items-center justify-end gap-2 mt-4">
          {boletas?.estado !='Cancelada' && (
            <>
              <button className={buttonClean} onClick={handleConvertPdf}>Convertir a PDF</button>
              <ButtonPrint name={'Imprimir'} fun={handlePrint} isLoad={isLoadImpresion}/>
            </>
          )} 
        </div>
      </motion.div>
    </div>
  );
};

export const CancelarBoleta = (props) => {
  const { 
    boletas,
    hdlClose, 
    hdlSubmitCancel,
    hdlChange,
    isLoad
  }  = props

  return (
    <motion.div {...propsMotionPadre} className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-40 min-h-screen overflow-auto bg-opa-50">
      <motion.div {...propsMotionHijo} className="bg-white min-w-[20vw] min-h-[20vh] max-w-[40vw] rounded-2xl max-sm:overflow-auto max-sm:min-h-[0px] shadow-lg overflow-y-auto boletas border-8 border-white px-10 py-5 max-sm:p-10">
        <div className="mb-1 flex justify-between gap-7">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Cancelar Boleta: #{boletas?.Id} / {boletas?.Placa}</h2>
            <p className="text-sm text-gray-500">Advertencia: Estás a punto de cancelar una boleta de peso de carga. Esta acción es crítica y no se puede deshacer. </p>
          </div>
          <div className="items-start h-full">
            <button className="text-4xl" onClick={hdlClose}><IoCloseSharp /></button>
          </div>
        </div>
        
        <div className="mt-4">
          <InputsFormBoletas data={claseFormInputs} name={'Motivo'} fun={hdlChange}/>
        </div>

        <div className="mt-4 flex justify-end">
          <button disabled={isLoad} className={buttonDanger} onClick={hdlSubmitCancel}>{!isLoad ? <span>Cancelar Boleta</span> : <MiniSpinner />}</button>
        </div>
      </motion.div>
    </motion.div>
  );
};