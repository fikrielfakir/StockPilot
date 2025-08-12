import { useState, useEffect } from "react";
import { WindowsCard, WindowsCardContent } from "@/components/WindowsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Database, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Zap,
  Server,
  Globe
} from "lucide-react";

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  activeUsers: number;
  dbConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  cacheHitRate: number;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastBackup: string;
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
  }>;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 0,
    throughput: 0,
    errorRate: 0,
    activeUsers: 0,
    dbConnections: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    cacheHitRate: 0
  });

  const [health, setHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: 0,
    lastBackup: '',
    alerts: []
  });

  const [realTimeData, setRealTimeData] = useState<number[]>([]);

  // Simulate real-time performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate realistic performance metrics
      const newMetrics: PerformanceMetrics = {
        responseTime: Math.random() * 500 + 50, // 50-550ms
        throughput: Math.random() * 100 + 50, // 50-150 req/sec
        errorRate: Math.random() * 5, // 0-5%
        activeUsers: Math.floor(Math.random() * 50 + 10), // 10-60 users
        dbConnections: Math.floor(Math.random() * 20 + 5), // 5-25 connections
        memoryUsage: Math.random() * 30 + 40, // 40-70%
        cpuUsage: Math.random() * 40 + 20, // 20-60%
        cacheHitRate: Math.random() * 20 + 75 // 75-95%
      };

      setMetrics(newMetrics);

      // Update real-time chart data
      setRealTimeData(prev => {
        const newData = [...prev, newMetrics.responseTime];
        return newData.slice(-20); // Keep last 20 data points
      });

      // Update system health
      const status = newMetrics.errorRate > 3 ? 'critical' : 
                   newMetrics.responseTime > 400 ? 'warning' : 'healthy';
      
      setHealth(prev => ({
        ...prev,
        status,
        uptime: prev.uptime + 5,
        lastBackup: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        alerts: generateAlerts(newMetrics)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const generateAlerts = (metrics: PerformanceMetrics) => {
    const alerts = [];
    
    if (metrics.responseTime > 400) {
      alerts.push({
        type: 'warning' as const,
        message: 'Temps de réponse élevé détecté',
        timestamp: new Date().toISOString()
      });
    }
    
    if (metrics.errorRate > 3) {
      alerts.push({
        type: 'error' as const,
        message: 'Taux d\'erreur élevé',
        timestamp: new Date().toISOString()
      });
    }
    
    if (metrics.memoryUsage > 80) {
      alerts.push({
        type: 'warning' as const,
        message: 'Utilisation mémoire élevée',
        timestamp: new Date().toISOString()
      });
    }

    return alerts.slice(0, 5);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'critical': return AlertCircle;
      default: return Activity;
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const StatusIcon = getStatusIcon(health.status);

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <WindowsCard>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${getStatusColor(health.status)}`}>
                <StatusIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">État du Système</h3>
                <p className="text-sm text-gray-600">Surveillance en temps réel</p>
              </div>
            </div>
            <Badge className={getStatusColor(health.status)}>
              {health.status === 'healthy' ? 'Optimal' : 
               health.status === 'warning' ? 'Attention' : 'Critique'}
            </Badge>
          </div>
        </div>
        <WindowsCardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatUptime(health.uptime)}</div>
              <div className="text-xs text-gray-600">Temps de fonctionnement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.activeUsers}</div>
              <div className="text-xs text-gray-600">Utilisateurs actifs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.responseTime.toFixed(0)}ms</div>
              <div className="text-xs text-gray-600">Temps de réponse moyen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.errorRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-600">Taux d'erreur</div>
            </div>
          </div>
        </WindowsCardContent>
      </WindowsCard>

      {/* Performance Metrics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Response Time Chart */}
            <WindowsCard>
              <div className="p-6 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Temps de Réponse
                </h4>
              </div>
              <WindowsCardContent className="p-6">
                <div className="h-32 bg-gray-50 rounded-sm mb-4 flex items-end justify-around p-2">
                  {realTimeData.map((value, index) => (
                    <div
                      key={index}
                      className="bg-blue-500 w-2 rounded-t-sm"
                      style={{ height: `${Math.max(4, (value / 600) * 100)}%` }}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{metrics.responseTime.toFixed(0)}ms</div>
                  <div className="text-sm text-gray-600">Temps moyen actuel</div>
                </div>
              </WindowsCardContent>
            </WindowsCard>

            {/* Throughput */}
            <WindowsCard>
              <div className="p-6 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Débit
                </h4>
              </div>
              <WindowsCardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Requêtes/seconde</span>
                      <span>{metrics.throughput.toFixed(1)}</span>
                    </div>
                    <Progress value={metrics.throughput} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taux de cache</span>
                      <span>{metrics.cacheHitRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.cacheHitRate} className="h-2" />
                  </div>
                </div>
              </WindowsCardContent>
            </WindowsCard>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* CPU Usage */}
            <WindowsCard>
              <div className="p-6 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                  Processeur
                </h4>
              </div>
              <WindowsCardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{metrics.cpuUsage.toFixed(1)}%</div>
                  <Progress value={metrics.cpuUsage} className="h-3 mb-2" />
                  <div className="text-sm text-gray-600">Utilisation CPU</div>
                </div>
              </WindowsCardContent>
            </WindowsCard>

            {/* Memory Usage */}
            <WindowsCard>
              <div className="p-6 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Server className="w-5 h-5 mr-2 text-purple-600" />
                  Mémoire
                </h4>
              </div>
              <WindowsCardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{metrics.memoryUsage.toFixed(1)}%</div>
                  <Progress value={metrics.memoryUsage} className="h-3 mb-2" />
                  <div className="text-sm text-gray-600">RAM utilisée</div>
                </div>
              </WindowsCardContent>
            </WindowsCard>

            {/* Database Connections */}
            <WindowsCard>
              <div className="p-6 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-blue-600" />
                  Base de Données
                </h4>
              </div>
              <WindowsCardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{metrics.dbConnections}</div>
                  <div className="text-sm text-gray-600 mb-2">Connexions actives</div>
                  <div className="text-xs text-green-600">Pool: 25 max</div>
                </div>
              </WindowsCardContent>
            </WindowsCard>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <WindowsCard>
            <div className="p-6 border-b border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900">Alertes Système</h4>
            </div>
            <WindowsCardContent className="p-0">
              {health.alerts.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {health.alerts.map((alert, index) => (
                    <div key={index} className="p-6 flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${
                        alert.type === 'error' ? 'bg-red-100' : 
                        alert.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        <AlertCircle className={`w-4 h-4 ${
                          alert.type === 'error' ? 'text-red-600' : 
                          alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>
                        {alert.type === 'error' ? 'Erreur' : 
                         alert.type === 'warning' ? 'Attention' : 'Info'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Aucune alerte</h4>
                  <p className="text-gray-600">Système fonctionnel, aucun problème détecté</p>
                </div>
              )}
            </WindowsCardContent>
          </WindowsCard>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <WindowsCard>
        <div className="p-6 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900">Actions Rapides</h4>
        </div>
        <WindowsCardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Restart Services
            </Button>
            <Button variant="outline" size="sm">
              <Database className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
            <Button variant="outline" size="sm">
              <Globe className="w-4 h-4 mr-2" />
              Health Check
            </Button>
            <Button variant="outline" size="sm">
              <Server className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </WindowsCardContent>
      </WindowsCard>
    </div>
  );
}