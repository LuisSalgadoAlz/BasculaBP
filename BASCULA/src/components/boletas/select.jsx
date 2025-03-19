import React from "react";

import Select from "react-select";

const SelectFormBoletas = ({ classCss, data = {}, name, fun }) => {
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
      <label className="block mb-2 text-sm font-medium text-gray-900 ">
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

export default SelectFormBoletas;

/* 

import Select from "react-select";

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

const options = [
  { value: "opcion1", label: "Opción 1" },
  { value: "opcion2", label: "Opción 2" },
];

export default function MiSelect() {
  return <Select options={options} styles={customStyles} />;
}


*/