import { useEffect, useState } from "react";
import { TablesBD } from "../../components/admin/tables";
import { getLogs, getStatsOfLogs, getUserForSelect } from "../../hooks/admin/formDataAdmin";
import { BigSpinner, NoData } from "../../components/alerts";
import { FiSearch, FiCalendar, FiFilter, FiDownload, FiRefreshCw, FiAlertCircle, FiAlertTriangle, FiClock, FiUsers } from "react-icons/fi";

// Componente de filtrado
const FilterControls = ({ onFilterChange, usersForSelects }) => {
  const [filters, setFilters] = useState({
    dateRange: "today",
    status: "all",
    user: "",
    search: ""
  });

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-3 border border-gray-200">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
          <button 
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            onClick={() => onFilterChange({ dateRange: "today", status: "all", user: "", search: "" })}
          >
            <FiRefreshCw size={16} className="mr-1" />
            <span className="text-sm">Restablecer</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="Buscar..."
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
            />
          </div>

          {/* Rango de fecha */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiUsers size={18} className="text-gray-400" />
            </div>
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              value={filters.dateRange}
              onChange={(e) => handleChange("dateRange", e.target.value)}
            >
              <option value="all">Todos los usuarios</option>
              {usersForSelects?.map((item, index) => (
                <option key={index} value={item.usuario}>
                  {item.usuario}
                </option>
              ))}
            </select>
          </div>
      
          {/* Rango de fecha */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiCalendar size={18} className="text-gray-400" />
            </div>
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              value={filters.dateRange}
              onChange={(e) => handleChange("dateRange", e.target.value)}
            >
              <option value="today">Hoy</option>
              <option value="yesterday">Ayer</option>
              <option value="last7days">Últimos 7 días</option>
              <option value="last30days">Últimos 30 días</option>
            </select>
          </div>

          {/* Estado */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiFilter size={18} className="text-gray-400" />
            </div>
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              value={filters.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="success">Completos</option>
              <option value="error">Advertencia</option>
              <option value="warning">Errores</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de tarjeta de estadísticas mejorado
const StatCard = ({ icon, title, value, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
        </div>
      </div>
    </div>
  );
};

const Logs = () => {
  const [tableLogs, setTablesLogs] = useState();
  const [usersForSelect, setUsersForSelect] = useState()
  const [isLoadStats, setIsloadStats] = useState(false)
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ logs: 0, completos: 0, advertencia: 0, errores: 0, });
  const [filters, setFilters] = useState({categoria:'', user:''})

  useEffect(() => {
    getLogs(setTablesLogs, setIsLoading, '', '', '');
    getStatsOfLogs(setStats, setIsloadStats)
    getUserForSelect(setUsersForSelect)
  }, []);

  useEffect(() => {
    getLogs(setTablesLogs, setIsLoading, filters?.categoria, filters?.user, filters?.search);
  }, [filters?.categoria, filters?.user, filters?.search]);

  const handleChange = (e) => {
    const {name, value} = e.target
    setFilters((prev)=>({
      ...prev, [name] : value,
    }))
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        {/* Encabezado */}
        <div className="flex justify-between w-full gap-5 max-sm:flex-col max-md:flex-col mb-4">
          <div className="parte-izq">
            <h1 className="text-3xl font-bold titulo">Registros: Logs</h1>
            <h1 className="text-gray-600 max-sm:text-sm">
              {" "}
              Sistema de monitoreo de los logs de usuarios de la Báscula
            </h1>
          </div>
        </div>
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-3">
          <StatCard 
            icon={<FiCalendar size={24} className="text-white" />}
            title="Logs (Hoy)" 
            value={stats.logs} 
            color="bg-blue-500"
          />
          <StatCard 
            icon={<FiClock size={24} className="text-white" />}
            title="Completados (Hoy)" 
            value={stats.completos} 
            color="bg-amber-500"
          />
          <StatCard 
            icon={<FiAlertTriangle size={24} className="text-white" />}
            title="Advertencias (Hoy)" 
            value={stats.advertencia} 
            color="bg-yellow-500"
          />
          <StatCard 
            icon={<FiAlertCircle size={24} className="text-white" />}
            title="Errores (Hoy)" 
            value={stats.errores} 
            color="bg-red-500"
          />
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-3 border border-gray-200">
          <div className="flex flex-col space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
              <button 
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                onClick={() => onFilterChange({ dateRange: "today", status: "all", user: "", search: "" })}
              >
                <FiRefreshCw size={16} className="mr-1" />
                <span className="text-sm">Restablecer</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  onChange={handleChange}
                />
              </div>

              {/* Rango de fecha */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiUsers size={18} className="text-gray-400" />
                </div>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                  name="user" 
                  onChange={handleChange}
                >
                  <option value="all">Todos los usuarios</option>
                  {usersForSelect?.map((item, index) => (
                    <option key={index} value={item.usuario}>
                      {item.usuario}
                    </option>
                  ))}
                </select>
              </div>
          
              {/* Rango de fecha */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiCalendar size={18} className="text-gray-400" />
                </div>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                  onChange={(e) => handleChange("dateRange", e.target.value)}
                >
                  <option value="today">Hoy</option>
                  <option value="yesterday">Ayer</option>
                  <option value="last7days">Últimos 7 días</option>
                  <option value="last30days">Últimos 30 días</option>
                </select>
              </div>

              {/* Estado */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiFilter size={18} className="text-gray-400" />
                </div>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                  onChange={handleChange}
                  name="categoria"
                >
                  <option value="all">Todos los estados</option>
                  <option value={1}>Completos</option>
                  <option value={2}>Advertencia</option>
                  <option value={3}>Errores</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de logs con acciones */}
        <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Historial de Logs</h2>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <FiDownload size={18} className="mr-2" />
              Exportar
            </button>
          </div>
          
          <div className="p-6">
            {(isLoading && !tableLogs) ? (
              <div className="flex justify-center py-12">
                <BigSpinner />
              </div>
            ) : (!tableLogs || tableLogs.length === 0) ? (
              <div className="py-12">
                <NoData />
              </div>
            ) : (
              <TablesBD datos={tableLogs} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;