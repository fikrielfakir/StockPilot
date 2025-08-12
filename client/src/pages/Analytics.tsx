import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WindowsCard, WindowsCardContent } from "@/components/WindowsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Download,
  Calendar,
  AlertTriangle,
  Package,
  ShoppingCart,
  Truck
} from "lucide-react";
import InteractiveChart from "@/components/InteractiveChart";
import PredictiveAnalytics from "@/components/PredictiveAnalytics";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import PerformanceOptimizer from "@/components/PerformanceOptimizer";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('3months');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: articles = [] } = useQuery<any[]>({
    queryKey: ["/api/articles"],
  });

  const { data: stockMovements = [] } = useQuery<any[]>({
    queryKey: ["/api/stock-movements"],
  });

  const { data: purchaseRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/purchase-requests"],
  });

  const { data: receptions = [] } = useQuery<any[]>({
    queryKey: ["/api/receptions"],
  });

  const { data: outbounds = [] } = useQuery<any[]>({
    queryKey: ["/api/outbounds"],
  });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ["/api/suppliers"],
  });

  // Generate analytics data
  const generateInventoryTrends = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
    return months.map((month, index) => ({
      month,
      totalStock: Math.floor(Math.random() * 1000 + 500),
      stockValue: Math.floor(Math.random() * 50000 + 25000),
      lowStock: Math.floor(Math.random() * 20 + 5),
      movements: Math.floor(Math.random() * 100 + 50)
    }));
  };

  const generateSupplierPerformance = () => {
    return suppliers.slice(0, 6).map((supplier: any) => ({
      supplier: supplier.nom || `Fournisseur ${supplier.id?.slice(0, 6)}`,
      deliveryTime: Math.floor(Math.random() * 20 + 5),
      quality: Math.floor(Math.random() * 20 + 80),
      orderVolume: Math.floor(Math.random() * 100000 + 10000),
      onTimeDelivery: Math.floor(Math.random() * 20 + 75)
    }));
  };

  const generateCategoryAnalysis = () => {
    const categories = [...new Set(articles.map((a: any) => a.categorie))];
    return categories.slice(0, 8).map(category => ({
      category: category || 'Non catégorisé',
      count: articles.filter((a: any) => a.categorie === category).length,
      avgPrice: Math.floor(Math.random() * 500 + 50),
      totalValue: Math.floor(Math.random() * 100000 + 10000),
      turnover: Math.floor(Math.random() * 10 + 1)
    }));
  };

  const generateMovementTrends = () => {
    const weeks = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];
    return weeks.map(week => ({
      week,
      entrees: Math.floor(Math.random() * 200 + 50),
      sorties: Math.floor(Math.random() * 150 + 30),
      net: Math.floor(Math.random() * 100 - 50)
    }));
  };

  const inventoryTrends = generateInventoryTrends();
  const supplierPerformance = generateSupplierPerformance();
  const categoryAnalysis = generateCategoryAnalysis();
  const movementTrends = generateMovementTrends();

  const handleExportReport = (format: 'pdf' | 'excel') => {
    // In a real application, this would generate and download the report
    console.log(`Exporting analytics report as ${format}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-blue-600" />
            Analytics & Intelligence
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Analyse avancée et prédictions pour votre inventaire
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 mois</SelectItem>
              <SelectItem value="3months">3 mois</SelectItem>
              <SelectItem value="6months">6 mois</SelectItem>
              <SelectItem value="1year">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => handleExportReport('pdf')}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <WindowsCard>
          <WindowsCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Articles</p>
                <p className="text-2xl font-bold text-blue-600">{articles.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </WindowsCardContent>
        </WindowsCard>

        <WindowsCard>
          <WindowsCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fournisseurs Actifs</p>
                <p className="text-2xl font-bold text-green-600">{suppliers.length}</p>
              </div>
              <Truck className="w-8 h-8 text-green-600" />
            </div>
          </WindowsCardContent>
        </WindowsCard>

        <WindowsCard>
          <WindowsCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Demandes ce Mois</p>
                <p className="text-2xl font-bold text-orange-600">{purchaseRequests.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-orange-600" />
            </div>
          </WindowsCardContent>
        </WindowsCard>

        <WindowsCard>
          <WindowsCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mouvements</p>
                <p className="text-2xl font-bold text-purple-600">{stockMovements.length}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </WindowsCardContent>
        </WindowsCard>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
          <TabsTrigger value="predictions">Prédictions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Inventory Trends */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <InteractiveChart
              data={inventoryTrends}
              title="Évolution du Stock"
              description="Tendances sur 6 mois"
              xAxisKey="month"
              yAxisKey="totalStock"
              defaultType="area"
              colors={['#3B82F6']}
              showAnalytics={true}
            />

            <InteractiveChart
              data={movementTrends}
              title="Mouvements de Stock"
              description="Entrées vs Sorties (8 dernières semaines)"
              xAxisKey="week"
              yAxisKey="entrees"
              defaultType="bar"
              colors={['#10B981', '#EF4444']}
              showAnalytics={true}
            />
          </div>

          {/* Category Analysis */}
          <InteractiveChart
            data={categoryAnalysis}
            title="Analyse par Catégorie"
            description="Répartition des articles et valeur par catégorie"
            xAxisKey="category"
            yAxisKey="count"
            defaultType="bar"
            colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
            enableDrillDown={true}
            showAnalytics={true}
          />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <InteractiveChart
              data={categoryAnalysis}
              title="Valeur par Catégorie"
              description="Valeur totale du stock par catégorie"
              xAxisKey="category"
              yAxisKey="totalValue"
              defaultType="pie"
              colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']}
              showAnalytics={true}
            />

            <InteractiveChart
              data={categoryAnalysis}
              title="Rotation des Stocks"
              description="Taux de rotation par catégorie"
              xAxisKey="category"
              yAxisKey="turnover"
              defaultType="bar"
              colors={['#10B981']}
              showAnalytics={true}
            />
          </div>

          {/* Stock Alerts */}
          <WindowsCard>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                Alertes de Stock
              </h3>
            </div>
            <WindowsCardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <div className="text-sm text-red-700">Stock Critique</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">8</div>
                  <div className="text-sm text-yellow-700">Stock Bas</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-blue-700">À Réapprovisionner</div>
                </div>
              </div>
            </WindowsCardContent>
          </WindowsCard>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <InteractiveChart
              data={supplierPerformance}
              title="Performance des Fournisseurs"
              description="Temps de livraison moyen (jours)"
              xAxisKey="supplier"
              yAxisKey="deliveryTime"
              defaultType="bar"
              colors={['#F59E0B']}
              showAnalytics={true}
            />

            <InteractiveChart
              data={supplierPerformance}
              title="Qualité des Fournisseurs"
              description="Score de qualité (%)"
              xAxisKey="supplier"
              yAxisKey="quality"
              defaultType="line"
              colors={['#10B981']}
              showAnalytics={true}
            />
          </div>

          {/* Add Performance Optimizer to Analytics */}
          <div className="mt-6">
            <WindowsCard>
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Optimisation des Performances</h3>
              </div>
              <WindowsCardContent className="p-6">
                <PerformanceOptimizer />
              </WindowsCardContent>
            </WindowsCard>
          </div>

          <InteractiveChart
            data={supplierPerformance}
            title="Volume des Commandes"
            description="Volume total des commandes par fournisseur"
            xAxisKey="supplier"
            yAxisKey="orderVolume"
            defaultType="area"
            colors={['#3B82F6']}
            showAnalytics={true}
          />
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <PredictiveAnalytics showGlobalInsights={true} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}