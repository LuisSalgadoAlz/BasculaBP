const InputsFormBoletas = ({ data, name }) => {
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
      />
    </>
  );
};

export default InputsFormBoletas;
