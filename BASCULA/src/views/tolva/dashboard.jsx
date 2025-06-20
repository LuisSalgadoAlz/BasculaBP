import { useEffect, useState } from "react";
import { FiCalendar, FiClock } from "react-icons/fi";
import { FaBox } from "react-icons/fa";
import {
  getBoletaSinQR,
  getDataAsign,
  getDataSelectSilos,
  getDatosUsuarios,
  getStatsTolvaDiarias,
  getTolvasDeDescagas,
  postAnalizarQR,
  updateFinalizarDescarga,
  updateSilos,
} from "../../hooks/tolva/formDataTolva";
import { FinalizarDescarga, FinalizarDescargaConMotivo, Modals } from "../../components/tolva/modals";
import { Toaster, toast } from "sonner";
import { isSelectedView, noSelectectView } from "../../constants/boletas";
import { TableTolva, TolvaSection } from "../../components/tolva/table";
import { NoData, Spinner } from "../../components/alerts";
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
  const [isLoadingUserData, setIsLoadingUserData] = useState(false)
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [modalDeAsignacion, setModalDeAsignacion] = useState(false);
  const [data, setData] = useState("");
  const [silos, setSilos] = useState([]);
  const [formData, setFormData] = useState({ silo: "" });
  const [error, setError] = useState("");
  const [isLoadAsingar, setIsLoadAsingar] = useState(false);
  const [modeView, setModeView] = useState(1);
  const [silosAsignados, setSilosAsignados] = useState([{}])
  const [isLoadingTable, setLoadingTables] = useState(false)
  const [stats, setStats] = useState()
  const [pagination, setPagination] = useState(1)
  const [buscarID, setBuscarID] = useState('')
  const [tolva, setTolva] = useState({})
  const [modalConfirmacion, setModalConfirmacion] = useState(false)
  const [selectedTolva, setSeletedTolva] = useState()
  const [isConfirmarLoading, setIsConfirmarLoading] = useState(false)
  const [modalConfirmacionTime, setModalConfirmacionTime] = useState(false)

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
    setFormData("")
    setError("")
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

    if(!formData?.tolvaDescarga) {
      toast.error('Debe selecionar una tolva de descarga.')
      return
    }
    setError("");
    const response = await updateSilos(formData, data?.id, setIsLoadAsingar);
    if (response?.msg) {
      getStatsTolvaDiarias(setStats)
      toast.success(response?.msg);
      setModalDeAsignacion(false);
      setFormData("");
      getTolvasDeDescagas(setTolva)
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage.url);
        setSelectedImage(null);
        document.getElementById("fileInput").value = "";
      }
      return
    }
    if (response?.err) toast.error(response?.err);
  };

  const onFinalizarDescarga = (item) => {
    const fechaInicio = new Date(item.fechaEntrada)
    const fechaFinal = new Date()

    const TIEMPOPROCESO = fechaFinal - fechaInicio;
    const totalSegundos = Math.floor(TIEMPOPROCESO / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    // Mostrar resultado
    console.log(`Horas: ${horas % 24}, Minutos: ${minutos % 60}`);
    setSeletedTolva(item.id)

    if(userData?.UsuariosPorTolva?.tolva==1 && ((horas===0 && minutos>15) && (horas===0 && minutos<50))){
      setModalConfirmacion(true)
      return
    }
    if(userData?.UsuariosPorTolva?.tolva==2 && ((horas===0 && minutos>15) && (horas===0 && minutos<40))){
      setModalConfirmacion(true)
      return
    }
    setModalConfirmacion(true)
  }

  const hdlConfirmarFinalizacionCorrecta = async() => {
    console.log(selectedTolva)
    const response = await updateFinalizarDescarga(selectedTolva, setIsConfirmarLoading, {})
    if(response?.msg){
      toast.success(response?.msg);
      getTolvasDeDescagas(setTolva)
      setModalConfirmacion(false)
      getDataAsign(setSilosAsignados, setLoadingTables)

    }
  }

  const hdlCancelConfirmacion = async() =>{
    setModalConfirmacion(false)
    setModalConfirmacionTime(false)
  }

  useEffect(() => {
    getDataSelectSilos(setSilos);
    getStatsTolvaDiarias(setStats)
    getDatosUsuarios(setUserData, setIsLoadingUserData)
    getTolvasDeDescagas(setTolva)
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

  const dashboardProps = {
    stats,
    modeView,
    setModeView,
    selectedImage,
    silosAsignados,
    isLoadingTable,
    pagination,
    setPagination,
    handlePagination,
    handleKeyDown,
    handleChangeForSearch,
    handleClickSearch,
    handleImageChange,
    removeImage,
    handleScanQr,
    formatFileSize,
    tolva,
    onFinalizarDescarga,
  };

  const propsModalConfirmacion = {
    hdlSubmit: hdlConfirmarFinalizacionCorrecta,
    isLoading: isConfirmarLoading, 
    hdClose: hdlCancelConfirmacion
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        {/* Encabezado */}
        <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
          <div className="parte-izq">
            <h1 className="text-3xl font-bold titulo max-sm:text-xl">Registros de: {userData?.name || 'Cargando...'} </h1>
            <h1 className="text-md   font-bold titulo">Tolva Asignada: {`Tolva ${userData?.UsuariosPorTolva?.tolva || 'NO ASIGNADA'}`}</h1>
            <h1 className="text-gray-600 max-sm:text-sm">
              {" "}
              Sistema de gestión de almacenamiento de boletas en tolva.
            </h1>
          </div>
        </div>
        {isLoadingUserData ? (
          <div className="flex items-center justify-center min-h-[70vh]">
            <Spinner />
          </div>
        ) : (
          <>
            {userData?.name && userData?.UsuariosPorTolva ? (
              <DashboardContent {...dashboardProps}/>
            ) : (
              <NoTolvaAssignedMessage />
            )}
          </>
        )}
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#333', // estilo general
            color: 'white',
          },
          error: {
            style: {
              background: '#ff4d4f', // rojo fuerte
              color: '#fff',
            },
          },
        }}
      />
      {modalConfirmacion && <FinalizarDescarga {...propsModalConfirmacion}/>}
      {modalConfirmacionTime && <FinalizarDescargaConMotivo hdClose={hdlCancelConfirmacion}/>}
      {modalDeAsignacion && <Modals {...propsModalAsignacion} />}
    </div>
  );
};

/* Partes del dashboard */

function DashboardContent({
  stats,
  modeView,
  setModeView,
  selectedImage,
  silosAsignados,
  isLoadingTable,
  pagination,
  setPagination,
  handlePagination,
  handleKeyDown,
  handleChangeForSearch,
  handleClickSearch,
  handleImageChange,
  removeImage,
  handleScanQr,
  formatFileSize, 
  tolva,
  onFinalizarDescarga, 
}) {
  const isSelectedView = "bg-[#725033] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200";
  const noSelectectView = "bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200";

  return (
    <>
      {/* Tarjetas de estadísticas - Solo en desktop */}
      <StatsCards stats={stats} />
      
      {/* Filtros de vista */}
      <ViewModeToggle 
        modeView={modeView}
        setModeView={setModeView}
        isSelectedView={isSelectedView}
        noSelectectView={noSelectectView}
      />
      
      {/* Contenido principal */}
      <MainContentCard 
        modeView={modeView}
        selectedImage={selectedImage}
        silosAsignados={silosAsignados}
        isLoadingTable={isLoadingTable}
        pagination={pagination}
        setPagination={setPagination}
        handlePagination={handlePagination}
        handleKeyDown={handleKeyDown}
        handleChangeForSearch={handleChangeForSearch}
        handleClickSearch={handleClickSearch}
        handleImageChange={handleImageChange}
        removeImage={removeImage}
        handleScanQr={handleScanQr}
        formatFileSize={formatFileSize}
        tolva={tolva}
        onFinalizarDescarga={onFinalizarDescarga}
      />
    </>
  );
}

function StatsCards({ stats }) {
  const statsData = [
    {
      icon: <FiCalendar size={24} className="text-white" />,
      title: "Total Boletas(hoy)",
      value: stats?.total || 0,
      color: "bg-blue-500"
    },
    {
      icon: <FiClock size={24} className="text-white" />,
      title: "Pendientes(hoy)",
      value: stats?.pendientes || 0,
      color: "bg-amber-500"
    },
    {
      icon: <FaBox size={24} className="text-white" />,
      title: "Granza Americana(hoy)",
      value: stats?.gamericana || 0,
      color: "bg-yellow-500"
    },
    {
      icon: <FaBox size={24} className="text-white" />,
      title: "Granza Nacional(hoy)",
      value: stats?.gnacional || 0,
      color: "bg-red-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-3 max-sm:hidden">
      {statsData.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          title={stat.title}
          value={stat.value}
          color={stat.color}
        />
      ))}
    </div>
  );
}

// Componente para alternar entre modos de vista
function ViewModeToggle({ modeView, setModeView, isSelectedView, noSelectectView }) {
  return (
    <div className="filtros grid grid-rows-1 grid-flow-col my-4 max-sm:grid-rows-3 gap-0.5">
      <button
        onClick={() => setModeView(1)}
        className={modeView === 1 ? isSelectedView : noSelectectView}
      >
        Escanear QR
      </button>
      <button
        onClick={() => setModeView(2)}
        className={modeView === 2 ? isSelectedView : noSelectectView}
      >
        Descargando
      </button>
      <button
        onClick={() => setModeView(3)}
        className={modeView === 3 ? isSelectedView : noSelectectView}
      >
        Finalizadas
      </button>
    </div>
  );
}

// Componente principal de contenido
function MainContentCard({ 
  modeView, 
  selectedImage,
  silosAsignados,
  isLoadingTable,
  pagination,
  setPagination,
  handlePagination,
  handleKeyDown,
  handleChangeForSearch,
  handleClickSearch,
  handleImageChange,
  removeImage,
  handleScanQr,
  formatFileSize, 
  tolva,
  onFinalizarDescarga
}) {
  return (
    <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden min-h-[450px]">
      {modeView ===1 && (
        <QRScannerView 
          selectedImage={selectedImage}
          handleKeyDown={handleKeyDown}
          handleChangeForSearch={handleChangeForSearch}
          handleClickSearch={handleClickSearch}
          handleImageChange={handleImageChange}
          removeImage={removeImage}
          handleScanQr={handleScanQr}
          formatFileSize={formatFileSize}
        />
      )}
      {modeView===2 && (
        <DischargeIntoHopperView tolva={tolva} onFinalizarDescarga={onFinalizarDescarga}/>
      )}
      {modeView===3 && (
        <AssignedView 
          silosAsignados={silosAsignados}
          isLoadingTable={isLoadingTable}
          pagination={pagination}
          setPagination={setPagination}
          handlePagination={handlePagination}
        />
      )}
    </div>
  );
}

// Componente para la vista de escáner QR
function QRScannerView({
  selectedImage,
  handleKeyDown,
  handleChangeForSearch,
  handleClickSearch,
  handleImageChange,
  removeImage,
  handleScanQr,
  formatFileSize
}) {
  return (
    <>
      <QRScannerHeader 
        handleKeyDown={handleKeyDown}
        handleChangeForSearch={handleChangeForSearch}
        handleClickSearch={handleClickSearch}
      />
      <QRScannerContent 
        selectedImage={selectedImage}
        handleImageChange={handleImageChange}
        removeImage={removeImage}
        handleScanQr={handleScanQr}
        formatFileSize={formatFileSize}
      />
    </>
  );
}

// Header del escáner QR
function QRScannerHeader({ handleKeyDown, handleChangeForSearch, handleClickSearch }) {
  return (
    <div className="p-4 sm:p-6 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col justify-baseline gap-4 w-full">
        <h2 className="text-md sm:text-xl font-semibold text-gray-800 text-left sm:text-left">
          Analizador de Códigos QR
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:min-w-[300px]">
          <input
            type="number" 
            className="flex-1 bg-white py-2.5 px-4 rounded-lg border focus:border transition-all duration-200 font-medium placeholder-gray-300" 
            onKeyDown={handleKeyDown}
            onChange={handleChangeForSearch}
            placeholder="Buscar por ID..."
          />
          
          <button 
            onClick={handleClickSearch}
            className="bg-[#725033] hover:bg-[#866548] text-white font-medium 
                      py-2.5 px-6 rounded-lg transition-all duration-200 
                      focus:outline-none focus:ring-2 focus:ring-[#a67c5a] 
                      min-w-[100px]"
          >
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
}

// Contenido del escáner QR
function QRScannerContent({ 
  selectedImage, 
  handleImageChange, 
  removeImage, 
  handleScanQr, 
  formatFileSize 
}) {
  return (
    <div className="w-full p-4">
      {!selectedImage ? (
        <ImageUploadArea handleImageChange={handleImageChange} />
      ) : (
        <ImagePreviewArea 
          selectedImage={selectedImage}
          removeImage={removeImage}
          handleScanQr={handleScanQr}
          formatFileSize={formatFileSize}
        />
      )}
    </div>
  );
}

// Área de carga de imagen
function ImageUploadArea({ handleImageChange }) {
  return (
    <label
      htmlFor="fileInput"
      className="flex flex-col bg-white min-h-[45vh] items-center justify-center rounded border border-gray-300 p-4 text-gray-900 shadow-sm sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <UploadIcon />
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
  );
}

// Área de vista previa de imagen
function ImagePreviewArea({ selectedImage, removeImage, handleScanQr, formatFileSize }) {
  return (
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
          <CloseIcon />
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
  );
}

// Vista de asignados
function AssignedView({ 
  silosAsignados, 
  isLoadingTable, 
  pagination, 
  setPagination, 
  handlePagination 
}) {
  return (
    <>
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Asignadas Hoy
        </h2>
      </div>
      
      <div className="w-full p-4 h-[550px] overflow-y-auto">
        {isLoadingTable && !silosAsignados ? (
          <Spinner />
        ) : (!silosAsignados?.data || silosAsignados.data.length === 0) ? (
          <div className="min-h-[550px] flex items-center justify-center">
            <NoData />
          </div>
        ) : (
          <TableTolva datos={silosAsignados.data} />
        )}
      </div>
      
      <div className="p-6 border-b border-gray-200 flex justify-center items-center">
        {silosAsignados?.data && silosAsignados.pagination.totalPages > 1 && (
          <Pagination 
            pg={pagination} 
            sp={setPagination} 
            hp={handlePagination} 
            dt={silosAsignados}
          />
        )}
      </div>
    </>
  );
}

// Componente para mensaje de sin tolva asignada
function NoTolvaAssignedMessage() {
  return (
    <div className="bg-white flex items-center justify-center shadow-md rounded-lg border border-gray-200 overflow-hidden min-h-[70vh]">
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <AlertIcon />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ¡Alerta!
          </h3>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              Usted no tiene una tolva asignada actualmente. Para poder acceder al sistema, 
              necesita tener una tolva asignada a su usuario.
            </p>
          </div>
          
          <ContactInfo />
        </div>
      </div>
    </div>
  );
}

// Información de contacto
function ContactInfo() {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-900">
        Por favor, comuníquese con:
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-blue-800">
            Departamento de IT
          </span>
        </div>
        <div className="text-sm text-gray-500 flex items-center justify-center">
          o
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-green-800">
            Jefe de Tolva
          </span>
        </div>
      </div>
    </div>
  );
}

// Iconos como componentes
function UploadIcon() {
  return (
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
  );
}

function CloseIcon() {
  return (
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
  );
}

function AlertIcon() {
  return (
    <svg
      className="mx-auto h-16 w-16 text-orange-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
      />
    </svg>
  );
}

const DischargeIntoHopperView = ({tolva, onFinalizarDescarga}) => {
  return(
    <>
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Descargando actualmente
        </h2>
      </div>
      <div className="">
        <TolvaSection datos={tolva?.descarga1} onFinalizar={onFinalizarDescarga}/>
      </div>
      <div className="">
        <TolvaSection datos={tolva?.descarga2} titulo="Tolva De Descarga #2" onFinalizar={onFinalizarDescarga}/>
      </div>
    </>
  )
}

export default DashboardTolva;
