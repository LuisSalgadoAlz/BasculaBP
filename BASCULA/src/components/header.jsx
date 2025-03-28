import { BiDockLeft } from "react-icons/bi";  
import { RxHamburgerMenu } from "react-icons/rx";
import { SideBarCel } from "./sideBarCel";
import { useState } from "react";

const Header = ({ title, fun }) => {
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
        <div>
          <h1 className="font-bold text-xl text-[#955e37] max-sm:text-sm">
            {title}
          </h1>
        </div>
      </div>
      {show && <SideBarCel hdlClose={handleClose} />}
    </>
  );
};

export default Header;
