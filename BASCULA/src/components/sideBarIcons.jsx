import { NavLink, useNavigate } from "react-router";
import { MdOutlineScale, MdOutlineDashboard } from "react-icons/md";
import { BsClipboard2Pulse, BsFileBarGraph  } from "react-icons/bs";
import { RiTruckLine } from "react-icons/ri";
import { FiUsers } from "react-icons/fi";
import { AiOutlineProduct } from "react-icons/ai";
import { PiSignOutFill } from "react-icons/pi";



const RUTAS_PRINCIPALES = [
  {
    path: "/Dashboard",
    name: "Dashboard",
    icon: <MdOutlineDashboard />,
  },
  {
    path: "/Boletas",
    name: "Boletas",
    icon: <BsClipboard2Pulse />,
  },
  {
    path: "/trasporte",
    name: "Trasporte",
    icon: <RiTruckLine />,
  },
  ,
  {
    path: "/clientes",
    name: "clientes",
    icon: <FiUsers  />,
  },
  ,
  {
    path: "/productos",
    name: "Productos",
    icon: <AiOutlineProduct />,
  },
]

const SideBarIcons = () => {
    const navigate = useNavigate()

    const handleClose = () =>{
        window.localStorage.removeItem('token')
        navigate('/')
    }
    return (
    <>
      <div className="w-[80px] sidebar p-1">
        <div data-sidebar="header" className="flex flex-col gap-2 p-2">
          <div className="flex items-center gap-2 px-4 py-2">
            <MdOutlineScale className="text-2xl justify-center items-center text-amber-300 mt-1" />
          </div>
        </div>
        {/* Parte principal del sistema */}
        <div className="p-2">
          <ul className="flex w-full min-w-0 flex-col gap-1 px-2">
            {RUTAS_PRINCIPALES.map((data, key) => (
              <NavLink className="flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-white" key={key} to={data.path}>
                <span className="text-lg font-normal ">{data.icon}</span>
              </NavLink>
            ))}
          </ul>
          <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
        </div>

        {/* Parte de informes */}
        <div className="pb-2">
            <ul className="flex w-full min-w-0 flex-col gap-1 px-4 border-l-emerald-50">
                <NavLink to='/informes' className="flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-white">
                    <span className="text-lg font-normal "><BsFileBarGraph /></span>
                </NavLink>
            </ul>
        </div>
        <div className="absolute bottom-0 p-4">
            <div className="px-2 w-full">
                <button className="flex items-center text-white gap-3 hover:text-red-500" onClick={handleClose}>
                    <span><PiSignOutFill className="text-xl" /></span>
                </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default SideBarIcons;
