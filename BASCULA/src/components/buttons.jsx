import { IoAddOutline } from "react-icons/io5";
import { FiSave } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa";

export const ButtonAdd = ({ name, fun }) => {
  return (
    <>
      <button
        type="button"
        onClick={fun}
        className="px-5 py-3  text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 flex items-center gap-3">
        <IoAddOutline />
        <span>{name}</span>
      </button>
    </>
  );
};

export const ButtonSave = ({ name, fun }) => {
  return (
    <>
      <button
        type="button"
        onClick={fun}
        className="px-5 py-3  text-sm font-medium focus:outline-none bg-[#955e37] text-white rounded-lg border border-gray-200 flex items-center gap-3">
        <FiSave />
        <span>{name}</span>
      </button>
    </>
  );
};

export const ButtonVolver = ({ name, fun }) => {
  return (
    <>
      <button
        type="button"
        onClick={fun}
        className="px-5 py-3  text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 flex items-center gap-3">
        <FaArrowLeft />
        <span>{name}</span>
      </button>
    </>
  );
};



