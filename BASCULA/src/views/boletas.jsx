import { useEffect, useState, useRef } from "react";
import { ButtonAdd } from "../components/buttons";
import ViewBoletas from "../components/boletas/viewBoletas";
import CardHeader from "../components/card-header";
import { ModalBoletas } from "../components/boletas/formBoletas";
import { initialSateDataFormSelet, initialStateFormBoletas } from "../constants/boletas";
import { getAllDataForSelect } from "../hooks/formDataBoletas";

const Boletas = () => {
  const [openModelForm, setOpenModalForm] = useState(false);
  const [formBoletas, setFormBoletas] = useState(initialStateFormBoletas);
  const [dataSelets, setDataSelects] = useState(initialSateDataFormSelet);
  const [plc, setPlc] = useState("");
  const [newRender, setNewRender] = useState(0);

  const formRefBoletas = useRef()

  const handleClik = () => {
    setOpenModalForm(!openModelForm);
    setFormBoletas(initialStateFormBoletas)
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormBoletas((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name == "Placa") setPlc(value);
  };

  const limpiar = () => {
    const key = newRender + 1
    setNewRender(key)
    setFormBoletas(initialStateFormBoletas)
    setDataSelects(initialSateDataFormSelet)
  }


  useEffect(() => {
    getAllDataForSelect(formBoletas.Proceso, plc, formBoletas.Clientes, formBoletas.Transportes, formBoletas.Motoristas,setDataSelects);
    console.log(formBoletas);
  }, [formBoletas]);

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
          {openModelForm ? (
            <ButtonAdd name="Volver" fun={handleClik} />
          ) : (
            <ButtonAdd name="Nueva boleta" fun={handleClik} />
          )}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mt-5">
        <CardHeader
          data={0}
          name={"Total de entradas de material"}
          title={"Entradas"}
        />
        <CardHeader
          data={0}
          name={"Total de salidas de material"}
          title={"Salidas"}
        />
        <CardHeader
          data={0}
          name={"Total de salidas de material"}
          title={"Pendientes"}
        />
      </div>
      <div className="mt-6 bg-white shadow rounded-xl px-6 py-7">
        <ViewBoletas />
        {openModelForm && (
          <ModalBoletas
            hdlClose={handleClik}
            hdlChange={handleChange}
            fillData={dataSelets}
            typeBol={formBoletas?.Proceso}
            typeStructure={formBoletas?.Estado}
            formBol = {setFormBoletas}
            boletas = {formBoletas}
            hdlClean = {limpiar}
            key={newRender}
          />
        )}
      </div>
    </>
  );
};

export default Boletas;
