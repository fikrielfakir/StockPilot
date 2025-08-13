import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from "recharts";

interface SimpleChartProps {
  data: any[];
  type: 'line' | 'bar' | 'prediction';
  xAxisKey: string;
  yAxisKey: string;
}

// Chart colors matching the design
const CHART_COLORS = {
  blue: '#4F8EF7',
  green: '#10B981', 
  yellow: '#FFA500',
  red: '#EF4444'
};

export default function SimpleChart({ data, type, xAxisKey, yAxisKey }: SimpleChartProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(1);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium text-gray-900">
                {formatValue(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const commonProps = {
    data: data,
    margin: { top: 20, right: 30, left: 20, bottom: 20 }
  };

  switch (type) {
    case 'line':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart {...commonProps}>
            <CartesianGrid 
              strokeDasharray="none" 
              stroke="#f3f4f6" 
              strokeWidth={1}
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="transparent"
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="transparent"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey={yAxisKey} 
              stroke={CHART_COLORS.blue} 
              strokeWidth={3}
              dot={{ r: 4, fill: CHART_COLORS.blue, strokeWidth: 2, stroke: 'white' }}
              activeDot={{ 
                r: 6, 
                stroke: CHART_COLORS.blue, 
                strokeWidth: 3,
                fill: 'white'
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      );

    case 'prediction':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart {...commonProps}>
            <CartesianGrid 
              strokeDasharray="none" 
              stroke="#f3f4f6" 
              strokeWidth={1}
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="transparent"
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="transparent"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey={yAxisKey} 
              stroke={CHART_COLORS.green} 
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: CHART_COLORS.green, strokeWidth: 2, stroke: 'white' }}
              activeDot={{ 
                r: 6, 
                stroke: CHART_COLORS.green, 
                strokeWidth: 3,
                fill: 'white'
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      );

    default: // bar
      const barColors = [CHART_COLORS.yellow, CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.red];
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart {...commonProps}>
            <CartesianGrid 
              strokeDasharray="none" 
              stroke="#f3f4f6" 
              strokeWidth={1}
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="transparent"
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="transparent"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={yAxisKey} 
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={barColors[index % barColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
  }
}