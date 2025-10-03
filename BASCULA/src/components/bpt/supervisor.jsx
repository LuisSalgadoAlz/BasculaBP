import { useState } from 'react';
import { Search, X, User, View } from 'lucide-react';
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
    <div className="w-full mx-auto p-6 max-sm:p-2 bg-white shadow-lg rounded-lg">
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

export const ViewTabs = ({view, setView, manifiestos, connectionStatus}) => {
  return(
    <>
      <div className="p-4 grid grid-cols-3 gap-1 max-md:grid-cols-2 max-md:gap-2 max-sm:grid-cols-1 max-sm:gap-2">
        <button 
          className={`${view === 1 ? 'bg-[#5a3f27] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} w-full max-md:col-span-2 max-sm:col-span-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2`}
          onClick={() => setView(1)}
        >
          <span>Manifiestos Libres</span>
          {connectionStatus === 'connected' && (
            <span className={`${view === 1 ? 'bg-white text-[#5a3f27]' : 'bg-[#5a3f27] text-white'} text-xs px-2 py-1 rounded-full font-bold`}>
              {manifiestos.length}
            </span>
          )}
        </button>
        <button 
          className={`${view === 2 ? 'bg-[#5a3f27] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2`}
          onClick={() => setView(2)}
        >
          <span>Manifiestos Libres</span>
          {connectionStatus === 'connected' && (
            <span className={`${view === 1 ? 'bg-white text-[#5a3f27]' : 'bg-[#5a3f27] text-white'} text-xs px-2 py-1 rounded-full font-bold`}>
              {0}
            </span>
          )}
        </button>
        <button 
          className={`${view === 3 ? 'bg-[#5a3f27] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2`}
          onClick={() => setView(3)}
        >
          <span>Manifiestos Libres</span>
          {connectionStatus === 'connected' && (
            <span className={`${view === 1 ? 'bg-white text-[#5a3f27]' : 'bg-[#5a3f27] text-white'} text-xs px-2 py-1 rounded-full font-bold`}>
              {0}
            </span>
          )}
        </button>
      </div>
    </>
  )
}