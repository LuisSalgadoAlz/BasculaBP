import { useEffect, useState } from "react";
import { TablesBD } from "../../components/admin/tables";
import { getLogs } from "../../hooks/admin/formDataAdmin";
import { BigSpinner, NoData } from "../../components/alerts";
import { FiSearch, FiCalendar, FiFilter, FiDownload, FiRefreshCw, FiActivity, FiAlertCircle, FiAlertTriangle, FiClock } from "react-icons/fi";

// Componente de filtrado
const FilterControls = ({ onFilterChange }) => {
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
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
              <option value="custom">Personalizado</option>
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
              <option value="success">Exitoso</option>
              <option value="error">Error</option>
              <option value="warning">Advertencia</option>
            </select>
          </div>

          {/* Usuario */}
          <div className="relative">
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Filtrar por usuario"
              value={filters.user}
              onChange={(e) => handleChange("user", e.target.value)}
            />
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
  const [filteredLogs, setFilteredLogs] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLogs: 0,
    pendingLogs: 0,
    warningLogs: 0,
    errorLogs: 0,
  });

  useEffect(() => {
    getLogs(setTablesLogs, setIsLoading);
  }, []);

  useEffect(() => {
    if (tableLogs) {
      setFilteredLogs(tableLogs);
      
      // Calcular estadísticas (simulación)
      setStats({
        totalLogs: tableLogs.length || 0,
        pendingLogs: Math.floor((tableLogs.length || 0) * 0.2),
        warningLogs: Math.floor((tableLogs.length || 0) * 0.15),
        errorLogs: Math.floor((tableLogs.length || 0) * 0.05),
      });
    }
  }, [tableLogs]);

  const handleFilterChange = (filters) => {
    // Lógica de filtrado (simplificada para el ejemplo)
    if (!tableLogs) return;
    
    let filtered = [...tableLogs];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        (log.description && log.description.toLowerCase().includes(searchLower)) ||
        (log.user && log.user.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.user) {
      filtered = filtered.filter(log => 
        log.user && log.user.toLowerCase().includes(filters.user.toLowerCase())
      );
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(log => log.status === filters.status);
    }
    
    setFilteredLogs(filtered);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Registros: Logs</h1>
          <p className="text-gray-600">
            Sistema avanzado de monitoreo de los logs de usuarios de la Báscula
          </p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<FiCalendar size={24} className="text-white" />}
            title="Logs (Hoy)" 
            value={stats.totalLogs} 
            color="bg-blue-500"
          />
          <StatCard 
            icon={<FiClock size={24} className="text-white" />}
            title="Pendientes" 
            value={stats.pendingLogs} 
            color="bg-amber-500"
          />
          <StatCard 
            icon={<FiAlertTriangle size={24} className="text-white" />}
            title="Advertencias" 
            value={stats.warningLogs} 
            color="bg-yellow-500"
          />
          <StatCard 
            icon={<FiAlertCircle size={24} className="text-white" />}
            title="Errores" 
            value={stats.errorLogs} 
            color="bg-red-500"
          />
        </div>

        {/* Filtros */}
        <FilterControls onFilterChange={handleFilterChange} />

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
            {(isLoading && !filteredLogs) ? (
              <div className="flex justify-center py-12">
                <BigSpinner />
              </div>
            ) : (!filteredLogs || filteredLogs.length === 0) ? (
              <div className="py-12">
                <NoData />
              </div>
            ) : (
              <TablesBD datos={filteredLogs} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;