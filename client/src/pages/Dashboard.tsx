import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  TrendingUp, 
  Truck, 
  Plus, 
  FileText, 
  Brain, 
  Activity,
  Clock,
  Euro,
  BarChart3,
  PieChart,
  LineChart,
  Zap
} from "lucide-react";
import InteractiveChart from "@/components/InteractiveChart";
import PredictiveAnalytics from "@/components/PredictiveAnalytics";

interface DashboardStats {
  totalArticles: number;
  lowStock: number;
  pendingRequests: number;
  stockValue: number;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: lowStockArticles = [] } = useQuery({
    queryKey: ["/api/articles/low-stock"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="fluent-card animate-pulse">
                <div className="h-32 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30" data-testid="dashboard">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="fluent-title text-4xl mb-3">Tableau de Bord</h1>
          <p className="fluent-caption text-lg">Vue d'ensemble de votre système de gestion de stock</p>
        </div>

        {/* Stats Cards - Fluent Design Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Total Articles Card */}
          <div className="fluent-card group overflow-hidden" data-testid="card-total-articles">
            <div className="stat-card-blue h-32 p-6 text-white relative">
              <div className="absolute top-4 right-4">
                <Package className="w-8 h-8 text-white/90" />
              </div>
              <div className="space-y-2">
                <p className="text-white/90 font-medium text-sm uppercase tracking-wide">Total Articles</p>
                <p className="text-3xl font-bold">{stats?.totalArticles || 0}</p>
                <div className="flex items-center text-white/80 text-xs">
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  <span>Articles référencés</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Bas Card */}
          <div className="fluent-card group overflow-hidden" data-testid="card-low-stock">
            <div className="stat-card-yellow h-32 p-6 text-white relative">
              <div className="absolute top-4 right-4">
                <AlertTriangle className="w-8 h-8 text-white/90" />
              </div>
              <div className="space-y-2">
                <p className="text-white/90 font-medium text-sm uppercase tracking-wide">Stock Bas</p>
                <p className="text-3xl font-bold">{stats?.lowStock || 0}</p>
                <div className="flex items-center text-white/80 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  <span>Attention requise</span>
                </div>
              </div>
            </div>
          </div>

          {/* Demandes en Cours Card */}
          <div className="fluent-card group overflow-hidden" data-testid="card-pending-requests">
            <div className="stat-card-orange h-32 p-6 text-white relative">
              <div className="absolute top-4 right-4">
                <Clock className="w-8 h-8 text-white/90" />
              </div>
              <div className="space-y-2">
                <p className="text-white/90 font-medium text-sm uppercase tracking-wide">Demandes en Cours</p>
                <p className="text-3xl font-bold">{stats?.pendingRequests || 0}</p>
                <div className="flex items-center text-white/80 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>En attente</span>
                </div>
              </div>
            </div>
          </div>

          {/* Valeur Stock Card */}
          <div className="fluent-card group overflow-hidden" data-testid="card-stock-value">
            <div className="stat-card-green h-32 p-6 text-white relative">
              <div className="absolute top-4 right-4">
                <Euro className="w-8 h-8 text-white/90" />
              </div>
              <div className="space-y-2">
                <p className="text-white/90 font-medium text-sm uppercase tracking-wide">Valeur Stock</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats?.stockValue || 0)}
                </p>
                <div className="flex items-center text-white/80 text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>Valeur totale</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Stock Evolution Chart */}
          <div className="xl:col-span-2">
            <div className="fluent-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="fluent-subtitle text-xl mb-1">Évolution du Stock</h2>
                  <p className="fluent-caption">Tendances des 30 derniers jours</p>
                </div>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-64">
                <InteractiveChart />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="fluent-card p-6">
              <h2 className="fluent-subtitle text-lg mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-blue-500" />
                Actions Rapides
              </h2>
              <div className="space-y-3">
                <Link to="/articles" className="block">
                  <button className="fluent-button w-full justify-start">
                    <Plus className="w-4 h-4" />
                    Nouvel Article
                  </button>
                </Link>
                <Link to="/purchase-requests" className="block">
                  <button className="fluent-button w-full justify-start bg-gradient-to-r from-green-500 to-green-400">
                    <ShoppingCart className="w-4 h-4" />
                    Nouvelle Demande
                  </button>
                </Link>
                <Link to="/reception" className="block">
                  <button className="fluent-button w-full justify-start bg-gradient-to-r from-purple-500 to-purple-400">
                    <Truck className="w-4 h-4" />
                    Réceptionner
                  </button>
                </Link>
                <Link to="/reports" className="block">
                  <button className="fluent-button w-full justify-start bg-gradient-to-r from-orange-500 to-orange-400">
                    <FileText className="w-4 h-4" />
                    Voir Rapports
                  </button>
                </Link>
              </div>
            </div>

            {/* Demand Status Chart */}
            <div className="fluent-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="fluent-subtitle text-lg">État des Demandes</h2>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-48">
                <InteractiveChart />
              </div>
            </div>
          </div>
        </div>

        {/* Predictive Analytics Section */}
        <div className="fluent-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="fluent-subtitle text-xl mb-1 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-indigo-500" />
                Analyses Prédictives
              </h2>
              <p className="fluent-caption">Insights intelligents pour optimiser votre stock</p>
            </div>
            <LineChart className="w-5 h-5 text-gray-400" />
          </div>
          <PredictiveAnalytics />
        </div>

        {/* Low Stock Alert Section */}
        {lowStockArticles.length > 0 && (
          <div className="fluent-card p-6 border-l-4 border-yellow-500">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="fluent-subtitle text-lg text-yellow-800 mb-2">
                  Alertes Stock Bas
                </h3>
                <p className="fluent-caption text-yellow-700 mb-4">
                  {lowStockArticles.length} articles nécessitent une attention immédiate
                </p>
                <Link to="/stock-status">
                  <button className="fluent-button bg-gradient-to-r from-yellow-500 to-yellow-400">
                    <AlertTriangle className="w-4 h-4" />
                    Voir Détails
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="fluent-card p-6 text-center">
            <Activity className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="fluent-subtitle text-lg mb-2">Activité Aujourd'hui</h3>
            <p className="text-2xl font-bold text-blue-600">
              {(stats?.pendingRequests || 0) + (stats?.lowStock || 0)}
            </p>
            <p className="fluent-caption">Actions requises</p>
          </div>

          <div className="fluent-card p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="fluent-subtitle text-lg mb-2">Croissance Stock</h3>
            <p className="text-2xl font-bold text-green-600">+12%</p>
            <p className="fluent-caption">Ce mois</p>
          </div>

          <div className="fluent-card p-6 text-center">
            <Package className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <h3 className="fluent-subtitle text-lg mb-2">Efficacité</h3>
            <p className="text-2xl font-bold text-purple-600">94%</p>
            <p className="fluent-caption">Taux de service</p>
          </div>
        </div>
      </div>
    </div>
  );
}