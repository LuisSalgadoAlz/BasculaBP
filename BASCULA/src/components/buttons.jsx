import { IoAddOutline } from "react-icons/io5";
import { FiSave } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa";
import { GrPrint } from "react-icons/gr";
import { MiniSpinner, Spinner } from "./alerts";

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


export const ButtonAddBoleta = ({ name, fun }) => {
  return (
    <>
      <button
        type="button"
        onClick={fun}
        className="px-5 py-3  text-sm font-medium text-white focus:outline-none bg-[#955e37] rounded-lg border border-gray-200 flex items-center gap-3">
        <IoAddOutline />
        <span>{name}</span>
      </button>
    </>
  );
};

export const ButtonPrint = ({ name, fun, isLoad, color }) => {
  return (
    <>
      <button
        type="button"
        onClick={fun}
        disabled={isLoad}
        className={`px-5 py-3  text-sm font-medium text-white focus:outline-none ${color} rounded-lg border border-gray-200 flex items-center gap-3 transition-transform duration-300 ease-in-out hover:scale-105`}>
        {!isLoad ? <GrPrint /> : <MiniSpinner />}
        <span>{name}</span>
      </button>
    </>
  );
}

export const Pagination = ({ pg, sp, hp, dt }) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        className="w-8 h-8 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
        onClick={() => sp(1)}
      >
        {'<<'}
      </button>
      <button
        className="w-8 h-8 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
        onClick={() => hp(-1)}
      >
        {'<'}
      </button>
      <span className="px-2 text-gray-600">{pg} {' / '} {dt && dt.pagination.totalPages}</span>
      <button
        className="w-8 h-8 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
        onClick={() => hp(1)}
      >
        {'>'}
      </button>
      <button
        className="w-8 h-8 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
        onClick={() => sp(dt && dt.pagination.totalPages)}
      >
        {'>>'}
      </button>
    </div>
  );
};


export const StatCard = ({ icon, title, value, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 max-sm:p-3 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} mr-4 max-sm:hidden`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-500 max-sm:text-sm">{title}</p>
          <h4 className="text-2xl font-bold text-gray-800 max-sm:text-sm">{value}</h4>
        </div>
      </div>
    </div>
  );
};