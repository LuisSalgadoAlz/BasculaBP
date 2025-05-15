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

export const SideBarCel = ({ hdlClose }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    Cookies.remove("token");
    navigate("/");
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm border border-gray-300">
        <ul className="flex flex-col gap-2">
          {RUTAS_PRINCIPALES.map((data, key) => (
            <NavLink
              key={key}
              to={data.path}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 elements-active hover:bg-gray-100 hover:shadow-md"
            >
              <span className="text-2xl">{data.icon}</span>
              <span className="flex-1">{data.name}</span>
            </NavLink>
          ))}
        </ul>
        <div className="mt-8 flex justify-center">
          <button
            className="flex items-center gap-3 rounded-lg px-5 py-3 text-sm font-medium text-gray-700 elements-active hover:bg-gray-100 hover:shadow-md"
            onClick={handleClose}
          >
            <span className="text-2xl text-red-600">
              <PiSignOutFill />
            </span>
          </button>
          <button
            onClick={hdlClose}
            aria-label="Cerrar modal de éxito"
            className="px-5 py-3 text-black bg-white rounded-lg hover:bg-red-600 transition-transform duration-200 hover:scale-105"
          >
            <IoMdClose />
          </button>
        </div>
      </div>
    </div>
  );
};

export const SideBarCelAdmin = ({ hdlClose }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    Cookies.remove("token");
    navigate("/");
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm border border-gray-300">
        <ul className="flex flex-col gap-2">
          {RUTAS_ADMIN.map((data, key) => (
            <NavLink
              key={key}
              to={data.path}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 elements-active hover:bg-gray-100 hover:shadow-md"
            >
              <span className="text-2xl">{data.icon}</span>
              <span className="flex-1">{data.name}</span>
            </NavLink>
          ))}
        </ul>
        <div className="mt-8 flex justify-center">
          <button
            className="flex items-center gap-3 rounded-lg px-5 py-3 text-sm font-medium text-gray-700 elements-active hover:bg-gray-100 hover:shadow-md"
            onClick={handleClose}
          >
            <span className="text-2xl text-red-600">
              <PiSignOutFill />
            </span>
          </button>
          <button
            onClick={hdlClose}
            aria-label="Cerrar modal de éxito"
            className="px-5 py-3 text-black bg-white rounded-lg hover:bg-red-600 transition-transform duration-200 hover:scale-105"
          >
            <IoMdClose />
          </button>
        </div>
      </div>
    </div>
  );
};
