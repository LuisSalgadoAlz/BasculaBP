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


