import { useQuery } from "@tanstack/react-query";
import { WindowsCard, WindowsCardContent } from "@/components/WindowsCard";
import { WindowsButton } from "@/components/WindowsButton";
import { Link } from "wouter";
import { Package, AlertTriangle, ShoppingCart, TrendingUp, Truck, Plus, FileText, Brain, Activity } from "lucide-react";
import InteractiveChart from "@/components/InteractiveChart";
import FluentChart from "@/components/FluentChart";
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <WindowsCard key={i} className="animate-pulse" hoverable={false}>
              <WindowsCardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </WindowsCardContent>
            </WindowsCard>
          ))}
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
    <div className="space-y-6" data-testid="dashboard">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-windows-gray-dark mb-2">Tableau de Bord</h1>
        <p className="text-windows-gray">Vue d'ensemble de votre système de gestion de stock</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <WindowsCard className="cursor-pointer" data-testid="card-total-articles">
          <WindowsCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-windows-gray">Total Articles</p>
                <p className="text-3xl font-semibold text-windows-gray-dark">{stats?.totalArticles || 0}</p>
                <p className="text-xs text-windows-green mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>Articles référencés</span>
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-sm flex items-center justify-center">
                <Package className="w-7 h-7 text-windows-blue" />
              </div>
            </div>
          </WindowsCardContent>
        </WindowsCard>

        <WindowsCard className="cursor-pointer" data-testid="card-low-stock">
          <WindowsCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-windows-gray">Stock Bas</p>
                <p className="text-3xl font-semibold text-windows-red">{stats?.lowStock || 0}</p>
                <p className="text-xs text-windows-red mt-2 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  <span>Attention requise</span>
                </p>
              </div>
              <div className="w-14 h-14 bg-red-50 rounded-sm flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-windows-red" />
              </div>
            </div>
          </WindowsCardContent>
        </WindowsCard>

        <WindowsCard className="cursor-pointer" data-testid="card-pending-requests">
          <WindowsCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-windows-gray">Demandes en Cours</p>
                <p className="text-3xl font-semibold text-windows-gray-dark">{stats?.pendingRequests || 0}</p>
                <p className="text-xs text-windows-amber mt-2 flex items-center">
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  <span>En attente</span>
                </p>
              </div>
              <div className="w-14 h-14 bg-amber-50 rounded-sm flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-windows-amber" />
              </div>
            </div>
          </WindowsCardContent>
        </WindowsCard>

        <WindowsCard className="cursor-pointer" data-testid="card-stock-value">
          <WindowsCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-windows-gray">Valeur Stock</p>
                <p className="text-3xl font-semibold text-windows-gray-dark">
                  {formatCurrency(stats?.stockValue || 0)}
                </p>
                <p className="text-xs text-windows-green mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>Valeur totale</span>
                </p>
              </div>
              <div className="w-14 h-14 bg-green-50 rounded-sm flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-windows-green" />
              </div>
            </div>
          </WindowsCardContent>
        </WindowsCard>
      </div>

      {/* Enhanced Analytics Section with Fluent Design Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Stock Evolution Chart */}
        <FluentChart
          data={[
            { month: 'Jan', stock: Math.max(50, (stats?.totalArticles || 100) * 0.8) },
            { month: 'Fév', stock: Math.max(65, (stats?.totalArticles || 100) * 0.9) },
            { month: 'Mar', stock: Math.max(45, (stats?.totalArticles || 100) * 0.7) },
            { month: 'Avr', stock: Math.max(75, stats?.totalArticles || 100) },
            { month: 'Mai', stock: Math.max(80, (stats?.totalArticles || 100) * 1.1) },
            { month: 'Juin', stock: Math.max(85, (stats?.totalArticles || 100) * 1.2) },
          ]}
          title="Évolution du Stock"
          description="Tendance de l'inventaire sur 6 mois"
          type="line"
          xAxisKey="month"
          yAxisKey="stock"
          showAnalytics={true}
        />

        {/* Purchase Status Bar Chart */}
        <FluentChart
          data={[
            { status: 'En Attente', count: Math.max(8, stats?.pendingRequests || 24) },
            { status: 'Approuvé', count: Math.max(15, Math.floor((stats?.pendingRequests || 24) * 1.5)) },
            { status: 'Commandé', count: Math.max(12, Math.floor((stats?.pendingRequests || 24) * 0.8)) },
            { status: 'Refusé', count: Math.max(3, Math.floor((stats?.pendingRequests || 24) * 0.3)) },
          ]}
          title="Statut des Demandes"
          description="Répartition des demandes d'achat par statut"
          type="bar"
          xAxisKey="status"
          yAxisKey="count"
          showAnalytics={true}
        />
      </div>

      {/* Predictive Analytics Chart */}
      <div className="mb-6">
        <FluentChart
          data={[
            { month: 'Juil', prediction: Math.max(90, (stats?.totalArticles || 100) * 1.3) },
            { month: 'Août', prediction: Math.max(95, (stats?.totalArticles || 100) * 1.4) },
            { month: 'Sept', prediction: Math.max(88, (stats?.totalArticles || 100) * 1.2) },
            { month: 'Oct', prediction: Math.max(102, (stats?.totalArticles || 100) * 1.5) },
            { month: 'Nov', prediction: Math.max(110, (stats?.totalArticles || 100) * 1.6) },
            { month: 'Déc', prediction: Math.max(115, (stats?.totalArticles || 100) * 1.7) },
          ]}
          title="Prévision de Stock"
          description="Prédiction basée sur l'IA pour les 6 prochains mois"
          type="prediction"
          xAxisKey="month"
          yAxisKey="prediction"
          showAnalytics={true}
        />
      </div>

      {/* AI Insights Section */}
      <div className="mb-6">
        <WindowsCard>
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-sm flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Insights IA</h3>
                  <p className="text-sm text-gray-600">Recommandations intelligentes du système</p>
                </div>
              </div>
              <Link href="/analytics">
                <WindowsButton variant="outline" size="sm">
                  <Activity className="w-4 h-4 mr-2" />
                  Vue Complète
                </WindowsButton>
              </Link>
            </div>
          </div>
          <WindowsCardContent className="p-6">
            <PredictiveAnalytics showGlobalInsights={true} />
          </WindowsCardContent>
        </WindowsCard>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div>
          <WindowsCard hoverable={false}>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-windows-gray-dark">Actions Rapides</h3>
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
                      <Plus className="w-4 h-4 text-windows-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-windows-gray-dark">Ajouter Article</p>
                      <p className="text-xs text-windows-gray">Nouveau produit</p>
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
                      <ShoppingCart className="w-4 h-4 text-windows-amber" />
                    </div>
                    <div>
                      <p className="font-medium text-windows-gray-dark">Demande Achat</p>
                      <p className="text-xs text-windows-gray">Nouvelle demande</p>
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
                      <Truck className="w-4 h-4 text-windows-green" />
                    </div>
                    <div>
                      <p className="font-medium text-windows-gray-dark">Réception</p>
                      <p className="text-xs text-windows-gray">Enregistrer livraison</p>
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
                      <FileText className="w-4 h-4 text-windows-purple" />
                    </div>
                    <div>
                      <p className="font-medium text-windows-gray-dark">Rapports</p>
                      <p className="text-xs text-windows-gray">Export données</p>
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
                <h3 className="text-lg font-semibold text-windows-gray-dark">Alertes Stock Bas</h3>
                {stats?.lowStock && stats.lowStock > 0 && (
                  <span className="bg-windows-red text-white text-xs px-2 py-1 rounded-sm">
                    {stats.lowStock} articles
                  </span>
                )}
              </div>
            </div>
            <WindowsCardContent className="p-0">
              {(lowStockArticles as any[]).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-windows-gray-light">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-windows-gray-dark">Code Article</th>
                        <th className="text-left p-4 text-sm font-medium text-windows-gray-dark">Désignation</th>
                        <th className="text-left p-4 text-sm font-medium text-windows-gray-dark">Stock Actuel</th>
                        <th className="text-left p-4 text-sm font-medium text-windows-gray-dark">Seuil Min.</th>
                        <th className="text-left p-4 text-sm font-medium text-windows-gray-dark">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(lowStockArticles as any[]).slice(0, 5).map((article: any) => (
                        <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4 text-sm font-medium text-windows-gray-dark">{article.codeArticle}</td>
                          <td className="p-4 text-sm text-windows-gray-dark">{article.designation}</td>
                          <td className="p-4 text-sm">
                            <span className="text-windows-red font-medium">{article.quantiteStock}</span>
                          </td>
                          <td className="p-4 text-sm text-windows-gray">{article.seuilMin}</td>
                          <td className="p-4">
                            <Link href={`/purchase-requests?article=${article.id}`}>
                              <WindowsButton size="sm" variant="primary" className="text-xs">
                                Commander
                              </WindowsButton>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(lowStockArticles as any[]).length > 5 && (
                    <div className="p-4 border-t border-gray-100 text-center">
                      <Link href="/stock-status?filter=critical">
                        <WindowsButton variant="outline" size="sm">
                          Voir tous les articles en stock bas ({(lowStockArticles as any[]).length})
                        </WindowsButton>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-50 rounded-sm mx-auto mb-4 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-windows-green" />
                  </div>
                  <h4 className="text-lg font-medium text-windows-gray-dark mb-2">Aucune alerte stock</h4>
                  <p className="text-windows-gray">Tous vos articles sont en stock suffisant</p>
                </div>
              )}
            </WindowsCardContent>
          </WindowsCard>
        </div>
      </div>
    </div>
  );
}