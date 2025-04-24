import { use, useCallback, useEffect, useState } from "react";
import { ButtonAdd, ButtonAddBoleta } from "../components/buttons";
import ViewBoletas from "../components/boletas/viewBoletas";
import CardHeader from "../components/card-header";
import { ModalBoletas, ModalNormal, ModalOut } from "../components/boletas/formBoletas";
import { initialSateDataFormSelet, initialStateFormBoletas, initialStateStats } from "../constants/boletas";
import { formaterData, getAllDataForSelect, postBoletasNormal, getDataBoletas, getStatsBoletas, formaterDataNewPlaca, verificarDataNewPlaca, getDataParaForm, updateBoletaOut, verificarDataCompleto, postBoletasCasulla } from "../hooks/formDataBoletas";
import { ModalErr, ModalSuccess } from "../components/alerts";

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
  const [search, setSearch] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [pagination, setPagination] = useState(1)

  /**
   * Variables para la segunda parte
   */

  const [outBol, setOutBol] = useState(false);


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
    setPlc('')
  }

  /**
   *  Controla todos los cambios hechos en el formulario de Boletas
   * @param {*} e 
   */
  const handleChange = (e) => {
    const { name, value, data } = e.target;
    setFormBoletas((prev) => ({...prev, [name]: value}));
    if (name == "Placa" && (formBoletas?.Socios ==-998 && formBoletas?.Socios ==-999)) setPlc(value);
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
    setFormBoletas(initialStateFormBoletas)
    getAllDataForSelect('', '', '', '', '',setDataSelects);
    getDataBoletas(setDataTable, setSsLoadTable, search, searchDate, pagination);
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
    const isCorrect = verificarDataCompleto(setErr, response, setMsg)
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

  const handleResetPagination = () => {
    setPagination(1)
  }


  const fetchData = useCallback(() => {
    getAllDataForSelect('', plc, formBoletas.Socios, formBoletas.Transportes, formBoletas.Motoristas, setDataSelects);
    getDataBoletas(setDataTable, setSsLoadTable, search, searchDate, pagination);
    getStatsBoletas(setStats);
  }, [plc, formBoletas.Socios, formBoletas.Transportes, formBoletas.Motoristas]);
  
  const fechDataSeaSearch = useCallback(() => {
    getDataBoletas(setDataTable, setSsLoadTable, search, searchDate, pagination);
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
  }

  const viewBoletasProps = {
    boletas: dataTable,
    sts: setStats,
    hdlOut: handleOutBol,
    isLoad: isLoadTable,
    setSearch,
    setSearchDate,
    pagination,
    setPagination,
    handlePagination
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
    </>
  );
};

export default Boletas;
