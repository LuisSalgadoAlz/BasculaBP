const tiempoTranscurrido = Date.now();
export const hoy = new Date(tiempoTranscurrido);

export const claseFormInputs =
  "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#955e37] focus:border-[#955e37] block w-full p-2";

  export const classFormSelct = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "#f9fafb", // bg-gray-50
      borderColor: "#D1D5DB",
      color: "#111827",
      fontSize: "0.875rem",
      borderRadius: "0.5rem",
      padding: "0",
      boxShadow: state.isFocused ? "#D1D5DB" : "none",
      "&:hover": {
        borderColor: "#D1D5DB",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 20,
    }),
    menuList: (provided) => ({
      ...provided,
      backgroundColor: "#f3f4f6", // bg-gray-100
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#d1d5db" : "#f3f4f6", // bg-gray-300 si está seleccionado
      color: state.isSelected ? "#000000" : "#111827", // Texto negro en la opción seleccionada
      "&:hover": {
        backgroundColor: "#e5e7eb", // bg-gray-200 al pasar el mouse
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#111827",
    }),
  };
  
export const classTextArea =
  "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#955e37] focus:border-[#955e37] block w-full p-2";

export const tipoTransporte = [
  {
    id: 1,
    nombre: "propio",
  },
  {
    id: 2,
    nombre: "contratado",
  },
];

export const cargando = [
  {
    id: 1,
    nombre: "Cargando datos",
  },
];
