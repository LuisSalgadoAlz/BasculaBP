import React from "react";
import Select from "react-select";

const SelectFormBoletas = ({ classCss, data = {}, name, fun, stt = false }) => {
  const opt = data.map((el) => {
    return {
      value: el.id,
      label: el.nombre,
    };
  });

  const handleChange = (selectedOption) => {
    /* React select no recibe como tal un objeto de event por eso se crea el fakeEvent */
    const fakeEvent = {
      target: {
        name,
        value: selectedOption ? selectedOption.value : "",
        data : selectedOption ? selectedOption.label : ""
      },
    };
    fun(fakeEvent); 
  };

  return (
    <>
      <label className="block mb-2 text-sm font-medium text-gray-900 ">
        {name}
      </label>
      <Select
        name={name}
        styles={{...classCss, menuPortal: (base) => ({ ...base, zIndex: 9999 }),}}
        menuPortalTarget={document.body}
        onChange={handleChange}
        options={opt}
        isDisabled={stt}
        isClearable
      />
    </>
  );
};

export default SelectFormBoletas;