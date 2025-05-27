import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  ScatterChart, 
  Scatter, 
  ResponsiveContainer 
} from 'recharts';

const ChartRenderer = ({ chartData }) => {
  if (!chartData || !chartData.data) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-sm">No chart data available</p>
      </div>
    );
  }

  const { chart_type, data } = chartData;

  // Clean, minimal chart styling
  const chartTheme = {
    textColor: '#374151', // gray-700
    gridColor: '#f3f4f6', // gray-100
    tooltipBg: '#ffffff',
    tooltipBorder: '#e5e7eb', // gray-200
    tooltipShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  // Professional grayscale color palette
  const colors = [
    '#000000', // Black
    '#374151', // Gray-700
    '#6b7280', // Gray-500
    '#9ca3af', // Gray-400
    '#d1d5db', // Gray-300
    '#111827', // Gray-900
    '#1f2937', // Gray-800
    '#4b5563'  // Gray-600
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-3"
          style={{ boxShadow: chartTheme.tooltipShadow }}
        >
          <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-700">
              <span 
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              ></span>
              {entry.name}: <span className="font-medium">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderBarChart = () => {
    const chartData = data.labels?.map((label, index) => ({
      name: label,
      value: data.values[index]
    })) || [];

    return (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: chartTheme.textColor, fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis 
            tick={{ fill: chartTheme.textColor, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            fill={colors[0]} 
            radius={[4, 4, 0, 0]}
            name={data.y_label || 'Value'}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = () => {
    const chartData = data.labels?.map((label, index) => ({
      name: label,
      value: data.values[index]
    })) || [];

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
      if (percent < 0.05) return null; // Hide labels for slices < 5%
      
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text 
          x={x} 
          y={y} 
          fill="white" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={12}
          fontWeight="600"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    return (
      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 max-w-md">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm text-gray-700 truncate max-w-24">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLineChart = () => {
    const chartData = data.labels?.map((label, index) => ({
      name: label,
      value: data.values[index]
    })) || [];

    return (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: chartTheme.textColor, fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis 
            tick={{ fill: chartTheme.textColor, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={colors[0]} 
            strokeWidth={3} 
            dot={{ fill: colors[0], strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, stroke: colors[0], strokeWidth: 2 }}
            name={data.y_label || 'Value'}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderScatterChart = () => {
    const chartData = data.x_values?.map((x, index) => ({
      x: x,
      y: data.y_values[index]
    })) || [];

    return (
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
          <XAxis 
            dataKey="x" 
            tick={{ fill: chartTheme.textColor, fontSize: 12 }}
            name={data.x_label || 'X Axis'}
            label={{ 
              value: data.x_label || 'X Axis', 
              position: 'insideBottom', 
              offset: -10, 
              style: { textAnchor: 'middle', fill: chartTheme.textColor }
            }}
          />
          <YAxis 
            dataKey="y" 
            tick={{ fill: chartTheme.textColor, fontSize: 12 }}
            name={data.y_label || 'Y Axis'}
            label={{ 
              value: data.y_label || 'Y Axis', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: chartTheme.textColor }
            }}
          />
          <Tooltip 
            content={<CustomTooltip />}
            formatter={(value, name) => [value, name === 'y' ? data.y_label || 'Y' : data.x_label || 'X']}
          />
          <Scatter 
            dataKey="y" 
            fill={colors[0]}
            stroke={colors[0]}
            strokeWidth={1}
          />
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  const renderChart = () => {
    switch (chart_type?.toLowerCase()) {
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'line':
        return renderLineChart();
      case 'scatter':
        return renderScatterChart();
      default:
        return renderBarChart(); // Default to bar chart
    }
  };

  return (
    <div className="w-full">
      {/* Chart Title */}
      {chartData.title && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-1">{chartData.title}</h4>
          {chartData.description && (
            <p className="text-sm text-gray-600">{chartData.description}</p>
          )}
        </div>
      )}
      
      {/* Chart Container */}
      <div className="bg-white border border-gray-100 rounded-lg p-4">
        {renderChart()}
      </div>
      
      {/* Chart Info */}
      <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
        <span>Chart Type: {chart_type?.toUpperCase()}</span>
        <span>
          {data.labels ? `${data.labels.length} data points` : 'Interactive chart'}
        </span>
      </div>
    </div>
  );
};

export default ChartRenderer;