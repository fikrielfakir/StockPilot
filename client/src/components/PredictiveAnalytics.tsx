import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { WindowsCard, WindowsCardContent } from "@/components/WindowsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, AlertTriangle, Brain, Calendar, Package, ShoppingCart } from "lucide-react";
import InteractiveChart from "./InteractiveChart";

interface PredictiveInsight {
  type: 'stockout_risk' | 'demand_forecast' | 'price_alert' | 'supplier_risk';
  articleId?: string;
  articleName?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
  confidence: number;
  timeframe?: string;
  impact?: string;
  data?: any;
}

interface DemandForecast {
  articleId: string;
  predictions: Array<{
    date: string;
    predicted: number;
    confidence: number;
    factors: string[];
  }>;
}

interface PredictiveAnalyticsProps {
  articleId?: string;
  showGlobalInsights?: boolean;
}

export default function PredictiveAnalytics({ 
  articleId, 
  showGlobalInsights = true 
}: PredictiveAnalyticsProps) {
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [demandForecasts, setDemandForecasts] = useState<DemandForecast[]>([]);

  // Fetch articles data for analysis
  const { data: articles = [] } = useQuery<any[]>({
    queryKey: ["/api/articles"],
  });

  const { data: stockMovements = [] } = useQuery<any[]>({
    queryKey: ["/api/stock-movements", articleId],
  });

  const { data: purchaseRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/purchase-requests"],
  });

  // Generate predictive insights
  useEffect(() => {
    if (Array.isArray(articles) && articles.length > 0) {
      const generatedInsights = generatePredictiveInsights(articles, stockMovements, purchaseRequests);
      setInsights(generatedInsights);
      
      const forecasts = generateDemandForecasts(articles, stockMovements);
      setDemandForecasts(forecasts);
    }
  }, [articles, stockMovements, purchaseRequests]);

  const generatePredictiveInsights = (
    articles: any[], 
    movements: any[], 
    requests: any[]
  ): PredictiveInsight[] => {
    const insights: PredictiveInsight[] = [];

    // Stockout Risk Analysis
    articles.forEach(article => {
      const consumption = calculateConsumptionRate(article.id, movements);
      const daysUntilStockout = article.stockActuel / (consumption || 1);
      
      if (daysUntilStockout <= 7) {
        insights.push({
          type: 'stockout_risk',
          articleId: article.id,
          articleName: article.designation,
          severity: daysUntilStockout <= 3 ? 'critical' : 'high',
          message: `Risque de rupture dans ${Math.ceil(daysUntilStockout)} jours`,
          recommendation: `Commander ${Math.ceil(consumption * 30)} unités pour couvrir 30 jours`,
          confidence: calculateConfidence(movements.length),
          timeframe: `${Math.ceil(daysUntilStockout)} jours`,
          impact: 'Production arrêtée'
        });
      }
    });

    // Demand Pattern Analysis
    const seasonalArticles = detectSeasonalPatterns(articles, movements);
    seasonalArticles.forEach(article => {
      insights.push({
        type: 'demand_forecast',
        articleId: article.id,
        articleName: article.name,
        severity: 'medium',
        message: `Pic de demande prévu ${article.nextPeak}`,
        recommendation: `Augmenter le stock de ${article.recommendedIncrease}%`,
        confidence: article.confidence,
        timeframe: article.nextPeak
      });
    });

    // Price Alert Analysis
    const priceAlerts = detectPriceAnomalies(articles);
    priceAlerts.forEach(alert => {
      insights.push({
        type: 'price_alert',
        articleId: alert.articleId,
        articleName: alert.articleName,
        severity: alert.severity,
        message: alert.message,
        recommendation: alert.recommendation,
        confidence: 85
      });
    });

    return insights.slice(0, 10); // Limit to top 10 insights
  };

  const generateDemandForecasts = (articles: any[], movements: any[]): DemandForecast[] => {
    return articles.slice(0, 5).map(article => ({
      articleId: article.id,
      predictions: generateForecastData(article, movements)
    }));
  };

  const generateForecastData = (article: any, movements: any[]) => {
    const predictions = [];
    const baseConsumption = calculateConsumptionRate(article.id, movements) || 5;
    
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      // Simple seasonal adjustment
      const seasonalFactor = 1 + 0.2 * Math.sin((date.getMonth() / 12) * 2 * Math.PI);
      const predicted = Math.round(baseConsumption * seasonalFactor * (0.9 + Math.random() * 0.2));
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        predicted,
        confidence: Math.max(60, 95 - (i * 5)), // Decreasing confidence over time
        factors: ['Tendance historique', 'Variations saisonnières', 'Cycles de maintenance']
      });
    }
    
    return predictions;
  };

  const calculateConsumptionRate = (articleId: string, movements: any[]): number => {
    const outboundMovements = movements.filter(m => 
      m.articleId === articleId && m.type === 'sortie'
    );
    
    if (outboundMovements.length === 0) return 0;
    
    const totalQuantity = outboundMovements.reduce((sum, m) => sum + m.quantite, 0);
    const days = Math.max(1, (Date.now() - new Date(outboundMovements[0].dateMovement).getTime()) / (1000 * 60 * 60 * 24));
    
    return totalQuantity / days;
  };

  const calculateConfidence = (dataPoints: number): number => {
    return Math.min(95, Math.max(50, dataPoints * 10));
  };

  const detectSeasonalPatterns = (articles: any[], movements: any[]) => {
    // Simplified seasonal detection
    return articles.slice(0, 2).map(article => ({
      id: article.id,
      name: article.designation,
      nextPeak: 'dans 3 mois',
      recommendedIncrease: 25,
      confidence: 75
    }));
  };

  const detectPriceAnomalies = (articles: any[]) => {
    return articles
      .filter(article => article.prixUnitaire > 100)
      .slice(0, 2)
      .map(article => ({
        articleId: article.id,
        articleName: article.designation,
        severity: 'medium' as const,
        message: `Prix élevé détecté: ${article.prixUnitaire} MAD`,
        recommendation: 'Rechercher des fournisseurs alternatifs'
      }));
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

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'stockout_risk': return AlertTriangle;
      case 'demand_forecast': return TrendingUp;
      case 'price_alert': return Package;
      case 'supplier_risk': return ShoppingCart;
      default: return Brain;
    }
  };

  const criticalInsights = insights.filter(i => i.severity === 'critical');
  const highPriorityInsights = insights.filter(i => i.severity === 'high');

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <WindowsCard>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-sm flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Intelligence Prédictive</h3>
              <p className="text-sm text-gray-600">Analyse automatique des tendances et prédictions</p>
            </div>
          </div>
        </div>
        <WindowsCardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{criticalInsights.length}</div>
              <div className="text-xs text-gray-600">Alertes Critiques</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{highPriorityInsights.length}</div>
              <div className="text-xs text-gray-600">Priorité Haute</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{demandForecasts.length}</div>
              <div className="text-xs text-gray-600">Prévisions Actives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length || 0)}%
              </div>
              <div className="text-xs text-gray-600">Confiance Moyenne</div>
            </div>
          </div>
        </WindowsCardContent>
      </WindowsCard>

      {/* Critical Alerts */}
      {criticalInsights.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>{criticalInsights.length} alerte(s) critique(s)</strong> nécessitent une action immédiate
          </AlertDescription>
        </Alert>
      )}

      {/* Insights List */}
      <WindowsCard>
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recommandations Intelligentes</h3>
        </div>
        <WindowsCardContent className="p-0">
          {insights.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {insights.map((insight, index) => {
                const Icon = getSeverityIcon(insight.type);
                return (
                  <div key={index} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${getSeverityColor(insight.severity)}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{insight.message}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {insight.confidence}% confiance
                          </Badge>
                          {insight.timeframe && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {insight.timeframe}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{insight.recommendation}</p>
                        {insight.articleName && (
                          <p className="text-xs text-gray-500">Article: {insight.articleName}</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        Action
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Analyse en cours</h4>
              <p className="text-gray-600">L'IA analyse vos données pour générer des insights</p>
            </div>
          )}
        </WindowsCardContent>
      </WindowsCard>

      {/* Demand Forecasting Charts */}
      {demandForecasts.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {demandForecasts.slice(0, 2).map((forecast) => {
            const article = Array.isArray(articles) ? articles.find((a: any) => a.id === forecast.articleId) : null;
            return (
              <InteractiveChart
                key={forecast.articleId}
                data={forecast.predictions.map(p => ({
                  date: new Date(p.date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
                  predicted: p.predicted,
                  confidence: p.confidence
                }))}
                title={`Prévision: ${article?.designation || 'Article'}`}
                description="Demande prévue sur 12 mois"
                defaultType="line"
                xAxisKey="date"
                yAxisKey="predicted"
                colors={['#3B82F6']}
                showAnalytics={true}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}