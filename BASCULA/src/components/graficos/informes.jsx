import React, { useState } from 'react';
import {
  LineChart, 
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';


// Datos de ejemplo para un sistema de báscula
const pesajesDiarios = [
    { fecha: '23/04', cantidad: 42, pesoTotal: 12500, promedio: 297.6 },
    { fecha: '24/04', cantidad: 38, pesoTotal: 11200, promedio: 294.7 },
    { fecha: '25/04', cantidad: 45, pesoTotal: 13400, promedio: 297.8 },
    { fecha: '26/04', cantidad: 37, pesoTotal: 10900, promedio: 294.6 },
    { fecha: '27/04', cantidad: 48, pesoTotal: 14300, promedio: 297.9 },
    { fecha: '28/04', cantidad: 51, pesoTotal: 15200, promedio: 298.0 },
    { fecha: '29/04', cantidad: 46, pesoTotal: 13600, promedio: 295.7 },
  ];
  
  const pesajesPorCategoria = [
    { categoria: 'Camiones', cantidad: 145, pesoPromedio: 12500 },
    { categoria: 'Camionetas', cantidad: 87, pesoPromedio: 2500 },
    { categoria: 'Autos', cantidad: 65, pesoPromedio: 1200 },
    { categoria: 'Maquinaria', cantidad: 24, pesoPromedio: 8500 },
    { categoria: 'Contenedores', cantidad: 32, pesoPromedio: 5800 },
  ];
  
  const distribucionPorHora = [
    { hora: '8:00', cantidad: 15 },
    { hora: '9:00', cantidad: 23 },
    { hora: '10:00', cantidad: 28 },
    { hora: '11:00', cantidad: 32 },
    { hora: '12:00', cantidad: 26 },
    { hora: '13:00', cantidad: 18 },
    { hora: '14:00', cantidad: 22 },
    { hora: '15:00', cantidad: 25 },
    { hora: '16:00', cantidad: 29 },
    { hora: '17:00', cantidad: 21 },
  ];
  
  const distribucionPorTipo = [
    { tipo: 'Entrada', value: 185 },
    { tipo: 'Salida', value: 167 },
    { tipo: 'Entrada y Salida', value: 48 },
  ];
  
  // Estadísticas generales
  const statsData = [
    { title: 'Total de Pesajes', value: '307', change: '+8.2%', icon: '⚖️', positive: true },
    { title: 'Peso Promedio', value: '296.8 kg', change: '+1.3%', icon: '📊', positive: true },
    { title: 'Tiempo Promedio', value: '3m 12s', change: '-0.5%', icon: '⏱️', positive: true },
    { title: 'Peso Total', value: '91.2 ton', change: '+12.2%', icon: '🏋️', positive: true },
  ];
  
  // Paleta de colores
  const COLORS = {
    primary: '#3B82F6',
    secondary: '#10B981',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#6366F1',
    light: '#F9FAFB',
    dark: '#374151',
    muted: '#9CA3AF',
    background: '#F9FAFB',
    cardBackground: '#FFFFFF',
    border: '#E5E7EB',
    lightBorder: '#F3F4F6',
  };
  
  const PIE_COLORS = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.info];


// Componente Card para encapsular secciones
const Card = ({ children }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="p-5">
      {children}
    </div>
  </div>
);

// Componente para mostrar estadísticas
const StatCard = ({ title, value, change, icon, positive }) => (
  <Card>
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="text-lg text-blue-500">{icon}</div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      <div className="mt-2">
        <span className={`text-xs font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
        <span className="text-xs text-gray-500 ml-1">vs día anterior</span>
      </div>
    </div>
  </Card>
);

// Gráfico de área para mostrar los pesajes diarios
const PesajesDiariosChart = () => (
  <Card>
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Pesajes Diarios</h3>
      <p className="text-sm text-gray-500 mt-1">Historial de los últimos 7 días</p>
    </div>
    <div className="mt-4">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={pesajesDiarios} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPesoTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke={COLORS.lightBorder} vertical={false} />
          <XAxis 
            dataKey="fecha" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: COLORS.muted, fontSize: 12 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: COLORS.muted, fontSize: 12 }} 
            width={35}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: COLORS.cardBackground, 
              borderColor: COLORS.border,
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
            formatter={(value, name) => {
              if (name === 'pesoTotal') return [`${value} kg`, 'Peso Total'];
              if (name === 'cantidad') return [value, 'Cantidad de Pesajes'];
              return [value, name];
            }}
            labelStyle={{ fontWeight: 'bold', color: COLORS.dark }}
          />
          <Legend 
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ 
              paddingTop: '10px', 
              fontSize: '12px',
              color: COLORS.muted
            }}
          />
          <Area 
            type="monotone" 
            name="Peso Total"
            dataKey="pesoTotal" 
            stroke={COLORS.primary}
            strokeWidth={2}
            fill="url(#colorPesoTotal)"
            dot={{ strokeWidth: 2, r: 3, fill: 'white' }}
            activeDot={{ r: 5, stroke: COLORS.primary }}
          />
          <Line 
            type="monotone" 
            name="Cantidad"
            dataKey="cantidad" 
            stroke={COLORS.success}
            strokeWidth={2}
            dot={{ strokeWidth: 2, r: 3, fill: 'white' }}
            activeDot={{ r: 5, stroke: COLORS.success }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-3 text-xs text-gray-500">Actualizado: Hoy a las 14:30</div>
  </Card>
);

// Gráfico de barras para mostrar pesajes por categoría
const PesajesPorCategoriaChart = () => (
  <Card>
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Pesajes por Categoría</h3>
      <p className="text-sm text-gray-500 mt-1">Distribución de cantidad y peso promedio</p>
    </div>
    <div className="mt-4">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={pesajesPorCategoria} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={COLORS.lightBorder} vertical={false} />
          <XAxis 
            dataKey="categoria" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: COLORS.muted, fontSize: 12 }}
          />
          <YAxis 
            yAxisId="left"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: COLORS.muted, fontSize: 12 }} 
            width={35}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: COLORS.muted, fontSize: 12 }} 
            width={35}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: COLORS.cardBackground, 
              borderColor: COLORS.border,
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
            formatter={(value, name) => {
              if (name === 'pesoPromedio') return [`${value} kg`, 'Peso Promedio'];
              if (name === 'cantidad') return [value, 'Cantidad'];
              return [value, name];
            }}
            cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
          />
          <Legend 
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ 
              paddingTop: '10px', 
              fontSize: '12px',
              color: COLORS.muted
            }}
          />
          <Bar 
            yAxisId="left"
            name="Cantidad" 
            dataKey="cantidad" 
            fill={COLORS.primary} 
            radius={[2, 2, 0, 0]} 
            barSize={20}
          />
          <Bar 
            yAxisId="right"
            name="Peso Promedio"
            dataKey="pesoPromedio" 
            fill={COLORS.warning} 
            radius={[2, 2, 0, 0]} 
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-3 text-xs text-gray-500">Actualizado: Hoy a las 14:30</div>
  </Card>
);

// Gráfico de distribución por hora
const DistribucionPorHoraChart = () => (
  <Card>
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Distribución por Hora</h3>
      <p className="text-sm text-gray-500 mt-1">Frecuencia de pesajes durante el día</p>
    </div>
    <div className="mt-4">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={distribucionPorHora} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={COLORS.lightBorder} vertical={false} />
          <XAxis 
            dataKey="hora" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: COLORS.muted, fontSize: 12 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: COLORS.muted, fontSize: 12 }} 
            width={35}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: COLORS.cardBackground, 
              borderColor: COLORS.border,
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
            formatter={(value, name) => {
              if (name === 'cantidad') return [value, 'Cantidad de Pesajes'];
              return [value, name];
            }}
            cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
          />
          <Bar 
            name="Cantidad" 
            dataKey="cantidad" 
            fill={COLORS.info} 
            radius={[2, 2, 0, 0]} 
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-3 text-xs text-gray-500">Actualizado: Hoy a las 14:30</div>
  </Card>
);

// Gráfico de distribución por tipo
const DistribucionPorTipoChart = () => (
  <Card>
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Distribución por Tipo</h3>
      <p className="text-sm text-gray-500 mt-1">Porcentaje según el tipo de pesaje</p>
    </div>
    <div className="mt-4">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={distribucionPorTipo}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {distribucionPorTipo.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={PIE_COLORS[index % PIE_COLORS.length]} 
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: COLORS.cardBackground, 
              borderColor: COLORS.border,
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
            formatter={(value, name, props) => [`${value} pesajes`, props.payload.tipo]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-3 text-xs text-gray-500">Actualizado: Hoy a las 14:30</div>
  </Card>
);

// Selector de período
const PeriodSelector = ({ selectedPeriod, onChange }) => {
  const periods = ['Hoy', 'Ayer', 'Esta semana', 'Este mes', 'Último mes', 'Personalizado'];
  
  return (
    <div className="flex flex-wrap">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={`px-3 py-1 text-sm transition-all mx-1 ${
            selectedPeriod === period
              ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {period}
        </button>
      ))}
    </div>
  );
};

// Componente de filtros para el reporte
const ReportFilters = () => {
  const [showFilters, setShowFilters] = useState(false);
  
  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filtros de Reporte</h3>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
      </div>
      
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Báscula</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="todas">Todas las básculas</option>
              <option value="principal">Báscula Principal</option>
              <option value="secundaria">Báscula Secundaria</option>
              <option value="portatil">Báscula Portátil</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="todas">Todas las categorías</option>
              <option value="camiones">Camiones</option>
              <option value="camionetas">Camionetas</option>
              <option value="autos">Autos</option>
              <option value="maquinaria">Maquinaria</option>
              <option value="contenedores">Contenedores</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operador</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="todos">Todos los operadores</option>
              <option value="juan">Juan Pérez</option>
              <option value="maria">María López</option>
              <option value="carlos">Carlos Rodríguez</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pesaje</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="todos">Todos los tipos</option>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="ambos">Entrada y Salida</option>
            </select>
          </div>
        </div>
      )}
      
      {showFilters && (
        <div className="flex justify-end mt-4">
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 mr-2 text-sm font-medium">
            Limpiar Filtros
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Aplicar Filtros
          </button>
        </div>
      )}
    </Card>
  );
};

// Componente para opciones de exportación
const ExportOptions = () => {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Exportar Reportes</h3>
        <p className="text-sm text-gray-500 mt-1">Descarga los datos en diferentes formatos</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <button className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
          <span className="mr-2">📊</span>
          <span className="font-medium text-sm">Excel</span>
        </button>
        
        <button className="flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
          <span className="mr-2">📄</span>
          <span className="font-medium text-sm">PDF</span>
        </button>
        
        <button className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
          <span className="mr-2">📋</span>
          <span className="font-medium text-sm">CSV</span>
        </button>
        
        <button className="flex items-center justify-center px-4 py-3 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors">
          <span className="mr-2">📱</span>
          <span className="font-medium text-sm">Enviar por Email</span>
        </button>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Programar Reportes</label>
        <div className="flex">
          <select className="w-full px-3 py-2 border border-gray-300 rounded-l-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="diario">Diario</option>
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 text-sm font-medium">
            Programar
          </button>
        </div>
      </div>
    </Card>
  );
};

// Componente principal del Sistema de Reportes de Báscula
const ReportesBascula = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Esta semana');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Reportes de Báscula</h2>
          <p className="text-sm text-gray-500 mt-1">Análisis de datos de pesaje y métricas de rendimiento</p>
        </div>
        <div className="mt-4 md:mt-0">
          <PeriodSelector selectedPeriod={selectedPeriod} onChange={setSelectedPeriod} />
        </div>
      </div>

      {/* Filtros de Reporte */}
      <section className="mb-6">
        <ReportFilters />
      </section>

      {/* Stats Section */}
      <section className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <StatCard 
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              positive={stat.positive}
            />
          ))}
        </div>
      </section>

      {/* Charts Section */}
      <section className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PesajesDiariosChart />
          <PesajesPorCategoriaChart />
        </div>
      </section>

      {/* Additional Charts */}
      <section className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DistribucionPorHoraChart />
          <DistribucionPorTipoChart />
        </div>
      </section>
      
      {/* Export Options */}
      <section className="mb-6">
        <ExportOptions />
      </section>
    </div>
  );
};

export default ReportesBascula;