import { Proceso } from "./global";

const tiempoTranscurrido = Date.now();
export const hoy = new Date(tiempoTranscurrido);

export const claseFormInputs = "bg-gray-50 border border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-[#955e37] focus:border-[#955e37] block w-full p-2";

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

export const classTextArea =  "bg-gray-50 border border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-[#955e37] block w-full p-2";

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
  Socios: "", 
  'Orden de compra': "",
  Documento: "", 
  NViajes: "", 
  NSalida:""
};

export const deptos = [
  { id: "Baprosa", nombre: "Baprosa" },
  { id: "Atlántida", nombre: "Atlántida" },
  { id: "Choluteca", nombre: "Choluteca" },
  { id: "Colón", nombre: "Colón" },
  { id: "Comayagua", nombre: "Comayagua" },
  { id: "Copán", nombre: "Copán" },
  { id: "Cortés", nombre: "Cortés" },
  { id: "El Paraíso", nombre: "El Paraíso" },
  { id: "Francisco Morazán", nombre: "Francisco Morazán" },
  { id: "Gracias a Dios", nombre: "Gracias a Dios" },
  { id: "Intibucá", nombre: "Intibucá" },
  { id: "Islas de la Bahía", nombre: "Islas de la Bahía" },
  { id: "La Paz", nombre: "La Paz" },
  { id: "Lempira", nombre: "Lempira" },
  { id: "Ocotepeque", nombre: "Ocotepeque" },
  { id: "Olancho", nombre: "Olancho" },
  { id: "Santa Bárbara", nombre: "Santa Bárbara" },
  { id: "Valle", nombre: "Valle" },
  { id: "Yoro", nombre: "Yoro" },
  { id: "Estados Unidos", nombre: "Estados Unidos" },
  { id: "Paraguay", nombre: "Paraguay" },
];

export const direccionOrigenEmpresa = [
  {id: 'Baprosa', nombre: 'Baprosa'}
]


export const tiposCamion = [
  { id: 0, tipo: "peso", nombre: "Camión liviano" },
  { id: 1, tipo: "peso", nombre: "Camión mediano" },
  { id: 2, tipo: "peso", nombre: "Camión pesado" },
  { id: 3, tipo: "uso", nombre: "Camión plataforma" },
  { id: 4, tipo: "uso", nombre: "Camión furgón" },
  { id: 5, tipo: "uso", nombre: "Camión refrigerado" },
  { id: 6, tipo: "uso", nombre: "Camión cisterna" },
  { id: 7, tipo: "uso", nombre: "Camión volteo" },
  { id: 8, tipo: "uso", nombre: "Camión grúa" },
  { id: 9, tipo: "uso", nombre: "Camión jaula" },
  { id: 10, tipo: "uso", nombre: "Rastra o tráiler" },
  { id: 11, tipo: "uso", nombre: "Camión lowboy" }
];

export const windowVariants = {
  hidden: {
    opacity: 0,
    scale: 0.85,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
};

export const initialStateStats = {entrada: 0, salida: 0, pendientes: 0}

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
  FleteS: cargando,
};

export const buttonSave =  "px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-transform duration-300 ease-in-out hover:scale-105"

export const buttonCancel =  "px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-transform duration-300 ease-in-out hover:scale-105"

export const buttonClean =  "px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-400 transition-transform duration-300 ease-in-out hover:scale-105"

export const buttonDanger =  "px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-800 transition-transform duration-300 ease-in-out hover:scale-105"

export const buttonCalcular = "w-full mt-2 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-400 transition-transform duration-300 ease-in-out"

export const isSelectedView = "p-2.5 text-sm font-medium text-white rounded-s-lg border border-gray-200 mt-2 sidebar transition-transform duration-300 ease-in-out hover:scale-[1.02]"

export const noSelectectView = "p-2.5 text-sm font-medium text-gray-400 rounded-e-lg border border-gray-200 mt-2 bg-[#FDF5D4] transition-transform duration-300 ease-in-out hover:scale-[1.02]"



/* Animaciones fullCalendar */

  // Animaciones
  export const calendarVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  export const expandedVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", damping: 20, stiffness: 300 }
    },
    exit: { opacity: 0, scale: 0.95 }
  };