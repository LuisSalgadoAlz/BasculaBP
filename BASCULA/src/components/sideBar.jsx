import { NavLink, useNavigate } from "react-router";
import { MdOutlineScale, MdOutlineDashboard } from "react-icons/md";
import { BsClipboard2Pulse, BsFileBarGraph } from "react-icons/bs";
import { RiTruckLine } from "react-icons/ri";
import { FiUsers } from "react-icons/fi";
import { IoCalendarOutline } from "react-icons/io5";
import { AiOutlineFileExclamation } from "react-icons/ai";
import { SlSupport } from "react-icons/sl";
import Cookies from "js-cookie";
import { VERSION } from "../constants/global";
import { useState } from "react";
import { SupportModal } from "./alerts";
import { PiSignOutFill, PiUserCircleFill, PiCaretDownFill } from "react-icons/pi";

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
];

export const SideBar = ({ modo = "extendido", altura = 500 }) => {
  const navigate = useNavigate();
  const [ShowModalSupport, setShowModalSupport] = useState()
  const handleClose = () => {
    Cookies.remove("token");
    navigate("/");
  };
  const handleShowModal = () => setShowModalSupport(true)
  const handleCloseModal = () => setShowModalSupport(false)
  
  const isExtendido = modo === "extendido";

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
              <h2 className="text-lg font-bold text-white">Baprosa </h2>
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

      {/* Calendario */}
      <div className={isExtendido ? `pb-2 px-2` : 'pb-2'}>
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
              </ul>
              <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
              <ul>
                <h1 className="px-3 text-sm text-gray-300">Soporte</h1>
                <button
                  onClick={handleShowModal}
                  className="flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-white mt-1"
                >
                  <span className="text-lg">
                    <SlSupport />
                  </span>
                  <span className="flex-1">Soporte</span>
                </button>
              </ul>
            </>
          ) : (
            <>
              <div className="relative group w-max">
                <NavLink
                  to="/calendario"
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
              <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
              <div className="relative group w-max mt-2">
                <button
                  onClick={handleShowModal}
                  className="flex items-center gap-x-3 rounded-md px-5 py-2 text-sm font-medium text-white"
                >
                  <span className="text-lg">
                    <SlSupport />
                  </span>
                </button>

                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-6 hidden group-hover:block sidebar text-white text-xs px-8 py-2 rounded shadow-lg z-10 whitespace-nowrap">
                  Soporte
                </div>
              </div>
              <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
            </>
          )}
        </ul>
      </div>

      {isExtendido && 
        <>
          <div className="px-4">
            <hr className="h-px mb-2 mt-1 bg-gray-200 border-0 dark:bg-gray-700" />
          </div>
        </>
      }

      <div
        className={`${
          !isExtendido && altura <= 350 ? "block" : "absolute bottom-0"
        } py-3 px-4`}
      > 
        <div className="px-3 w-full relative">
          {/* Botón principal del usuario */}
          <button
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm text-white hover:bg-white/10 rounded-lg transition-all duration-200 ${
              !isExtendido ? "justify-center px-2" : ""
            } ${isDropdownOpen ? 'bg-white/10' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {/* Avatar */}
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-white/20">
              <img 
                src="/api/placeholder/36/36" 
                alt="Avatar" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <PiUserCircleFill className="text-white/80 text-xl hidden" />
            </div>
            
            {isExtendido && (
              <>
                <span className="flex-1 text-left font-medium text-white">Tom Cook</span>
                <PiCaretDownFill 
                  className={`text-xs text-white/70 transition-all duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </>
            )}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && isExtendido && (
            <div className="absolute bottom-full left-3 right-3 mb-3 bg-slate-700 border border-slate-600 rounded-lg shadow-xl py-2 z-50 backdrop-blur-sm">
              <button
                className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-600 hover:text-white transition-all duration-150 flex items-center gap-3"
                onClick={()=>console.log("Holaaaaaaa")}
              >
                <PiUserCircleFill className="text-base opacity-70" />
                Perfil
              </button>
              
              <div className="border-t border-slate-600 my-1" />
              
              <button
                className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-red-600 hover:text-white transition-all duration-150 flex items-center gap-3"
                onClick={handleClose}
              >
                <PiSignOutFill className="text-base opacity-70" />
                Cerrar Sesión
              </button>
            </div>
          )}

          {/* Overlay para cerrar el dropdown */}
          {isDropdownOpen && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsDropdownOpen(false)}
            />
          )}
        </div>
      </div>
      {ShowModalSupport && <SupportModal hdClose={handleCloseModal}/>}
    </div>
  );
};


export const SideBarAdmin = ({ modo = "extendido", altura = 500 }) => {
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
                Administración Bascula
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
          {isExtendido && <h1 className="px-3 text-sm text-gray-300">Admin</h1>}
          {RUTAS_ADMIN.map((data, key) => (
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
      <div className={isExtendido ? `pb-2 px-2` : 'pb-2'}>
        <ul className="flex w-full flex-col gap-1 px-2">
          {isExtendido ? (
            <>
            <h1 className="px-3 text-sm text-gray-300">Logs</h1>
              <NavLink
                to="/admin/logs"
                className="flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-white"
              >
                <span className="text-lg">
                  <AiOutlineFileExclamation />
                </span>
                <span className="flex-1">Registros</span>
              </NavLink>
              <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
            </>
          ) : (
            <>
              <div className="relative group w-max">
                <NavLink
                  to="/admin/logs"
                  className="flex items-center gap-x-3 rounded-md px-5 py-2 text-sm font-medium text-white"
                >
                  <span className="text-lg text-center">
                    <AiOutlineFileExclamation />
                  </span>
                </NavLink>

                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-6 hidden group-hover:block sidebar text-white text-xs px-8 py-2 rounded shadow-lg z-10 whitespace-nowrap">
                  Registros
                </div>
              </div>
              <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
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
