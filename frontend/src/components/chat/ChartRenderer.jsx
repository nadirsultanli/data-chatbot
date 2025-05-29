import React, { useMemo } from 'react';
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

const ChartRenderer = React.memo(({ chartData, isDarkMode = false }) => {
  // Memoize theme calculation to prevent re-renders
  const chartTheme = useMemo(() => ({
    textColor: isDarkMode ? '#ffffff' : '#374151',
    gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f3f4f6',
    tooltipBg: isDarkMode ? 'rgba(26, 26, 26, 0.95)' : '#ffffff',
    tooltipBorder: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb',
    tooltipShadow: isDarkMode 
      ? '0 10px 30px rgba(0, 0, 0, 0.5)' 
      : '0 10px 30px rgba(0, 0, 0, 0.1)'
  }), [isDarkMode]);

  // Memoize color palette
  const colors = useMemo(() => isDarkMode ? [
    '#ffffff', '#e5e7eb', '#d1d5db', '#9ca3af', 
    '#6b7280', '#4b5563', '#374151', '#1f2937'
  ] : [
    '#000000', '#1f2937', '#374151', '#4b5563', 
    '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'
  ], [isDarkMode]);

  // Memoize styles
  const styles = useMemo(() => `
    .chart-container {
      width: 100%;
      transition: all 0.3s ease;
    }

    .chart-empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 320px;
      border-radius: 12px;
      border: 2px dashed ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
      background: ${isDarkMode 
        ? 'rgba(255, 255, 255, 0.02)' 
        : 'rgba(248, 250, 252, 0.5)'};
      transition: all 0.3s ease;
      width: 100%;
    }

    .chart-empty-state:hover {
      border-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'};
      background: ${isDarkMode 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(248, 250, 252, 0.8)'};
    }

    .empty-text {
      color: ${isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
      font-size: 14px;
      font-weight: 500;
    }

    .chart-header {
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid ${isDarkMode 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.08)'};
    }

    .chart-title {
      font-size: 18px;
      font-weight: 700;
      color: ${isDarkMode ? '#ffffff' : '#1f2937'};
      margin-bottom: 4px;
      letter-spacing: -0.5px;
    }

    .chart-description {
      font-size: 13px;
      color: ${isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
      line-height: 1.4;
    }

    .chart-wrapper {
      background: ${isDarkMode 
        ? 'rgba(255, 255, 255, 0.02)' 
        : 'rgba(248, 250, 252, 0.5)'};
      border: 1px solid ${isDarkMode 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'rgba(0, 0, 0, 0.05)'};
      border-radius: 16px;
      padding: 24px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      width: 100%;
    }

    .chart-wrapper:hover {
      background: ${isDarkMode 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(248, 250, 252, 0.8)'};
      border-color: ${isDarkMode 
        ? 'rgba(255, 255, 255, 0.15)' 
        : 'rgba(0, 0, 0, 0.1)'};
      transform: translateY(-1px);
    }

    .chart-footer {
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: ${isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .chart-type-badge {
      background: ${isDarkMode 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.05)'};
      border: 1px solid ${isDarkMode 
        ? 'rgba(255, 255, 255, 0.2)' 
        : 'rgba(0, 0, 0, 0.1)'};
      padding: 4px 8px;
      border-radius: 6px;
      backdrop-filter: blur(10px);
    }

    .data-points-info {
      opacity: 0.8;
    }

    .glass-tooltip {
      background: ${isDarkMode 
        ? 'linear-gradient(145deg, rgba(42, 42, 42, 0.95), rgba(26, 26, 26, 0.95))' 
        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))'};
      backdrop-filter: blur(20px);
      border: 1px solid ${isDarkMode 
        ? 'rgba(255, 255, 255, 0.2)' 
        : 'rgba(0, 0, 0, 0.1)'};
      border-radius: 12px;
      padding: 12px 16px;
      box-shadow: ${chartTheme.tooltipShadow};
      min-width: 120px;
    }

    .tooltip-label {
      font-size: 13px;
      font-weight: 600;
      color: ${isDarkMode ? '#ffffff' : '#1f2937'};
      margin-bottom: 8px;
      border-bottom: 1px solid ${isDarkMode 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.1)'};
      padding-bottom: 4px;
    }

    .tooltip-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: ${isDarkMode ? '#e5e7eb' : '#374151'};
      margin-bottom: 2px;
    }

    .tooltip-item:last-child {
      margin-bottom: 0;
    }

    .tooltip-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .tooltip-value {
      font-weight: 600;
      color: ${isDarkMode ? '#ffffff' : '#000000'};
    }

    .pie-chart-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }

    .pie-legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
      margin-top: 24px;
      max-width: 100%;
      width: 100%;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: ${isDarkMode 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.03)'};
      border: 1px solid ${isDarkMode 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.08)'};
      border-radius: 8px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      flex: 0 1 auto;
      min-width: 0;
    }

    .legend-item:hover {
      background: ${isDarkMode 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.06)'};
      transform: translateY(-1px);
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .legend-text {
      font-size: 12px;
      color: ${isDarkMode ? '#e5e7eb' : '#374151'};
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100px;
    }
  `, [isDarkMode, chartTheme.tooltipShadow]);

  // Memoized empty state
  const EmptyState = useMemo(() => (
    <div className="chart-empty-state">
      <p className="empty-text">No chart data available</p>
    </div>
  ), []);

  // Memoized Glass Tooltip component
  const GlassTooltip = useMemo(() => React.memo(({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-tooltip">
          <div className="tooltip-label">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} className="tooltip-item">
              <div 
                className="tooltip-dot"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}: </span>
              <span className="tooltip-value">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  }), []);

  // Memoized chart renderers
  const renderBarChart = useMemo(() => {
    if (!chartData?.data) return null;
    
    const chartDataForBar = chartData.data.labels?.map((label, index) => ({
      name: label,
      value: chartData.data.values[index]
    })) || [];

    return (
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={chartDataForBar} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={chartTheme.gridColor}
            strokeOpacity={0.6}
          />
          <XAxis 
            dataKey="name" 
            tick={{ 
              fill: chartTheme.textColor, 
              fontSize: 11,
              fontWeight: 500
            }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            axisLine={{ stroke: chartTheme.gridColor }}
            tickLine={{ stroke: chartTheme.gridColor }}
          />
          <YAxis 
            tick={{ 
              fill: chartTheme.textColor, 
              fontSize: 11,
              fontWeight: 500
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
              return value;
            }}
          />
          <Tooltip content={<GlassTooltip />} />
          <Bar 
            dataKey="value" 
            fill={colors[0]} 
            radius={[6, 6, 0, 0]}
            name={chartData.data.y_label || 'Value'}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }, [chartData, chartTheme, colors, GlassTooltip]);

  const renderPieChart = useMemo(() => {
    if (!chartData?.data) return null;
    
    const chartDataForPie = chartData.data.labels?.map((label, index) => ({
      name: label,
      value: chartData.data.values[index]
    })) || [];

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
      if (percent < 0.05) return null;
      
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text 
          x={x} 
          y={y} 
          fill={isDarkMode ? '#000000' : '#ffffff'} 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={11}
          fontWeight="700"
          textShadow={isDarkMode ? 'none' : '0 1px 2px rgba(0,0,0,0.5)'}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    return (
      <div className="pie-chart-container">
        <ResponsiveContainer width="100%" height={360}>
          <PieChart>
            <Pie
              data={chartDataForPie}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              stroke={isDarkMode ? '#1a1a1a' : '#ffffff'}
              strokeWidth={3}
            >
              {chartDataForPie.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<GlassTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="pie-legend">
          {chartDataForPie.map((item, index) => (
            <div key={index} className="legend-item">
              <div 
                className="legend-dot"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="legend-text" title={item.name}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }, [chartData, colors, isDarkMode, GlassTooltip]);

  const renderLineChart = useMemo(() => {
    if (!chartData?.data) return null;
    
    const chartDataForLine = chartData.data.labels?.map((label, index) => ({
      name: label,
      value: chartData.data.values[index]
    })) || [];

    return (
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={chartDataForLine} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={chartTheme.gridColor}
            strokeOpacity={0.6}
          />
          <XAxis 
            dataKey="name" 
            tick={{ 
              fill: chartTheme.textColor, 
              fontSize: 11,
              fontWeight: 500
            }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            axisLine={{ stroke: chartTheme.gridColor }}
            tickLine={{ stroke: chartTheme.gridColor }}
          />
          <YAxis 
            tick={{ 
              fill: chartTheme.textColor, 
              fontSize: 11,
              fontWeight: 500
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
              return value;
            }}
          />
          <Tooltip content={<GlassTooltip />} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={colors[0]} 
            strokeWidth={3} 
            dot={{ 
              fill: colors[0], 
              strokeWidth: 2, 
              r: 6,
              stroke: isDarkMode ? '#1a1a1a' : '#ffffff'
            }}
            activeDot={{ 
              r: 8, 
              stroke: colors[0], 
              strokeWidth: 3,
              fill: isDarkMode ? '#1a1a1a' : '#ffffff'
            }}
            name={chartData.data.y_label || 'Value'}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }, [chartData, chartTheme, colors, isDarkMode, GlassTooltip]);

  const renderScatterChart = useMemo(() => {
    if (!chartData?.data) return null;
    
    const chartDataForScatter = chartData.data.x_values?.map((x, index) => ({
      x: x,
      y: chartData.data.y_values[index]
    })) || [];

    return (
      <ResponsiveContainer width="100%" height={360}>
        <ScatterChart data={chartDataForScatter} margin={{ top: 20, right: 30, left: 40, bottom: 80 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={chartTheme.gridColor}
            strokeOpacity={0.6}
          />
          <XAxis 
            dataKey="x" 
            tick={{ 
              fill: chartTheme.textColor, 
              fontSize: 11,
              fontWeight: 500
            }}
            name={chartData.data.x_label || 'X Axis'}
            label={{ 
              value: chartData.data.x_label || 'X Axis', 
              position: 'insideBottom', 
              offset: -10, 
              style: { 
                textAnchor: 'middle', 
                fill: chartTheme.textColor,
                fontSize: '12px',
                fontWeight: '600'
              }
            }}
            axisLine={{ stroke: chartTheme.gridColor }}
            tickLine={{ stroke: chartTheme.gridColor }}
          />
          <YAxis 
            dataKey="y" 
            tick={{ 
              fill: chartTheme.textColor, 
              fontSize: 11,
              fontWeight: 500
            }}
            name={chartData.data.y_label || 'Y Axis'}
            label={{ 
              value: chartData.data.y_label || 'Y Axis', 
              angle: -90, 
              position: 'insideLeft',
              style: { 
                textAnchor: 'middle', 
                fill: chartTheme.textColor,
                fontSize: '12px',
                fontWeight: '600'
              }
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            content={<GlassTooltip />}
            formatter={(value, name) => [
              value, 
              name === 'y' ? chartData.data.y_label || 'Y' : chartData.data.x_label || 'X'
            ]}
          />
          <Scatter 
            dataKey="y" 
            fill={colors[0]}
            stroke={isDarkMode ? '#1a1a1a' : '#ffffff'}
            strokeWidth={2}
          />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }, [chartData, chartTheme, colors, isDarkMode, GlassTooltip]);

  const renderChart = useMemo(() => {
    if (!chartData?.data) return EmptyState;
    
    switch (chartData.chart_type?.toLowerCase()) {
      case 'bar':
        return renderBarChart;
      case 'pie':
        return renderPieChart;
      case 'line':
        return renderLineChart;
      case 'scatter':
        return renderScatterChart;
      default:
        return renderBarChart;
    }
  }, [chartData, renderBarChart, renderPieChart, renderLineChart, renderScatterChart, EmptyState]);

  if (!chartData || !chartData.data) {
    return EmptyState;
  }

  return (
    <div className="chart-container">
      <style>{styles}</style>

      {/* Chart Title */}
      {chartData.title && (
        <div className="chart-header">
          <h4 className="chart-title">{chartData.title}</h4>
          {chartData.description && (
            <p className="chart-description">{chartData.description}</p>
          )}
        </div>
      )}
      
      {/* Chart Container */}
      <div className="chart-wrapper">
        {renderChart}
      </div>
      
      {/* Chart Info */}
      <div className="chart-footer">
        <span className="chart-type-badge">
          {chartData.chart_type?.toUpperCase() || 'CHART'}
        </span>
        <span className="data-points-info">
          {chartData.data.labels ? `${chartData.data.labels.length} data points` : 'Interactive visualization'}
        </span>
      </div>
    </div>
  );
});

ChartRenderer.displayName = 'ChartRenderer';

export default ChartRenderer;