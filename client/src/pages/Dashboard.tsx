import { useQuery } from "@tanstack/react-query";
import { WindowsCard, WindowsCardContent } from "@/components/WindowsCard";
import { WindowsButton } from "@/components/WindowsButton";
import { Link } from "wouter";
import { Package, AlertTriangle, ShoppingCart, TrendingUp, Truck, Plus, FileText, Brain, Activity } from "lucide-react";
import SimpleChart from "@/components/SimpleChart";
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
      <div>
        <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Tableau de Bord</h1>
          <p className="text-sm text-gray-600">Vue d'ensemble de votre système de gestion de stock</p>
        </div>
        <div className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
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
    <div>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Tableau de Bord</h1>
        <p className="text-sm text-gray-600">Vue d'ensemble de votre système de gestion de stock</p>
      </div>

      <div className="px-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Articles</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalArticles || 0}</p>
                <p className="text-sm text-blue-600 mt-1">Articles référencés</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Stock Bas</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.lowStock || 0}</p>
                <p className="text-sm text-red-600 mt-1">Attention requise</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Demandes en Cours</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.pendingRequests || 0}</p>
                <p className="text-sm text-yellow-600 mt-1">{stats?.pendingRequests || 0} en attente</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Valeur Stock</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats?.stockValue || 0)}</p>
                <p className="text-sm text-green-600 mt-1">Inventaire total</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section with Mica Effects */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Stock Evolution Chart - Mica Container */}
          <div className="relative rounded-xl overflow-hidden mica-container">
            <div className="absolute inset-0 bg-white/90 backdrop-blur-lg border border-white/20" 
                 style={{ 
                   boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                   background: 'rgba(255, 255, 255, 0.9)',
                   backdropFilter: 'blur(20px) saturate(180%)'
                 }}>
            </div>
            <div className="relative z-10 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Évolution du Stock</h3>
                <p className="text-sm text-gray-600">Depuis les 4 derniers mois</p>
              </div>
              <div className="h-64">
                <SimpleChart
                  data={[
                    { month: 'Jan', stock: 3.0 },
                    { month: 'Fév', stock: 1.8 },
                    { month: 'Mar', stock: 2.5 },
                    { month: 'Avr', stock: 2.2 },
                  ]}
                  type="line"
                  xAxisKey="month"
                  yAxisKey="stock"
                />
              </div>
            </div>
          </div>

          {/* Purchase Status Bar Chart - Mica Container */}
          <div className="relative rounded-xl overflow-hidden mica-container">
            <div className="absolute inset-0 bg-white/90 backdrop-blur-lg border border-white/20" 
                 style={{ 
                   boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                   background: 'rgba(255, 255, 255, 0.9)',
                   backdropFilter: 'blur(20px) saturate(180%)'
                 }}>
            </div>
            <div className="relative z-10 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Statut des Demandes</h3>
                <p className="text-sm text-gray-600">Répartition des statuts d'achat</p>
              </div>
              <div className="h-64">
                <SimpleChart
                  data={[
                    { status: 'En attente', count: 2.0 },
                    { status: 'Approuvé', count: 5.0 },
                    { status: 'Commandé', count: 3.0 },
                    { status: 'Refusé', count: 1.0 },
                  ]}
                  type="bar"
                  xAxisKey="status"
                  yAxisKey="count"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Chart - Full Width Mica Container */}
        <div className="mb-8">
          <div className="relative rounded-xl overflow-hidden mica-container">
            <div className="absolute inset-0 bg-white/90 backdrop-blur-lg border border-white/20" 
                 style={{ 
                   boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                   background: 'rgba(255, 255, 255, 0.9)',
                   backdropFilter: 'blur(20px) saturate(180%)'
                 }}>
            </div>
            <div className="relative z-10 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Prévision</h3>
                <p className="text-sm text-gray-600">Demande prévue sur 12 mois</p>
              </div>
              <div className="h-64">
                <SimpleChart
                  data={[
                    { month: 'Jan', prediction: 6.0 },
                    { month: 'Fév', prediction: 7.5 },
                    { month: 'Mar', prediction: 8.0 },
                    { month: 'Avr', prediction: 7.8 },
                    { month: 'Mai', prediction: 8.2 },
                    { month: 'Juin', prediction: 8.0 },
                  ]}
                  type="prediction"
                  xAxisKey="month"
                  yAxisKey="prediction"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-8">
          {/* Quick Actions */}
          <div>
            <WindowsCard hoverable={false}>
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Actions Rapides</h3>
              </div>
              <WindowsCardContent className="p-6 space-y-3">
                <Link href="/articles">
                  <WindowsButton 
                    variant="outline" 
                    className="w-full justify-start p-4 h-auto"
                    data-testid="quick-action-articles"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-50 rounded-sm flex items-center justify-center mr-3">
                        <Plus className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Ajouter Article</p>
                        <p className="text-xs text-gray-600">Nouveau produit</p>
                      </div>
                    </div>
                  </WindowsButton>
                </Link>

                <Link href="/purchase-requests">
                  <WindowsButton 
                    variant="outline" 
                    className="w-full justify-start p-4 h-auto"
                    data-testid="quick-action-purchase-request"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-amber-50 rounded-sm flex items-center justify-center mr-3">
                        <ShoppingCart className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Demande Achat</p>
                        <p className="text-xs text-gray-600">Nouvelle demande</p>
                      </div>
                    </div>
                  </WindowsButton>
                </Link>

                <Link href="/reception">
                  <WindowsButton 
                    variant="outline" 
                    className="w-full justify-start p-4 h-auto"
                    data-testid="quick-action-reception"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-50 rounded-sm flex items-center justify-center mr-3">
                        <Truck className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Réception</p>
                        <p className="text-xs text-gray-600">Enregistrer livraison</p>
                      </div>
                    </div>
                  </WindowsButton>
                </Link>

                <Link href="/reports">
                  <WindowsButton 
                    variant="outline" 
                    className="w-full justify-start p-4 h-auto"
                    data-testid="quick-action-export"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-50 rounded-sm flex items-center justify-center mr-3">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Rapports</p>
                        <p className="text-xs text-gray-600">Export données</p>
                      </div>
                    </div>
                  </WindowsButton>
                </Link>
              </WindowsCardContent>
            </WindowsCard>
          </div>

          {/* Stock Alerts */}
          <div className="xl:col-span-2">
            <WindowsCard hoverable={false}>
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Alertes Stock Bas</h3>
                  {stats?.lowStock && stats.lowStock > 0 && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-sm">
                      {stats.lowStock} articles
                    </span>
                  )}
                </div>
              </div>
              <WindowsCardContent className="p-0">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-50 rounded-sm mx-auto mb-4 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Aucune alerte stock</h4>
                  <p className="text-gray-600">Tous vos articles sont en stock suffisant</p>
                </div>
              </WindowsCardContent>
            </WindowsCard>
          </div>
        </div>
      </div>
    </div>
  );
}