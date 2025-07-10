import { NavLink, useNavigate } from "react-router";
import { MdOutlineDashboard } from "react-icons/md";
import { BsClipboard2Pulse, BsFileBarGraph } from "react-icons/bs";
import { RiTruckLine } from "react-icons/ri";
import { FiUsers } from "react-icons/fi";
import { PiSignOutFill } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";

import Cookies from "js-cookie";
import { AiOutlineFileExclamation } from "react-icons/ai";

const RUTAS_PRINCIPALES = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: <MdOutlineDashboard />,
  },
  {
    path: "/socios",
    name: "Socios",
    icon: <FiUsers />,
  },
  {
    path: "/empresas",
    name: "Empresas",
    icon: <RiTruckLine />,
  },
  {
    path: "/boletas",
    name: "Boletas",
    icon: <BsClipboard2Pulse />,
  },
];


const RUTAS_ADMIN = [
  {
    path: "/admin/dashboard",
    name: "Dashboard",
    icon: <MdOutlineDashboard />,
  },
  {
    path: "/admin/usuarios",
    name: "Usuarios",
    icon: <FiUsers />,
  },
  {
    path: "/admin/logs",
    name: "Registros",
    icon: <AiOutlineFileExclamation />,
  },
];

const RUTAS_TOLVA = [
  {
    path: "/tolva/dashboard",
    name: "Dashboard",
    icon: <MdOutlineDashboard />,
  },
];

const RUTAS_GUARDIA = [
  {
    path: "/guardia",
    name: "Control Salida",
    icon: <MdOutlineDashboard />,
  },
]

export const CerrarSession = ({ onClick }) => (
  <button
    className="flex items-center gap-3 rounded-lg px-5 py-3 text-sm font-medium text-gray-700 elements-active hover:bg-gray-100 hover:shadow-md"
    onClick={onClick}
  >
    <span className="text-2xl text-red-600">
      <PiSignOutFill />
    </span>
  </button>
);

export const CloseButton = ({ onClick }) => (
  <button
    onClick={onClick}
    aria-label="Cerrar modal"
    className="px-5 py-3 text-black bg-white rounded-lg hover:bg-red-600 transition-transform duration-200 hover:scale-105"
  >
    <IoMdClose />
  </button>
);

export const NavItem = ({ data }) => (
  <NavLink
    to={data.path}
    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 elements-active hover:bg-gray-100 hover:shadow-md"
  >
    <span className="text-2xl">{data.icon}</span>
    <span className="flex-1">{data.name}</span>
  </NavLink>
);

export const NavList = ({ routes }) => (
  <ul className="flex flex-col gap-2">
    {routes.map((data, key) => (
      <NavItem key={key} data={data} />
    ))}
  </ul>
);

export const BotonesDeAccion = ({ onLogout, onClose }) => (
  <div className="mt-8 flex justify-center">
    <CerrarSession onClick={onLogout} />
    <CloseButton onClick={onClose} />
  </div>
);

// Componente atómico para el overlay del modal
export const ModalOverlay = ({ children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm border border-gray-300">
      {children}
    </div>
  </div>
);

// Hook personalizado para manejar el cierre de sesión
export const useLogout = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/");
  };
  
  return handleLogout;
};

export const BaseSidebar = ({ routes, onClose }) => {
  const handleLogout = useLogout();
  
  return (
    <ModalOverlay>
      <NavList routes={routes} />
      <BotonesDeAccion onLogout={handleLogout} onClose={onClose} />
    </ModalOverlay>
  );
};


export const SideBarCel = ({ hdlClose }) => (
  <BaseSidebar routes={RUTAS_PRINCIPALES} onClose={hdlClose} />
);

export const SideBarCelAdmin = ({ hdlClose }) => (
  <BaseSidebar routes={RUTAS_ADMIN} onClose={hdlClose} />
);

export const SideBarCelTolva = ({ hdlClose }) => (
  <BaseSidebar routes={RUTAS_TOLVA} onClose={hdlClose} />
);

export const SideBarCelGuardia = ({ hdlClose }) => (
  <BaseSidebar routes={RUTAS_GUARDIA} onClose={hdlClose} />
);