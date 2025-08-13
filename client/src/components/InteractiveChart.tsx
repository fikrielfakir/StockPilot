import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import { WindowsCard, WindowsCardContent } from "@/components/WindowsCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Activity, Download } from "lucide-react";

interface ChartData {
  [key: string]: any;
}

interface InteractiveChartProps {
  data?: ChartData[];
  title?: string;
  description?: string;
  defaultType?: 'bar' | 'line' | 'area' | 'pie';
  xAxisKey?: string;
  yAxisKey?: string;
  categoryKey?: string;
  colors?: string[];
  enableDrillDown?: boolean;
  showAnalytics?: boolean;
  onDrillDown?: (dataPoint: ChartData) => void;
  onExport?: (format: 'png' | 'csv' | 'pdf') => void;
}

const CHART_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red  
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
];

export default function InteractiveChart({
  data = [],
  title = "Chart",
  description,
  defaultType = 'bar',
  xAxisKey = 'name',
  yAxisKey = 'value',
  categoryKey,
  colors = CHART_COLORS,
  enableDrillDown = false,
  showAnalytics = true,
  onDrillDown,
  onExport
}: InteractiveChartProps = {}) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie'>(defaultType);
  const [timeRange, setTimeRange] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Analytics calculations
  const analytics = useMemo(() => {
    if (!data || data.length === 0) return null;

    const values = data.map(item => Number(item[yAxisKey]) || 0);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // Trend calculation (simple linear regression)
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

  // Filter data based on selections
  const filteredData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return [
        { name: 'Jan', value: 10 },
        { name: 'Fév', value: 20 },
        { name: 'Mar', value: 15 },
        { name: 'Avr', value: 25 }
      ];
    }

    let filtered = [...data];

    if (selectedCategory !== 'all' && categoryKey) {
      filtered = filtered.filter(item => item[categoryKey] === selectedCategory);
    }

    if (timeRange !== 'all') {
      // Implement time range filtering if data has date fields
      // This would depend on your data structure
    }

    return filtered;
  }, [data, selectedCategory, categoryKey, timeRange]);

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const handleDataPointClick = (dataPoint: any) => {
    if (enableDrillDown && onDrillDown) {
      onDrillDown(dataPoint);
    }
  };

  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
              tickFormatter={formatValue}
            />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), title]}
              labelStyle={{ color: '#333' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey={yAxisKey} 
              stroke={colors[0]} 
              strokeWidth={2}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
              onClick={handleDataPointClick}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
              tickFormatter={formatValue}
            />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), title]}
              labelStyle={{ color: '#333' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={yAxisKey} 
              stroke={colors[0]} 
              fill={colors[0]}
              fillOpacity={0.3}
              onClick={handleDataPointClick}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart width={400} height={300}>
            <Pie
              data={filteredData}
              cx={200}
              cy={150}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={yAxisKey}
              onClick={handleDataPointClick}
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [formatValue(value), title]}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </PieChart>
        );

      default: // bar
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
              tickFormatter={formatValue}
            />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), title]}
              labelStyle={{ color: '#333' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <Bar 
              dataKey={yAxisKey} 
              fill={colors[0]}
              onClick={handleDataPointClick}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        );
    }
  };

  const categories = categoryKey ? Array.from(new Set(data.map(item => item[categoryKey]))) : [];

  return (
    <WindowsCard>
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Chart Type Selector */}
            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Barres</span>
                  </div>
                </SelectItem>
                <SelectItem value="line">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Ligne</span>
                  </div>
                </SelectItem>
                <SelectItem value="area">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Zone</span>
                  </div>
                </SelectItem>
                <SelectItem value="pie">
                  <div className="flex items-center space-x-2">
                    <PieChartIcon className="w-4 h-4" />
                    <span>Secteur</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            {categories.length > 0 && (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Export Button */}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('png')}
                className="flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <WindowsCardContent className="p-6">
        {/* Analytics Summary */}
        {showAnalytics && analytics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatValue(analytics.total)}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatValue(analytics.average)}</div>
              <div className="text-xs text-gray-600">Moyenne</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatValue(analytics.max)}</div>
              <div className="text-xs text-gray-600">Maximum</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{formatValue(analytics.min)}</div>
              <div className="text-xs text-gray-600">Minimum</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                {analytics.trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-2xl font-bold ${analytics.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.trend > 0 ? '+' : ''}{analytics.trend.toFixed(1)}
                </span>
              </div>
              <div className="text-xs text-gray-600">Tendance</div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Drill Down Hint */}
        {enableDrillDown && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              💡 Cliquez sur un élément du graphique pour explorer en détail
            </p>
          </div>
        )}
      </WindowsCardContent>
    </WindowsCard>
  );
}