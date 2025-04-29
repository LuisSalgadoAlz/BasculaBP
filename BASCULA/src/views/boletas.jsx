import { use, useCallback, useEffect, useState } from "react";
import { ButtonAdd, ButtonAddBoleta } from "../components/buttons";
import ViewBoletas from "../components/boletas/viewBoletas";
import CardHeader from "../components/card-header";
import { CancelarBoleta, ModalBoletas, ModalNormal, ModalOut, VisualizarBoletas } from "../components/boletas/formBoletas";
import { initialSateDataFormSelet, initialStateFormBoletas, initialStateStats } from "../constants/boletas";
import { formaterData, getAllDataForSelect, postBoletasNormal, getDataBoletas, getStatsBoletas, formaterDataNewPlaca, verificarDataNewPlaca, getDataParaForm, updateBoletaOut, verificarDataCompleto, postBoletasCasulla, getDataBoletasCompletadas, getDataBoletasPorID, updateCancelBoletas } from "../hooks/formDataBoletas";
import { ModalErr, ModalSuccess } from "../components/alerts";
import { AnimatePresence } from "framer-motion";

const Boletas = () => {
  const [openModelForm, setOpenModalForm] = useState(false);
  /**
   * Variables de control de feching
   */
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadTable, setSsLoadTable] = useState(false)
  const [stats, setStats] = useState(initialStateStats)
  const [formBoletas, setFormBoletas] = useState(initialStateFormBoletas);
  const [dataSelets, setDataSelects] = useState(initialSateDataFormSelet);
  const [plc, setPlc] = useState("");
  const [move, setMove] = useState('');
  const [newRender, setNewRender] = useState(0);
  const [dataTable, setDataTable] = useState()
  const [dataTableCompletadas, setDataTableCompletadas] = useState()
  const [search, setSearch] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [pagination, setPagination] = useState(1)
  const [isLoadCompletadas, setIsLoadCompletadas] = useState(false)
  const [proceso, setProceso] = useState('')
  const [details, setDetails] = useState(false)
  const [dataDetails, setDataDetails] = useState()
  /**
   * Variables para la segunda parte
   */

  const [outBol, setOutBol] = useState(false);
  const [cancelBol, setCancelBol] = useState(false) 
  const [idCancelBol, setIdCancelBol] = useState()
  const [isLoadCancel, setIsLoadCancel] = useState()
  /**
   * Variables tercera parte
   */

  const [modalEspecial, setModalEspecial] = useState(false)


  /**
   * Variables de alertas de exito y error
   */

  const [err, setErr] = useState(false)
  const [success, setSuccess] = useState()
  const [msg, setMsg] = useState()

  /**
   * Area de los modals
   */
  const handleCloseSuccess = () => {
    setOpenModalForm(false)
    setSuccess(false)
    setOutBol(false)
    setModalEspecial(false)
    setMove('')
    setPlc('')
    setProceso('')
  }

  const handleClik = () => {
    setOpenModalForm(!openModelForm);
    setFormBoletas(initialStateFormBoletas)
    setDataSelects(initialSateDataFormSelet)
    getAllDataForSelect('', '', '', '', '',setDataSelects);
    setPlc('')
  };

  const handleCloseCompleto=() => {
    setOutBol(false)
    setModalEspecial(false)
    setFormBoletas(initialStateFormBoletas)
    setDataSelects(initialSateDataFormSelet)
    getAllDataForSelect('', '', '', '', '',setDataSelects);
    setProceso('')
    setPlc('')
    setMove('')
  }

  /**
   *  Controla todos los cambios hechos en el formulario de Boletas
   * ! AQUI SE ESTA TRABAJANDO
   * @param {*} e 
   */
  const handleChange = (e) => {
    const { name, value, data } = e.target;
    setFormBoletas((prev) => ({...prev, [name]: value}));
    if (name == "Proceso") {
      setProceso(value)
      if (value ==0 ) setFormBoletas((prev) => ({...prev, ['Orden de compra'] : '', Origen: ''}))
      if (value ==1 ) setFormBoletas((prev) => ({...prev, ['Documento'] : '' , Destino: ''}))
    }
    if (name == "Placa" && (formBoletas?.Socios ==-998 || formBoletas?.Socios ==-999)) setPlc(value);
    if (name == "Movimiento") setMove(data)
    if (name == "Estado" && value==1) setFormBoletas((prev) => ({...prev, ['Proceso'] : 1}))
    if (name == "Socios" && (value==-998 || value==-999)) {
      setFormBoletas((prev) => ({
        ...prev, ['Placa'] : "", ['Transportes'] : "Transportes X", ['Motoristas'] : "", ['Cliente'] : "", ['Proveedor'] : ""
      }))
    }
  };

  const closeAllDataOfForm = () => {
    setPlc('')
    setProceso('')
    setMove('')
    setFormBoletas(initialStateFormBoletas)
    getAllDataForSelect('', '', '', '', '',setDataSelects);
    getDataBoletas(setDataTable, setSsLoadTable, search, searchDate, pagination);
    getDataBoletasCompletadas(setDataTableCompletadas, setIsLoadCompletadas, search, searchDate, pagination)
  }
  
  const limpiar = () => {
    const key = newRender + 1
    setFormBoletas(initialStateFormBoletas)
    setDataSelects(initialSateDataFormSelet)
    setPlc('')
    setNewRender(key)
    getAllDataForSelect('', '', '', '', '',setDataSelects);
  }

  /**
   * Todo: terminada Primera parte
   */
  const handleSubmitNewPlaca = async () => {
    const response = formaterDataNewPlaca(formBoletas) 
    const isCorrect = verificarDataNewPlaca(setErr,response, setMsg) 
    if (isCorrect) {
      await postBoletasNormal(response, setIsLoading)
      setSuccess(true)
      setMsg('agregar nueva boleta')
      setOpenModalForm(false)
      closeAllDataOfForm()
    }
  }

  /**
   * Todo: Segunda Parte area donde sacan las boletas
   * ! Trabajando aqui
   */

  const handleOutBol = (data) => {
    setOutBol(true)
    getDataParaForm(setFormBoletas, data) 
  }

  const handleCompleteOut = async() => {
    const response = formaterData(formBoletas)
    const isCorrect = verificarDataCompleto(setErr, response, setMsg, formBoletas?.pesoIn)
    console.log(response)
    if (isCorrect) {
      await updateBoletaOut(response, formBoletas.idBoleta, setIsLoading)
      setSuccess(true)
      setMsg('dar salida a boleta')
      setOutBol(false)
      closeAllDataOfForm()    
    }
  }


  /**
   * Todo: Funciones de la tercera parte 
   * ! Trabajando Aqui
   */

  const handleShowModalEspcial = async() => {
    setModalEspecial(true)
    setFormBoletas((prev)=>({
      ...prev, ['Proceso']: 1, ['Movimiento'] : 6, ['Producto'] : 11
    }))
    setProceso(1)
    await getAllDataForSelect(1, plc, formBoletas.Socios, formBoletas.Transportes, formBoletas.Motoristas, setDataSelects);
  }

  const handleSubmitCasulla = async() => {
    const response = formaterData(formBoletas)
    const allForm = {...response, ['pesoInicial']: formBoletas?.pesoIn, ["Cliente"] : formBoletas?.Cliente}
    const isCorrect = true
    if (isCorrect) {
      await postBoletasCasulla(allForm, setIsLoading)
      setSuccess(true)
      setMsg('agregar nueva boleta')
      setModalEspecial(false)
      closeAllDataOfForm()
    }
  }

  const handlePagination = (item) => {
    if (pagination>0) {
      const newRender = pagination+item
      if(newRender==0) return
      if(newRender>dataTable.pagination.totalPages) return
      setPagination(newRender) 
    }
  } 
  const handlePaginationCompletadas = (item) => {
    if (pagination>0) {
      const newRender = pagination+item
      if(newRender==0) return
      if(newRender>dataTableCompletadas.pagination.totalPages) return
      setPagination(newRender) 
    }
  } 

  /* Area de los details */
  const handleCloseDetails = () => { 
    setDetails(false)
  }

  const handleOpenDetails = async (data) => {
    setDetails(true)
    const response = await getDataBoletasPorID(data?.Id)
    setDataDetails(response)
  }

  /**
   * TODO: Area para cancelar boletas
   */

  const handleCloseCancelModal = () => {
    setCancelBol(false)
    /* Aqui reiniciaremos el form */
  }

  const handleCancelBoleta = (info) => {
    setCancelBol(true)
    setIdCancelBol(info)
    console.log(info)
  }

  const handleChangeCancelModal = (e) => {
    const { name, value } = e.target

    setIdCancelBol((prev)=>({
      ...prev, [name] : value
    }))
  }

  const handleSubmitCancelBol = async() => {
    if (!idCancelBol.Motivo) {
      setErr(true) 
      setMsg('Debe de ingresar un motivo')
      return
    }
    await updateCancelBoletas(idCancelBol, setIsLoadCancel)
    setCancelBol(false)
    setIdCancelBol('')
    fetchData()
    fechDataSeaSearch()
  }
  
  const fetchData = useCallback(() => {
    getAllDataForSelect(modalEspecial ? 1 : '', plc, formBoletas.Socios, formBoletas.Transportes, formBoletas.Motoristas, setDataSelects);
    getDataBoletas(setDataTable, setSsLoadTable, search, searchDate, pagination);
    getStatsBoletas(setStats);
  }, [plc, formBoletas.Socios, formBoletas.Transportes, formBoletas.Motoristas, modalEspecial]);
    
  const fechDataSeaSearch = useCallback(() => {
    getDataBoletas(setDataTable, setSsLoadTable, search, searchDate, pagination);
    getDataBoletasCompletadas(setDataTableCompletadas, setIsLoadCompletadas, search, searchDate, pagination)
  }, [search, searchDate, pagination])

  useEffect(() => {
    fechDataSeaSearch()
  }, [fechDataSeaSearch]);

  useEffect(() => {
    fetchData()
  }, [fetchData]);


  /**
   * Todo : area de lass props
   */

  const propsModalNormalNewPlacas = {
    hdlClose: handleClik,
    hdlChange: handleChange,
    fillData: dataSelets,
    typeBol: formBoletas?.Proceso,
    typeStructure: formBoletas?.Estado,
    formBol: setFormBoletas,
    boletas: formBoletas,
    hdlClean: limpiar,
    hdlSubmit: handleSubmitNewPlaca,
    clean: newRender,
    isLoading: isLoading
  };

  const propsModalOutPlacas = {
    hdlClose: handleCloseCompleto,
    hdlChange: handleChange,
    fillData: dataSelets,
    typeBol: formBoletas?.Proceso,
    typeStructure: formBoletas?.Estado,
    formBol: setFormBoletas,
    boletas: formBoletas,
    hdlClean: limpiar,
    hdlSubmit: handleCompleteOut,
    move: move,
    clean: newRender, 
    isLoading : isLoading,
    proceso : proceso
  };

  const propsModalCasulla = { 
    hdlClose: handleCloseCompleto,
    hdlChange: handleChange,
    fillData: dataSelets,
    typeBol: formBoletas?.Proceso,
    typeStructure: formBoletas?.Estado,
    formBol: setFormBoletas,
    boletas: formBoletas,
    hdlClean: limpiar,
    hdlSubmit: handleSubmitCasulla,
    move: move,
    clean: newRender, 
    isLoading : isLoading,
    proceso : proceso,
  }

  const viewBoletasProps = {
    boletas: dataTable,
    sts: setStats,
    hdlOut: handleOutBol,
    isLoad: isLoadTable,
    isLoadCompletadas, 
    setSearch,
    setSearchDate,
    pagination,
    setPagination,
    handlePagination,
    completadas: dataTableCompletadas, 
    handlePaginationCompletadas,
    hdlOpenDetails: handleOpenDetails,
    hdlCancel: handleCancelBoleta,
  };

  return (
    <>
      <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Boletas</h1>
          <h1 className="text-gray-600 max-sm:text-sm">
            {" "}
            Generación y visualización de las boletas de Báscula
          </h1>
        </div>
        <div className="parte-der flex items-center justify-center gap-3 max-sm:text-sm max-sm:flex-col">
          <ButtonAdd className={'bg-amber-9001'} name="Boleta Especial" fun={handleShowModalEspcial} />
          <ButtonAddBoleta name="Nueva boleta" fun={handleClik} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mt-5">
        <CardHeader data={stats['entrada']} name={"Total de entradas de material"} title={"Entradas (Hoy)"}/>
        <CardHeader data={stats['salida']} name={"Total de salidas de material"} title={"Salidas (Hoy)"}/>
        <CardHeader data={stats['pendientes']} name={"Total de salidas de material"} title={"Pendientes"}/>
      </div>
      <div className="mt-6 bg-white shadow rounded-xl px-6 py-7">
        <ViewBoletas {...viewBoletasProps} />
      </div>

      {/* Modals de control de boletas */}
      {openModelForm && (<ModalNormal key={newRender} {...propsModalNormalNewPlacas}/>)}
      {outBol && (<ModalOut key={newRender} {...propsModalOutPlacas}/>)}
      {modalEspecial && (<ModalBoletas {...propsModalCasulla}/>)}

      {/* Area de modals de errores */}
      {err && <ModalErr name={msg} hdClose={()=>setErr(false)} />}
      {success && <ModalSuccess name={msg} hdClose={handleCloseSuccess} />}


      {/* Area para ver los detalles de las boletas completas */}
      <AnimatePresence>
        {details && (<VisualizarBoletas hdlClose={handleCloseDetails} boletas={dataDetails}/>)}
        {cancelBol && (<CancelarBoleta boletas={idCancelBol} hdlClose={handleCloseCancelModal} hdlSubmitCancel={handleSubmitCancelBol} hdlChange={handleChangeCancelModal} isLoad={isLoadCancel}/>)}
      </AnimatePresence>
    </>
  );
};

export default Boletas;
