import { claseFormInputs } from "../../constants/boletas";
import { PiGaugeThin } from "react-icons/pi";

export const InputsFormBoletas = ({ data, name, fun, stt=false }) => {
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
        disabled={stt}
      />
    </>
  );
};

export const PartInputsPesos = ({ fun, hdlChange, val, stt=false }) => {
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

export const PartInputsPesos2 = ({ fun, hdlChange, val, stt=false }) => {
  return (
    <>
      <label className="block mb-2 text-sm font-medium text-gray-900">Peso de Entrada</label>
      <div className="flex gap-3">
        <input type="number" name='pesoIn' className={claseFormInputs} onChange={hdlChange} placeholder="Peso de entrada" value={val.pesoIn}/>
      </div>
      <label className="block mb-2 text-sm font-medium text-gray-900">Peso de salida</label>
      <div className="flex gap-3">
        <input type="number" name='pesoOut' className={claseFormInputs} onChange={hdlChange} placeholder="Peso de Salida" disabled value={val.pesoOut}/>
        <button className="text-2xl" onClick={fun}><PiGaugeThin/></button>
      </div>
    </>
  );
};
