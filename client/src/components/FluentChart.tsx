import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from "recharts";
import { motion } from "framer-motion";
import { WindowsCard, WindowsCardContent } from "@/components/WindowsCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, BarChart3, Activity, Download } from "lucide-react";

interface ChartData {
  [key: string]: any;
}

interface FluentChartProps {
  data: ChartData[];
  title: string;
  description?: string;
  type: 'line' | 'bar' | 'prediction';
  xAxisKey: string;
  yAxisKey: string;
  colors?: string[];
  showAnalytics?: boolean;
  onExport?: (format: 'png' | 'csv' | 'pdf') => void;
}

// Windows 11 Fluent Design color palette
const FLUENT_COLORS = {
  blue: '#0078d4',
  green: '#107c10', 
  yellow: '#ffb900',
  red: '#d13438',
  purple: '#881798',
  teal: '#00b7c3',
  orange: '#ff8c00',
  pink: '#e3008c'
};

const CHART_COLORS = [
  FLUENT_COLORS.blue,
  FLUENT_COLORS.green,
  FLUENT_COLORS.yellow,
  FLUENT_COLORS.red,
  FLUENT_COLORS.purple,
  FLUENT_COLORS.teal,
  FLUENT_COLORS.orange,
  FLUENT_COLORS.pink
];

export default function FluentChart({
  data,
  title,
  description,
  type,
  xAxisKey,
  yAxisKey,
  colors = CHART_COLORS,
  showAnalytics = true,
  onExport
}: FluentChartProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Analytics calculations
  const analytics = useMemo(() => {
    if (!data || data.length === 0) return null;

    const values = data.map(item => Number(item[yAxisKey]) || 0);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // Trend calculation
    const trend = values.length >= 2 ? 
      (values[values.length - 1] - values[0]) / values.length : 0;

    return {
      total,
      average,
      max,
      min,
      trend,
      count: data.length
    };
  }, [data, yAxisKey]);

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  // Custom Fluent Design Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-xl p-4 shadow-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            fontFamily: 'Segoe UI Variable, Segoe UI, system-ui, sans-serif'
          }}
        >
          <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-lg font-medium text-gray-900">
                {formatValue(entry.value)}
              </span>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  // Custom Dot Component with glow effect
  const CustomDot = ({ cx, cy, fill }: any) => (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={fill}
        stroke="white"
        strokeWidth={2}
        style={{
          filter: isHovered ? `drop-shadow(0 0 8px ${fill}66)` : 'none',
          transition: 'filter 0.2s ease'
        }}
      />
    </g>
  );

  const renderChart = () => {
    const commonProps = {
      data: data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors[0]} stopOpacity={0.3} />
                <stop offset="100%" stopColor={colors[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="none" 
              stroke="rgba(0, 0, 0, 0.05)" 
              strokeWidth={1}
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12, fontFamily: 'Segoe UI Variable', fill: '#605e5c' }}
              stroke="transparent"
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fontFamily: 'Segoe UI Variable', fill: '#605e5c' }}
              stroke="transparent"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey={yAxisKey} 
              stroke={colors[0]} 
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ 
                r: 6, 
                stroke: colors[0], 
                strokeWidth: 3,
                fill: 'white',
                style: { filter: `drop-shadow(0 0 12px ${colors[0]}66)` }
              }}
              style={{
                filter: `drop-shadow(0 2px 4px ${colors[0]}33)`
              }}
            />
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </LineChart>
        );

      case 'prediction':
        return (
          <LineChart {...commonProps}>
            <defs>
              <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={FLUENT_COLORS.purple} stopOpacity={0.3} />
                <stop offset="100%" stopColor={FLUENT_COLORS.purple} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="none" 
              stroke="rgba(0, 0, 0, 0.05)" 
              strokeWidth={1}
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12, fontFamily: 'Segoe UI Variable', fill: '#605e5c' }}
              stroke="transparent"
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fontFamily: 'Segoe UI Variable', fill: '#605e5c' }}
              stroke="transparent"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey={yAxisKey} 
              stroke={FLUENT_COLORS.purple} 
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={<CustomDot />}
              activeDot={{ 
                r: 6, 
                stroke: FLUENT_COLORS.purple, 
                strokeWidth: 3,
                fill: 'white',
                style: { filter: `drop-shadow(0 0 12px ${FLUENT_COLORS.purple}66)` }
              }}
              style={{
                filter: `drop-shadow(0 2px 4px ${FLUENT_COLORS.purple}33)`
              }}
            />
          </LineChart>
        );

      default: // bar
        return (
          <BarChart {...commonProps}>
            <defs>
              {colors.map((color, index) => (
                <linearGradient key={index} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={1} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid 
              strokeDasharray="none" 
              stroke="rgba(0, 0, 0, 0.05)" 
              strokeWidth={1}
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12, fontFamily: 'Segoe UI Variable', fill: '#605e5c' }}
              stroke="transparent"
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fontFamily: 'Segoe UI Variable', fill: '#605e5c' }}
              stroke="transparent"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={yAxisKey} 
              radius={[8, 8, 0, 0]}
              style={{
                filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))'
              }}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#barGradient${index % colors.length})`}
                />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative rounded-xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }}
      >
        {/* Mica effect overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%)',
          }}
        />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="p-6 border-b border-gray-100/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Segoe UI Variable' }}>
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Segoe UI Variable' }}>
                    {description}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {onExport && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExport('png')}
                    className="flex items-center space-x-1 bg-white/50 backdrop-blur-sm border-gray-200/50 hover:bg-white/70"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Analytics Summary */}
            {showAnalytics && analytics && (
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Segoe UI Variable' }}>
                    {formatValue(analytics.total)}
                  </div>
                  <div className="text-xs text-gray-600" style={{ fontFamily: 'Segoe UI Variable' }}>Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Segoe UI Variable' }}>
                    {formatValue(analytics.average)}
                  </div>
                  <div className="text-xs text-gray-600" style={{ fontFamily: 'Segoe UI Variable' }}>Moyenne</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Segoe UI Variable' }}>
                    {formatValue(analytics.max)}
                  </div>
                  <div className="text-xs text-gray-600" style={{ fontFamily: 'Segoe UI Variable' }}>Maximum</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600" style={{ fontFamily: 'Segoe UI Variable' }}>
                    {formatValue(analytics.min)}
                  </div>
                  <div className="text-xs text-gray-600" style={{ fontFamily: 'Segoe UI Variable' }}>Minimum</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    {analytics.trend > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-2xl font-bold ${analytics.trend > 0 ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: 'Segoe UI Variable' }}>
                      {analytics.trend > 0 ? '+' : ''}{analytics.trend.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600" style={{ fontFamily: 'Segoe UI Variable' }}>Tendance</div>
                </div>
              </motion.div>
            )}

            {/* Chart */}
            <motion.div 
              className="h-80"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </motion.div>

            {/* Legend */}
            {type === 'bar' && data.length > 0 && (
              <motion.div 
                className="flex justify-center mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <div className="flex flex-wrap justify-center gap-4">
                  {data.map((entry, index) => (
                    <div 
                      key={index} 
                      className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-white/50 backdrop-blur-sm transition-all hover:bg-white/70"
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span 
                        className="text-sm text-gray-700" 
                        style={{ fontFamily: 'Segoe UI Variable' }}
                      >
                        {entry[xAxisKey]}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}