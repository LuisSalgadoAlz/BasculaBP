import { useNavigate } from "react-router";
const ViewDisabled = () => {
    const navigate = useNavigate()

    const handleBack = () => {
        navigate(-1)
    }

    return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="p-6 max-w-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">En desarrollo.</h2>
          <p className="text-gray-600">Trabajando para ofrecerle la mejor experiencia posible.</p>
          <div className="mt-6 flex justify-end">
            <button className="px-4 py-2 text-white bg-red-600 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105" onClick={handleBack}>
              Regresar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewDisabled;
