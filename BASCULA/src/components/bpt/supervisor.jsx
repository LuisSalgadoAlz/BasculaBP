import { useState } from 'react';
import { Search, X, User, Package, Calendar, CheckCircle, Clock, XCircle, AlertCircle, ArrowUpDown } from 'lucide-react';
import { useEffect } from 'react';

const LIST_STATUS = {
    C : 'CANCELADO',
    E : 'EDITABLE',
    I : 'ORIGINAL'
}

export const ManifiestosTable = ({ tableData, handleOpenModal }) => {
  const data = tableData ? tableData.map((item, index) => ({
    id: index + 1,
    manifiesto: item.DocNum,
    tipo: item.Tipo,
    fechaEntrega: new Date(item.U_FechaEntrega).toISOString().slice(0, 10),
    ruta: item.U_IDRuta,
    estado: LIST_STATUS[item.U_Status],
    peso: parseFloat(item.U_PesoTotal),
  })) : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [onlyNow, setOnlyNow] = useState(false)
  const itemsPerPage = 20;

  const estadosUnicos = ['Todos', ...new Set(data.map(item => item.estado))];

  const filteredData = data.filter(item => {
    const matchesSearch = Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesEstado = filterEstado === 'Todos' || item.estado === filterEstado;
    const matchesHoy = onlyNow ? new Date(item.fechaEntrega).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10) : true
    return matchesSearch && matchesEstado && matchesHoy;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'Entregado': return 'bg-green-50 text-green-700 border-green-200';
      case 'En Tránsito': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pendiente': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="w-full mx-auto p-6 max-sm:p-2 bg-white rounded-lg">
      {/* Barra de búsqueda y filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por manifiesto, ruta, estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {estadosUnicos.map(estado => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
        <label className='flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-2 cursor-pointer hover:bg-gray-50 max-sm:p-2'>
          <input 
              id='onlyNow'
              name='onlyNow' 
              type="checkbox" 
              className='cursor-pointer' 
              onChange={(e) => {setOnlyNow(e.target.checked)}}
          /> 
          <span>Entregas Hoy</span>
      </label>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 max-sm:py-2 text-left text-xs max-sm:hidden font-semibold text-gray-700 uppercase tracking-wider">
                ID 
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Manifiesto
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Ruta
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Peso (QQ)
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap text-sm text-gray-900 max-sm:hidden">
                    #{row.id}
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className='flex flex-col'>
                        <div>
                            {row.manifiesto} <span className='sm:hidden'>- {row.tipo}</span>
                        </div>
                        <div className='sm:hidden'>
                            {row.fechaEntrega}
                        </div>
                        <div className='sm:hidden'>
                            {row.estado} 
                        </div>
                        <div className='sm:hidden'>
                            {row.ruta} - {row.peso.toFixed(2)} 
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      {row.tipo === 'Mayoreo' ? 
                        <div className='w-5 h-5 bg-gray-600 rounded-full'></div>: 
                        <div className='w-5 h-5 bg-amber-600 rounded-full'></div> 
                      }
                      <span className='max-sm:hidden'>{row.tipo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap text-sm text-gray-700 table-cell">
                    <div className="flex items-center gap-2">
                      {row.fechaEntrega}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.ruta}
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full border ${getEstadoColor(row.estado)}`}>
                      {row.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center justify-end gap-2">
                      {row.peso.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={()=>handleOpenModal(tableData?.filter(item => item.DocNum === row.manifiesto))} className='bg-[#5a3f27] text-white p-2 rounded-lg'> Asignar </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No se encontraron registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className='flex items-center justify-center gap-2 px-6 py-3 border-t border-gray-100 sm:hidden'>
            <div className='w-5 h-5 bg-gray-600 rounded-sm'></div> Mayoreo
            <div className='w-5 h-5 bg-amber-600 rounded-sm'></div> Detalle
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length} registros
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const ModalAsignar = ({ usuarios=[{}], setIsOpen,isOpen, handleAsignar }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setSelectedUser(null);
    setSearchTerm('')
  }, [isOpen])

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Asignar Manifiesto</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#955e37] rounded-lg focus:ring-1 focus:ring-[#955e37] focus:border-[#955e37] text-sm"
            />
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-3">
            Seleccionar Usuario
          </label>
          <div className="space-y-2 h-64 overflow-y-auto">
            {filteredUsuarios.map((usuario) => (
              <div
                key={usuario.id}
                onClick={() => setSelectedUser(usuario.id)}
                className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedUser === usuario.id
                    ? 'border-[#955e37] bg-[#cf9c7881]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="bg-gray-100 p-1.5 rounded-full">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm text-gray-800">{usuario.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => handleAsignar(selectedUser)}
            disabled={!selectedUser}
            className={`px-4 py-2 rounded-lg text-white ${
              selectedUser
                ? 'bg-[#955e37] hover:bg-[#745a47]'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Asignar
          </button>
        </div>
      </div>
    </div>
  );
}

export const ViewTabs = ({view, setView, manifiestos, connectionStatus, manifiestosAsignados}) => {
  return(
    <>
      <div className="p-2 sm:p-4">
        <div className="inline-flex bg-gray-200 rounded-xl p-1 gap-1 w-full sm:w-auto overflow-x-auto">
          <button 
            className={`${
              view === 1 
                ? 'bg-[#5a3f27] text-white shadow-lg' 
                : 'text-gray-400 hover:text-gray-300'
            } px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-1 sm:flex-initial min-w-0`}
            onClick={() => setView(1)}
          >
            <span className="text-sm sm:text-base">Libres</span>
            {connectionStatus === 'connected' && view === 1 && (
              <span className="bg-white text-[#5a3f27] text-xs px-2 py-0.5 rounded-full font-bold">
                {manifiestos.length}
              </span>
            )}
          </button>
          
          <button 
            className={`${
              view === 2 
                ? 'bg-[#5a3f27] text-white shadow-lg' 
                : 'text-gray-400 hover:text-gray-300'
            } px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-1 sm:flex-initial min-w-0`}
            onClick={() => setView(2)}
          >
            <span className="text-sm sm:text-base">Asignados</span>
            {connectionStatus === 'connected' && view === 2 && (
              <span className="bg-white text-[#5a3f27] text-xs px-2 py-0.5 rounded-full font-bold">
                {manifiestosAsignados.length}
              </span>
            )}
          </button>
          
          <button 
            className={`${
              view === 3 
                ? 'bg-[#5a3f27] text-white shadow-lg' 
                : 'text-gray-400 hover:text-gray-300'
            } px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-1 sm:flex-initial min-w-0`}
            onClick={() => setView(3)}
          >
            <span className="text-sm sm:text-base">Aprobados</span>
            {connectionStatus === 'connected' && view === 3 && (
              <span className="bg-white text-[#5a3f27] text-xs px-2 py-0.5 rounded-full font-bold">
                {0}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

const ESTADO_PICKING = {
  'AGN': 'Asignado',
  'EPK': 'En Picking',
  'FPK': 'Finalizado',
  'ICP': 'Incompleto',
  'APK': 'Aprobado',
  'RCO': 'Rechazado',
  'END': 'Finalizado'
};

export const ManifiestosAsignadosTable = ({ tableData, handleOpenLogs }) => {
  const data = tableData ? tableData.map((item) => ({
    id: item.id,
    docNum: item.DocNum,
    tipo: item.Tipo,
    fechaEntrega: new Date(item.U_FechaEntrega).toISOString().slice(0, 10),
    ruta: item.U_IDRuta,
    estadoManifiesto: LIST_STATUS[item.U_Status] || item.U_Status,
    estadoPicking: ESTADO_PICKING[item.estadoPicking] || item.estadoPicking,
    estadoPickingCode: item.estadoPicking,
    peso: parseFloat(item.U_PesoTotal),
    userAsignado: item.userAsignado,
    logs: item.logs || 0,
    bodega: item.Bodega,
    camion: item.U_CamionPlaca,
    chofer: item.U_Chofer
  })) : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstadoPicking, setFilterEstadoPicking] = useState('Todos');
  const [filterUsuario, setFilterUsuario] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [onlyNow, setOnlyNow] = useState(false);
  const itemsPerPage = 20;

  const estadosPickingUnicos = ['Todos', ...new Set(data.map(item => item.estadoPicking))];
  const usuariosUnicos = ['Todos', ...new Set(data.map(item => item.userAsignado))];

  const filteredData = data.filter(item => {
    const matchesSearch = Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesEstadoPicking = filterEstadoPicking === 'Todos' || item.estadoPicking === filterEstadoPicking;
    const matchesUsuario = filterUsuario === 'Todos' || item.userAsignado === filterUsuario;
    const matchesHoy = onlyNow ? new Date(item.fechaEntrega).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10) : true;
    return matchesSearch && matchesEstadoPicking && matchesUsuario && matchesHoy;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getEstadoPickingColor = (estadoCode) => {
    switch(estadoCode) {
      case 'APK': return 'bg-green-50 text-green-700 border-green-200';
      case 'EPK': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'FPK': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'AGN': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'ICP': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'RCO': return 'bg-red-50 text-red-700 border-red-200';
      case 'END': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getEstadoPickingIcon = (estadoCode) => {
    switch(estadoCode) {
      case 'APK': return <CheckCircle className="w-4 h-4" />;
      case 'EPK': return <Clock className="w-4 h-4" />;
      case 'FPK': return <CheckCircle className="w-4 h-4" />;
      case 'AGN': return <AlertCircle className="w-4 h-4" />;
      case 'ICP': return <XCircle className="w-4 h-4" />;
      case 'RCO': return <XCircle className="w-4 h-4" />;
      case 'END': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full mx-auto p-6 max-sm:p-2 bg-white rounded-lg">
      {/* Barra de búsqueda y filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por manifiesto, ruta, usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={filterEstadoPicking}
          onChange={(e) => setFilterEstadoPicking(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {estadosPickingUnicos.map(estado => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
        <label className='flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-3 cursor-pointer hover:bg-gray-50 max-sm:p-2 whitespace-nowrap'>
          <input 
            id='onlyNow'
            name='onlyNow' 
            type="checkbox" 
            className='cursor-pointer' 
            onChange={(e) => setOnlyNow(e.target.checked)}
          /> 
          <span className="text-sm">Entregas Hoy</span>
        </label>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 max-sm:py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Manifiesto
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider max-sm:hidden">
                Tipo
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider max-sm:hidden">
                Fecha
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider max-sm:hidden">
                Ruta
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Usuario Asignado
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Estado Picking
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider max-sm:hidden">
                Peso (QQ)
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider max-sm:hidden">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className='flex flex-col'>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="font-bold">{row.docNum}</span>
                        <div className={`{sm:hidden py-1 inline-flex items-center gap-1.5 text-xs font-medium text-gray-400`}>
                          {row.estadoPicking}
                        </div>
                      </div>
                      <div className='sm:hidden text-xs text-gray-500 mt-1'>
                        {row.tipo} • {row.fechaEntrega}
                      </div>
                      <div className='sm:hidden text-xs text-gray-600 mt-1'>
                        Ruta: {row.ruta} • {row.peso.toFixed(2)} QQ
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap text-sm text-gray-700 max-sm:hidden">
                    <div className="flex items-center gap-2">
                      {row.tipo === 'Mayoreo' ? 
                        <div className='w-5 h-5 bg-gray-600 rounded-full'></div> : 
                        <div className='w-5 h-5 bg-amber-600 rounded-full'></div> 
                      }
                      <span>{row.tipo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap text-sm text-gray-700 max-sm:hidden">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {row.fechaEntrega}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap text-sm text-gray-900 max-sm:hidden">
                    {row.ruta}
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{row.userAsignado}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-medium rounded-full border ${getEstadoPickingColor(row.estadoPickingCode)}`}>
                      {getEstadoPickingIcon(row.estadoPickingCode)}
                      {row.estadoPicking}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap text-sm text-gray-900 text-right max-sm:hidden">
                    {row.peso.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex gap-2 justify-center items-center max-sm:flex-col">
                      <button onClick={()=>handleOpenLogs(row.docNum)} className='inline-flex items-center justify-center px-2.5 py-1 rounded text-xs font-medium bg-[#5a3f27] text-white w-24'>
                        Logs ({row.logs})
                      </button>
                      <button onClick={()=>console.log(row.docNum)} className='inline-flex items-center justify-center px-2.5 py-1 rounded text-xs font-medium bg-[#5a3f27] text-white w-24'>
                        Reasignar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                  No se encontraron registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className='flex items-center justify-center gap-4 px-6 py-3 border-t border-gray-100 sm:hidden text-xs'>
          <div className='flex items-center gap-1'>
            <div className='w-4 h-4 bg-gray-600 rounded-sm'></div> Mayoreo
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-4 h-4 bg-amber-600 rounded-sm'></div> Detalle
          </div>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length} registros
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const ManifiestosLogs = ({data=[], isOpen, setIsOpen}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-HN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseChanges = (observacion) => {
    const matches = observacion.match(/(\w+):\s*"([^"]+)"\s*→\s*"([^"]+)"/g);
    if (!matches) return null;
    
    return matches.map(match => {
      const parts = match.match(/(\w+):\s*"([^"]+)"\s*→\s*"([^"]+)"/);
      return {
        field: parts[1],
        from: parts[2],
        to: parts[3]
      };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-60 flex items-end sm:items-center justify-center p-2 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full sm:max-w-sm overflow-hidden">
        {/* Header - colores café/marrón */}
        <div className="px-3 py-2 flex items-center justify-between bg-[#5a3f27]">
          <div>
            <h2 className="text-sm font-bold text-white">Historial</h2>
            <p className="text-xs text-white">Doc #{data[0]?.DocNum}</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content mini */}
        <div className="p-2 overflow-y-auto max-h-[calc(80vh-100px)]" style={{ backgroundColor: '#FAF8F5' }}>
          <div className="space-y-1.5">
            {data.map((item, index) => {
              const changes = parseChanges(item.Observacion);
              
              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-md p-2 border"
                  style={{ borderColor: '#E5DDD5' }}
                >
                  {/* Timestamp mini */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" style={{ color: '#8B7355' }} />
                      <span className="text-xs" style={{ color: '#6B5B4A' }}>
                        {formatDate(item.createAt)}
                      </span>
                    </div>
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#FFF3E0', color: '#8B7355' }}>
                      #{index + 1}
                    </span>
                  </div>

                  {/* Changes mini */}
                  {changes && changes.map((change, idx) => (
                    <div 
                      key={idx}
                      className="rounded p-1.5 mb-1 last:mb-0"
                      style={{ backgroundColor: '#FAFAFA' }}
                    >
                      <div className="text-xs font-semibold mb-1">
                        {change.field}
                      </div>
                      <div className="space-y-0.5">
                        <div className="border rounded px-1.5 py-0.5 bg-[#5a3f27]">
                          <span className="text-xs font-medium text-white">
                            {change.to}
                          </span>
                        </div>
                        <div className="flex justify-center">
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                        <div className="border rounded px-1.5 py-0.5">
                          <span className="text-xs line-through">
                            {change.from}
                          </span>
                        </div>  
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer mini */}
        <div className="px-2 py-2 border-t" style={{ backgroundColor: '#FAF8F5', borderColor: '#E5DDD5' }}>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-full text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ backgroundColor: '#6B5B4A' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#5A4A3A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6B5B4A'}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};