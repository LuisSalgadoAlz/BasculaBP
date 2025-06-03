import { useEffect, useState } from "react";
import { FiCalendar, FiClock } from "react-icons/fi";
import { FaBox } from "react-icons/fa";
import { getDataSelectSilos, postAnalizarQR, } from "../../hooks/tolva/formDataTolva";
import { Modals } from "../../components/tolva/modals";
import { Toaster, toast } from 'sonner';

const StatCard = ({ icon, title, value, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} mr-4`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
        </div>
      </div>
    </div>
  );
};

const DashboardTolva = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const [modalDeAsignacion, setModalDeAsignacion] = useState(false)
  const [data, setData] = useState('')
  const [silos, setSilos] = useState([])
  const [formData, setFormData] = useState({silo: ''})

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      // Limpiar URL anterior si existe
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage.url);
      }

      const imageObject = {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      };

      setSelectedImage(imageObject);
    }
  };

  const removeImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.url);
      setSelectedImage(null);
      document.getElementById("fileInput").value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleScanQr = async() => {
    setModalDeAsignacion(true)
    const response = await postAnalizarQR(selectedImage, setIsLoadingImage)
    if (response?.err) {
      toast.error(response?.err);
      setData('')
      setModalDeAsignacion(false)
      return
    }
    setData(response?.boleta)
  }

  const handleCloseModalAsignacion = () => {
    setModalDeAsignacion(false)
    setData('');
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev)=>({
      ...prev, [name] : value
    }))
  }

  useEffect(() => {
    getDataSelectSilos(setSilos)
  }, []);

  const propsModalAsignacion = {
    hdlClose: handleCloseModalAsignacion, 
    isLoadingImage, 
    data,  
    silos, 
    handleChange, 
  }


  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        {/* Encabezado */}
        <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
          <div className="parte-izq">
            <h1 className="text-3xl font-bold titulo">Registros: Boletas</h1>
            <h1 className="text-gray-600 max-sm:text-sm">
              {" "}
              Sistema de gestión de almacenamiento de boletas.
            </h1>
          </div>
        </div>
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-3 max-sm:hidden">
          <StatCard
            icon={<FiCalendar size={24} className="text-white" />}
            title="Total Boletas"
            value={0}
            color="bg-blue-500"
          />
          <StatCard
            icon={<FiClock size={24} className="text-white" />}
            title="Pendientes"
            value={0}
            color="bg-amber-500"
          />
          <StatCard
            icon={<FaBox size={24} className="text-white" />}
            title="Granza Americana"
            value={0}
            color="bg-yellow-500"
          />
          <StatCard
            icon={<FaBox size={24} className="text-white" />}
            title="Granza Nacional"
            value={0}
            color="bg-red-500"
          />
        </div>

        {/* Tabla de logs con acciones */}
        <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Analizador de Códigos QR
            </h2>
          </div>
          <div className="w-full p-4">
            {!selectedImage ? (
              <label
                htmlFor="fileInput"
                className="flex flex-col items-center rounded border border-gray-300 p-4 text-gray-900 shadow-sm sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
                  />
                </svg>

                <span className="mt-4 font-medium">Seleccionar imagen</span>

                <span className="mt-2 inline-block rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-center text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-100">
                  Buscar archivo
                </span>

                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </label>
            ) : (
              <div className="space-y-4">
                {/* Vista previa de la imagen */}
                <div className="relative">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.name}
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />

                  {/* Botón para eliminar imagen */}
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                    title="Eliminar imagen"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Información de la imagen */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedImage.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedImage.size)}
                  </p>
                </div>

                {/* Botón para subir */}
                <button
                  onClick={handleScanQr}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Subir imagen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster position="top-center" toastOptions={{style: { background: '#955e37', color: 'white'},}}/>
      {modalDeAsignacion && <Modals {...propsModalAsignacion}/>}
    </div>
  );
};

export default DashboardTolva;
