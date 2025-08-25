import { useEffect, useState } from "react";
import SelectFormBoletas from "./select";
import { InputsFormBoletas, PartInputsPesos, PartInputsPesos2, PartPesosDeSalida, TransladoExterno, TransladoInterno, TransladoNormal } from "./inputs";
import { buttonCalcular, buttonCancel, buttonClean, buttonDanger, buttonSave, claseFormInputs, classFormSelct, deptos, direccionOrigenEmpresa, } from "../../constants/boletas";
import { propsModalPrevisual, propsModalPrevisualHijo, propsMotionHijo, propsMotionPadre, URLHOST, URLWEBSOCKET } from "../../constants/global";
import { MiniSpinner, ModalPrevisual, SkeletonBoleta, SkeletonModalOut, Spinner } from "../alerts";
import { motion } from "framer-motion";
import { IoCloseSharp, IoAlertCircleOutline, IoScaleOutline } from "react-icons/io5"; 
import { ButtonPrint } from "../buttons";
import { getPrintEpson, getToleranciaValue } from "../../hooks/formDataBoletas";
import { CiLock } from "react-icons/ci";
import { CiUnlock } from "react-icons/ci";
import { Toaster, toast } from 'sonner';
import { IoIosArrowDown, IoIosArrowUp, IoIosArrowForward, IoMdClose   } from "react-icons/io";

const formInputSelect = ['Transportes', 'Placa', 'Furgon', 'Motoristas']
const guardiaValidacion = [{id: 1, nombre: 'Si'}, {id: 2, nombre: 'No'}]


const PrevisualizarPesoNeto = ({ pn, hdlClose, unidad = "lb" }) => {
  const [animateValue, setAnimateValue] = useState(0);
  
  useEffect(() => {
    // Animación del valor numérico
    const timer = setTimeout(() => {
      setAnimateValue(parseFloat(pn));
    }, 50);
    
    return () => clearTimeout(timer);
  }, [pn]);

  return (
    <motion.div className="fixed inset-0 flex items-center justify-center bg-opa-50 bg-opacity-60 z-50 p-4 backdrop-blur-sm" {...propsModalPrevisual}>
      <motion.div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden" {...propsModalPrevisualHijo} >
        {/* Header */}
        <div className="bg-[#5A3F27] text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center">
            <IoScaleOutline className="mr-2 text-2xl" />
            Detalle de Peso
          </h2>
          <button 
            className="text-white hover:bg-[#795e47] p-1 rounded-full transition-colors"
            onClick={hdlClose}
            aria-label="Cerrar"
          >
            <IoCloseSharp className="text-3xl" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col mb-6">
            <div className="text-gray-600 text-sm uppercase tracking-wide mb-1">Peso Neto</div>
            <div className="flex items-baseline">
              <motion.span 
                className="text-4xl font-bold text-gray-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {animateValue.toLocaleString(undefined, { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </motion.span>
              <span className="ml-2 text-xl text-gray-500">{unidad}</span>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="bg-gray-100 rounded-lg py-4 mb-6">
            <div className="text-sm text-gray-600">
              <p><strong>Nota:</strong> El peso neto corresponde al peso final después de restar el peso bruto y tara.</p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-end">
            <button 
              onClick={hdlClose}
              className="bg-[#5A3F27] hover:bg-[#9c7c60] text-white py-2 px-6 rounded-lg font-medium transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
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
  const [modalPesoNeto, setModalPesoNeto] = useState(false)
  const [pesoNeto, setPesoNeto] = useState(0)

  const getPesoOut = () => {
    formBol((prev)=> ({
      ...prev, 
      'pesoOut' : peso.replaceAll('lb', ''), 
    }))
  } 

  const closeModal = () => {
    setModalPesoNeto(false)
  }

  const hdlPrevisualizar = async() => {
    const pesoNeto = boletas?.pesoOut - boletas?.pesoIn;
    setPesoNeto(pesoNeto)
    setModalPesoNeto(true) 
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
            {formInputSelect.map((field) => (boletas?.Socios !=-998 && boletas?.Socios !=-999 && field !== 'Furgon') ? 
              (
                <SelectFormBoletas key={field} classCss={classFormSelct} name={field} data={fillData[field]} fun={hdlChange} />
                ) : (
                  field !=='Furgon' && (
                    <InputsFormBoletas key={field} data={claseFormInputs} name={field} fun={hdlChange} val={boletas?.[field]} /> 
                )
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
        
        <button onClick={hdlPrevisualizar}  className={buttonCalcular}>Previsualizar</button>

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
      {modalPesoNeto && <PrevisualizarPesoNeto pn={pesoNeto} hdlClose={closeModal}/>}
    </div>
  );
};

/**
 * !Importante seguir probando se realizaron cambios, en la estructura
 * @param {*} param0 
 * @returns 
 */
export const ModalNormal = ({ hdlClose, hdlChange, fillData, formBol, boletas, hdlClean, hdlSubmit, clean, isLoading, setAddMarchamos, marchamos }) => {
  const [peso, setPeso] = useState('00lb');
  const [itemSelect, setItemSelect] = useState(false)
  const [openMarchamos, setOpenMarchamos] = useState(false)
  
  /* Props de hijos */
  const propsAddMarchamos = {setAddMarchamos, marchamos, setOpenMarchamos}

  const getPesoIn = () => {
    formBol((prev) => ({
      ...prev,
      'pesoIn': parseInt(peso.replaceAll('lb', '')),
    }));
  };

  const handleKeyDown = (e) => {
    const forbiddenKeys = ['e', 'E', '+', '-', '.', ','];
    if (forbiddenKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    const socket = new WebSocket(URLWEBSOCKET);
    socket.onmessage = (event) => {
      setPeso(event.data);
    };
    socket.onerror = () => setPeso('No conectada');
    return () => socket.close();
  }, []);

  const tipoDeSocioOrigen = () => {
    return (boletas?.Socios ==-998 || boletas?.Socios ==-999) ? deptos : fillData['Origen']
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opa-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-4 shadow-2xl max-h-[95vh] overflow-y-auto border border-gray-300 space-y-1">
        
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
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-4 place-content-center'>
          {/* Select Proceso */}
          <div className="col-span-2">
            <SelectFormBoletas classCss={classFormSelct} name="Proceso" data={fillData['Proceso']} fun={hdlChange} />
          </div>

          {/* Cliente / Proveedor / Socios */}
          <div className="col-span-2 space-y-3 border-2 border-gray-200 rounded-md w-full p-1">
            <button className="p-2 bg-gray-200 rounded-sm w-full flex items-center gap-2" onClick={()=>setItemSelect(false)}><span className="text-sm">Informacion Socio</span></button>
            {(!itemSelect || boletas?.Proceso===1) && (
              <>
                <div className="grid grid-cols-2 space-y-1">
                  <SelectFormBoletas key={clean} classCss={classFormSelct} name="Socios" data={fillData['Clientes']} fun={hdlChange} val={boletas?.Socios} stt={boletas?.Proceso!==''? false: true}/>
                  {boletas?.Socios === -998 && ( <InputsFormBoletas data={claseFormInputs} name="Cliente" fun={hdlChange} val={boletas?.Cliente}/> )}
                  {boletas?.Socios === -999 && (<InputsFormBoletas data={claseFormInputs} name="Proveedor" fun={hdlChange} val={boletas?.Proveedor}/> )}

                  {formInputSelect.map((field) => (
                    boletas?.Socios !== -998 && boletas?.Socios !== -999 ? (
                      field === 'Furgon' ? (
                        fillData['Rastras']?.some(r => r.placa === boletas?.Placa) && (
                          <SelectFormBoletas
                            key={field}
                            classCss={classFormSelct}
                            name={field}
                            data={fillData['Furgones']}
                            fun={hdlChange}
                            val={boletas?.Furgon}
                          />
                        )
                      ) : (
                        <SelectFormBoletas
                          key={field}
                          classCss={classFormSelct}
                          name={field}
                          data={fillData[field]}
                          fun={hdlChange}
                          val={boletas[field]}
                          stt={boletas?.Proceso !== '' ? false : true}
                        />
                      )
                    ) : (
                      field !== 'Furgon' && (
                        <InputsFormBoletas
                          key={field}
                          data={claseFormInputs}
                          name={field}
                          fun={hdlChange}
                          val={field === 'Transportes' ? 'Transportes X' : boletas[field]}
                          stt={field === 'Transportes'}
                        />
                      )
                    )
                  ))}

                  <PartInputsPesos fun={getPesoIn} hdlChange={hdlChange} val={boletas} />
                </div>
              </>
            )}
          </div>
          {/* Extra inputs si Proceso === 0 */}
          <div className="col-span-2 space-y-3 border-2 border-gray-200 rounded-md w-full p-1">
            <button className="p-2 bg-gray-200 rounded-sm w-full flex items-center gap-2" 
              onClick={()=>setItemSelect(true)} disabled={boletas?.Proceso===0 ? false: true}>
              {boletas?.Proceso===0 ? <CiUnlock className="text-green-600" /> : <CiLock className="text-red-600"/>}
              <span className="text-sm">Detalles Entradas{boletas?.Proceso===0 && <span className="text-black font-bold">: Campos Obligatorios</span>} </span>
            </button>

            {itemSelect && boletas?.Proceso===0 &&(
              <>
                <div className="grid grid-cols-2 space-y-1">
                  <SelectFormBoletas classCss={classFormSelct} name="Movimiento" data={fillData['Flete']} fun={hdlChange} val={boletas?.Movimiento}/>
                  {(boletas?.Movimiento==2 || boletas?.Movimiento == 15) && (
                    <SelectFormBoletas classCss={classFormSelct} name="Factura" data={fillData['FacturaFinal']} fun={hdlChange} val={boletas['Factura']}/>
                  )}
                  {(boletas?.Movimiento === 10 || boletas?.Movimiento===11) ? (
                    <>
                      <InputsFormBoletas data={claseFormInputs} name={'Documento'} val={boletas['Documento']} fun={hdlChange} />
                      <SelectFormBoletas classCss={classFormSelct} name="Traslado Origen" data={boletas?.Movimiento===10 ? fillData['TransladosI'] : fillData['TransladosE']} fun={hdlChange} val={boletas['Traslado Origen']}/>
                    </>
                  ) : ( 
                    <SelectFormBoletas classCss={classFormSelct} name="Origen" data={tipoDeSocioOrigen()} fun={hdlChange} val={boletas?.Origen}/>
                  )}
                  <SelectFormBoletas classCss={classFormSelct} name="Producto" data={fillData['Producto']} fun={hdlChange} val={boletas?.Producto}/>
                </div>
                {
                  /**
                   * !Imporatnte: esto se debera de cambiar a algo mas sustancial, que sea migratorio
                   */
                }
                {(boletas?.Movimiento==2) &&(
                  <>
                    <div className="grid grid-cols-6 gap-3 mt-2 mb-4 bg-gray-50 p-4 rounded-2xl max-sm:grid-cols-2 max-sm:gap-1 shadow">
                      <div className="col-span-2">
                        <label htmlFor="NSalida" className="block text-sm text-gray-600"># Salida</label>
                        <input type="number" name="NSalida" onChange={hdlChange} onKeyDown={handleKeyDown} className={claseFormInputs} value={boletas?.NSalida} />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="NViajes" className="block text-sm text-gray-600"># Viaje</label>
                        <input type="number" name="NViajes" onChange={hdlChange} onKeyDown={handleKeyDown} className={claseFormInputs} value={boletas?.NViajes}/>
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="Nbodega" className="block text-sm text-gray-600"># Bodega</label>
                        <input type="text" name="Nbodega" onChange={hdlChange} className={claseFormInputs} value={boletas?.Nbodega}/>
                      </div>
                      <div className="col-span-3 max-sm:col-span-2">
                        <label htmlFor="FechaPuerto" className="block text-sm text-gray-600">Fecha: Puerto</label>
                        <input name="FechaPuerto" max={new Date().toISOString().split("T")[0]} onChange={hdlChange} type="date" className={`${claseFormInputs} p-3`} value={boletas?.FechaPuerto}/>
                      </div>
                      <div className="col-span-3 max-sm:col-span-2">
                        <label htmlFor="TolvaAsignada" className="block text-sm text-gray-600"># Tolva</label>
                        <select name="TolvaAsignada" className={`${claseFormInputs} p-3`} onChange={hdlChange} value={boletas?.TolvaAsignada}>
                          <option value=''>Seleccione una tolva</option>
                          <option value={1}>Tolva 1</option>
                          <option value={2}>Tolva 2</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
                {(boletas?.Movimiento==15) &&(
                  <>
                    <div className="grid grid-cols-6 gap-3 mt-2 mb-4 bg-gray-50 p-4 rounded-2xl max-sm:grid-cols-2 max-sm:gap-1 shadow">
                      <div className="col-span-4">
                        <label htmlFor="contenedor" className="block text-sm text-gray-600">Contenedor</label>
                        <input type="text" name="contenedor" onChange={hdlChange} onKeyDown={handleKeyDown} className={claseFormInputs} value={boletas?.contenedor} />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="NViajes" className="block text-sm text-gray-600">Sacos teoricos</label>
                        <input type="number" name="sacosDeOrigen" onChange={hdlChange} onKeyDown={handleKeyDown} className={claseFormInputs} value={boletas?.sacosDeOrigen}/>
                      </div>
                      <div className="col-span-6">
                        <label htmlFor="Nbodega" className="block text-sm text-gray-600">Marchamo de origen</label>
                        <input type="text" name="marchamoOrigen" onChange={hdlChange} className={claseFormInputs} value={boletas?.marchamoOrigen}/>
                      </div>
                    </div>
                  </>
                )}
                {(boletas?.Movimiento==2 || boletas?.Movimiento == 15) && (
                  <>
                    <button 
                      className={buttonCalcular}
                      onClick={()=>setOpenMarchamos(true)}>
                      Agregar Marchamos
                    </button>
                  </>
                )}
                {openMarchamos && <AgregarMarchamos {...propsAddMarchamos}/>}
              </>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="grid grid-cols-3 gap-3 text-sm mt-4 max-sm:grid-cols-1">
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


/**
 * TODO: Actualmente se esta trabaajando aqui
 * @param {*} props 
 * @returns 
 */
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
    isLoadingDataOut, 
    proceso,
    setAddMarchamos, 
    marchamos
  } = props;
  
  const [peso, setPeso] = useState('00lb');
  const [modal, setModal] = useState(false)
  const [dataPrev, setDataPrev] = useState()
  const [openMarchamos, setOpenMarchamos] = useState(false)
  const [openDocumento, setOpenDocumento] = useState(false)
  const [openImpContenerizada, setOpenImpContenerizada] = useState(false)

  const getPesoOut = () => {
    formBol((prev)=> ({
      ...prev, 
      'pesoOut' : peso.replaceAll('lb', ''), 
    }))
  } 

  const hdlPrevisualizar = async() => {

    const { valor } = await getToleranciaValue()

    const pesoNeto = boletas?.pesoOut - boletas?.pesoIn;
    const tolerancia = boletas['Peso Teorico'] * valor;
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

  const propsAddMarchamos = {setAddMarchamos, marchamos, setOpenMarchamos}

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 sm:p-6 min-h-screen bg-opa-50">
      <div className="bg-white w-full max-w-5xl rounded-2xl p-2 shadow-lg sm:w-[90%] md:w-[80%] lg:w-[60%] max-h-[95vh] overflow-y-auto boletas border-8 border-white">
        {isLoadingDataOut ? (
          <SkeletonModalOut />
        ) : (
          <>
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
                <SelectFormBoletas classCss={classFormSelct} name={'Proceso'} data={fillData['Proceso']} fun={hdlChange} val={boletas?.Proceso} stt={true}/>
                <SelectFormBoletas classCss={classFormSelct} name={'Producto'} data={fillData['Producto']} fun={hdlChange} val={boletas?.Producto} stt={boletas?.Proceso === 0}/>
                <SelectFormBoletas key={clean} classCss={classFormSelct} name={'Socios'} val={boletas?.Socios} data={fillData['Clientes']} fun={hdlChange} stt={true} />
                {boletas?.Socios==-998 && <InputsFormBoletas data={claseFormInputs} name={'Cliente'} fun={hdlChange} val={boletas?.valueSocio} stt={true}/>}
                {boletas?.Socios==-999 && <InputsFormBoletas data={claseFormInputs} name={'Proveedor'} fun={hdlChange} val={boletas?.valueSocio}  stt={true}/>}
                {formInputSelect.map((field) => (
                  boletas?.Socios !=-998 && boletas?.Socios !=-999) ? (
                    field === 'Furgon' ? (
                        fillData['Rastras']?.some(r => r.placa === boletas?.Placa) && (
                          <SelectFormBoletas
                            key={field}
                            classCss={classFormSelct}
                            name={field}
                            data={fillData['Furgones']}
                            fun={hdlChange}
                            val={boletas?.Furgon}
                            stt={true}
                          />
                        )
                      ) : (
                        <SelectFormBoletas key={field} classCss={classFormSelct} name={field} val={boletas?.[field]} data={fillData[field]} fun={hdlChange} stt={true}/>
                      )                  
                  ) : (
                    field !== 'Furgon' && (
                      <InputsFormBoletas key={field} data={claseFormInputs} name={field} fun={hdlChange} val={boletas?.[field]} stt={true} />
                    )
                  )
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 place-content-start">
                <SelectFormBoletas classCss={classFormSelct} name={'Movimiento'} val={boletas?.Movimiento} 
                data={(boletas.Proceso===0) ? fillData['Flete'] : fillData['FleteS']} fun={hdlChange} 
                stt={(boletas.Proceso===0)? true : false}/>
                
                {move == 'Traslado Interno' ? (
                  <TransladoInterno bol={boletas} hdl={hdlChange} fill={fillData} />
                ) : move == 'Traslado Externo' ? (
                  <TransladoExterno bol={boletas} hdl={hdlChange} fill={fillData} />
                ) : (
                  <TransladoNormal bol={boletas} hdl={hdlChange} fill={fillData} tipo = {boletas?.Proceso} />
                )}
                <PartPesosDeSalida fun={getPesoOut} hdlChange={hdlChange} val={boletas} />
                <InputsFormBoletas data={claseFormInputs} name={'Peso Teorico'} fun={hdlChange} />
                {(move == 'Traslado Interno' || move == 'Traslado Externo') ? <InputsFormBoletas data={claseFormInputs} name={'Orden de Transferencia'} fun={hdlChange} /> : ''}
                {typeStructure == 0 ? (
                  typeBol == 0 ? (
                    move == "Traslado Interno" || move == "Traslado Externo" ? (
                      <>
                        <InputsFormBoletas
                          data={claseFormInputs}
                          name={"Documento"}
                          val={boletas["Documento"]}
                          fun={hdlChange}
                        />
                        {boletas?.Socios=== 1 && (
                          <>
                            <button
                                type="button"
                                onClick={()=> setOpenDocumento(!openDocumento)}
                                className="text-xs flex gap-1 items-center text-gray-500 hover:text-gray-700 transition-all duration-200 self-start col-span-2 my-1 text-left"
                              >
                                <span >{openDocumento ? <IoIosArrowDown  /> : <IoIosArrowForward />}</span>
                                {openDocumento ? 'Ocultar documento auxiliar' : 'Agregar documento auxiliar'}
                              </button>
                            {openDocumento && (
                              <>
                                <label htmlFor="" className="block mb-2 text-sm font-medium text-gray-900">Documento Auxiliar</label>
                                <input type="text" placeholder="Agregar manifiesto auxiliar" className={claseFormInputs} name="documentoAgregado" onChange={hdlChange} value={boletas["documentoAgregado"]} />
                              </>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <InputsFormBoletas
                        data={claseFormInputs}
                        name={"Orden de compra"}
                        fun={hdlChange}
                        val={boletas["Orden de compra"]}
                      />
                    )
                  ) : (
                    <>
                      <InputsFormBoletas
                        data={claseFormInputs}
                        name={"Documento"}
                        val={boletas["Documento"]}
                        fun={hdlChange}
                      />
                      {boletas?.Socios== 1 && (
                        <>
                          <button
                                type="button"
                                onClick={()=> setOpenDocumento(!openDocumento)}
                                className="text-xs flex gap-1 items-center text-gray-500 hover:text-gray-700 transition-all duration-200 self-start col-span-2 my-1 text-left"
                              >
                                <span >{openDocumento ? <IoIosArrowDown  /> : <IoIosArrowForward />}</span>
                                {openDocumento ? 'Ocultar documento auxiliar' : 'Agregar documento auxiliar'}
                              </button>
                            {openDocumento && (
                              <>
                                <label htmlFor="" className="block mb-2 text-sm font-medium text-gray-900">Documento Auxiliar</label>
                                <input type="text" placeholder="Agregar manifiesto auxiliar" className={claseFormInputs} name="documentoAgregado" onChange={hdlChange} value={boletas["documentoAgregado"]} />
                              </>
                            )}
                        </>
                      )}
                    </>
                  )
                ) : (
                  ""
                )}
              </div>
            </div>

            <div className="px-2 grid grid-cols-2 mt-2 bg-gray-100 py-3 rounded-2xl shadow-sm gap-1.5">              
              {/* Sale hoy, Agregado. */}
              {(boletas?.Socios === 1 && boletas?.Proceso ===1) ? (
                <SelectFormBoletas classCss={classFormSelct} name={'¿Sale hoy?'} data={guardiaValidacion} fun={hdlChange} val={boletas?.isExit}/>
              ) : (null)}
              <InputsFormBoletas data={claseFormInputs} name={'Observaciones'} fun={hdlChange} />
            </div>

            <div className={`px-3 flex`}>
              <button onClick={hdlPrevisualizar} className={buttonCalcular}>Previsualizar</button>
              {
                boletas?.Proceso == 1 && <button className={buttonCalcular} onClick={()=>setOpenMarchamos(true)}> Agregar Marchamos </button>
              }
              {
                (boletas?.Proceso == 0 && boletas?.Movimiento == 15) && <button className={buttonCalcular} onClick={()=>setOpenImpContenerizada(true)}> Importacion contenerizada </button>
              }
            </div>
      
            <hr className="text-gray-300 mt-1" />

            <div className="mt-3 px-3 grid grid-cols-2 gap-2 justify-between max-sm:grid-rows-3 max-sm:grid-cols-1">
              <button onClick={hdlClose} className={buttonCancel} disabled={isLoading}>
                Cancelar
              </button>
              <button onClick={hdlSubmit} className={buttonSave} disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            {openMarchamos && <AgregarMarchamos {...propsAddMarchamos}/>}
            {openImpContenerizada && <FormImportacionesContenerizada setOpenContenedor={setOpenImpContenerizada} boletas={boletas} hdlChange={hdlChange}/>}
          </>
        )}
      </div>
      {modal && <ModalPrevisual name={'Previsualizacion'} data={dataPrev} hdClose={()=>setModal(false)} />}
    </div>
  );
};

export const VisualizarBoletas = (props) => {
  const { hdlClose, boletas, isLoad } = props;
  const [isLoadingYellow, setIsLoadingYellow] = useState(false);
  const [isLoadingGreen, setIsLoadingGreen] = useState(false);
  const [isLoadingPink, setIsLoadingPink] = useState(false);
  
  const opt = ['Entrada de material', 'Salida de material'];
  const isNullData = 'N/A';
  const pesoTolerado = boletas?.pesoTeorico * boletas?.porTolerancia;

  const handleConvertPdf = async() => {
    console.log(boletas);
    const url = `${URLHOST}boletas/pdf/bol/${boletas?.id}`;
    window.open(url, '_blank');
  };

  const handlePrintYellow = async() => {
    const response = await getPrintEpson(boletas?.id, setIsLoadingYellow, 'yellow');
    if(response?.msg) toast.success('SE IMPRIMIO CORRECTAMENTE BOLETA AMARILLA');
  };

  const handlePrintGreen = async() => {
    const response = await getPrintEpson(boletas?.id, setIsLoadingGreen, 'green');
    if(response?.msg) toast.success('SE IMPRIMIO CORRECTAMENTE BOLETA VERDE');
  };

  const handlePrintPink = async() => {
    const response = await getPrintEpson(boletas?.id, setIsLoadingPink, 'pink');
    if(response?.msg) toast.success('SE IMPRIMIO CORRECTAMENTE BOLETA ROSADA');
  };

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
  
  let TARA;
  let PESOBRUTO;

  const isServicioBascula = boletas?.proceso === 0 && (boletas?.idMovimiento ===12)
  const isEspecialTraslado = boletas?.proceso === 0 && (boletas?.idMovimiento === 10 || boletas?.idMovimiento === 11);
  console.log(boletas)
  if(isServicioBascula) {
    TARA = boletas?.pesoInicial;
    PESOBRUTO = boletas?.pesoFinal;
  } else {
    TARA = isEspecialTraslado ? boletas?.pesoInicial : ((boletas?.pesoInicial && boletas?.pesoFinal) ? boletas?.proceso == 0 ? boletas?.pesoFinal : boletas?.pesoInicial : 0);
    PESOBRUTO = isEspecialTraslado ? boletas?.pesoFinal : ((boletas?.pesoInicial && boletas?.pesoFinal) ? boletas?.proceso == 0 ? boletas?.pesoInicial : boletas?.pesoFinal : 0);
  }

  const getEstadoStyle = (estado) => {
    switch(estado) {
      case 'Completado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between py-1">
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      <span className="text-sm text-gray-900 sm:text-right">{value || isNullData}</span>
    </div>
  );

  const InfoSection = ({ title, children, className = "" }) => (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-50 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full h-full overflow-hidden"
      >
        {isLoad ? (
          <div className="p-6">
            <SkeletonBoleta />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6 lg:px-8 lg:py-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Boleta # {boletas?.numBoleta}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Visualización general de la boleta
                  </p>
                </div>
                <button 
                  className="self-end sm:self-center text-gray-400 hover:text-gray-600 transition-colors p-1 noCalendar"
                  onClick={hdlClose}
                >
                  <IoCloseSharp size={28} />
                </button>
              </div>
              
              {/* Fecha de creación */}
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <span className="text-sm sm:text-base font-medium text-gray-700">
                  Creación de la boleta: {boletas?.fechaFin ? new Date(boletas?.fechaFin).toLocaleString('es-ES') : 'Cargando...'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:px-8 lg:py-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                
                {/* Datos de la boleta y Ruta */}
                <InfoSection title="Información General" className="lg:col-span-1">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Datos de la boleta</h4>
                      <div className="space-y-1 pl-2">
                        <InfoRow label="Socio" value={boletas?.socio} />
                        <InfoRow label="Transporte" value={boletas?.empresa} />
                        <InfoRow label="Placa" value={boletas?.placa} />
                        <InfoRow label="Furgon" value={boletas?.furgon} />
                        <InfoRow label="Conductor" value={boletas?.motorista} />
                        <InfoRow label="Factura" value={boletas?.factura} />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Ruta</h4>
                      <div className="space-y-1 pl-2">
                        <InfoRow label="Origen" value={boletas?.origen} />
                        <InfoRow label="Destino" value={boletas?.destino} />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Traslado</h4>
                      <div className="space-y-1 pl-2">
                        <InfoRow label="Origen" value={boletas?.trasladoOrigen} />
                        <InfoRow label="Destino" value={boletas?.trasladoDestino} />
                        <InfoRow label="Orden de transferencia" value={boletas?.ordenDeTransferencia} />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Datos de Tolva</h4>
                      <div className="space-y-1 pl-2">
                        <InfoRow label="Tolva" value={boletas?.tolvaAsignada} />
                        <InfoRow 
                          label="Silos" 
                          value={[boletas?.tolva[0]?.principal?.nombre, boletas?.tolva[0]?.secundario?.nombre, boletas?.tolva[0]?.terciario?.nombre]
                            .filter(Boolean)
                            .join(', ')
                          } 
                        />
                      </div>
                    </div>
                  </div>
                </InfoSection>

                {/* Detalles del proceso */}
                <InfoSection title="Detalles del Proceso" className="lg:col-span-1">
                  <div className="space-y-4">
                    <div>
                      <div className={`p-3 rounded-lg border text-center font-medium ${getEstadoStyle(boletas?.proceso)}`}>
                        {parseInt(boletas?.proceso) === 0 || parseInt(boletas?.proceso) === 1 ? opt[parseInt(boletas?.proceso)] : isNullData}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <InfoRow label="Producto" value={boletas?.producto} />
                      <InfoRow label="Movimiento" value={boletas?.movimiento} />
                      <InfoRow label="Manifiesto" value={boletas?.manifiesto} />
                      <InfoRow label="Manifiesto de agregado" value={boletas?.manifiestoDeAgregado} />
                      <InfoRow label="Orden de Compra" value={boletas?.ordenDeCompra} />
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Tiempos</h4>
                      <div className="space-y-1 pl-2">
                        <InfoRow label="Fecha Inicial" value={boletas?.fechaInicio ? new Date(boletas?.fechaInicio).toLocaleString() : isNullData} />
                        <InfoRow label="Fecha Final" value={boletas?.fechaFin ? new Date(boletas?.fechaFin).toLocaleString() : isNullData} />
                        <InfoRow label="Duración del proceso" value={tiempoDeEstadia()} />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Datos Puerto</h4>
                      <div className="space-y-1 pl-2">
                        <InfoRow label="Bodega" value={boletas?.bodegaPuerto} />
                        <InfoRow label="Fecha de despacho" value={boletas?.fechaDespachoPuerto?.split("T")[0]} />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Marchamos</h4>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        <span className="font-medium">Sellos: </span>
                        <span className="text-gray-700">
                          {[boletas?.sello1, boletas?.sello2, boletas?.sello3, boletas?.sello4, boletas?.sello5, boletas?.sello6]
                            .filter(Boolean)
                            .join(', ') || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </InfoSection>

                {/* Datos del peso */}
                <InfoSection title="Datos del Peso" className="lg:col-span-2 xl:col-span-1">
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border text-center font-semibold ${getEstadoStyle(boletas?.estado)}`}>
                      {boletas?.estado || 'Sin estado'}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Peso Tara:</span>
                        <span className="font-semibold text-gray-900">{TARA} lb</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Peso Bruto:</span>
                        <span className="font-semibold text-gray-900">{PESOBRUTO} lb</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-600">Peso Neto:</span>
                        <span className="font-bold text-gray-900">{boletas?.pesoNeto || 0} lb</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="font-medium text-gray-600">Peso Teórico:</span>
                        <span className="font-semibold text-gray-900">{boletas?.pesoTeorico || 0} lb</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-t border-gray-200">
                        <span className="font-medium text-gray-600">Desviación:</span>
                        <span className="font-semibold text-gray-900">{boletas?.desviacion || 0} lb</span>
                      </div>
                      <div className="flex justify-between items-center py-2 text-sm">
                        <span className="text-gray-500">(Peso Tolerado)</span>
                        <span className="font-medium text-gray-700">± {parseFloat(pesoTolerado).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-medium text-gray-700 mb-2">Observaciones</h4>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 min-h-[60px]">
                        {boletas?.observaciones || 'Sin observaciones'}
                      </div>
                    </div>
                  </div>
                </InfoSection>
              </div>
            </div>

            {/* Footer con botones de impresión */}
            {boletas?.estado !== 'Cancelada' && (
              <div className="bg-white border-t border-gray-200 p-6 lg:px-4 lg:py-4 shadow-sm">
                <div className="w-full">
                  <div className="flex flex-col sm:flex-row gap-3 sm:justify-end bg-red">
                  <ButtonPrint 
                    name="Imprimir Pase de Salida" 
                    fun={handlePrintYellow} 
                    isLoad={isLoadingYellow} 
                    color="bg-yellow-500 hover:bg-yellow-600"
                  />
                  <ButtonPrint 
                    name="Imprimir Rosada" 
                    fun={handlePrintPink} 
                    isLoad={isLoadingPink} 
                    color="bg-pink-500 hover:bg-pink-600"
                  />
                  <ButtonPrint 
                    name="Imprimir Verde" 
                    fun={handlePrintGreen} 
                    isLoad={isLoadingGreen} 
                    color="bg-green-500 hover:bg-green-600"
                  />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: { 
              background: '#374151', 
              color: 'white' 
            }
          }} 
        />
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


const AgregarMarchamos = ({ marchamos = [], setAddMarchamos, setOpenMarchamos }) => {
  const [cuerpo, setCuerpo] = useState('')

  const handleNewMarchamo = () => {
    if (cuerpo.trim() === '') return
    if (cuerpo.length != 6) return
    if (marchamos.length==6) return
    const nuevosMarchamos = [...marchamos, cuerpo]
    setAddMarchamos(nuevosMarchamos)
    setCuerpo('')
  }

  const handleChangeCuerpo = (e) => {
    const { value } = e.target
    if(value.length > 6) return
    if(value<0) return
    setCuerpo(e.target.value)
  }

  const handleKeyDown = (e) => {
    const forbiddenKeys = ['e', 'E', '+', '-', '.', ','];
    if (forbiddenKeys.includes(e.key)) {
      e.preventDefault();
    }
} ;

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNewMarchamo()
    }
  }

  const handleRemoveMarchamo = (indexToRemove) => {
    const nuevosMarchamos = marchamos.filter((_, index) => index !== indexToRemove)
    setAddMarchamos(nuevosMarchamos)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="mb-2">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Adicionar Marchamos</h2>
        </div>

        {/* Input Section */}
        <div className="mb-6">
          <div className="relative">
            <input
              className="w-full text-sm px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400"
              placeholder="Ingrese nuevo marchamo..."
              value={cuerpo}
              type="number"
              onChange={handleChangeCuerpo}
              onKeyDown={handleKeyDown}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={handleNewMarchamo}
              disabled={cuerpo.trim() === ''}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#725033] hover:bg-[#68513d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Lista de Marchamos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              Marchamos ({marchamos.length})
            </h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar border border-gray-200 p-4 rounded-xl">
            {marchamos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="font-medium">No hay marchamos agregados</p>
                <p className="text-sm">Agregue su primer marchamo arriba</p>
              </div>
            ) : (
              marchamos.map((item, index) => (
                <div
                  key={index}
                  className="group flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 px-2 py-1 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <span className="text-gray-700 font-normal text-sm flex-1 mr-3">
                    {item}
                  </span>
                  <button
                    onClick={() => handleRemoveMarchamo(index)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
                    title="Eliminar marchamo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
            
        {/* Footer con estadísticas */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="w-full bg-[] rounded-sm p-1 hover:scale-105" onClick={()=>setOpenMarchamos(false)}>Finalizar</button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}

export const ValidarMarchamos = ({ hdClose, hdlSubmit, isLoading }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opa-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100 animate-fadeIn">
        {/* Header con icono y título */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <IoAlertCircleOutline className="text-3xl text-red-500 animate-pulse" />
          <h2 className="text-2xl font-bold text-red-600 tracking-wide">
            ALERTA
          </h2>
          <IoAlertCircleOutline className="text-3xl text-red-500 animate-pulse" />
        </div>

        {/* Contenido del mensaje */}
        <div className="text-center mb-8">
          <p className="text-gray-700 text-lg">
            ¿Está seguro que desea ingresar la boleta{' '}
            <span className="text-red-600 font-bold mt-2 text-xl"> SIN MARCHAMOS?</span>
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={hdClose}
            aria-label="Cancelar operación"
            disabled={isLoading}
            className="px-6 py-3 w-full text-gray-600 font-medium rounded-lg border border-gray-300 
                       transition-all duration-200 ease-in-out 
                       hover:bg-gray-50 hover:border-gray-400 hover:scale-[1.02]
                       focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
                       active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={hdlSubmit}
            aria-label="Confirmar ingreso sin marchamos"
            disabled={isLoading}
            className="px-6 py-3 w-full text-white font-semibold bg-gradient-to-r from-red-600 to-red-700 
                       rounded-lg shadow-lg transition-all duration-200 ease-in-out 
                       hover:from-red-700 hover:to-red-800 hover:scale-[1.02] hover:shadow-xl
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                       active:scale-95"
          >
            {isLoading ? 'PROCESANDO...' : 'CONFIRMAR'}
          </button>
        </div>
      </div>
    </div>
  );
};


export const FormImportacionesContenerizada = ({ setOpenContenedor, hdlChange, boletas }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200 relative">
        {/* Close button */}
        <button
          onClick={() => setOpenContenedor(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-full"
        >
          <IoMdClose size={30} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Información del Contenedor</h2>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          {/* Sacos teóricos */}
          <div className="grid grid-cols-2 gap-2 items-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenedor
            </label>
            <input
              type="text"
              name="contenedor"
              className="w-full text-sm px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400"
              placeholder="Ingrese número de contenedor..."
              value={boletas?.contenedor}
              onChange={hdlChange}
              disabled
            />
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marchamo de origen
            </label>
            <input
              type="text"
              name="marchamoOrigen"
              className="w-full text-sm px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400"
              placeholder="Ingrese marchamo de origen..."
              value={boletas?.marchamoOrigen || ''}
              onChange={hdlChange}
              disabled
            />
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sacos teóricos
            </label>
            <input
              type="number"
              name="sacosDeOrigen"
              className="w-full text-sm px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400"
              placeholder="Cantidad de sacos teóricos..."
              value={boletas?.sacosDeOrigen || ''}
              onChange={hdlChange}
              disabled
            />
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bodega
            </label>
            <select 
              name="bodegaSelected"
              onChange={hdlChange}
              value={boletas?.bodegaSelected}
              className="w-full text-sm px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400">
              <option value="-1">Seleccione un encargado</option>
              {boletas?.bodegasContenerizada.map((items) => (
                <option key={items.nombre} value={items.nombre}>{items.nombre}</option>
              ))}
            </select>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Encargado de bodega
            </label>
            <select 
              name="encargadoDeBodega"
              onChange={hdlChange}
              value={boletas?.encargadoDeBodega}
              className="w-full text-sm px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400">
              <option value="-1">Seleccione un encargado</option>
              {boletas?.onlyContenerizada.map((items) => (
                <option key={items.key} value={items.id}>{items.Nombre}</option>
              ))}
            </select>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sacos descargados
            </label>
            <input
              type="number"
              name="sacosDescargados"
              className="w-full text-sm px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400"
              placeholder="Cantidad de sacos descargados..."
              value={boletas?.sacosDescargados || ''}
              onChange={hdlChange}
            />
          </div>

          {/* Botón */}
          <div className="pt-4 border-t border-gray-200">
            <button 
              className="w-full bg-[#725033] hover:bg-[#68513d] text-white rounded-xl p-3 hover:scale-105 transition-all duration-200 font-medium shadow-lg hover:shadow-xl" 
              onClick={() => setOpenContenedor(false)}
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};