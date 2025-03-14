import { BiDockLeft } from "react-icons/bi";  
import logo from '../assets/logo.png'

const Header = ({ title, fun }) => {
  return (
    <>
      <div className="bg-amber-50 w-full max-h-16 shadow-sm flex items-center gap-6">
        <div>
          <button
            onClick={fun}
            className="text-lg text-gray-700 ml-8 flex items-center"
          >
            <BiDockLeft />
          </button>
        </div>
        <div>
          <h1 className="font-bold text-xl text-[#955e37]">
            {title}
          </h1>
        </div>
      </div>
    </>
  );
};

export default Header;
