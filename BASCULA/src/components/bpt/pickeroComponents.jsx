import React, { useState, useEffect } from 'react';
import { Search, User, Calendar, Clock, CheckCircle, AlertCircle, XCircle, Play, Package, Check, X, Menu, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { buttonNormal } from '../../constants/boletas';

const ESTADO_LABELS = {
  'pendiente': 'Pendiente',
  'en_progreso': 'En Progreso',
  'completado': 'Completado',
  'pausado': 'Pausado',
  'devuelto': 'Devuelto'
};

export const PickingAsignadosTable = ({ tableData, loadingAction, selectedRow }) => {
  const navigate = useNavigate();
  const data = tableData ? tableData.map((item) => ({
    id: item.id,
    manifiesto: item.manifiestosDocNum,
    nombrePickero: item.nombrePickero,
    asignadoPor: item.asignadoPorNombre,
    fechaInicio: item.fechaInicioPicking ? new Date(item.fechaInicioPicking).toISOString().slice(0, 16).replace('T', ' ') : '-',
    fechaFin: item.fechaFinPicking ? new Date(item.fechaFinPicking).toISOString().slice(0, 16).replace('T', ' ') : '-',
    estado: ESTADO_LABELS[item.estado] || item.estado,
    estadoCode: item.estado,
    motivoDevolucion: item.motivoDevolucion || '-',
    numeroIntentos: item.numeroIntentos || 0,
    esReasignacion: item.esReasignacion,
    createdAt: new Date(item.createdAt).toISOString().slice(0, 16).replace('T', ' ')
  })) : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [onlyPendientes, setOnlyPendientes] = useState(false);
  const itemsPerPage = 20;

  const estadosUnicos = ['Todos', ...new Set(data.map(item => item.estado))];

  const filteredData = data.filter(item => {
    const matchesSearch = searchTerm === '' || Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesEstado = filterEstado === 'Todos' || item.estado === filterEstado;
    const matchesPendientes = !onlyPendientes || item.estadoCode === 'pendiente';
    return matchesSearch && matchesEstado && matchesPendientes;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getEstadoColor = (estadoCode) => {
    switch(estadoCode) {
      case 'PND': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'EPK': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'FPK': return 'bg-green-50 text-green-700 border-green-200';
      case 'ICP': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getEstadoIcon = (estadoCode) => {
    switch(estadoCode) {
      case 'PND': return <Clock className="w-4 h-4" />;
      case 'EPK': return <Play className="w-4 h-4" />;
      case 'FPK': return <CheckCircle className="w-4 h-4" />;
      case 'ICP': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleComenzarPicking = (DocNum) => {
    navigate(`./${DocNum}`);
  };

  return (
    <div className="w-full mx-auto p-3 max-sm:p-2 bg-white rounded-lg">
      {/* Barra de búsqueda y filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por manifiesto, pickero..."
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

        <label className='flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-3 cursor-pointer hover:bg-gray-50 max-sm:p-2 whitespace-nowrap'>
          <input 
            id='onlyPendientes'
            name='onlyPendientes' 
            type="checkbox" 
            className='cursor-pointer' 
            onChange={(e) => setOnlyPendientes(e.target.checked)}
          /> 
          <span className="text-sm">Solo Pendientes</span>
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
                Asignado Por
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider max-sm:hidden">
                Fecha Asignación
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider max-sm:hidden">
                Intentos
              </th>
              <th className="px-6 py-3 max-sm:py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
                        <span className="font-bold">{row.manifiesto}</span>
                      </div>
                      <div className='sm:hidden text-xs text-gray-500 mt-1'>
                        {row.createdAt}
                      </div>
                      <div className='sm:hidden text-xs text-gray-500 mt-1'>
                        Asignado por: {row.asignadoPor}
                      </div>
                      {row.esReasignacion && (
                        <span className="sm:hidden text-xs text-orange-600 mt-1 font-medium">
                          Reasignación
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap text-sm text-gray-900 max-sm:hidden">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{row.asignadoPor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap text-sm text-gray-700 max-sm:hidden">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {row.createdAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-medium rounded-full border ${getEstadoColor(row.estadoCode)}`}>
                        {getEstadoIcon(row.estadoCode)}
                        {row.estado}
                      </span>
                      {row.esReasignacion && (
                        <span className="max-sm:hidden text-xs text-orange-600 font-medium">
                          Reasignación
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap text-sm text-gray-900 text-center max-sm:hidden">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-semibold">
                      {row.numeroIntentos}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-sm:py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex gap-2 justify-center items-center">
                      <button 
                        onClick={() => handleComenzarPicking(row.manifiesto)} 
                        disabled={loadingAction && selectedRow === row.id}
                        className='inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#5a3f27] text-white hover:bg-[#5a3f27] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No se encontraron registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

export const ProductosAgrupadosTable = ({ tableData, type }) => {
  const [fechasCaducidad, setFechasCaducidad] = useState({});

  const handleFechaCaducidad = (groupIndex, itemIndex, fecha) => {
    const key = `${groupIndex}-${itemIndex}`;
    setFechasCaducidad(prev => ({
      ...prev,
      [key]: fecha
    }));
  };

  return (
    <div className="w-full mx-auto p-5 bg-white rounded-lg">
      {/* Vista Desktop */}
      <div className="hidden md:block overflow-x-auto rounded-lg">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-2 py-1.5 text-left text-[0.65rem] font-semibold text-gray-700 uppercase">Código</th>
              <th className="px-2 py-1.5 text-left text-[0.65rem] font-semibold text-gray-700 uppercase">Descripción</th>
              <th className="px-2 py-1.5 text-center text-[0.65rem] font-semibold text-gray-700 uppercase">Cant.</th>
              <th className="px-2 py-1.5 text-center text-[0.65rem] font-semibold text-gray-700 uppercase">Med.</th>
              <th className="px-2 py-1.5 text-center text-[0.65rem] font-semibold text-gray-700 uppercase">Peso</th>
              <th className="px-2 py-1.5 text-center text-[0.65rem] font-semibold text-gray-700 uppercase">Total</th>
              {type===2 && (
                <th className="px-2 py-1.5 text-center text-[0.65rem] font-semibold text-gray-700 uppercase">Caducidad</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white">
            {tableData.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                <tr style={{ backgroundColor: '#5a3f27' }}>
                  <td colSpan="7" className="px-2 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-white" />
                      <span className="text-white font-semibold text-xs">
                        {group.propiedad} - {group.pesoTotalAcumulado} lb
                      </span>
                    </div>
                  </td>
                </tr>
                {group.items.map((item, itemIndex) => {
                  const key = `${groupIndex}-${itemIndex}`;
                  return (
                    <tr key={key}>
                      <td className="px-2 py-1.5 text-xs font-medium text-gray-900">{item.itemCode}</td>
                      <td className="px-2 py-1.5 text-xs text-gray-900">{item.Descripcion}</td>
                      <td className="px-2 py-1.5 text-xs text-gray-900 text-center font-semibold">
                        {parseFloat(item.Cantidad).toFixed(2)}
                      </td>
                      <td className="px-2 py-1.5 text-xs text-gray-700 text-center">{item.Medida}</td>
                      <td className="px-2 py-1.5 text-xs text-gray-900 text-center">{item.PesoLb}</td>
                      <td className="px-2 py-1.5 text-xs text-gray-900 text-center">{item.PesoTotal}</td>
                      <td className="px-2 py-1.5 text-xs text-gray-900 text-center">
                        {type===2 && (
                          <div className="relative inline-block">
                            <input
                              type="date"
                              value={fechasCaducidad[key] || ''}
                              onChange={(e) => handleFechaCaducidad(groupIndex, itemIndex, e.target.value)}
                              className="pl-6 pr-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Mobile - Ultra Compacta */}
      <div className="md:hidden space-y-1.5">
        {tableData.map((group, groupIndex) => (
          <div key={groupIndex} className="overflow-hidden">
            {/* Header del grupo */}
            <div style={{ backgroundColor: '#5a3f27' }} className="px-2 py-1">
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3 text-white flex-shrink-0" />
                <span className="text-white font-semibold text-[0.6rem]">
                  {group.propiedad} - {group.pesoTotalAcumulado} lb
                </span>
              </div>
            </div>

            {/* Items del grupo */}
            <div className="divide-y divide-gray-100">
              {group.items.map((item, itemIndex) => {
                const key = `${groupIndex}-${itemIndex}`;
                const fechaActual = fechasCaducidad[key];
                return (
                  <div key={key} className="p-1.5 bg-white">
                    {/* Código y Descripción en línea compacta */}
                    <div className="mb-1">
                      <span className="font-bold text-[0.6rem] text-gray-900">{item.itemCode}</span>
                      <span className="text-[0.58rem] text-gray-600 ml-1">{item.Descripcion}</span>
                    </div>

                    {/* Info compacta en una sola línea */}
                    <div className="flex items-center gap-1.5 mb-1 text-[0.58rem]">
                      <div className="flex items-center gap-0.5 bg-gray-50 rounded px-1 py-0.5">
                        <span className="text-gray-500">Cant:</span>
                        <span className="font-semibold text-gray-900">{parseFloat(item.Cantidad).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-0.5 bg-gray-50 rounded px-1 py-0.5">
                        <span className="text-gray-500">{item.Medida}</span>
                      </div>
                    </div>

                    {/* Selector de fecha táctil mejorado */}
                    {type===2 && (
                      <label 
                        htmlFor={`date-${key}`}
                        className="relative block cursor-pointer"
                      >
                        <div className="w-full flex items-center justify-between px-2 py-1.5 bg-blue-50 border border-blue-200 rounded text-[0.6rem] hover:bg-blue-100 active:bg-blue-200 transition-colors">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-700 font-medium">
                              {fechaActual ? new Date(fechaActual + 'T00:00:00').toLocaleDateString('es-HN', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              }) : 'Seleccionar fecha'}
                            </span>
                          </div>
                          <span className="text-blue-600 text-xs">📅</span>
                        </div>
                        <input
                          id={`date-${key}`}
                          type="date"
                          value={fechasCaducidad[key] || ''}
                          onChange={(e) => handleFechaCaducidad(groupIndex, itemIndex, e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ActionsButtones = (props) => {
  const {handleBack, setMenuOpen, menuOpen, state = 'PND', handleStartPicking, handleFinishPicking, logs} = props
  return (
    <>
      <div className="flex items-end flex-col sm:flex-row gap-2">
        <button className={`${buttonNormal} max-sm:hidden`} onClick={handleBack}>
            Volver
        </button>
        <button className={`${buttonNormal} max-sm:hidden`}>
            Registros de Cambios ({logs})
        </button>
        {state == 'PND' ? (
          <button className={`${buttonNormal} max-sm:hidden`} onClick={handleStartPicking}>
            Comenzar picking
          </button>
        ): (
          <button className={`${buttonNormal} max-sm:hidden`} onClick={handleFinishPicking}>
            Finalizar picking
          </button>
        )}
      </div>
      {/* Version de telefono */}
      <div className="sm:hidden">
        <button 
          className={`${buttonNormal} fixed bottom-5 right-5 z-50 
            rounded-full !w-10 !h-10 !p-0 !min-w-0 shadow-lg 
            flex items-center justify-center
            transition-transform duration-300
            ${menuOpen ? 'rotate-45' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {menuOpen && (
          <>
            <button 
                className={`${buttonNormal} fixed bottom-56 right-5 z-40
                    rounded-full !w-12 !h-12 !p-0 !min-w-0 shadow-lg 
                    flex items-center justify-center
                    animate-in fade-in slide-in-from-bottom-4 duration-300`}
                title="Guardar"
            >
                <Save size={20} />
            </button>
            <button 
                className={`${buttonNormal} fixed bottom-24 right-5 z-40
                    rounded-full !w-12 !h-12 !p-0 !min-w-0 shadow-lg 
                    flex items-center justify-center
                    animate-in fade-in slide-in-from-bottom-4 duration-200`}
                onClick={handleBack}
                title="Volver"
            >
                <ArrowLeft size={20} />
            </button>
            {/* Finalizar */}
            <button 
                className={`${buttonNormal} fixed bottom-40 right-5 z-40
                    rounded-full !w-12 !h-12 !p-0 !min-w-0 shadow-lg 
                    flex items-center justify-center
                    animate-in fade-in slide-in-from-bottom-4 duration-500`}
                title="Finalizar"
            >
                <Check size={20} />
            </button>

            {/* Overlay para cerrar el menú al hacer clic fuera */}
            <div 
                className="fixed inset-0 z-30 bg-black/20"
                onClick={() => setMenuOpen(false)}
            />
          </>
        )}
      </div>
    </>
  )
}