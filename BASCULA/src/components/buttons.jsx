import { IoAddOutline } from "react-icons/io5";

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


