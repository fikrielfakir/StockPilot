import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Brain,
  Zap,
  DollarSign,
  Package,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  Activity
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, ComposedChart, Area, AreaChart } from "recharts";

interface AnalyticsData {
  demandForecasting: Array<{
    article: string;
    currentStock: number;
    predictedDemand: number;
    recommendedOrder: number;
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  
  supplierPerformance: Array<{
    supplier: string;
    deliveryTime: number;
    reliability: number;
    costEfficiency: number;
    riskScore: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  
  stockOptimization: Array<{
    category: string;
    currentValue: number;
    optimizedValue: number;
    potentialSavings: number;
    actionRequired: boolean;
  }>;

  priceAnalysis: Array<{
    article: string;
    currentPrice: number;
    predictedPrice: number;
    priceChange: number;
    priceVolatility: number;
    buySignal: boolean;
  }>;

  anomalyDetection: Array<{
    type: 'consumption' | 'pricing' | 'delivery' | 'waste';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    detected: Date;
    affectedItems: string[];
    recommendation: string;
  }>;
}

interface AdvancedAnalyticsProps {
  data?: AnalyticsData;
  onRefresh?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function AdvancedAnalytics({ 
  data, 
  onRefresh, 
  autoRefresh = false, 
  refreshInterval = 300000 
}: AdvancedAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Auto-refresh mechanism
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
      setLastUpdate(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh, refreshInterval]);

  // Mock data generator (replace with real API calls)
  const mockData: AnalyticsData = useMemo(() => ({
    demandForecasting: [
      {
        article: 'JOINT-ETANCH-001',
        currentStock: 45,
        predictedDemand: 120,
        recommendedOrder: 75,
        confidence: 0.87,
        riskLevel: 'high'
      },
      {
        article: 'ROULEMENT-BR-205',
        currentStock: 23,
        predictedDemand: 40,
        recommendedOrder: 20,
        confidence: 0.92,
        riskLevel: 'medium'
      },
      {
        article: 'COURROIE-TR-150',
        currentStock: 67,
        predictedDemand: 30,
        recommendedOrder: 0,
        confidence: 0.95,
        riskLevel: 'low'
      }
    ],
    
    supplierPerformance: [
      {
        supplier: 'TechCeramics Pro',
        deliveryTime: 5.2,
        reliability: 0.94,
        costEfficiency: 0.87,
        riskScore: 0.15,
        trend: 'up'
      },
      {
        supplier: 'Industrial Supply Co',
        deliveryTime: 8.1,
        reliability: 0.89,
        costEfficiency: 0.92,
        riskScore: 0.23,
        trend: 'stable'
      },
      {
        supplier: 'FastParts Ltd',
        deliveryTime: 12.3,
        reliability: 0.76,
        costEfficiency: 0.78,
        riskScore: 0.45,
        trend: 'down'
      }
    ],

    stockOptimization: [
      {
        category: 'Joints et étanchéité',
        currentValue: 45000,
        optimizedValue: 38000,
        potentialSavings: 7000,
        actionRequired: true
      },
      {
        category: 'Roulements',
        currentValue: 23000,
        optimizedValue: 25000,
        potentialSavings: -2000,
        actionRequired: true
      },
      {
        category: 'Courroies',
        currentValue: 12000,
        optimizedValue: 11000,
        potentialSavings: 1000,
        actionRequired: false
      }
    ],

    priceAnalysis: [
      {
        article: 'JOINT-ETANCH-001',
        currentPrice: 45.50,
        predictedPrice: 48.20,
        priceChange: 5.9,
        priceVolatility: 0.12,
        buySignal: true
      },
      {
        article: 'ROULEMENT-BR-205',
        currentPrice: 125.00,
        predictedPrice: 118.30,
        priceChange: -5.4,
        buySignal: false
      },
      {
        article: 'COURROIE-TR-150',
        currentPrice: 89.90,
        predictedPrice: 92.10,
        priceChange: 2.4,
        priceVolatility: 0.08,
        buySignal: false
      }
    ],

    anomalyDetection: [
      {
        type: 'consumption',
        description: 'Consommation anormalement élevée détectée pour les joints d\'étanchéité',
        severity: 'high',
        detected: new Date(Date.now() - 2 * 60 * 60 * 1000),
        affectedItems: ['JOINT-ETANCH-001', 'JOINT-ETANCH-002'],
        recommendation: 'Vérifier l\'équipement et planifier une maintenance préventive'
      },
      {
        type: 'pricing',
        description: 'Augmentation significative des prix fournisseur détectée',
        severity: 'medium',
        detected: new Date(Date.now() - 24 * 60 * 60 * 1000),
        affectedItems: ['ROULEMENT-BR-205'],
        recommendation: 'Rechercher des fournisseurs alternatifs'
      },
      {
        type: 'delivery',
        description: 'Retards de livraison récurrents identifiés',
        severity: 'medium',
        detected: new Date(Date.now() - 48 * 60 * 60 * 1000),
        affectedItems: ['FastParts Ltd'],
        recommendation: 'Réviser les accords de niveau de service'
      }
    ]
  }), []);

  const analyticsData = data || mockData;

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      setLastUpdate(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Avancées</h2>
          <p className="text-muted-foreground">
            Intelligence artificielle et analyse prédictive pour l'optimisation des stocks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="1y">1 année</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isLoading ? 'Actualisation...' : 'Actualiser'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Précision IA</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <Progress value={94.2} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Économies Prédites</p>
                <p className="text-2xl font-bold">12.5K MAD</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600">+15.3% ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertes Actives</p>
                <p className="text-2xl font-bold">7</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-xs text-muted-foreground">3 critiques, 4 moyennes</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Optimisation</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <Progress value={87} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="forecasting" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="forecasting">Prédictions</TabsTrigger>
          <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
          <TabsTrigger value="optimization">Optimisation</TabsTrigger>
          <TabsTrigger value="pricing">Prix</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>

        {/* Demand Forecasting */}
        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Prévisions de Demande IA
              </CardTitle>
              <CardDescription>
                Analyse prédictive basée sur l'historique et les tendances saisonnières
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.demandForecasting.map((forecast, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{forecast.article}</h4>
                        <Badge className={getRiskLevelColor(forecast.riskLevel)}>
                          {forecast.riskLevel === 'high' ? 'Risque élevé' : 
                           forecast.riskLevel === 'medium' ? 'Risque modéré' : 'Risque faible'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span>Stock actuel: </span>
                          <span className="font-medium text-foreground">{forecast.currentStock}</span>
                        </div>
                        <div>
                          <span>Demande prédite: </span>
                          <span className="font-medium text-foreground">{forecast.predictedDemand}</span>
                        </div>
                        <div>
                          <span>Commande suggérée: </span>
                          <span className="font-medium text-blue-600">{forecast.recommendedOrder}</span>
                        </div>
                        <div>
                          <span>Confiance: </span>
                          <span className="font-medium text-green-600">{(forecast.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Créer commande
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supplier Performance */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Performance des Fournisseurs
              </CardTitle>
              <CardDescription>
                Analyse comparative et scoring prédictif des fournisseurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.supplierPerformance.map((supplier, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{supplier.supplier}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={supplier.trend === 'up' ? 'default' : supplier.trend === 'down' ? 'destructive' : 'secondary'}>
                          {supplier.trend === 'up' ? 'En hausse' : 
                           supplier.trend === 'down' ? 'En baisse' : 'Stable'}
                        </Badge>
                        {supplier.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {supplier.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Délai de livraison</p>
                        <div className="flex items-center gap-2">
                          <Progress value={(15 - supplier.deliveryTime) / 15 * 100} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{supplier.deliveryTime}j</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Fiabilité</p>
                        <div className="flex items-center gap-2">
                          <Progress value={supplier.reliability * 100} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{(supplier.reliability * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Efficacité coût</p>
                        <div className="flex items-center gap-2">
                          <Progress value={supplier.costEfficiency * 100} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{(supplier.costEfficiency * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Score de risque</p>
                        <div className="flex items-center gap-2">
                          <Progress value={(1 - supplier.riskScore) * 100} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{(supplier.riskScore * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Optimization */}
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Optimisation des Stocks
              </CardTitle>
              <CardDescription>
                Recommandations IA pour réduire les coûts et optimiser les niveaux de stock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.stockOptimization.map((opt, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{opt.category}</h4>
                      {opt.actionRequired && (
                        <Badge variant="outline" className="text-orange-600">
                          Action requise
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Valeur actuelle</p>
                        <p className="font-medium">{opt.currentValue.toLocaleString()} MAD</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Valeur optimisée</p>
                        <p className="font-medium">{opt.optimizedValue.toLocaleString()} MAD</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Économies potentielles</p>
                        <p className={`font-medium ${opt.potentialSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {opt.potentialSavings > 0 ? '+' : ''}{opt.potentialSavings.toLocaleString()} MAD
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {opt.potentialSavings > 0 ? 'Réduction recommandée' : 'Augmentation recommandée'}
                      </div>
                      {opt.actionRequired && (
                        <Button size="sm" variant="outline">
                          Appliquer optimisation
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price Analysis */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Analyse des Prix
              </CardTitle>
              <CardDescription>
                Prédictions de prix et signaux d'achat basés sur l'analyse de marché
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.priceAnalysis.map((price, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{price.article}</h4>
                      <div className="flex items-center gap-2">
                        {price.buySignal && (
                          <Badge className="bg-green-100 text-green-800">
                            Signal d'achat
                          </Badge>
                        )}
                        <Badge variant={price.priceChange > 0 ? 'destructive' : 'default'}>
                          {price.priceChange > 0 ? '+' : ''}{price.priceChange.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Prix actuel</p>
                        <p className="font-medium">{price.currentPrice.toFixed(2)} MAD</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Prix prédit</p>
                        <p className="font-medium">{price.predictedPrice.toFixed(2)} MAD</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Volatilité</p>
                        <div className="flex items-center gap-2">
                          <Progress value={(price.priceVolatility || 0) * 100} className="h-2 flex-1" />
                          <span className="text-sm">{((price.priceVolatility || 0) * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anomaly Detection */}
        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Détection d'Anomalies
              </CardTitle>
              <CardDescription>
                Intelligence artificielle pour identifier les comportements anormaux
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.anomalyDetection.map((anomaly, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getSeverityColor(anomaly.severity)}`}></div>
                        <Badge variant="outline" className="text-xs">
                          {anomaly.type === 'consumption' ? 'Consommation' :
                           anomaly.type === 'pricing' ? 'Prix' :
                           anomaly.type === 'delivery' ? 'Livraison' : 'Gaspillage'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {anomaly.detected.toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <Badge variant={
                        anomaly.severity === 'critical' ? 'destructive' :
                        anomaly.severity === 'high' ? 'destructive' :
                        anomaly.severity === 'medium' ? 'secondary' : 'outline'
                      }>
                        {anomaly.severity === 'critical' ? 'Critique' :
                         anomaly.severity === 'high' ? 'Élevé' :
                         anomaly.severity === 'medium' ? 'Moyen' : 'Faible'}
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium mb-2">{anomaly.description}</h4>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      <strong>Éléments affectés:</strong> {anomaly.affectedItems.join(', ')}
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded text-sm">
                      <strong className="text-blue-800">Recommandation:</strong>
                      <p className="text-blue-700 mt-1">{anomaly.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground">
        Dernière mise à jour: {lastUpdate.toLocaleString('fr-FR')}
        {autoRefresh && <span> • Actualisation automatique activée</span>}
      </div>
    </div>
  );
}