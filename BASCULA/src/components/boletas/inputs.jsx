import { FaWeight } from "react-icons/fa";
import { claseFormInputs } from "../../constants/boletas";
import { PiGaugeThin } from "react-icons/pi";

export const InputsFormBoletas = ({ data, name, fun, value }) => {
  return (
    <>
      <label className="block mb-2 text-sm font-medium text-gray-900 ">
        {name}
      </label>
      <input
        type="usuario"
        id={name}
        name={name}
        className={data}
        placeholder={`Ingrese ${name}`}
        required
        onChange={fun}
      />
    </>
  );
};

export const InputsFormBoletasPeso = ({ data, name, fun, value = "0.0lb" }) => {
  return (
    <>
      <label className="block mb-2 text-sm font-medium text-gray-900 ">
        {name}
      </label>
      <input
        type="usuario"
        id={name}
        name={name}
        className={data}
        placeholder={`Ingrese ${name}`}
        required
        onChange={fun}
        readOnly
        value={value && value}
      />
    </>
  );
};

export const PartInputsPesos = ({ fun, hdlChange, val }) => {
  return (
    <>
      <label className="block mb-2 text-sm font-medium text-gray-900">Peso de Entrada</label>
      <div className="flex gap-3">
        <input type="number" name='pesoIn' className={claseFormInputs} onChange={hdlChange} placeholder="Peso de entrada" value={val.pesoIn} readOnly />
        <button className="text-2xl" onClick={fun}><PiGaugeThin/></button>
      </div>
    </>
  );
};

export const PartInputsPesos2 = ({ fun, hdlChange, val }) => {
  return (
    <>
      <label className="block mb-2 text-sm font-medium text-gray-900">Peso de Entrada</label>
      <div className="flex gap-3">
        <input type="number" name='pesoIn' className={claseFormInputs} onChange={hdlChange} placeholder="Peso de entrada" value={val.pesoIn}/>
        <button className="text-2xl" onClick={fun}><PiGaugeThin/></button>
      </div>
      <label className="block mb-2 text-sm font-medium text-gray-900">Peso de salida</label>
      <div className="flex gap-3">
        <input type="number" name='pesoOut' className={claseFormInputs} onChange={hdlChange} placeholder="Peso de Salida" disabled value={val.pesoOut}/>
        <button className="text-2xl" onClick={fun}><PiGaugeThin/></button>
      </div>
    </>
  );
};
