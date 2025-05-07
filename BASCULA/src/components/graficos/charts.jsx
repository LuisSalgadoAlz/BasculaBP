import React, { useState } from "react";
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
} from "recharts";

const COLORS = {
  primary: "#3B82F6",
  secondary: "#10B981",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#6366F1",
  light: "#F9FAFB",
  dark: "#374151",
  muted: "#9CA3AF",
  background: "#F9FAFB",
  cardBackground: "#FFFFFF",
  border: "#E5E7EB",
  lightBorder: "#F3F4F6",
};

const PIE_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.danger,
  COLORS.warning,
  COLORS.info,
];


export const Card = ({ children }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="p-5">{children}</div>
  </div>
);

export const DistribucionPorTipoChart = ({data, title, subtitle}) => {
  const distribucionPorTipo = data.map((el)=>({
    tipo: Object.keys(el)[0], value: Object.values(el)[0]
  }))

  return(
    <Card>
      {console.log(data)}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
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
              label={({ name, percent }) => `${Object.keys(data[name])[0]} (${(percent * 100).toFixed(0)}%)`}
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
      <div className="mt-3 text-xs text-gray-500">Actualizado: {new Date().toLocaleString()}</div>
    </Card>
  )
};
  
