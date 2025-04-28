import { NavLink, useNavigate } from "react-router";
import { MdOutlineScale, MdOutlineDashboard } from "react-icons/md";
import { BsClipboard2Pulse, BsFileBarGraph } from "react-icons/bs";
import { RiTruckLine } from "react-icons/ri";
import { FiUsers } from "react-icons/fi";
import { PiSignOutFill } from "react-icons/pi";
import { IoCalendarOutline } from "react-icons/io5";

import Cookies from "js-cookie";
import { VERSION } from "../constants/global";

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
          {isExtendido && <h1 className="px-3 text-sm text-gray-300">Bascula</h1>}
          {RUTAS_PRINCIPALES.map((data, key) => (
            <div key={key} className="relative group w-full">
              <NavLink
                to={data.path}
                className="flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-white"
              >
                <span className="text-lg">{data.icon}</span>
                {isExtendido && <span className="flex-1">{data.name}</span>}
              </NavLink>

              {!isExtendido && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-6 hidden group-hover:block sidebar text-white text-xs px-8 py-2 rounded shadow-lg z-10 whitespace-nowrap">
                  {data.name}
                </div>
              )}
            </div>
          ))}
        </ul>
        <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
      </div>

      {/* Reportes */}
      <div className="pb-2">
        <ul className="flex w-full flex-col gap-1 px-2">
          {isExtendido ? (
            <>
            <h1 className="px-3 text-sm text-gray-300">Calendario</h1>
              <NavLink
                to="/calendario"
                className="flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-white"
              >
                <span className="text-lg">
                  <IoCalendarOutline />
                </span>
                <span className="flex-1">Calendario</span>
              </NavLink>
              <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
              <h1 className="px-3 text-sm text-gray-300 mt-2">Reportes</h1>
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
                  to="/informes/diarios"
                  className="flex items-center gap-x-1 rounded-md py-2 text-sm font-medium text-white"
                >
                  <span className="flex-1">Informes Diarios</span>
                </NavLink>
                <NavLink
                  to="/informes/semanales"
                  className="flex items-center gap-x-1 rounded-md py-2 text-sm font-medium text-white"
                >
                  <span className="flex-1">Informes Semanal</span>
                </NavLink>
                <NavLink
                  to="/informes/mensual"
                  className="flex items-center gap-x-1 rounded-md py-2 text-sm font-medium text-white"
                >
                  <span className="flex-1">Informes Mensual</span>
                </NavLink>
              </ul>
            </>
          ) : (
            <>
              <div className="relative group w-max">
                <NavLink
                  to="/Calendario"
                  className="flex items-center gap-x-3 rounded-md px-5 py-2 text-sm font-medium text-white"
                >
                  <span className="text-lg text-center">
                    <IoCalendarOutline />
                  </span>
                </NavLink>

                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-6 hidden group-hover:block sidebar text-white text-xs px-8 py-2 rounded shadow-lg z-10 whitespace-nowrap">
                  Calendario
                </div>
              </div>
              <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
              <div className="relative group w-max mt-2">
                <NavLink
                  to="/informes"
                  className="flex items-center gap-x-3 rounded-md px-5 py-2 text-sm font-medium text-white"
                >
                  <span className="text-lg text-center">
                    <BsFileBarGraph />
                  </span>
                </NavLink>

                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-6 hidden group-hover:block sidebar text-white text-xs px-8 py-2 rounded shadow-lg z-10 whitespace-nowrap">
                  Informes
                </div>
              </div>
            </>
          )}
        </ul>
      </div>

      {/* Botón Cerrar Sesión */}
      <div
        className={`${
          !isExtendido && altura <= 350 ? "block" : "absolute bottom-0"
        } py-4 px-4`}
      > 
        <div className="w-full flex justify-center"><span className="text-white text-center text-sm">V. {VERSION}</span></div>
        <hr className="h-px mb-4 mt-2 bg-gray-200 border-0 dark:bg-gray-700" />
        <div className="px-3 w-full">
          <button
            className="flex items-center justify-center text-white gap-3 hover:text-red-500"
            onClick={handleClose}
          >
            <span>
              <PiSignOutFill className="text-xl" />
            </span>
            {isExtendido && (
              <span className="flex-1">Cerrar Sesión</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
