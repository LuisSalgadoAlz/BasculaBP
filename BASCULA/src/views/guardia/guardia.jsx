import { StatCard } from "../../components/buttons";
import { useState } from "react";
import {
  FiCalendar,
  FiPackage,
  FiTruck,
  FiMapPin,
  FiFileText,
  FiClock,
  FiX,
  FiEye,
} from "react-icons/fi";
import { MdFilterListAlt } from "react-icons/md";
import { FaBalanceScale } from "react-icons/fa";
import { getDataPlaca } from "../../hooks/guardia/formDataGuardia";

const Guardia = () => {
  const [stats, setStats] = useState();
  const [placa, setPlaca] = useState("");
  const [infoPlaca, setInfoPlaca] = useState();
  const [openModal, setOpenModal] = useState(false);

  const handleChangePlaca = (e) => {
    const { value } = e.target;
    setPlaca(value);
  };

  const handleSearchPlaca = async () => {
    const response = await getDataPlaca(setInfoPlaca, placa);
    if (response?.err) {
      return response?.err;
    }
    setInfoPlaca(response?.data);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const statsdata = [
    {
      icon: <FiCalendar size={24} className="text-white" />,
      title: "Total (hoy)",
      value: stats?.total || 40,
      color: "bg-blue-500",
    },
    {
      icon: <FiClock size={24} className="text-white" />,
      title: "Pendientes(hoy)",
      value: stats?.pendientes || 20,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="min-h-[80vh]">
      <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
        <div className="parte-izq">
          <h1 className="text-3xl font-bold titulo">Registros de Salidas</h1>
          <h1 className="text-gray-600 max-sm:text-sm">
            {" "}
            Gestión de salidas de camiones en Baprosa
          </h1>
        </div>
      </div>
      <div className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-sm:gap-2 mb-3 max-sm:grid-cols-2">
          {statsdata?.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              color={stat.color}
            />
          ))}
        </div>
      </div>
      <div className="mt-4 bg-white p-4 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:min-w-[300px]">
          <input
            type="text"
            onChange={handleChangePlaca}
            value={placa}
            className="flex-1 bg-white py-2.5 px-4 rounded-lg border focus:border transition-all duration-200 font-medium placeholder-gray-300"
            placeholder="Buscar por Placa..."
          />

          <button
            onClick={handleSearchPlaca}
            className="bg-[#725033] hover:bg-[#866548] text-white font-medium 
                      py-2.5 px-6 rounded-lg transition-all duration-200 
                      focus:outline-none focus:ring-2 focus:ring-[#a67c5a] 
                      min-w-[100px]"
          >
            Buscar
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:min-w-[300px]">
          {openModal && (
            <ManifestModal data={infoPlaca} closeModal={handleCloseModal} />
          )}
        </div>
      </div>
    </div>
  );
};

const ManifestModal = ({ data, closeModal }) => {
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

  const fechaInicio = formatDate(new Date(data?.fechaInicio));
  const fechaFin = formatDate(new Date(data?.fechaFin));
  /*   const fechaTolva = formatDate(new Date(data?.tolva[0].fechaSalida))
   */ const fechaGuardia = formatDate(new Date());
  const duracionGuardia = Math.round(
    (new Date() - new Date(data?.fechaFin)) / (1000 * 60 * 60)
  );
  const duracion = Math.round(
    (new Date(data?.fechaFin) - new Date(data?.fechaInicio)) / (1000 * 60 * 60)
  );

  return (
    <div className=" bg-gray-100 min-h-screen">
      <div
        className="fixed inset-0 bg-black bg-opa-50 z-50 flex items-center justify-center p-4 max-sm:p-0 "
        style={{
          animation: "fadeIn 0.3s ease-out",
        }}
        onClick={closeModal}
      >
        {/* Modal Content */}
        <div
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] max-sm:min-h-[100vh] overflow-y-auto  max-sm:rounded-none flex flex-col"
          style={{
            animation: "slideUp 0.4s ease-out",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r bg-[#5a3f27] text-white p-6 sticky top-0 z-10 max-sm:pt-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
                  style={{
                    animation: "bounceIn 0.6s ease-out 0.2s both",
                  }}
                >
                  <FiFileText className="w-5 h-5" />
                </div>
                <div>
                  <h1
                    className="text-2xl font-bold max-sm:text-sm"
                    style={{
                      animation: "slideRight 0.5s ease-out 0.3s both",
                    }}
                  >
                    {data?.manifiesto
                      ? `Manifiesto: # ${data?.manifiesto}`
                      : data?.ordenDeCompra
                      ? `Orden De Compra: #${data?.ordenDeCompra}`
                      : "Sin Documentos"}
                  </h1>
                  <div
                    className="flex items-center gap-4 text-blue-100 mt-1"
                    style={{
                      animation: "slideRight 0.5s ease-out 0.4s both",
                    }}
                  >
                    <span className="flex items-center gap-1">
                      <FiPackage className="w-4 h-4" />
                      ID: {data?.id}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiTruck className="w-4 h-4" />
                      {data?.placa}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200"
                style={{
                  animation: "fadeIn 0.5s ease-out 0.5s both",
                }}
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div
              className="mt-4"
              style={{
                animation: "slideUp 0.5s ease-out 0.6s both",
              }}
            >
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  data?.paseDeSalida
                    ? data?.paseDeSalida?.estado === false
                      ? "bg-green-500 text-white"
                      : "bg-yellow-500 text-white"
                    : "bg-red-500"
                }`}
              >
                {data?.paseDeSalida
                  ? data?.paseDeSalida?.estado
                    ? "Salida ya registrada"
                    : "Valida"
                  : "No ha completado su proceso"}
              </span>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6">
            <h2
              className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2 max-sm:text-sm"
              style={{
                animation: "slideUp 0.5s ease-out 0.7s both",
              }}
            >
              <FiClock className="w-5 h-5 text-blue-600" />
              Recorrido del Transporte
            </h2>

            <div className="relative">
              {/* Timeline Line */}
              <div
                className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 to-green-600"
                style={{
                  animation: "growDown 1s ease-out 0.8s both",
                }}
              ></div>

              {/* Primer punto */}
              <LineItems
                title={"Primer proceso de bascula"}
                fecha={fechaInicio.date}
                hora={fechaInicio.time}
                Icon={FaBalanceScale}
                color={"green"}
                time={0.2}
              />

              {/* Punto intermedio */}
              {data?.producto == "GRANZA" &&
                data?.movimiento == "Flete de Importación" &&
                (data?.tolva.length != 0 && data?.tolva[0]?.fechaSalida ? (
                  <LineItems
                    fecha={fechaTolva.date}
                    Icon={MdFilterListAlt}
                    hora={fechaTolva.time}
                    title={"Descarga en tolva"}
                    color={"orange"}
                    time={0.5}
                  />
                ) : (
                  <LinePendiente
                    title={"Descarga en tolva Pendiente"}
                    subtitle={"Proceso Pendiente"}
                    details={"Aún no ha completado su proceso"}
                    Icon={FiClock}
                    time={0.5}
                  />
                ))}

              {/* Segundo punto */}
              {data?.fechaFin ? (
                data?.estado != "Cancelada" ? (
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
                        <p className="text-purple-700 font-medium">
                          {fechaFin.date}
                        </p>
                        <p className="text-purple-600 text-sm">
                          Hora: {fechaFin.time}
                        </p>
                      </div>

                      <div className="space-y-3 text-sm grid grid-cols-2">
                        <div>
                          <span className="font-medium text-purple-700">
                            Nº Boleta:
                          </span>
                          <p className="text-purple-600 mt-1">
                            {data?.numBoleta || "No generado"}
                          </p>
                        </div>

                        <div>
                          <span className="font-medium text-purple-700">
                            Pase de Salida:
                          </span>
                          <p className="text-purple-600 mt-1">
                            {data?.paseDeSalida?.numPaseSalida
                              ? `# ${data.paseDeSalida.numPaseSalida}${
                                  data.paseDeSalida.estado
                                    ? " - Ya efectuado"
                                    : " - Válido"
                                }`
                              : "No ha completado su proceso"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="relative flex items-start mb-8"
                    style={{ animation: "slideLeft 0.6s ease-out 1.4s both" }}
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center shadow-lg">
                      <FiClock className="w-6 h-6 text-white" />
                    </div>

                    <div className="ml-6 bg-gray-50 rounded-lg p-4 flex-grow border-l-4 border-gray-400">
                      <h3 className="font-semibold text-gray-700 mb-2">
                        BOLETA CANCELADA!
                      </h3>

                      <div className="text-sm">
                        <p className="text-gray-600 font-medium">
                          Proceso Cancelado
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          Ultima boleta cancelada. Comunicarse con Bascula.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              ) : data?.paseDeSalida ? (
                <div
                  className="relative flex items-start mb-8"
                  style={{ animation: "slideLeft 0.6s ease-out 1.4s both" }}
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <FiMapPin className="w-6 h-6 text-white" />
                  </div>

                  <div className="ml-6 bg-orange-50 rounded-lg p-4 flex-grow border-l-4 border-orange-500">
                    <h3 className="font-semibold text-orange-800 mb-2">
                      Traslado de Origen
                    </h3>

                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-orange-700">
                          Dirección de Origen:
                        </span>
                        <p className="text-orange-600 mt-1">
                          {data?.trasladoOrigen || "No especificado"}
                        </p>
                      </div>

                      <div>
                        <span className="font-medium text-orange-700">
                          Pase de Salida:
                        </span>
                        <p className="text-orange-600 mt-1">
                          {data?.paseDeSalida?.numPaseSalida
                            ? `# ${data.paseDeSalida.numPaseSalida}${
                                data.paseDeSalida.estado
                                  ? " - Ya efectuado"
                                  : " - Válido"
                              }`
                            : "No generado"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="relative flex items-start mb-8"
                  style={{ animation: "slideLeft 0.6s ease-out 1.4s both" }}
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center shadow-lg">
                    <FiClock className="w-6 h-6 text-white" />
                  </div>

                  <div className="ml-6 bg-gray-50 rounded-lg p-4 flex-grow border-l-4 border-gray-400">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Segundo Proceso Báscula
                    </h3>

                    <div className="text-sm">
                      <p className="text-gray-600 font-medium">
                        Proceso Pendiente
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Aún no ha completado su proceso
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Guardia */}

              {data?.paseDeSalida && (
                <div
                  className="relative flex items-start mb-8"
                  style={{ animation: "slideLeft 0.6s ease-out 1.4s both" }}
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                    <FiCalendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-6 bg-purple-50 rounded-lg p-4 flex-grow border-l-4 border-yellow-500">
                    <h3 className="font-semibold text-yellow-800 mb-2">
                      Llegada a la guardia
                    </h3>
                    <p className="text-yellow-700 font-medium">
                      {fechaGuardia.date}
                    </p>
                    <p className="text-yellow-600 text-sm">
                      Hora: {fechaGuardia.time}
                    </p>
                    <div className="mt-3 p-2 bg-yellow-100 rounded text-sm text-yellow-700">
                      <strong>Duración total:</strong> {duracionGuardia} horas
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Finalizar */}
          <div
            className="bg-gray-50 border-t-gray-50 mt-auto"
            style={{
              animation: "slideUp 0.5s ease-out 1.6s both",
            }}
          >
            {data?.paseDeSalida && (
              <button
                disabled
                className="bg-[#5a3f27] p-4 w-full text-white hover:scale-105"
              >
                Realizar Salida
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const HeaderTimeLines = ({data, closeModal, Icon1 = FiFileText, Icon2 = FiPackage, Icon3 = FiTruck}) => {
  return (
    <>
      <div className="bg-gradient-to-r bg-[#5a3f27] text-white p-6 sticky top-0 z-10 max-sm:pt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
              style={{
                animation: "bounceIn 0.6s ease-out 0.2s both",
              }}
            >
              <Icon1 className="w-5 h-5" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold max-sm:text-sm"
                style={{
                  animation: "slideRight 0.5s ease-out 0.3s both",
                }}
              >
                {data?.manifiesto
                  ? `Manifiesto: # ${data?.manifiesto}`
                  : data?.ordenDeCompra
                  ? `Orden De Compra: #${data?.ordenDeCompra}`
                  : "Sin Documentos"}
              </h1>
              <div
                className="flex items-center gap-4 text-blue-100 mt-1"
                style={{
                  animation: "slideRight 0.5s ease-out 0.4s both",
                }}
              >
                <span className="flex items-center gap-1">
                  <Icon2 className="w-4 h-4" />
                  ID: {data?.id}
                </span>
                <span className="flex items-center gap-1">
                  <Icon3 className="w-4 h-4" />
                  {data?.placa}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200"
            style={{
              animation: "fadeIn 0.5s ease-out 0.5s both",
            }}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div
          className="mt-4"
          style={{
            animation: "slideUp 0.5s ease-out 0.6s both",
          }}
        >
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              data?.paseDeSalida
                ? data?.paseDeSalida?.estado === false
                  ? "bg-green-500 text-white"
                  : "bg-yellow-500 text-white"
                : "bg-red-500"
            }`}
          >
            {data?.paseDeSalida
              ? data?.paseDeSalida?.estado
                ? "Salida ya registrada"
                : "Valida"
              : "No ha completado su proceso"}
          </span>
        </div>
      </div>
    </>
  );
};

const LineItems = ({ fecha, hora, color, Icon, title, time }) => {
  return (
    <>
      <div
        className="relative flex items-start mb-8"
        style={{ animation: `slideLeft ${time}s ease-out 1.4s both` }}
      >
        <div
          className={`flex-shrink-0 w-16 h-16 bg-${color}-500 rounded-full flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>

        <div
          className={`ml-6 bg-${color}-50 rounded-lg p-4 flex-grow border-l-4 border-${color}-500`}
        >
          <h3 className={`font-semibold text-${color}-800 mb-2`}>{title}</h3>

          <div className="space-y-3 text-sm">
            <div className="mb-3">
              <p className={`text-${color}-700 font-medium`}>{fecha}</p>
              <p className={`text-${color}-600 text-sm`}>Hora: {hora}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const LinePendiente = ({ title, subtitle, details, Icon }) => {
  return (
    <>
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
    </>
  );
};

export default Guardia;
