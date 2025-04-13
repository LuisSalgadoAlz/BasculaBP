import { useEffect, useState } from "react";
import { ButtonAdd } from "../components/buttons";
import ViewBoletas from "../components/boletas/viewBoletas";
import CardHeader from "../components/card-header";
import { ModalNormal, ModalOut } from "../components/boletas/formBoletas";
import { initialSateDataFormSelet, initialStateFormBoletas, initialStateStats } from "../constants/boletas";
import { formaterData, getAllDataForSelect, postBoletasNormal, getDataBoletas, getStatsBoletas, formaterDataNewPlaca, verificarDataNewPlaca, getDataParaForm, updateBoletaOut, verificarDataCompleto } from "../hooks/formDataBoletas";
import { ModalErr, ModalSuccess } from "../components/alerts";

const Boletas = () => {
  const [openModelForm, setOpenModalForm] = useState(false);
  const [stats, setStats] = useState(initialStateStats)
  const [formBoletas, setFormBoletas] = useState(initialStateFormBoletas);
  const [dataSelets, setDataSelects] = useState(initialSateDataFormSelet);
  const [plc, setPlc] = useState("");
  const [move, setMove] = useState('');
  const [newRender, setNewRender] = useState(0);
  const [dataTable, setDataTable] = useState()
  const [err, setErr] = useState(false)
  const [success, setSuccess] = useState()
  const [msg, setMsg] = useState()

  /**
   * Variables para la segunda parte
   */

  const [outBol, setOutBol] = useState(false);

  /**
   * Area de los modals
   */
  const handleCloseSuccess = () => {
    setOpenModalForm(false)
    setSuccess(false)
    setOutBol(false)
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
        ...prev, ['Placa'] : "", ['Transportes'] : "Transportes X", ['Motoristas'] : ""
      }))
    }

    console.log(formBoletas)
  };

  const closeAllDataOfForm = () => {
    setPlc('')
    setFormBoletas(initialStateFormBoletas)
    getAllDataForSelect('', '', '', '', '',setDataSelects);
    getDataBoletas(setDataTable)
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
      await postBoletasNormal(response)
      setSuccess(true)
      setMsg('agregar nueva boleta')
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
      await updateBoletaOut(response, formBoletas.idBoleta)
      setSuccess(true)
      setMsg('dar salida a boleta')
      closeAllDataOfForm()    
    }
  }
  
  useEffect(() => {
    getAllDataForSelect('', plc, formBoletas.Socios, formBoletas.Transportes, formBoletas.Motoristas,setDataSelects);
    getDataBoletas(setDataTable)
    getStatsBoletas(setStats)
  }, [formBoletas.Socios, plc, formBoletas.Transportes, formBoletas.Motoristas, formBoletas]);


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
    clean: newRender
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
          <ButtonAdd name="Nueva boleta" fun={handleClik} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mt-5">
        <CardHeader data={stats['entrada']} name={"Total de entradas de material"} title={"Entradas"}/>
        <CardHeader data={stats['salida']} name={"Total de salidas de material"} title={"Salidas"}/>
        <CardHeader data={stats['pendientes']} name={"Total de salidas de material"} title={"Pendientes"}/>
      </div>
      <div className="mt-6 bg-white shadow rounded-xl px-6 py-7">
        <ViewBoletas boletas={dataTable} sts={setStats} hdlOut={handleOutBol}/>
      </div>

      {/* Modals de control de boletas */}
      {openModelForm && (<ModalNormal key={newRender} {...propsModalNormalNewPlacas}/>)}
      {outBol && (<ModalOut key={newRender} {...propsModalOutPlacas}/>)}

      {/* Area de modals de errores */}
      {err && <ModalErr name={msg} hdClose={()=>setErr(false)} />}
      {success && <ModalSuccess name={msg} hdClose={handleCloseSuccess} />}
    </>
  );
};

export default Boletas;
