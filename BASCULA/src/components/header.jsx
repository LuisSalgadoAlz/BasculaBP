import { BiDockLeft } from "react-icons/bi";  
import { RxHamburgerMenu } from "react-icons/rx";
import { SideBarCel, SideBarCelAdmin, SideBarCelGuardia, SideBarCelTolva } from "./sideBarCel";
import { useState } from "react";
import { VERSION } from "../constants/global";

const Header = ({ title, fun, type }) => {
  const [show, setShow] =useState(false)
  const handleClose = () => setShow(!show)
  return (
    <>
      <div className="bg-amber-50 w-full h-16 shadow-sm flex items-center gap-6">
        <div>
          <button
            onClick={fun}
            className="text-lg text-gray-700 ml-8 flex items-center max-sm:hidden"
          >
            <BiDockLeft />
          </button>
          <button
            onClick={()=>setShow(true)}
            className="text-lg text-gray-700 ml-8 hidden items-center max-sm:block"
          >
            <RxHamburgerMenu />
          </button>
        </div>
        <div className="flex items-center">
          <h1 className="font-bold text-xl text-[#955e37] max-sm:text-sm">
            {title}
          </h1>
          <h1 className="px-3 text-sm text-gray-400">
            V. {VERSION}
          </h1>
        </div>
      </div>
      {(show && type=='BASCULA') &&  <SideBarCel hdlClose={handleClose} />}
      {(show && type=='ADMINISTRADOR') &&  <SideBarCelAdmin hdlClose={handleClose} />}
      {(show && type=='TOLVA') &&  <SideBarCelTolva hdlClose={handleClose} />}
      {(show && type=='GUARDIA') &&  <SideBarCelGuardia hdlClose={handleClose} />}
    </>
  );
};

export default Header;
