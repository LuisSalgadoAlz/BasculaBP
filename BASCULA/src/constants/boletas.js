import { Proceso } from "./global";

const tiempoTranscurrido = Date.now();
export const hoy = new Date(tiempoTranscurrido);

export const claseFormInputs =
  "bg-gray-50 border border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-[#955e37] focus:border-[#955e37] block w-full p-2";

export const classFormSelct = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "#f9fafb", // gris claro
      borderColor: "#4A5565", // gris oscuro
      color: "#111827", // texto
      fontSize: "0.875rem", // 14px
      borderRadius: "0.5rem", // bordes redondeados
      padding: "0",
      minHeight: "2.5rem",
      boxShadow: state.isFocused ? "0 0 0 2px #4A5565" : "none",
      "&:hover": {
        borderColor: "#4A5565",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 20,
      marginTop: "0.25rem",
      borderRadius: "0.5rem",
      overflow: "hidden",
    }),
    menuList: (provided) => ({
      ...provided,
      backgroundColor: "#f3f4f6", // gris más claro
      padding: 0,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#d1d5db"
        : state.isFocused
        ? "#e5e7eb"
        : "#f3f4f6",
      color: "#111827",
      padding: "0.5rem 1rem",
      fontSize: "0.875rem",
      cursor: "pointer",
      whiteSpace: "normal",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#111827",
    }),
};

export const classTextArea =
  "bg-gray-50 border border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-[#955e37] block w-full p-2";

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

export const fechaCorta = "";

export const initialStateFormBoletas = {
  Clientes: "",
  Destino: "",
  Flete: "",
  Motoristas: "",
  Origen: "",
  Placa: "",
  Proceso: "",
  Producto: "",
  Transportes: "",
  Estado: 0,
  pesoIn: 0,
  pesoOut: 0,
  fechaInicio: hoy
};

export const initialSateDataFormSelet = {
  Proceso,
  Placa: cargando,
  Clientes: cargando,
  Transportes: cargando,
  Motoristas: cargando,
  Producto: cargando,
  Origen: cargando,
  Destino: cargando,
  Flete: cargando,
};

export const buttonSave = 
  "px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-transform duration-300 ease-in-out hover:scale-105"

export const buttonCancel =
  "px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-transform duration-300 ease-in-out hover:scale-105"

export const buttonClean = 
  "px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-400 transition-transform duration-300 ease-in-out hover:scale-105"
