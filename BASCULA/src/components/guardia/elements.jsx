import { MdFilterListAlt, MdOutlinePlace  } from "react-icons/md";
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
      className: "bg-gray-500 text-white"
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
    if (data?.manifiesto && data?.manifiesto!=0) return `Manifiesto: # ${data.manifiesto}`;
    if (data?.ordenDeCompra && data?.ordenDeCompra!=0) return `Orden De Compra: #${data.ordenDeCompra}`;
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
              className="grid grid-cols-3 max-sm:grid-cols-2 gap-2 text-blue-100 mt-1"
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
                    Bol: {data?.numBoleta}
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
  const borders = { green: 'border-green-500', yellow: 'border-yellow-500', orange:'border-orange-500', red:'border-red-500'}
  const colorsText = { green: 'text-green-700', yellow: 'text-yellow-700', orange:'text-orange-700', red: 'text-red-700'}

  return (
    <div
      className="relative flex items-start mb-8"
      style={{ animation: `slideLeft ${animationDelay}s ease-out 1.4s both` }}
    >
      <div className="relative flex-shrink-0">
        <div className={`w-16 h-16 max-sm:w-12 max-sm:h-12 bg-${color}-500 rounded-full flex items-center justify-center shadow-lg relative z-10`}>
          <Icon className="w-6 h-6 text-white max-sm:w-4 max-sm:h-4" />
        </div>
        {color === 'red' && (
          <div className="absolute top-0 left-0 w-16 h-16 max-sm:w-12 max-sm:h-12 rounded-full animate-ping bg-red-400 opacity-20"></div>
        )}
      </div>

      <div className={`ml-6 bg-${color}-50 rounded-lg p-4 max-sm:p-2 flex-grow ${borders[color]} border-l-4`}>
        <h3 className={`font-semibold text-${color}-800 mb-2`}>{title}</h3>
        <div className="space-y-3 text-sm">
          <div className="mb-3">
            <p className={`${colorsText[color]} font-medium`}>{fecha}</p>
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
      <div className="flex-shrink-0 w-16 h-16 max-sm:w-12 max-sm:h-12 bg-gray-400 rounded-full flex items-center justify-center shadow-lg">
        <Icon className="w-6 h-6 text-white max-sm:w-4 max-sm:h-4" />
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

  // Determinar el color basado en el estado del pase de salida
  const isCompleted = data?.paseDeSalida?.estado === true;
  const colorClasses = isCompleted ? {
    bg: 'bg-gray-500',
    border: 'border-gray-500',
    containerBg: 'bg-gray-50',
    titleText: 'text-gray-800',
    dateText: 'text-gray-700',
    timeText: 'text-gray-600'
  } : {
    bg: 'bg-green-500',
    border: 'border-green-500',
    containerBg: 'bg-green-50',
    titleText: 'text-green-800',
    dateText: 'text-green-700',
    timeText: 'text-green-600'
  };

  return (
    <div
      className="relative flex items-start mb-8"
      style={{ animation: "slideLeft 0.6s ease-out 1.4s both" }}
    >
      <div className={`flex-shrink-0 w-16 h-16 max-sm:w-12 max-sm:h-12 ${colorClasses.bg} rounded-full flex items-center justify-center shadow-lg`}>
        <FiCalendar className="w-6 h-6 max-sm:w-4 max-sm:h-4 text-white" />
      </div>

      <div className={`ml-6 ${colorClasses.containerBg} rounded-lg p-4 flex-grow border-l-4 ${colorClasses.border}`}>
        <h3 className={`font-semibold ${colorClasses.titleText} mb-2`}>
          Segundo Proceso Báscula
        </h3>

        <div className="mb-3">
          <p className={`${colorClasses.dateText} font-medium`}>{fechaFin.date}</p>
          <p className={`${colorClasses.timeText} text-sm`}>Hora: {fechaFin.time}</p>
        </div>
      </div>
    </div>
  );
};

const OriginTransferItem = ({ data }) => {
  // Determinar si el estado es true para cambiar los colores
  const isCompleted = data?.paseDeSalida?.estado === true;
  
  // Colores condicionales
  const iconBgColor = isCompleted ? "bg-gray-500" : "bg-green-500";
  const containerBgColor = isCompleted ? "bg-gray-50" : "bg-green-50";
  const borderColor = isCompleted ? "border-gray-500" : "border-green-500";
  const titleColor = isCompleted ? "text-gray-800" : "text-green-800";
  const labelColor = isCompleted ? "text-gray-700" : "text-green-700";
  const textColor = isCompleted ? "text-gray-600" : "text-green-600";

  return (
    <div
      className="relative flex items-start mb-8"
      style={{ animation: "slideLeft 0.6s ease-out 1.4s both" }}
    >
      <div className={`flex-shrink-0 w-16 h-16 max-sm:w-12 max-sm:h-12 ${iconBgColor} rounded-full flex items-center justify-center shadow-lg`}>
        <FiMapPin className="w-6 h-6 text-white" />
      </div>

      <div className={`ml-6 ${containerBgColor} rounded-lg p-4 max-sm:p-2 flex-grow border-l-4 ${borderColor}`}>
        <h3 className={`font-semibold ${titleColor} mb-2`}>Realizando un traslado</h3>

        <div className="space-y-3 text-sm">
          <div>
            <span className={`font-medium ${labelColor}`}>Dirección de Origen:</span>
            <p className={`${textColor} mt-1`}>{data?.trasladoOrigen || "No especificado"}</p>
          </div>

          <div>
            <span className={`font-medium ${labelColor}`}>Pase de Salida:</span>
            <p className={`${textColor} mt-1`}>
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

const ServicioBascula = ({ data }) => {
  // Determinar si el estado es true para cambiar los colores
  const isCompleted = data?.paseDeSalida?.estado === true;
  
  // Colores condicionales
  const iconBgColor = isCompleted ? "bg-gray-500" : "bg-green-500";
  const containerBgColor = isCompleted ? "bg-gray-50" : "bg-green-50";
  const borderColor = isCompleted ? "border-gray-500" : "border-green-500";
  const titleColor = isCompleted ? "text-gray-800" : "text-green-800";
  const labelColor = isCompleted ? "text-gray-700" : "text-green-700";
  const textColor = isCompleted ? "text-gray-600" : "text-green-600";

  return (
    <div
      className="relative flex items-start mb-8"
      style={{ animation: "slideLeft 0.6s ease-out 1.4s both" }}
    >
      <div className={`flex-shrink-0 w-16 h-16 max-sm:w-12 max-sm:h-12 ${iconBgColor} rounded-full flex items-center justify-center shadow-lg`}>
        <MdOutlinePlace className="w-6 h-6 text-white" />
      </div>

      <div className={`ml-6 ${containerBgColor} rounded-lg p-4 max-sm:p-2 flex-grow border-l-4 ${borderColor}`}>
        <h3 className={`font-semibold ${titleColor} mb-2`}>Servicio de bascula Pendiente</h3>

        <div className="space-y-3 text-sm">
          <div>
            <span className={`font-medium ${labelColor}`}>Dirección de Origen:</span>
            <p className={`${textColor} mt-1`}>{data?.origen || "No especificado"}</p>
          </div>

          <div>
            <span className={`font-medium ${labelColor}`}>Pase de Salida:</span>
            <p className={`${textColor} mt-1`}>
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
  const fechaSalida = data?.paseDeSalida?.fechaSalida ? formatDate(new Date(data?.paseDeSalida?.fechaSalida)) : null;

  let horas = null;
  let minutos = null;

  if (data?.fechaFin) {
    const diferenciaMs = (data?.paseDeSalida?.fechaSalida ? new Date(data?.paseDeSalida?.fechaSalida) : new Date()) - new Date(data.fechaFin); // Diferencia en milisegundos
    const diffMin = Math.floor(diferenciaMs / 60000); // A minutos
    horas = Math.floor(diffMin / 60);
    minutos = diffMin % 60;
  } else {
    horas = null;
    minutos = null;
  }


  console.log(`min: ${minutos} horas: ${horas}`)
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
        {data?.paseDeSalida?.estado ===true ? (
          <div
            className="absolute left-8 max-sm:left-6 top-0 bottom-0 max-h-[calc(100%-5rem)] max-sm:max-h-[calc(100%-5rem)] linea-horinzontal-limite w-0.5 bg-gradient-to-b from-gray-400 to-gray-600"
            style={{ animation: "growDown 1s ease-out 0.8s both" }}
          />
        ): (
          <div
            className="absolute left-8 max-sm:left-6 top-0 bottom-0 max-h-[calc(100%-5rem)] max-sm:max-h-[calc(100%-5rem)] linea-horinzontal-limite w-0.5 bg-gradient-to-b from-green-400 to-green-600"
            style={{ animation: "growDown 1s ease-out 0.8s both" }}
          />
        )}

        {/* Primer proceso de báscula */}
        <TimelineSuccessItem
          title="Primer proceso de bascula"
          fecha={fechaInicio.date}
          hora={fechaInicio.time}
          Icon={FaBalanceScale}
          color={data?.paseDeSalida?.estado===true ? 'gray' : 'green'}
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
              color={data?.paseDeSalida?.estado===true ? 'gray' : 'green'}
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
          data?.movimiento =='SERVICIO BASCULA' ? <ServicioBascula data={data} />  : <OriginTransferItem data={data} />
        ) : (
          <TimelinePendingItem
            title="Segundo Proceso Báscula"
            subtitle="Proceso Pendiente"
            details="Aún no ha completado su proceso"
          />
        )}

        {/* Llegada a la guardia */}
        {data?.paseDeSalida && (
          data?.paseDeSalida?.estado===true ? (
            <TimelineSuccessItem
              title={`Llegada a la guardia`}
              fecha={fechaSalida.date}
              hora={fechaSalida.time}
              Icon={FiCalendar}
              color={(horas>0 || minutos > 15 ) ? 'red' : 'gray'}
            />
          ) : ( 
            <TimelineSuccessItem
              title={`Llegada a la guardia: ${(horas>0 || minutos > 15 ) ? 'Tiempo excedido' : (horas==null && minutos==null) ? 'N/A': 'Sin Problema'}`}
              fecha={fechaGuardia.date}
              hora={fechaGuardia.time}
              Icon={FiCalendar}
              color={(horas>0 || minutos > 15 ) ? 'red' : 'green'}
            />
          )
        )}
      </div>
    </div>
  );
};

const ModalFooter = ({ data, openConfim }) => {
  if (!data?.paseDeSalida) return null;
  if (data?.paseDeSalida?.estado==true) return

  return (
    <div
      className="bg-gray-50 border-t-gray-50 mt-auto"
      style={{ animation: "slideUp 0.5s ease-out 1.6s both" }}
    >
      <button
        className="bg-[#5a3f27] p-4 w-full text-white hover:scale-105"
        onClick={openConfim}
      >
        Realizar Salida
      </button>
    </div>
  );
};

export const ManifestModal = ({ data, closeModal, handleOpenConfirm }) => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div
        className="fixed inset-0 bg-black bg-opa-50 z-40 flex items-center justify-center p-4 max-sm:p-0"
        style={{ animation: "fadeIn 0.3s ease-out" }}
        onClick={closeModal}
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] max-sm:min-h-[100vh] max-sm:rounded-none flex flex-col overflow-hidden"
          style={{ animation: "slideUp 0.4s ease-out" }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader data={data} closeModal={closeModal} />
          
          {/* Contenedor scrolleable para el contenido principal */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <TransportTimeline data={data} />
          </div>
          
          <ModalFooter data={data} openConfim={handleOpenConfirm} />
        </div>
      </div>
    </div>
  );
};

export const DespacharUnidad = ({ hdClose, hdlSubmit, isLoading, requiereMotivo=false, motivo='', setMotivo }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opa-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100 animate-fadeIn">
        {/* Header con icono y título */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-[#5A3F27] tracking-wide max-sm:text-md">
            - Registrar Salida - 
          </h2>
        </div>

        {/* Contenido del mensaje */}
        <div className="text-center mb-8">
          <p className="text-gray-700 text-lg max-sm:text-sm">
            ¿Está seguro que desea despachar esta unidad?
          </p>
        </div>
        
        {requiereMotivo && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de la demora <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ingrese el motivo por el cual la unidad se tardó más de 15 minutos..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none
                         focus:outline-none focus:ring-2 focus:ring-[#5A3F27] focus:border-transparent
                         transition-all duration-200 ease-in-out"
              rows="2"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Este campo es obligatorio.
            </p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-row sm:flex-row gap-3 justify-end">
          <button
            onClick={hdClose}
            aria-label="Cancelar operación"
            disabled={isLoading}
            className="px-6 py-3 w-full text-gray-600 font-medium rounded-lg border border-gray-300 
                       transition-all duration-200 ease-in-out 
                       hover:bg-gray-50 hover:border-gray-400 hover:scale-[1.02]
                       focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
                       active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={hdlSubmit}
            aria-label="Confirmar ingreso sin marchamos"
            disabled={isLoading}
            className="px-6 py-3 w-full text-white font-semibold bg-gradient-to-r from-[#5A3F27] to-[#5A3F27]
                       rounded-lg shadow-lg transition-all duration-200 ease-in-out 
                       hover:from-[#5A3F27] hover:to-[#5A3F27] hover:scale-[1.02] hover:shadow-xl
                       focus:outline-none focus:ring-2 focus:ring-[#5A3F27] focus:ring-offset-2
                       active:scale-95"
          >
            {isLoading ? 'PROCESANDO...' : 'CONFIRMAR'}
          </button>
        </div>
      </div>
    </div>
  );
};