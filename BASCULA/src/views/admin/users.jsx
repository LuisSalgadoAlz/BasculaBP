import { useEffect, useState } from "react";
import { CiUser } from "react-icons/ci";
import { MdOutlineScale, MdOutlineAdminPanelSettings,MdAttachMoney  } from "react-icons/md";    
import { FaTruckRampBox } from "react-icons/fa6";
import { IoAdd } from "react-icons/io5";
import {
  FiSearch,
  FiFilter,
  FiRefreshCw,
} from "react-icons/fi";
import { getUsers, postUsers } from "../../hooks/admin/formDataAdmin";
import { TableUsers } from "../../components/admin/tables";
import { BigSpinner, ModalErr, ModalSuccess } from "../../components/alerts";
import { ModalAgregarUsuarios } from "../../components/admin/modal";


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

const Users = () => {
  const initialSate = { categoria: "", user: "", search: "", date: "" };
  const initialForm = {Nombre:'', Usuario:'', Gmail:'', Tipo: '', Contraseña:''}
  const [userTable, setUserTable] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [modalUser, setModalUser] = useState(false)
  const [filters, setFilters] = useState(initialSate);
  const [pagination, setPagination] = useState(1);
  const [formUsers, setFormUsers] = useState(initialForm)
  const [success, setSuccess] = useState(false)
  const [err, setErr] = useState(false)
  const [msg, setMsg] = useState(false)

  const handlePagination = (item) => {
    if (pagination > 0) {
      const newRender = pagination + item;
      if (newRender == 0) return;
      if (newRender > tableLogs.pagination.totalPages) return;
      setPagination(newRender);
    }
  };

  const handleResetPagination = () => {
    setPagination(1);
  };

  useEffect(() => {
    getUsers(setUserTable, setIsLoading)
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormUsers((prev) => ({ ...prev, [name]: value, }));
    handleResetPagination();
  };

  const handleResetFilters = () => setFilters(initialSate);

  const hdlClose = () => setModalUser(false)
  
  const hdlCancel = () => {
    setModalUser(false)
    setFormUsers(initialForm)
  }

  const hdlSaveUser = async() => {
    const response = await postUsers(formUsers);
    if(response.msgErr){
      setErr(true)
      setMsg(response.msgErr)
      return
    } 

    setSuccess(true)
    setMsg(response.msg)
    getUsers(setUserTable, setIsLoading)
  }

  const handleCloseErr = () => setErr(false)

  const handleCloseSucces = () => {
    setModalUser(false)
    setFormUsers(initialForm)
    setSuccess(false)
  }
  const propsModalErr = {name: msg, hdClose: handleCloseErr}
  const propsModalSucces = {name: msg, hdClose: handleCloseSucces}
  const propsModalUsuarios = { hdlClose, handleChange, formUsers, hdlCancel, hdlSaveUser}

  return (
    <>
      <div>
        {/* Header */}
        <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
          <div className="parte-izq">
            <h1 className="text-3xl font-bold titulo">Usuarios</h1>
            <h1 className="text-gray-600 max-sm:text-sm">
              {" "}
              Administración de los usuarios permitidos por el sistema.
            </h1>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-3">
          <StatCard
            icon={<CiUser size={24} className="text-white" />}
            title="Usuarios"
            value={12}
            color="bg-blue-500"
          />
          <StatCard
            icon={
              <MdOutlineAdminPanelSettings size={24} className="text-white" />
            }
            title="Administradores"
            value={12}
            color="bg-amber-500"
          />
          <StatCard
            icon={<MdOutlineScale size={24} className="text-white" />}
            title="Bascula"
            value={12}
            color="bg-amber-500"
          />
          <StatCard
            icon={<FaTruckRampBox size={24} className="text-white" />}
            title="Tolva"
            value={12}
            color="bg-amber-500"
          />
          <StatCard
            icon={<MdAttachMoney size={24} className="text-white" />}
            title="Contabilidad"
            value={12}
            color="bg-amber-500"
          />
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-3 border border-gray-200">
          <div className="flex flex-col space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
              <button
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                onClick={handleResetFilters}
              >
                <FiRefreshCw size={16} className="mr-1" />
                <span className="text-sm">Restablecer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3   gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiSearch size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                  placeholder="Buscar..."
                  name="search"
                />
              </div>

              {/* Rango de fecha */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <CiUser  size={18} className="text-gray-400" />
                </div>
                <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5" name="date">
                  <option value={""}>Seleccione tipo de usuario</option>
                  <option value={1}>Administrador</option>
                  <option value={2}>Bascula</option>
                  <option value={3}>Tolva</option>
                  <option value={4}>Contabilidad</option>
                </select>
              </div>

              {/* Estado */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiFilter size={18} className="text-gray-400" />
                </div>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                  name="categoria"
                >
                  <option value={""}>Todos los estados</option>
                  <option value={1}>Activos</option>
                  <option value={2}>Inactivos</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-3 border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Historial de Logs</h2>
              <button onClick={()=>setModalUser(!modalUser)} className="flex items-center px-4 py-3 bg-[#4f3627] text-white rounded-lg hover:bg-[#4f3627ce] transition-colors">
                <IoAdd  size={18} className="mr-2" />
                Agregar Usuario
              </button>
            </div>
            {isLoading ? <BigSpinner /> :  <TableUsers datos={userTable}/>}
        </div>
      </div>
      {modalUser && <ModalAgregarUsuarios {...propsModalUsuarios}/>}
      {err && <ModalErr {...propsModalErr} />}
      {success && <ModalSuccess {...propsModalSucces}/>}
    </>
  );
};

export default Users;
