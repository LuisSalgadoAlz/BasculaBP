import { FaWeight } from "react-icons/fa";

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

const ButtonFormBoletasPeso = ({ fun }) => {
  return (
    <>
      <button onClick={fun} className="rounded-2xl mt-7 px-2">
        <FaWeight className="text-gray-600 text-3xl" />
      </button>
    </>
  );
};

export const PartInputsPesos = ({ css, fun1, id, data, fun2 }) => {
  return (
    <>
      <div className="grow flex items-center gap-2">
        <div className="grow sm:flex-auto">
          <InputsFormBoletasPeso
            data={css}
            fun={fun1}
            name={id}
            value={data ? data.peso : "0.00lb"}
          />
        </div>
        <div className="flex-none">
          <ButtonFormBoletasPeso fun={fun2} />
        </div>
      </div>
    </>
  );
};

export const PartInputsPesos2 = ({ css, fun1, id, data, fun2 }) => {
  return (
    <>
      <div className="flex flex-1 items-center gap-2">
        <div className="grow sm:flex-auto">
          <InputsFormBoletas
            data={css}
            fun={fun1}
            name={'Peso entrada'}
          />
        </div>
      </div>
      <div className="flex flex-1 items-center gap-2">
        <div className="grow sm:flex-auto">
          <InputsFormBoletasPeso
            data={css}
            fun={fun1}
            name={id}
            value={data ? data.peso : "0.00lb"}
          />
        </div>
        <div className="flex-none">
          <ButtonFormBoletasPeso fun={fun2} />
        </div>
      </div>
    </>
  );
};
