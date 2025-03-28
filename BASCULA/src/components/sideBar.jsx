import { NavLink, useNavigate } from "react-router";
import { MdOutlineScale, MdOutlineDashboard } from "react-icons/md";
import { BsClipboard2Pulse, BsFileBarGraph } from "react-icons/bs";
import { RiTruckLine } from "react-icons/ri";
import { FiUsers } from "react-icons/fi";
import { PiSignOutFill } from "react-icons/pi";

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

const SideBar = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    Cookies.remove("token");
    navigate("/");
  };
  
  return (
    <>
      <div className="w-[290px] sidebar p-1 max-h-screen max-sm:hidden min-md:visible">
        <div data-sidebar="header" className="flex flex-col gap-2 p-2">
          <div className="flex items-center gap-2 px-2 py-2">
            <MdOutlineScale className="text-2xl justify-center items-center text-amber-300 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">Baprosa</h2>
              <p className="text-xs text-sidebar-foreground/70 text-gray-400">
                Sistema de Gestión Bascula
              </p>
            </div>
          </div>
          <div className="px-2 py-2">
            <input
              type="text"
              className="block w-full p-2 text-white border border-[#725033] rounded-md bg-[#5A3F27] text-sm focus:text-white  focus:border-blue-500"
              placeholder="Buscar..."
            />
          </div>
        </div>
        {/* Parte principal del sistema */}
        <div className="p-2">
          <ul className="flex w-full min-w-0 flex-col gap-1 px-2">
            {RUTAS_PRINCIPALES.map((data, key) => (
              <NavLink
                className="flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-white"
                key={key}
                to={data.path}
              >
                <span className="text-lg font-normal ">{data.icon}</span>
                <span className="flex-1">{data.name}</span>
              </NavLink>
            ))}
          </ul>
          <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
        </div>

        {/* Parte de informes */}
        <div className="pb-2">
          <ul className="flex w-full min-w-0 flex-col gap-1 px-2 border-l-emerald-50">
            <h1 className="px-3 text-sm text-gray-300">Reportes</h1>
            <NavLink
              to="/informes"
              className="flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-white"
            >
              <span className="text-lg font-normal ">
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
          </ul>
        </div>
        <div className="absolute bottom-0 p-4">
          <div className="px-2 w-full">
            <button
              className="flex items-center text-white gap-3 hover:text-red-500"
              onClick={handleClose}
            >
              <span>
                <PiSignOutFill className="text-xl" />
              </span>
              <span className="font-normal text-base">Cerrar Sessión</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBar;
