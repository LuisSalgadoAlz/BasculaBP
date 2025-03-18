const SelectFormBoletas = ( {classCss, data = {}, name} ) => {
  return (
    <>
      <label className="block mb-2 text-sm font-medium text-gray-900 ">
        {name}
      </label>
      <select name="" id="" className={classCss}>
        {data.map((el, ke)=> (
            <option key={ke} value={el.id}>{el.nombre}</option>
        ))}
      </select>
    </>
  );
};

export default SelectFormBoletas;
