import React, { useState, useEffect } from 'react';
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
import { Settings, Eye, EyeOff, RotateCcw, Database, ArrowUp, ArrowDown, X, Trash2, Save } from 'lucide-react';


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
export const Card = ({ children }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="p-5">
      {children}
    </div>
  </div>
);

// Componente para mostrar estadísticas
export const StatCard = ({ title, value, change, icon, positive }) => (
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
export const PesajesDiariosChart = () => (
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
export const PesajesPorCategoriaChart = () => (
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
export const DistribucionPorHoraChart = () => (
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
export const DistribucionPorTipoChart = () => (
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
export const PeriodSelector = ({ selectedPeriod, onChange }) => {
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
export const ReportFilters = () => {
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
export const ExportOptions = () => {
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
export const ReportesBascula = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Esta semana');

  return (
    <div className="min-h-screen">
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


export const BaprosaSiloChart = ({ data, onSiloAction, isLoading }) => {
  const [selectedSilos, setSelectedSilos] = useState([]);
  const [showConfig, setShowConfig] = useState(false);
  const [showSiloManagement, setShowSiloManagement] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Clave para localStorage
  const STORAGE_KEY = 'baprosa_selected_silos';
  
  // Filtrar silos válidos
  const allSilos = data ? data.filter(item => item.peso_total >= 0) : [];

  // Componente Skeleton para el gráfico
  const ChartSkeleton = () => (
    <div className="h-[600px] p-4 relative">
      {/* Skeleton bars de fondo */}
      <div className="flex justify-between items-end h-full space-x-2 opacity-30">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex-1 flex flex-col justify-end space-y-2">
            <div 
              className="bg-gray-200 rounded-t animate-pulse"
              style={{ 
                height: `${Math.random() * 60 + 20}%`,
                animationDelay: `${i * 0.1}s`
              }}
            />
            <div className="bg-gray-200 h-8 rounded animate-pulse" />
          </div>
        ))}
      </div>
      
      {/* Spinner centrado */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
          <p className="text-sm text-gray-500 font-medium">Cargando datos...</p>
        </div>
      </div>
    </div>
  );

  // Componente Skeleton para la lista de silos
  const SiloListSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200 animate-pulse">
          <div className="flex-1 min-w-0">
            <div className="bg-gray-200 h-4 w-3/4 rounded mb-2" />
            <div className="bg-gray-200 h-3 w-1/2 rounded mb-1" />
            <div className="bg-gray-200 h-3 w-2/3 rounded" />
          </div>
          <div className="ml-4">
            <div className="bg-gray-200 h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );

  // Componente Spinner para acciones
  const Spinner = ({ size = 16 }) => (
    <div 
      className="animate-spin rounded-full border-2 border-current border-t-transparent"
      style={{ width: size, height: size }}
    />
  );

  // Cargar configuración desde localStorage o usar valores por defecto
  useEffect(() => {
    if (allSilos.length > 0 && !isLoading) {
      try {
        const savedSilos = localStorage.getItem(STORAGE_KEY);
        
        if (savedSilos) {
          const parsedSilos = JSON.parse(savedSilos);
          // Verificar que los silos guardados aún existen en los datos
          const validSavedSilos = parsedSilos.filter(siloName => 
            allSilos.some(silo => silo.silo_nombre === siloName)
          );
          
          if (validSavedSilos.length >= 3) {
            setSelectedSilos(validSavedSilos);
          } else {
            // Si no hay suficientes silos válidos guardados, usar por defecto
            const defaultSilos = allSilos.slice(0, 6).map(silo => silo.silo_nombre);
            setSelectedSilos(defaultSilos);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSilos));
          }
        } else {
          // Primera vez, usar configuración por defecto
          const defaultSilos = allSilos.slice(0, 6).map(silo => silo.silo_nombre);
          setSelectedSilos(defaultSilos);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSilos));
        }
      } catch (error) {
        console.error('Error al cargar configuración desde localStorage:', error);
        // En caso de error, usar configuración por defecto
        const defaultSilos = allSilos.slice(0, 6).map(silo => silo.silo_nombre);
        setSelectedSilos(defaultSilos);
      }
    }
  }, [allSilos.length, isLoading]);

  // Función para guardar en localStorage
  const saveToLocalStorage = (silos) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(silos));
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  };

  // Manejar selección/deselección de silos
  const toggleSilo = (siloName) => {
    let newSelection;
    if (selectedSilos.includes(siloName)) {
      if (selectedSilos.length > 3) {
        newSelection = selectedSilos.filter(name => name !== siloName);
      } else {
        return;
      }
    } else {
      newSelection = [...selectedSilos, siloName];
    }
    setSelectedSilos(newSelection);
    saveToLocalStorage(newSelection);
  };

  // Restablecer a los primeros 6 silos
  const resetToDefault = () => {
    const defaultSilos = allSilos.slice(0, 31).map(silo => silo.silo_nombre);
    setSelectedSilos(defaultSilos);
    saveToLocalStorage(defaultSilos);
  };

  const selectAllSilos = () => {
    const defaultSilos = allSilos.slice(0, allSilos.length).map(silo => silo.silo_nombre);
    setSelectedSilos(defaultSilos);
    saveToLocalStorage(defaultSilos);
  }

  // Función para limpiar configuración guardada
  const clearSavedConfig = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      const defaultSilos = allSilos.slice(0, 6).map(silo => silo.silo_nombre);
      setSelectedSilos(defaultSilos);
      saveToLocalStorage(defaultSilos);
    } catch (error) {
      console.error('Error al limpiar configuración:', error);
    }
  };

  // Manejar acción de vaciar silos
  const handleSiloAction = (siloName) => {
    setConfirmAction({ siloName, action: 'empty' });
  };

  const confirmSiloAction = () => {
    if (confirmAction && onSiloAction) {
      onSiloAction(confirmAction.siloName, confirmAction.action);
    }
    setConfirmAction(null);
    setShowSiloManagement(false);
    setShowConfig(false);
  };

  const cancelSiloAction = () => {
    setConfirmAction(null);
  };

  // Preparar datos para el gráfico
  const chartData = allSilos
    .filter(item => selectedSilos.includes(item.silo_nombre))
    .map(item => ({
      ...item,
      espacio_disponible: (item.capacidad - item.peso_total) >= 0 ? item.capacidad - item.peso_total : 0,
      pesoColor: item.porcentaje_ocupacion >= 90 ? '#dc2626' : '#059669',
      pesoColorEnd: item.porcentaje_ocupacion >= 90 ? '#b91c1c' : '#047857'
    }));

  // Loading state principal
  if (isLoading) {
    return (
      <div className="bg-white rounded-md p-4 mt-6 shadow-2xl border border-stone-200 overflow-hidden">
        <div className="px-4 py-4 border-b border-stone-200 flex justify-between max-sm:flex-col max-sm:justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-pulse bg-gray-200 h-6 w-48 rounded" />
            <Spinner size={20} />
          </div>
          
          <div className="flex gap-2 items-center">
            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded-md" />
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded-md" />
          </div>
        </div>

        <div className="p-0">
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  // Si no hay datos suficientes
  if (allSilos.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-stone-200 shadow-sm p-6">
        <div className="text-center text-stone-600">
          No hay datos de silos disponibles
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-md p-4 mt-6 shadow-2xl border border-stone-200 overflow-hidden">
        <div className="px-4 py-4 border-b border-stone-200 flex justify-between max-sm:flex-col max-sm:justify-center">
          <h3 className="text-xl font-bold text-gray-500 mb-2">
            Análisis por Silo ({selectedSilos.length} silos)
          </h3>
          
          {/* Botones de configuración */}
          <div className="flex gap-2 items-center">
            {/* Botón de gestión de silos */}
            <button
              onClick={() => {
                setShowSiloManagement(true);
                setShowConfig(false);
              }}
              disabled={isLoading}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-md transition-colors
                ${isLoading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-amber-100 hover:bg-amber-200'
                }
              `}
            >
              {isLoading ? <Spinner size={14} /> : <Database size={14} />}
              Gestionar
            </button>

            {/* Botón de configuración */}
            <button
              onClick={() => {
                setShowConfig(true);
                setShowSiloManagement(false);
              }}
              disabled={isLoading}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-md transition-colors
                ${isLoading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-stone-100 hover:bg-stone-200'
                }
              `}
            >
              {isLoading ? <Spinner size={14} /> : <Settings size={14} />}
              Configurar
            </button>
          </div>
        </div>

        <div className="p-0">
          {selectedSilos.length >= 3 ? (
            <div className="h-[600px] overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  barGap={8}
                >
                  <defs>
                    <linearGradient id="pesoGradNormal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                    <linearGradient id="pesoGradAlerta" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#dc2626" />
                      <stop offset="100%" stopColor="#b91c1c" />
                    </linearGradient>
                    <linearGradient id="disponibleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f5f5f4" />
                      <stop offset="100%" stopColor="#e7e5e4" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e7e5e4"
                    horizontal={true}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="silo_nombre"
                    tick={{
                      fontSize: 10,
                      fill: "#78716c",
                      fontWeight: "500",
                    }}
                    tickLine={{ stroke: "#d6d3d1", strokeWidth: 1 }}
                    axisLine={{ stroke: "#d6d3d1", strokeWidth: 1 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "#78716c",
                      fontWeight: "500",
                    }}
                    tickLine={{ stroke: "#d6d3d1", strokeWidth: 1 }}
                    axisLine={{ stroke: "#d6d3d1", strokeWidth: 1 }}
                    label={{ 
                      value: 'Quintales (qq)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: '12px', fill: '#78716c' }
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #d6d3d1",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      fontSize: "12px",
                      padding: "12px",
                    }}
                    labelStyle={{
                      color: "#44403c",
                      fontWeight: "600",
                      fontSize: "13px",
                      marginBottom: "6px",
                    }}
                    formatter={(value, name, props) => {
                      if (name === "Peso Actual") {
                        const ocupacion = props.payload.porcentaje_ocupacion;
                        return [
                          `${Number(value).toLocaleString()} qq (${ocupacion.toFixed(1)}%)`,
                          "Peso Actual",
                        ];
                      }
                      if (name === "Espacio Disponible")
                        return [
                          `${Number(value).toLocaleString()} qq`,
                          "Espacio Disponible",
                        ];
                      return [value, name];
                    }}
                    cursor={{ fill: "rgba(5, 150, 105, 0.05)" }}
                  />

                  {/* Renderizado personalizado para cada barra */}
                  <Bar dataKey="peso_total" stackId="silo" name="Peso Actual" radius={[0, 0, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-peso-${index}`} 
                        fill={entry.porcentaje_ocupacion >= 90 ? "url(#pesoGradAlerta)" : "url(#pesoGradNormal)"}
                        stroke={entry.porcentaje_ocupacion >= 90 ? "#b91c1c" : "#047857"}
                        strokeWidth={0.5}
                      />
                    ))}
                  </Bar>
                  
                  {/* Barra para espacio disponible */}
                  <Bar
                    dataKey="espacio_disponible"
                    stackId="silo"
                    fill="url(#disponibleGrad)"
                    name="Espacio Disponible"
                    stroke="#d6d3d1"
                    strokeWidth={0.5}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <>Cargando...</>
          )}
        </div>
      </div>

      {/* Modal de Gestión de Silos */}
      {showSiloManagement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Database size={20} className="text-amber-600" />
                <h4 className="text-lg font-medium text-stone-700">
                  Gestión de Silos
                </h4>
                {isLoading && <Spinner size={16} />}
              </div>
              <button
                onClick={() => setShowSiloManagement(false)}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-stone-500" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <SiloListSkeleton />
                ) : (
                  <div className="space-y-3">
                    {allSilos.map(silo => (
                      <div
                        key={silo.silo_nombre}
                        className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-stone-800 truncate">
                            {silo.silo_nombre}
                          </div>
                          <div className="text-xs text-stone-600 mt-1">
                            {Number(silo.peso_total).toLocaleString()} qq ({silo.porcentaje_ocupacion.toFixed(1)}% ocupado)
                          </div>
                          <div className="text-xs text-stone-500">
                            Capacidad: {Number(silo.capacidad).toLocaleString()} qq
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <button
                            onClick={() => handleSiloAction(silo.silo_nombre)}
                            disabled={isLoading}
                            className={`
                              flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg transition-colors font-medium
                              ${isLoading 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-red-100 hover:bg-red-200 text-red-800'
                              }
                            `}
                            title="Vaciar silo completamente"
                          >
                            {isLoading ? <Spinner size={14} /> : <ArrowDown size={14} />}
                            Vaciar Silo
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-3 border-t border-stone-200">
                <div className="text-xs text-stone-500 flex items-center gap-1">
                  <span>💡</span>
                  <span>Usa "Vaciar" para vaciar un silo por completo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Settings size={20} className="text-stone-600" />
                <h4 className="text-lg font-medium text-stone-700">
                  Configurar Silos
                </h4>
                {isLoading && <Spinner size={16} />}
              </div>
              <button
                onClick={() => setShowConfig(false)}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-stone-500" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-stone-600">
                  Seleccionar Silos (mín. 3)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={clearSavedConfig}
                    disabled={isLoading}
                    className={`
                      flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors
                      ${isLoading 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-red-100 hover:bg-red-200 text-red-600'
                      }
                    `}
                    title="Limpiar configuración guardada"
                  >
                    {isLoading ? <Spinner size={11} /> : <Trash2 size={11} />}
                    Limpiar
                  </button>
                  <button
                    onClick={selectAllSilos}
                    disabled={isLoading}
                    className={`
                      flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors
                      ${isLoading 
                        ? 'bg-green-100 text-green-400 cursor-not-allowed' 
                        : 'bg-green-100 hover:bg-green-200 text-stone-600'
                      }
                    `}
                  >
                    {isLoading ? <Spinner size={11} /> : <RotateCcw size={11} />}
                    Todos
                  </button>
                </div>
              </div>
              
              {/* Grid de silos */}
              <div className="max-h-64 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {allSilos.map(silo => {
                    const isSelected = selectedSilos.includes(silo.silo_nombre);
                    const canDeselect = selectedSilos.length > 3;
                    
                    return (
                      <button
                        key={silo.silo_nombre}
                        onClick={() => toggleSilo(silo.silo_nombre)}
                        disabled={(isSelected && !canDeselect) || isLoading}
                        className={`
                          flex items-center gap-2 p-3 text-sm rounded border transition-colors text-left w-full
                          ${isSelected 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                          }
                          ${(isSelected && !canDeselect) || isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        title={`${silo.silo_nombre} - ${silo.porcentaje_ocupacion.toFixed(1)}%`}
                      >
                        <div className="flex-shrink-0">
                          {isLoading ? (
                            <Spinner size={16} />
                          ) : isSelected ? (
                            <Eye size={16} className="text-emerald-600" />
                          ) : (
                            <EyeOff size={16} className="text-stone-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {silo.silo_nombre}
                          </div>
                          <div className="text-xs opacity-70 mt-1">
                            {silo.porcentaje_ocupacion.toFixed(1)}% ocupado • {Number(silo.capacidad).toLocaleString()} qq
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {selectedSilos.length < 3 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                  <div className="flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Selecciona al menos 3 silos</span>
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-3 border-t border-stone-200">
                <div className="text-sm text-stone-600 flex items-center justify-between">
                  <span>{selectedSilos.length} de {allSilos.length} silos seleccionados</span>
                  <div className="flex items-center gap-1 text-xs text-stone-500">
                    {isLoading ? <Spinner size={12} /> : <Save size={12} />}
                    <span>Auto-guardado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-stone-200 shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${
                confirmAction.action === 'fill' 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {confirmAction.action === 'fill' ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
              </div>
              <div>
                <h3 className="text-lg font-medium text-stone-800">
                  Confirmar Acción
                </h3>
                <p className="text-sm text-stone-600">
                  {confirmAction.action === 'fill' 
                    ? 'Llenar silo al 100% de capacidad'
                    : 'Vaciar silo completamente'
                  }
                </p>
              </div>
            </div>
            
            <div className="bg-stone-50 rounded-lg p-3 mb-4">
              <div className="text-sm font-medium text-stone-800">
                {confirmAction.siloName}
              </div>
              <div className="text-xs text-stone-600 mt-1">
                {confirmAction.action === 'fill' 
                  ? 'El silo se llenará completamente'
                  : 'El silo se vaciará por completo'
                }
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelSiloAction}
                disabled={isLoading}
                className={`
                  px-4 py-2 text-sm rounded-lg transition-colors
                  ${isLoading 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }
                `}
              >
                Cancelar
              </button>
              <button
                onClick={confirmSiloAction}
                disabled={isLoading}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg transition-colors
                  ${isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : confirmAction.action === 'fill'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }
                `}
              >
                {isLoading && <Spinner size={16} />}
                {confirmAction.action === 'fill' ? 'Llenar Silo' : 'Vaciar Silo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};