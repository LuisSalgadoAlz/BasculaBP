import { MdFilterListAlt } from "react-icons/md";
import { FaBalanceScale } from "react-icons/fa";
import {
  FiCalendar,
  FiPackage,
  FiTruck,
  FiMapPin,
  FiFileText,
  FiClock,
  FiX,
} from "react-icons/fi";
import { PiNewspaperClippingLight } from "react-icons/pi";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const StatusBadge = ({ paseDeSalida, data }) => {
  const getStatusConfig = () => {
    if (data?.estado === 'Completado' && !paseDeSalida) {
      return {
        text: "Boleta terminada, pero sin pase de salida",
        className: "bg-gray-500 text-white"
      };
    }
    
    if (!paseDeSalida) {
      return {
        text: "No ha completado su proceso",
        className: "bg-red-500 text-white"
      };
    }
    
    if (paseDeSalida.estado === false) {
      return {
        text: "Pase de salida sin efectuar",
        className: "bg-green-500 text-white"
      };
    }

    return {
      text: "Salida ya registrada",
      className: "bg-yellow-500 text-white"
    };
  };

  const { text, className } = getStatusConfig();

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${className}`}
      style={{ animation: "slideUp 0.5s ease-out 0.6s both" }}
    >
      {text}
    </span>
  );
};

const ModalHeader = ({ data, closeModal }) => {
  const getDocumentTitle = () => {
    if (data?.manifiesto) return `Manifiesto: # ${data.manifiesto}`;
    if (data?.ordenDeCompra) return `Orden De Compra: #${data.ordenDeCompra}`;
    return "Sin Documentos";
  };

  return (
    <div className="bg-gradient-to-r bg-[#5a3f27] text-white p-6 sticky top-0 z-10 max-sm:pt-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
            style={{ animation: "bounceIn 0.6s ease-out 0.2s both" }}
          >
            <FiFileText className="w-5 h-5" />
          </div>
          
          <div>
            <h1
              className="text-2xl font-bold max-sm:text-sm"
              style={{ animation: "slideRight 0.5s ease-out 0.3s both" }}
            >
              {getDocumentTitle()}
            </h1>
            
            <div
              className="flex items-center gap-4 text-blue-100 mt-1"
              style={{ animation: "slideRight 0.5s ease-out 0.4s both" }}
            >
              <span className="flex items-center gap-1">
                <FiPackage className="w-4 h-4" />
                ID: {data?.id}
              </span>
              <span className="flex items-center gap-1">
                <FiTruck className="w-4 h-4" />
                {data?.placa}
              </span>
              {data?.numBoleta && (
                <span className="flex items-center gap-1">
                    <PiNewspaperClippingLight className="w-4 h-4" />
                    Boleta: {data?.numBoleta}
                </span>
              )}
            </div>
          </div>

          
        </div>
        
        <button
          onClick={closeModal}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200"
          style={{ animation: "fadeIn 0.5s ease-out 0.5s both" }}
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>

      <div className="mt-4">
        <StatusBadge paseDeSalida={data?.paseDeSalida} data={data} />
      </div>
    </div>
  );
};

// Componente de línea de tiempo exitosa
const TimelineSuccessItem = ({ fecha, hora, color, Icon, title, animationDelay = 0.6 }) => {
const borders = { green: 'border-green-500', yellow: 'border-yellow-500', orange:'border-orange-500'}
return (
    <div
      className="relative flex items-start mb-8"
      style={{ animation: `slideLeft ${animationDelay}s ease-out 1.4s both` }}
    >
      <div className={`flex-shrink-0 w-16 h-16 bg-${color}-500 rounded-full flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      <div className={`ml-6 bg-${color}-50 rounded-lg p-4 flex-grow ${borders[color]} border-l-4`}>
        <h3 className={`font-semibold text-${color}-800 mb-2`}>{title}</h3>
        <div className="space-y-3 text-sm">
          <div className="mb-3">
            <p className={`text-${color}-700 font-medium`}>{fecha}</p>
            <p className={`text-${color}-600 text-sm`}>Hora: {hora}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de línea de tiempo pendiente
const TimelinePendingItem = ({ title, subtitle, details, Icon = FiClock }) => {
  return (
    <div
      className="relative flex items-start mb-8"
      style={{ animation: "slideLeft 0.6s ease-out 1.4s both" }}
    >
      <div className="flex-shrink-0 w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center shadow-lg">
        <Icon className="w-6 h-6 text-white" />
      </div>

      <div className="ml-6 bg-gray-50 rounded-lg p-4 flex-grow border-l-4 border-gray-400">
        <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
        <div className="text-sm">
          <p className="text-gray-600 font-medium">{subtitle}</p>
          <p className="text-gray-500 text-sm mt-1">{details}</p>
        </div>
      </div>
    </div>
  );
};

// Componente especializado para el segundo proceso
const SecondProcessItem = ({ data, fechaFin }) => {
  if (data?.estado === "Cancelada") {
    return (
      <TimelinePendingItem 
        title="BOLETA CANCELADA"
        subtitle="Proceso cancelado"
        details="Boleta cancelada, actualmente no cuenta con un pase de salida"
      />
    );
  }

  return (
    <div
      className="relative flex items-start mb-8"
      style={{ animation: "slideLeft 0.6s ease-out 1.4s both" }}
    >
      <div className="flex-shrink-0 w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
        <FiCalendar className="w-6 h-6 text-white" />
      </div>

      <div className="ml-6 bg-purple-50 rounded-lg p-4 flex-grow border-l-4 border-purple-500">
        <h3 className="font-semibold text-purple-800 mb-2">
          Segundo Proceso Báscula
        </h3>

        <div className="mb-3">
          <p className="text-purple-700 font-medium">{fechaFin.date}</p>
          <p className="text-purple-600 text-sm">Hora: {fechaFin.time}</p>
        </div>
      </div>
    </div>
  );
};

const OriginTransferItem = ({ data }) => {
  return (
    <div
      className="relative flex items-start mb-8"
      style={{ animation: "slideLeft 0.6s ease-out 1.4s both" }}
    >
      <div className="flex-shrink-0 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
        <FiMapPin className="w-6 h-6 text-white" />
      </div>

      <div className="ml-6 bg-orange-50 rounded-lg p-4 flex-grow border-l-4 border-orange-500">
        <h3 className="font-semibold text-orange-800 mb-2">Traslado de Origen</h3>

        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-orange-700">Dirección de Origen:</span>
            <p className="text-orange-600 mt-1">{data?.trasladoOrigen || "No especificado"}</p>
          </div>

          <div>
            <span className="font-medium text-orange-700">Pase de Salida:</span>
            <p className="text-orange-600 mt-1">
              {data?.paseDeSalida?.numPaseSalida
                ? `# ${data.paseDeSalida.numPaseSalida}${
                    data.paseDeSalida.estado ? " - Ya efectuado" : " - Válido"
                  }`
                : "No generado"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal de línea de tiempo
const TransportTimeline = ({ data }) => {
  const fechaInicio = formatDate(new Date(data?.fechaInicio));
  const fechaFin = data?.fechaFin ? formatDate(new Date(data?.fechaFin)) : null;
  const fechaGuardia = formatDate(new Date());
  
  // Verificar si necesita mostrar descarga en tolva
  const shouldShowTolvaDischarge = 
    data?.producto === "GRANZA" && 
    data?.movimiento === "Flete de Importación";
  
  const hasCompletedTolva = 
    data?.tolva?.length > 0 && 
    data?.tolva[0]?.fechaSalida;

  return (
    <div className="p-6">
      <h2
        className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2 max-sm:text-sm"
        style={{ animation: "slideUp 0.5s ease-out 0.7s both" }}
      >
        <FiClock className="w-5 h-5 text-blue-600" />
        Recorrido del Transporte
      </h2>

      <div className="relative">
        {/* Línea de tiempo */}
        <div
          className="absolute left-8 top-0 bottom-0 max-h-[calc(100%-5rem)] w-0.5 bg-gradient-to-b from-green-400 to-green-600"
          style={{ animation: "growDown 1s ease-out 0.8s both" }}
        />

        {/* Primer proceso de báscula */}
        <TimelineSuccessItem
          title="Primer proceso de bascula"
          fecha={fechaInicio.date}
          hora={fechaInicio.time}
          Icon={FaBalanceScale}
          color="green"
          animationDelay={0.2}
        />

        {/* Descarga en tolva (condicional) */}
        {shouldShowTolvaDischarge && (
          hasCompletedTolva ? (
            <TimelineSuccessItem
              title="Descarga en tolva"
              fecha={formatDate(new Date(data.tolva[0].fechaSalida)).date}
              hora={formatDate(new Date(data.tolva[0].fechaSalida)).time}
              Icon={MdFilterListAlt}
              color="orange"
              animationDelay={0.5}
            />
          ) : (
            <TimelinePendingItem
              title="Descarga en tolva Pendiente"
              subtitle="Proceso Pendiente"
              details="Aún no ha completado su proceso"
              Icon={FiClock}
            />
          )
        )}

        {/* Segundo proceso o estados alternativos */}
        {fechaFin ? (
          <SecondProcessItem data={data} fechaFin={fechaFin} />
        ) : data?.paseDeSalida ? (
          <OriginTransferItem data={data} />
        ) : (
          <TimelinePendingItem
            title="Segundo Proceso Báscula"
            subtitle="Proceso Pendiente"
            details="Aún no ha completado su proceso"
          />
        )}

        {/* Llegada a la guardia */}
        {data?.paseDeSalida && (
          <TimelineSuccessItem
            title="Llegada a la guardia"
            fecha={fechaGuardia.date}
            hora={fechaGuardia.time}
            Icon={FiCalendar}
            color="yellow"
          />
        )}
      </div>
    </div>
  );
};

const ModalFooter = ({ data }) => {
  if (!data?.paseDeSalida) return null;
  if (data?.paseDeSalida?.estado==true) return

  return (
    <div
      className="bg-gray-50 border-t-gray-50 mt-auto"
      style={{ animation: "slideUp 0.5s ease-out 1.6s both" }}
    >
      <button
        disabled
        className="bg-[#5a3f27] p-4 w-full text-white hover:scale-105"
      >
        Realizar Salida
      </button>
    </div>
  );
};

export const ManifestModal = ({ data, closeModal }) => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div
        className="fixed inset-0 bg-black bg-opa-50 z-50 flex items-center justify-center p-4 max-sm:p-0"
        style={{ animation: "fadeIn 0.3s ease-out" }}
        onClick={closeModal}
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] max-sm:min-h-[100vh] max-sm:rounded-none flex flex-col"
          style={{ animation: "slideUp 0.4s ease-out" }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader data={data} closeModal={closeModal} />
          <TransportTimeline data={data} />
          <ModalFooter data={data} />
        </div>
      </div>
    </div>
  );
};