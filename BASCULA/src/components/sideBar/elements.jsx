import { Children, useState } from "react";
import { useNavigate } from "react-router";
import { PiSignOutFill, PiUserCircleFill, PiCaretDownFill } from "react-icons/pi";
import Cookies from "js-cookie";
import { MdOutlineScale, MdOutlineAdminPanelSettings, MdOutlineSecurity  } from "react-icons/md";
import { FaScaleUnbalancedFlip } from "react-icons/fa6";
import { NavLink } from "react-router";
import { IoCalendarOutline } from "react-icons/io5";
import { BsFileBarGraph } from "react-icons/bs";
import { SlSupport } from "react-icons/sl";
import { AiOutlineFileExclamation } from "react-icons/ai";
import { BiFilterAlt } from "react-icons/bi";
import { TbReportAnalytics } from "react-icons/tb";

const LISTICONS = {
  'Admin' : <MdOutlineAdminPanelSettings />, 
  'Bascula' : <FaScaleUnbalancedFlip />,
  'Tolva' : <BiFilterAlt />,
  'Guardia' : <MdOutlineSecurity />,
  'Reportes' : <TbReportAnalytics />
}

export const SideBarBase = ({ children, extended = true }) => {
    return (
        <div className={`${ extended ? "w-[290px]" : "w-[80px]" } sidebar p-1 max-sm:hidden min-md:visible flex flex-col`} >
            {children}
        </div>
    );
};

export const UserDropdown = ({ isExtendido = true, altura = 500 }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleClose = () => {
    Cookies.remove("token");
    navigate("/");
  };

  const handleProfileClick = () => {
    console.log("Hola");
  };

  return (
    <div
      className={`${
        !isExtendido && altura <= 350 ? "block" : "mt-auto"
      }`}
    >
      <div className="px-3 w-full relative">
        {/* Contenedor principal */}
        <div className="relative w-full">
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
                <span className="flex-1 text-left font-medium text-white">
                  {Cookies.get('name')}
                </span>
                <PiCaretDownFill 
                  className={`text-xs text-white/70 transition-all duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </>
            )}
          </button>

          {/* Dropdown cuando está extendido - aparece abajo */}
          {isDropdownOpen && isExtendido && (
            <div className="absolute bottom-full left-3 right-3 mb-3 bg-[#725033] border border-[#725033] rounded-lg shadow-xl z-50 backdrop-blur-sm">
              {/* <button
                className="w-full px-4 py-3.5 text-left text-sm text-slate-200 hover:bg-[#765c45] hover:text-white transition-all duration-150 flex items-center gap-3"
                onClick={handleProfileClick}
              >
                <PiUserCircleFill className="text-base opacity-70" />
                Perfil
              </button> */}
              
              {/* <div className="border-t border-slate-600 my-1" /> */}
              
              <button
                className="w-full px-4 py-3.5 text-left text-sm text-slate-200 hover:bg-red-600 hover:rounded-lg hover:text-white transition-all duration-150 flex items-center gap-3"
                onClick={handleClose}
              >
                <PiSignOutFill className="text-base opacity-70" />
                Cerrar Sesión
              </button>
            </div>
          )}

          {/* Dropdown cuando está colapsado - aparece al lado */}
          {isDropdownOpen && !isExtendido && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-5 bg-[#725033] border border-[#725033] rounded-lg shadow-xl z-50 backdrop-blur-sm whitespace-nowrap">
              {/* <button
                className="w-full px-4 py-3.5 text-left text-sm text-slate-200 hover:bg-[#765c45] hover:text-white transition-all duration-150 flex items-center gap-3 min-w-[160px]"
                onClick={handleProfileClick}
              >
                <PiUserCircleFill className="text-base opacity-70" />
                Perfil
              </button>
              
              <div className="border-t border-slate-600 my-1" /> */}
              
              <button
                className="w-full px-4 py-3.5 text-left text-sm text-slate-200 hover:bg-red-600 hover:text-white hover:rounded-lg transition-all duration-150 flex items-center gap-3 min-w-[160px]"
                onClick={handleClose}
              >
                <PiSignOutFill className="text-base opacity-70" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

        {/* Overlay para cerrar el dropdown */}
        {isDropdownOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export const SidebarHeader = ({ isExtendido, title, subtitle }) => {
  return (
    <div data-sidebar="header" className="flex flex-col gap-2 p-2">
      <div
        className={`flex items-center ${
          isExtendido ? "gap-2 px-2 py-2" : "gap-2 px-4 py-2"
        }`}
      >
        <MdOutlineScale className="text-2xl text-amber-300 mt-1" />
        {isExtendido && (
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
        )}
      </div>
      <hr className="h-px my-1 bg-gray-700 border-0 dark:bg-gray-700" />
      {/* Esto se compenta para cuando este en operativo y ya estne todos los reportes y el buscar sea mas facil. */}
      {/* {isExtendido && (
        <div className="px-2 py-2">
          <input
            type="text"
            className="w-full p-2 text-white hidden border border-[#725033] rounded-md bg-[#5A3F27] text-sm focus:border-blue-500"
            placeholder="Buscar..."
          />
        </div>
      )} */}
    </div>
  );
};

export const NavigationRoutes = ({ routes, isExtendido, sectionTitle, userRole, activeDropdown, setActiveDropdown }) => {
  const [internalDropdownOpen, setInternalDropdownOpen] = useState(false);
  const isAdmin = userRole === 'ADMINISTRADOR';
  
  const isDropdownOpen = !isExtendido ? (activeDropdown === sectionTitle) : internalDropdownOpen;

  const handleDropdownToggle = () => {
    if (!isExtendido) {
      if (isDropdownOpen) {
        setActiveDropdown(null);
      } else {
        setActiveDropdown(sectionTitle);
      }
    } else {
      setInternalDropdownOpen(!internalDropdownOpen);
    }
  };

  const handleItemClick = () => {
    if (!isExtendido) {
      setActiveDropdown(null);
    }
  };

  // Si es administrador
  if (isAdmin) {
    // Si no está extendido, mostrar menú flotante al hover/click
    if (!isExtendido) {
      return (
        <div className="px-2">
          <div className="relative group w-full">
            <button
              onClick={handleDropdownToggle}
              className="flex items-center justify-center rounded-md py-2 px-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors w-full"
            >
              <span className="text-lg">{LISTICONS[sectionTitle]}</span>
            </button>

            {/* Menú flotante */}
            {(isDropdownOpen || false) && (
              <div className="absolute left-full top-0 ml-4 bg-[#31251b] rounded-md shadow-lg z-20 min-w-[200px] py-1">
                <div className="px-3 py-2 text-xs text-gray-300 border-b border-gray-700">
                  {sectionTitle || 'Administración'}
                </div>
                {routes.map((data, key) => (
                  <NavLink
                    key={key}
                    to={data.path}
                    className="flex items-center gap-x-3 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                    onClick={handleItemClick}
                  >
                    <span className="text-lg">{data.icon}</span>
                    <span>{data.name}</span>
                  </NavLink>
                ))}
              </div>
            )}

            {/* Tooltip del botón principal cuando no está abierto */}
            {!isDropdownOpen && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-6 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                {sectionTitle || 'Administración'}
              </div>
            )}
          </div>
          <hr className="h-px my-4 bg-gray-700 border-0 dark:bg-gray-700" />
        </div>
      );
    }

    // Si está extendido, mostrar como dropdown
    return (
      <div className="px-2">
        <div className="relative">
          <button
            onClick={handleDropdownToggle}
            className="flex items-center rounded-md py-2 text-sm font-medium text-white w-full hover:bg-gray-700 transition-colors gap-x-3 px-3"
          >
            <span className="text-lg">{LISTICONS[sectionTitle]}</span>
            <span className="flex-1 text-left">{sectionTitle || 'Administración'}</span>
            <svg 
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="mt-1 space-y-1">
              {routes.map((data, key) => (
                <div key={key} className="relative group w-full">
                  <NavLink
                    to={data.path}
                    className="flex items-center rounded-md py-2 text-sm font-medium text-white hover:bg-gray-600 transition-colors gap-x-3 px-3"
                  >
                    <span className="text-lg">{data.icon}</span>
                    <span className="flex-1">{data.name}</span>
                  </NavLink>
                </div>
              ))}
            </div>
          )}
        </div>
        <hr className="h-px my-4 bg-gray-700 border-0 dark:bg-gray-700" />
      </div>
    );
  }

  // Para usuarios no administradores, mantener el comportamiento original
  return (
    <div className="p-2">
      <ul className="flex w-full flex-col gap-1 px-2">
        {isExtendido && sectionTitle && (
          <h1 className="px-3 text-sm text-gray-300">{sectionTitle}</h1>
        )}
        {routes.map((data, key) => (
          <div key={key} className="relative group w-full">
            <NavLink
              to={data.path}
              className={`flex items-center rounded-md py-2 text-sm font-medium text-white ${
                isExtendido ? 'gap-x-3 px-3' : 'justify-center px-2'
              }`}
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
      <hr className="h-px my-4 bg-gray-700 border-0 dark:bg-gray-700" />
    </div>
  );
};

export const SupportSection = ({ isExtendido, onShowModal }) => {
  return (
    <div className={isExtendido ? `pb-2 px-2` : 'pb-2'}>
      <ul className="flex w-full flex-col gap-1 px-2">
        {isExtendido ? (
          <ul>
            <h1 className="px-3 text-sm text-gray-300">Soporte</h1>
            <button
              onClick={onShowModal}
              className="flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-white mt-1"
            >
              <span className="text-lg">
                <SlSupport />
              </span>
              <span className="flex-1">Soporte</span>
            </button>
          </ul>
        ) : (
          <div className="relative group w-max mt-2">
            <button
              onClick={onShowModal}
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
        )}
      </ul>
      <hr className="h-px my-4 bg-gray-700 border-0 dark:bg-gray-700" />
    </div>
  );
};

export const LogsSection = ({ isExtendido }) => {
  return (
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
          </>
        ) : (
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
        )}
      </ul>
      <hr className="h-px my-4 bg-gray-700 border-0 dark:bg-gray-700" />
    </div>
  );
};