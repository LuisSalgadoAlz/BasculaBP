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

export const InputsFormBoletasPeso = ({ data, name, fun, value='0.0lb' }) => {
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
