import { useEffect, useState } from "react";
import { FiCalendar, FiClock } from "react-icons/fi";
import { FaBox } from "react-icons/fa";
import {
  getBoletaSinQR,
  getDataAsign,
  getDataSelectSilos,
  getDatosUsuarios,
  getStatsTolvaDiarias,
  postAnalizarQR,
  updateSilos,
} from "../../hooks/tolva/formDataTolva";
import { Modals } from "../../components/tolva/modals";
import { Toaster, toast } from "sonner";
import { isSelectedView, noSelectectView } from "../../constants/boletas";
import { TableTolva } from "../../components/tolva/table";
import { NoData } from "../../components/alerts";
import { Pagination } from "../../components/buttons";

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
  const [userData, setUserData] = useState(null)
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [modalDeAsignacion, setModalDeAsignacion] = useState(false);
  const [data, setData] = useState("");
  const [silos, setSilos] = useState([]);
  const [formData, setFormData] = useState({ silo: "" });
  const [error, setError] = useState("");
  const [isLoadAsingar, setIsLoadAsingar] = useState(false);
  const [modeView, setModeView] = useState(false);
  const [silosAsignados, setSilosAsignados] = useState([{}])
  const [isLoadingTable, setLoadingTables] = useState(false)
  const [stats, setStats] = useState()
  const [pagination, setPagination] = useState(1)
  const [buscarID, setBuscarID] = useState('')
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

  const isToLarge = (bytes) => {
    if (bytes === 0) return 0;
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (
      sizes[i] == "MB" &&
      parseFloat((bytes / Math.pow(k, i)).toFixed(2)) > 10
    )
      return true;
    return false;
  };

  const handleScanQr = async () => {
    if (isToLarge(selectedImage.size)) {
      toast.error("Imagen demasido grande, tamaño debe ser menor a 10MB");
      return;
    }
    setModalDeAsignacion(true);
    const response = await postAnalizarQR(selectedImage, setIsLoadingImage);
    if (response?.err) {
      toast.error(response?.err);
      setData("");
      setModalDeAsignacion(false);
      return;
    }
    setData(response?.boleta);
  };

  const handleCloseModalAsignacion = () => {
    setModalDeAsignacion(false);
    setData("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleKeyDown = (e) => {
    const forbiddenKeys = ['e', 'E', '+', '-', '.', ','];
    if (forbiddenKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleChangeForSearch = (e) => {
    const { value } = e.target
    setBuscarID(value)
  }

  const handleClickSearch = async(e) => {
    setModalDeAsignacion(true);
    const response = await getBoletaSinQR(buscarID, setIsLoadingImage)
    if (response?.err) {
      toast.error(response?.err);
      setData("");
      setModalDeAsignacion(false);
      return;
    }
    setData(response?.boleta);
  }

  const hdlSubmit = async () => {
    const { silo, silo2, silo3 } = formData || {};

    if (!silo) {
      setError("No se ha seleccionado el silo principal.");
      return;
    }
    
    const filledSilos = [silo, silo2, silo3].filter(Boolean);
    const uniqueSilos = new Set(filledSilos);

    if (filledSilos.length !== uniqueSilos.size) {
      toast.error('Los silos no deben de ser iguales.');
      return;
    }
    setError("");
    const response = await updateSilos(formData, data?.id, setIsLoadAsingar);
    if (response?.msg) {
      getDataAsign(setSilosAsignados, setLoadingTables)
      getStatsTolvaDiarias(setStats)
      toast.success(response?.msg);
      setModalDeAsignacion(false);
      setFormData("");
    }
    if (response?.err) toast.error("Intente de nuevo");
  };

  useEffect(() => {
    getDataSelectSilos(setSilos);
    getStatsTolvaDiarias(setStats)
    getDatosUsuarios(setUserData)
  }, []);

  useEffect(() => {
    getDataAsign(setSilosAsignados, setLoadingTables, pagination)
  }, [pagination]);

  const handlePagination = (item) => {
    if (pagination>0) {
      const newRender = pagination+item
      if(newRender==0) return
      if(newRender>silosAsignados.pagination.totalPages) return
      setPagination(newRender) 
    }
  } 

  const handleResetPagination = () => {
    setPagination(1)
  }

  const propsModalAsignacion = {
    hdlClose: handleCloseModalAsignacion,
    hdlSubmit,
    isLoadingImage,
    data,
    silos,
    handleChange,
    error,
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        {/* Encabezado */}
        <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
          <div className="parte-izq">
            <h1 className="text-3xl font-bold titulo max-sm:text-xl">Registros de: {userData?.name || 'Cargando...'} </h1>
            <h1 className="text-md   font-bold titulo">Tolva Asignada: {`Tolva ${userData?.UsuariosPorTolva?.tolva}` || 'NO ASIGNADA'}</h1>
            <h1 className="text-gray-600 max-sm:text-sm">
              {" "}
              Sistema de gestión de almacenamiento de boletas en tolva.
            </h1>
          </div>
        </div>
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-3 max-sm:hidden">
          <StatCard
            icon={<FiCalendar size={24} className="text-white" />}
            title="Total Boletas(hoy)"
            value={stats?.total || 0}
            color="bg-blue-500"
          />
          <StatCard
            icon={<FiClock size={24} className="text-white" />}
            title="Pendientes(hoy)"
            value={stats?.pendientes || 0}
            color="bg-amber-500"
          />
          <StatCard
            icon={<FaBox size={24} className="text-white" />}
            title="Granza Americana(hoy)"
            value={stats?.gamericana || 0}
            color="bg-yellow-500"
          />
          <StatCard
            icon={<FaBox size={24} className="text-white" />}
            title="Granza Nacional(hoy)"
            value={stats?.gnacional || 0}
            color="bg-red-500"
          />
        </div>
        <div className="filtros grid grid-rows-1 grid-flow-col my-4">
          <button
            onClick={()=> setModeView(false)}
            className={modeView == false ? isSelectedView : noSelectectView}
          >
            Escanear QR
          </button>
          <button
            onClick={()=> setModeView(true)}
            className={modeView == true ? isSelectedView : noSelectectView}
          >
            Asignadas
          </button>
        </div>
        {/* Tabla de logs con acciones */}
        <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden min-h-[450px]">
          {!modeView && (
            <>
              <div className="p-4 sm:p-6 border-b border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col justify-baseline gap-4 w-full">
                  <h2 className="text-md sm:text-xl font-semibold text-gray-800 text-left sm:text-left">
                    Analizador de Códigos QR
                  </h2>
                  
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:min-w-[300px]">
                    <input
                      type="number" className="flex-1 bg-white py-2.5 px-4 rounded-lg border focus:border transition-all duration-200 font-medium placeholder-gray-300" 
                      onKeyDown={handleKeyDown}
                      onChange={handleChangeForSearch}
                      placeholder="Buscar por ID..."
                    />
                    
                    <button 
                    onClick={handleClickSearch}
                    className="bg-[#725033] hover:bg-[#866548] text-white font-medium 
                                      py-2.5 px-6 rounded-lg transition-all duration-200 
                                      focus:outline-none focus:ring-2 focus:ring-[#a67c5a] 
                                      min-w-[100px]">
                      Buscar
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-full p-4">
                {!selectedImage ? (
                  <label
                    htmlFor="fileInput"
                    className="flex flex-col bg-white min-h-[45vh] items-center justify-center rounded border border-gray-300 p-4 text-gray-900 shadow-sm sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
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
                      className="w-full bg-[#725033] text-white py-2 px-4 rounded-lg hover:bg-[#866548] transition-colors font-medium"
                    >
                      Encontrar Boleta
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {modeView && (
            <>
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Asiganadas Hoy
                </h2>
              </div>
              <div className="w-full p-4 h-[550px] overflow-y-auto">
                {(isLoadingTable && !silosAsignados) ? <Spinner /> : (!silosAsignados.data || silosAsignados.data.length == 0) ? (
                    <div className="min-h-[550px] flex items-center justify-center">
                      <NoData />
                    </div>
                ) : (
                  <TableTolva datos={silosAsignados?.data} />
                )}
              </div>
              <div className="p-6 border-b border-gray-200 flex justify-center items-center">
                {silosAsignados?.data && silosAsignados.pagination.totalPages > 1 && <Pagination pg={pagination} sp={setPagination} hp={handlePagination} dt={silosAsignados}/>}
              </div>
            </>
          )}
        </div>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{ style: { background: "#955e37", color: "white" } }}
      />
      {modalDeAsignacion && <Modals {...propsModalAsignacion} />}
    </div>
  );
};

export default DashboardTolva;
