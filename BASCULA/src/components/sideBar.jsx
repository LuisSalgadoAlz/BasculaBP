import { RUTAS } from "../constants/rutas";
import { NavLink } from "react-router";
import { MdOutlineScale } from "react-icons/md";

const SideBar = () => {
  return (
    <>
      <div className="w-[290px] sidebar p-1">
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
              class="block w-full p-2 text-white border border-[#725033] rounded-md bg-[#5A3F27] text-sm focus:text-white  focus:border-blue-500"
              placeholder="Buscar..."
            />
          </div>
        </div>

        <div className="mt-8 p-2">
          <ul className="flex w-full min-w-0 flex-col gap-1 px-2">
            {/* {RUTAS.map((data, key) => (
              <NavLink key={key} to={data.path}>
                {data.name}
              </NavLink>
            ))} */}
          </ul>
        </div>
        <div></div>
        <div></div>
      </div>
    </>
  );
};

export default SideBar;
