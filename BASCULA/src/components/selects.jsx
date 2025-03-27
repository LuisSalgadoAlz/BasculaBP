import React from "react";

import Select from "react-select";

export const SelectSociosSave = ({ classCss, data = {}, name, fun }) => {
  const opt = data.map((el) => {
    return {
      value: el.id,
      label: el.nombre,
    };
  });

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "#f9fafb", // bg-gray-50
      borderColor: state.isFocused ? "#955e37" : "#d1d5db", // border-gray-300 y focus
      color: "#111827", // text-gray-900
      fontSize: "0.875rem", // text-sm
      borderRadius: "0.5rem", // rounded-lg
      padding: "0.5rem", // p-2
      boxShadow: state.isFocused ? "0 0 0 3px rgba(149, 94, 55, 0.2)" : "none",
      "&:hover": {
        borderColor: "#955e37",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 20,
    }),
  };

  const handleChange = (selectedOption) => {
    /* React select no recibe como tal un objeto de event por eso se crea el fakeEvent */
    const fakeEvent = {
      target: {
        name,
        value: selectedOption ? selectedOption.value : "",
      },
    };
    fun(fakeEvent); 
  };

  return (
    <>
      <label className="block mb-1.5 text-sm font-medium text-gray-900 ">
        {name}
      </label>
      <Select
        name={name}
        styles={classCss}
        onChange={handleChange}
        options={opt}
      />
    </>
  );
};

export const SelectSociosEdit = ({ classCss, data = {}, name, fun, val }) => {
  const opt = data.map((el) => {
    return {
      value: el.id,
      label: el.nombre,
    };
  });

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "#f9fafb", // bg-gray-50
      borderColor: state.isFocused ? "#955e37" : "#d1d5db", // border-gray-300 y focus
      color: "#111827", // text-gray-900
      fontSize: "0.875rem", // text-sm
      borderRadius: "0.5rem", // rounded-lg
      padding: "0.5rem", // p-2
      boxShadow: state.isFocused ? "0 0 0 3px rgba(149, 94, 55, 0.2)" : "none",
      "&:hover": {
        borderColor: "#955e37",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 20,
    }),
  };

  const handleChange = (selectedOption) => {
    /* React select no recibe como tal un objeto de event por eso se crea el fakeEvent */
    const fakeEvent = {
      target: {
        name,
        value: selectedOption ? selectedOption.value : "",
      },
    };
    fun(fakeEvent); 
  };

  const selectedValue = opt.find((option) => option.value === val) || null;


  return (
    <>
      <label className="block mb-1.5 text-sm font-medium text-gray-900 ">
        Asignar socio:
      </label>
      <Select
        name={name}
        styles={classCss}
        onChange={handleChange}
        options={opt}
        value={selectedValue}
      />
    </>
  );
};
