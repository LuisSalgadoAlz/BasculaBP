import { NavLink, useNavigate } from "react-router";
import { MdOutlineScale, MdOutlineDashboard } from "react-icons/md";
import { BsClipboard2Pulse, BsFileBarGraph } from "react-icons/bs";
import { RiTruckLine } from "react-icons/ri";
import { FiUsers } from "react-icons/fi";
import { PiSignOutFill } from "react-icons/pi";
import Cookies from "js-cookie";

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

const SideBar = ({ modo = "extendido", altura = 500 }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    Cookies.remove("token");
    navigate("/");
  };

  const isExtendido = modo === "extendido";

  return (
    <div
      className={`${
        isExtendido ? "w-[290px]" : "w-[80px]"
      } sidebar p-1 max-sm:hidden min-md:visible`}
    >
      {/* Header */}
      <div data-sidebar="header" className="flex flex-col gap-2 p-2">
        <div
          className={`flex items-center ${
            isExtendido ? "gap-2 px-2 py-2" : "gap-2 px-4 py-2"
          }`}
        >
          <MdOutlineScale className="text-2xl text-amber-300 mt-1" />
          {isExtendido && (
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">Baprosa</h2>
              <p className="text-xs text-gray-400">
                Sistema de Gestión Bascula
              </p>
            </div>
          )}
        </div>
        {isExtendido && (
          <div className="px-2 py-2">
            <input
              type="text"
              className="block w-full p-2 text-white border border-[#725033] rounded-md bg-[#5A3F27] text-sm focus:border-blue-500"
              placeholder="Buscar..."
            />
          </div>
        )}
      </div>

      {/* Rutas principales */}
      <div className="p-2">
        <ul className="flex w-full flex-col gap-1 px-2">
          {RUTAS_PRINCIPALES.map((data, key) => (
            <NavLink
              key={key}
              to={data.path}
              className="flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-white"
            >
              <span className="text-lg">{data.icon}</span>
              {isExtendido && <span className="flex-1">{data.name}</span>}
            </NavLink>
          ))}
        </ul>
        <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
      </div>

      {/* Reportes */}
      <div className="pb-2">
        <ul className="flex w-full flex-col gap-1 px-2">
          {isExtendido ? (
            <>
              <h1 className="px-3 text-sm text-gray-300">Reportes</h1>
              <NavLink
                to="/informes"
                className="flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-white"
              >
                <span className="text-lg">
                  <BsFileBarGraph />
                </span>
                <span className="flex-1">Informes</span>
              </NavLink>
              <ul className="pl-5 border-l border-gray-500 ml-5">
                <NavLink
                  to="/informes"
                  className="flex items-center gap-x-1 rounded-md py-2 text-sm font-medium text-white"
                >
                  <span className="flex-1">Informes Diarios</span>
                </NavLink>
                <NavLink
                  to="/informes"
                  className="flex items-center gap-x-1 rounded-md py-2 text-sm font-medium text-white"
                >
                  <span className="flex-1">Informes Semanal</span>
                </NavLink>
                <NavLink
                  to="/informes"
                  className="flex items-center gap-x-1 rounded-md py-2 text-sm font-medium text-white"
                >
                  <span className="flex-1">Informes Mensual</span>
                </NavLink>
              </ul>
            </>
          ) : (
            <NavLink
              to="/informes"
              className="flex items-center gap-x-3 rounded-md px-5 py-2 text-sm font-medium text-white "
            >
              <span className="text-lg text-center">
                <BsFileBarGraph />
              </span>
            </NavLink>
          )}
        </ul>
      </div>

      {/* Botón Cerrar Sesión */}
      <div
        className={`${
          !isExtendido && altura <= 350 ? "block" : "absolute bottom-0"
        } py-4 px-5`}
      >
        <div className="px-2 w-full">
          <button
            className="flex items-center text-white gap-3 hover:text-red-500"
            onClick={handleClose}
          >
            <span>
              <PiSignOutFill className="text-xl" />
            </span>
            {isExtendido && (
              <span className="font-normal text-base">Cerrar Sesión</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideBar;