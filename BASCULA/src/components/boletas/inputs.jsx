import { claseFormInputs, classFormSelct, deptos, direccionOrigenEmpresa } from "../../constants/boletas";
import { PiGaugeThin } from "react-icons/pi";
import SelectFormBoletas from "./select";

export const InputsFormBoletas = ({ data, name, fun, stt = false, val }) => {
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
        {...(val !== undefined ? { value: val ?? '' } : {})}
      />
    </>
  );
};

export const PartInputsPesos = ({ fun, hdlChange, val }) => {
  return (
    <>
      <label className="block mb-2 text-sm font-medium text-gray-900">
        Peso de Entrada
      </label>
      <div className="flex gap-3">
        <input
          type="number"
          name="pesoIn"
          className={claseFormInputs}
          onChange={hdlChange}
          placeholder="Peso de entrada"
          value={val.pesoIn}
          readOnly
        />
        <button className="text-2xl" onClick={fun}>
          <PiGaugeThin />
        </button>
      </div>
    </>
  );
};

export const PartInputsPesos2 = ({ fun, hdlChange, val }) => {
  return (
    <>
      <label className="block mb-2 text-sm font-medium text-gray-900">
        Peso de Entrada
      </label>
      <div className="flex gap-3">
        <input
          type="number"
          name="pesoIn"
          className={claseFormInputs}
          onChange={hdlChange}
          placeholder="Peso de entrada"
          value={val.pesoIn}
        />
      </div>
      <label className="block mb-2 text-sm font-medium text-gray-900">
        Peso de salida
      </label>
      <div className="flex gap-3">
        <input
          type="number"
          name="pesoOut"
          className={claseFormInputs}
          onChange={hdlChange}
          placeholder="Peso de Salida"
          disabled
          value={val.pesoOut}
        />
        <button className="text-2xl" onClick={fun}>
          <PiGaugeThin />
        </button>
      </div>
    </>
  );
};

export const PartPesosDeSalida = ({ fun, hdlChange, val }) => {
  return (
    <>
      <label className="block mb-2 text-sm font-medium text-gray-900">
        Peso de salida
      </label>
      <div className="flex gap-3">
        <input
          type="number"
          name="pesoOut"
          className={claseFormInputs}
          onChange={hdlChange}
          placeholder="Peso de Salida"
          disabled
          value={val.pesoOut}
        />
        <button className="text-2xl" onClick={fun}>
          <PiGaugeThin />
        </button>
      </div>
    </>
  );
};

export const TransladoNormal = ({bol, fill, hdl, tipo}) => {
  const tipoOrigen = (bol?.Socios ==-998 || bol?.Socios ==-999) ? deptos : tipo == 0 ? fill['Origen'] : direccionOrigenEmpresa
  const tipoDestino = (bol?.Socios ==-998 || bol?.Socios ==-999) ? deptos : tipo == 1 ? fill['Destino'] : direccionOrigenEmpresa

  return (
    <>
      <SelectFormBoletas
        classCss={classFormSelct}
        name={"Origen"}
        data={tipoOrigen}
        fun={hdl}
        stt={bol.Proceso === "" || tipo===1 ? true : false}
        {...tipo === 1 && { val: 'Baprosa' }}
      />
      <SelectFormBoletas
        classCss={classFormSelct}
        name={"Destino"}
        data={tipoDestino}
        fun={hdl}
        stt={bol.Proceso === "" || tipo ===0 ? true : false}
        {...tipo === 0 && { val: 'Baprosa' }}
      />
    </>
  );
};

export const TransladoInterno = ({bol, fill, hdl}) => {
  return (
    <>
      <SelectFormBoletas
        classCss={classFormSelct}
        name={"Traslado origen"}
        data={fill["TransladosI"]}
        fun={hdl}
        stt={bol.Proceso === "" ? true : false}
      />
      <SelectFormBoletas
        classCss={classFormSelct}
        name={"Traslado destino"}
        data={fill["TransladosI"]}
        fun={hdl}
        stt={bol.Proceso === "" ? true : false}
      />
    </>
  );
};

export const TransladoExterno = ({bol, fill, hdl}) => {
  return (
    <>
      <SelectFormBoletas
        classCss={classFormSelct}
        name={"Traslado origen"}
        data={fill["TransladosE"]}
        fun={hdl}
        stt={bol.Proceso === "" ? true : false}
      />
      <SelectFormBoletas
        classCss={classFormSelct}
        name={"Traslado destino"}
        data={fill["TransladosE"]}
        fun={hdl}
        stt={bol.Proceso === "" ? true : false}
      />
    </>
  );
};
