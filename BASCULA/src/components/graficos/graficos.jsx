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
  Area,
} from 'recharts';

// Datos mejorados con más detalles
const lineData = [
  { name: 'Ene', valor: 400, promedio: 350 },
  { name: 'Feb', valor: 300, promedio: 320 },
  { name: 'Mar', valor: 500, promedio: 380 },
  { name: 'Abr', valor: 200, promedio: 300 },
  { name: 'May', valor: 600, promedio: 400 },
  { name: 'Jun', valor: 450, promedio: 420 },
];

const barData = [
  { name: 'Producto A', ventas: 2400, objetivo: 2000 },
  { name: 'Producto B', ventas: 1398, objetivo: 1500 },
  { name: 'Producto C', ventas: 980, objetivo: 1200 },
  { name: 'Producto D', ventas: 3908, objetivo: 3500 },
  { name: 'Producto D', ventas: 3908, objetivo: 3500 },
  { name: 'Producto D', ventas: 3908, objetivo: 3500 },
  { name: 'Producto D', ventas: 3908, objetivo: 3500 },
  { name: 'Producto D', ventas: 3908, objetivo: 3500 },
  { name: 'Producto D', ventas: 3908, objetivo: 3500 },
  { name: 'Producto D', ventas: 3908, objetivo: 3500 },
  { name: 'Producto D', ventas: 3908, objetivo: 3500 },
];

const pieData = [
  { name: 'Chrome', value: 45 },
  { name: 'Safari', value: 25 },
  { name: 'Firefox', value: 15 },
  { name: 'Edge', value: 10 },
  { name: 'Otros', value: 5 },
];

// Nuevos datos para la sección de stats
const statsData = [
  { title: 'Ingresos Totales', value: '$24,567', change: '+12.5%', icon: '📈', positive: true },
  { title: 'Usuarios Activos', value: '1,234', change: '+8.7%', icon: '👥', positive: true },
  { title: 'Tasa de Conversión', value: '3.2%', change: '-0.5%', icon: '🔄', positive: false },
  { title: 'Tiempo de Sesión', value: '4m 32s', change: '+14.2%', icon: '⏱️', positive: true },
];

// Paleta de colores mejorada inspirada en el estilo de la imagen
const COLORS = {
  primary: '#3B82F6', // Azul más claro como en la imagen
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

// Componente Card minimalista como en la imagen
const Card = ({ children }) => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
    <div className="p-5">
      {children}
    </div>
  </div>
);

// Componente para las métricas de estadísticas más limpio
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
        <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
      </div>
    </div>
  </Card>
);

// Gráfico de línea simplificado como en la imagen
const SimpleLineChart = () => (
  <Card>
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Tendencia Mensual</h3>
      <p className="text-sm text-gray-500 mt-1">Análisis de los últimos 6 meses</p>
    </div>
    <div className="mt-4">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke={COLORS.lightBorder} vertical={false} />
          <XAxis 
            dataKey="name" 
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
            labelStyle={{ fontWeight: 'bold', color: COLORS.dark }}
          />
          <Area 
            type="monotone" 
            dataKey="valor" 
            stroke={COLORS.primary}
            strokeWidth={2}
            fill="url(#colorValor)"
            dot={{ strokeWidth: 2, r: 3, fill: 'white' }}
            activeDot={{ r: 5, stroke: COLORS.primary }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-3 text-xs text-gray-500">Actualizado: Hoy a las 14:30</div>
  </Card>
);

// Gráfico de barras simplificado como en la imagen
const SimpleBarChart = () => (
  <Card>
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Ventas por Producto</h3>
      <p className="text-sm text-gray-500 mt-1">Comparación de ventas vs objetivos</p>
    </div>
    <div className="mt-4">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={COLORS.lightBorder} vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: COLORS.muted, fontSize: 12 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: COLORS.muted, fontSize: 12 }} 
            width={40}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: COLORS.cardBackground, 
              borderColor: COLORS.border,
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
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
            name="Ventas" 
            dataKey="ventas" 
            fill={COLORS.primary} 
            radius={[2, 2, 0, 0]} 
            barSize={20}
          />
          <Bar 
            name="Objetivo"
            dataKey="objetivo" 
            fill="#E5E7EB" 
            radius={[2, 2, 0, 0]} 
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-3 text-xs text-gray-500">Actualizado: Hoy a las 14:30</div>
  </Card>
);

// Gráfico de pastel simplificado
const SimplePieChart = () => (
  <Card>
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Distribución de Navegadores</h3>
      <p className="text-sm text-gray-500 mt-1">Porcentaje de uso por plataforma</p>
    </div>
    <div className="mt-4">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {pieData.map((entry, index) => (
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
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-3 text-xs text-gray-500">Actualizado: Hoy a las 14:30</div>
  </Card>
);

// Selector de período simplificado
const PeriodSelector = ({ selectedPeriod, onChange }) => {
  const periods = ['Hoy', 'Esta semana', 'Este mes', 'Este trimestre', 'Este año'];
  
  return (
    <div className="flex">
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

// Componente de actualización simple
const UpdateInfo = ({ text }) => (
  <div className="flex items-center text-xs text-gray-500">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-3 w-3 mr-1" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
      />
    </svg>
    {text}
  </div>
);

// Componente para futuros desarrollos
const FutureUpdates = () => (
  <Card>
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Próximas Actualizaciones</h3>
      <p className="text-sm text-gray-500 mt-1">Mejoras programadas para el dashboard</p>
    </div>
    
    <div className="space-y-4 mt-4">
      <div className="flex items-start">
        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
        </div>
        <div className="ml-3">
          <h4 className="text-sm font-medium text-gray-900">Integración con CRM</h4>
          <p className="text-xs text-gray-500">Conecta con tu sistema CRM para análisis más profundos</p>
        </div>
      </div>
      <div className="flex items-start">
        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
        </div>
        <div className="ml-3">
          <h4 className="text-sm font-medium text-gray-900">Predicciones mediante IA</h4>
          <p className="text-xs text-gray-500">Modelo predictivo para tendencias de ventas futuras</p>
        </div>
      </div>
      <div className="flex items-start">
        <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
        </div>
        <div className="ml-3">
          <h4 className="text-sm font-medium text-gray-900">Exportación de informes</h4>
          <p className="text-xs text-gray-500">Genera reportes en PDF y Excel automáticamente</p>
        </div>
      </div>
    </div>
    
    <div className="mt-6">
      <button className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
        Solicitar una función
      </button>
    </div>
  </Card>
);


// Dashboard principal con estilos minimalistas
const Graficos = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Este mes');

  return (
    <div className="min-h-screen bg-gray-50">      
      {/* Main Content */}
      <div className="ml-2">
        {/* Content */}
        <main className="p-0">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Dashboard Analytics</h2>
              <p className="text-sm text-gray-500 mt-1">Monitoreo de métricas en tiempo real</p>
            </div>
            <PeriodSelector selectedPeriod={selectedPeriod} onChange={setSelectedPeriod} />
          </div>

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
              <SimpleLineChart />
              <SimpleBarChart />
            </div>
          </section>

          {/* Additional Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimplePieChart />
            <FutureUpdates />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Graficos;