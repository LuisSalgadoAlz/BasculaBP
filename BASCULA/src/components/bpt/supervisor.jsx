import { useState } from 'react';
import { Search, Download, Truck, Package, Calendar, Weight } from 'lucide-react';
import { FaBoxes } from "react-icons/fa";

const LIST_STATUS = {
    C : 'CANCELADO',
    E : 'EDITABLE',
    I : 'ORIGINAL'
}

export const ManifiestosTable = ({ tableData }) => {
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
        <div className='flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-2'>
            <input name='onlyNow' type="checkbox" className='bg-red-400'/> <label htmlFor="onlyNow">Entregas Hoy</label>
        </div>
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
              <th className="px-6 py-3 max-sm:py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
                      <button className='bg-[#5a3f27] text-white p-2 rounded-lg'> Asignar </button>
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