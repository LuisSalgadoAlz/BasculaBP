import { StatCard } from "../../components/buttons";
import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import { getDataPlaca, getStatsGuardia, updatePaseSalida } from "../../hooks/guardia/formDataGuardia";
import { ManifestModal, DespacharUnidad } from "../../components/guardia/elements"
import { Toaster, toast } from "sonner";

const Guardia = () => {
  const [stats, setStats] = useState();
  const [placa, setPlaca] = useState("");
  const [infoPlaca, setInfoPlaca] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [despacharUnidadModal, setDespacharUnidadModal] = useState(false)
  const [isLoadingConfirm, setIsLoadingConfirm] = useState(false)
  const [motivo, setMotivo] = useState(false)
  const [motivoDetails, setMotivoDetails] = useState()
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)

  const handleChangePlaca = (e) => {
    const { value } = e.target;
    setPlaca(value);
  };

  const handleSearchPlaca = async () => {
    if(!placa) return toast.error('No ha ingresado una placa.', {style:{background:'#ff4d4f'}});
    const response = await getDataPlaca(setInfoPlaca, placa, setIsLoadingSearch);
    if (response?.err) {
      toast.error(response?.err, {style:{background:'#ff4d4f'}});
      return
    }
    setInfoPlaca(response?.data);
    setOpenModal(true);
    setMotivo(false)
    setMotivoDetails('')
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenConfirm = () => {
    const fechaFin = new Date(infoPlaca?.fechaFin);
    const fechaActual = new Date();

    const diffMs = fechaActual - fechaFin; // diferencia en milisegundos
    const diffMin = Math.floor(diffMs / 60000); // minutos
    const horas = Math.floor(diffMin / 60);
    const minutos = diffMin % 60;

    // Los únicos sin motivo son: sin fecha final Y no servicio báscula
    const requiereMotivo = (horas !== 0 || minutos > 15) && 
                            (infoPlaca?.fechaFin !== null && 
                            (infoPlaca?.movimiento !== 'SERVICIO BASCULA') &&
                            (infoPlaca?.movimiento !== 'Carga Doble Detalle') &&
                            (infoPlaca?.paseDeSalida?.aplicaAlerta===true));

    if(requiereMotivo) {
      setMotivo(true)
    }

    setDespacharUnidadModal(true)
  }

  const handleCloseConfirm =() => {
    setDespacharUnidadModal(false)
  }

  const handleConfirmSalidad = async(data) => {
    if(motivo===true && !motivoDetails) return toast.error('No ha ingresado un motivo.', {style:{background:'#ff4d4f'}});
    const response = await updatePaseSalida(infoPlaca?.paseDeSalida?.id, setIsLoadingConfirm, motivoDetails)
    if(response?.msg){
      toast.success(response?.msg, {style:{background:'#4CAF50'}});
      setOpenModal(false)
      setDespacharUnidadModal(false)
      setMotivo(false)
      setMotivoDetails('')
      getStatsGuardia(setStats)
      return
    }
    toast.error(response?.err , {style:{background:'#ff4d4f'}});
  }

  const statsdata = [
    {
      icon: <FiCalendar size={24} className="text-white" />,
      title: "Despachados (hoy)",
      value: stats?.total || 0,
      color: "bg-blue-500",
    },
    {
      icon: <FiClock size={24} className="text-white" />,
      title: "En BAPROSA (hoy)",
      value: stats?.pendientes || 0,
      color: "bg-amber-500",
    },
  ];

  useEffect(() => {
    getStatsGuardia(setStats)
  }, []);


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
            disabled={isLoadingSearch}
            className="bg-[#725033] hover:bg-[#866548] text-white font-medium 
                      py-2.5 px-6 rounded-lg transition-all duration-200 
                      focus:outline-none focus:ring-2 focus:ring-[#a67c5a] 
                      min-w-[100px]"
          >
            {isLoadingSearch ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:min-w-[300px]">
          {openModal && (
            <ManifestModal data={infoPlaca} closeModal={handleCloseModal} handleOpenConfirm={handleOpenConfirm}/>
          )}
        </div>
      </div>
      {despacharUnidadModal && <DespacharUnidad hdClose={handleCloseConfirm} hdlSubmit={handleConfirmSalidad} isLoading={isLoadingConfirm} requiereMotivo={motivo} motivo={motivoDetails} setMotivo={setMotivoDetails} />}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#333', // estilo general
            color: 'white',
          },
        }}
      />
    </div>
  );
};

export default Guardia;
