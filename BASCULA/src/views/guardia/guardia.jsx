import { StatCard } from "../../components/buttons";
import { useState } from "react";
import {
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import { getDataPlaca } from "../../hooks/guardia/formDataGuardia";
import { ManifestModal } from "../../components/guardia/elements"

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

export default Guardia;
