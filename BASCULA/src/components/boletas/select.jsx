const SelectFormBoletas = ( {classCss, data = {}, name, fun} ) => {
  return (
    <>
      <label className="block mb-2 text-sm font-medium text-gray-900 ">
        {name}
      </label>
      <select name={name} id="" className={classCss} onChange={fun}>
        {data.map((el, ke)=> (
            <option key={ke} value={el.id}>{el.nombre}</option>
        ))}
      </select>
    </>
  );
};

export default SelectFormBoletas;
