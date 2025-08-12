import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
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
    <div className="space-y-8" data-testid="dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="card-hover transition-smooth" data-testid="card-total-articles">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ms-gray">Total Articles</p>
                <p className="text-2xl font-bold text-ms-gray-dark">{stats?.totalArticles || 0}</p>
                <p className="text-xs text-ms-green mt-1">
                  <i className="fas fa-arrow-up"></i>
                  <span>Articles référencés</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-boxes text-ms-blue text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover transition-smooth" data-testid="card-low-stock">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ms-gray">Stock Bas</p>
                <p className="text-2xl font-bold text-ms-red">{stats?.lowStock || 0}</p>
                <p className="text-xs text-ms-red mt-1">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>Attention requise</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-ms-red text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover transition-smooth" data-testid="card-pending-requests">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ms-gray">Demandes en Cours</p>
                <p className="text-2xl font-bold text-ms-gray-dark">{stats?.pendingRequests || 0}</p>
                <p className="text-xs text-ms-amber mt-1">
                  <i className="fas fa-clock"></i>
                  <span>En attente</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-shopping-cart text-ms-amber text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover transition-smooth" data-testid="card-stock-value">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ms-gray">Valeur Stock</p>
                <p className="text-2xl font-bold text-ms-gray-dark">
                  {formatCurrency(stats?.stockValue || 0)}
                </p>
                <p className="text-xs text-ms-green mt-1">
                  <i className="fas fa-arrow-up"></i>
                  <span>Valeur totale</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-euro-sign text-ms-green text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div>
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-ms-gray-dark">Actions Rapides</h3>
            </div>
            <CardContent className="p-6 space-y-3">
              <Link href="/articles">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start p-4 h-auto bg-ms-gray-light hover:bg-gray-200"
                  data-testid="quick-action-articles"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-ms-blue rounded-lg flex items-center justify-center">
                      <i className="fas fa-plus text-white text-sm"></i>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-ms-gray-dark">Ajouter Article</p>
                      <p className="text-xs text-ms-gray">Nouveau produit</p>
                    </div>
                  </div>
                </Button>
              </Link>

              <Link href="/purchase-requests">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start p-4 h-auto bg-ms-gray-light hover:bg-gray-200"
                  data-testid="quick-action-purchase-request"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-ms-amber rounded-lg flex items-center justify-center">
                      <i className="fas fa-shopping-cart text-white text-sm"></i>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-ms-gray-dark">Demande d'Achat</p>
                      <p className="text-xs text-ms-gray">Nouvelle demande</p>
                    </div>
                  </div>
                </Button>
              </Link>

              <Link href="/reception">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start p-4 h-auto bg-ms-gray-light hover:bg-gray-200"
                  data-testid="quick-action-reception"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-ms-green rounded-lg flex items-center justify-center">
                      <i className="fas fa-truck text-white text-sm"></i>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-ms-gray-dark">Réception</p>
                      <p className="text-xs text-ms-gray">Enregistrer livraison</p>
                    </div>
                  </div>
                </Button>
              </Link>

              <Link href="/reports">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start p-4 h-auto bg-ms-gray-light hover:bg-gray-200"
                  data-testid="quick-action-export"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-ms-light-blue rounded-lg flex items-center justify-center">
                      <i className="fas fa-file-export text-white text-sm"></i>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-ms-gray-dark">Export Données</p>
                      <p className="text-xs text-ms-gray">Excel/PDF</p>
                    </div>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stock Alerts */}
        <div className="xl:col-span-2">
          <Card>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ms-gray-dark">Alertes Stock Bas</h3>
                {stats?.lowStock && stats.lowStock > 0 && (
                  <span className="bg-ms-red text-white text-xs px-2 py-1 rounded-full">
                    {stats.lowStock} articles
                  </span>
                )}
              </div>
            </div>
            <CardContent className="p-0">
              {lowStockArticles.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-ms-gray-light">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Code Article</th>
                        <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Désignation</th>
                        <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Stock Actuel</th>
                        <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Seuil Min.</th>
                        <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockArticles.slice(0, 5).map((article: any) => (
                        <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4 text-sm font-medium text-ms-gray-dark">{article.codeArticle}</td>
                          <td className="p-4 text-sm text-ms-gray-dark">{article.designation}</td>
                          <td className="p-4 text-sm font-medium text-ms-red">{article.stockActuel}</td>
                          <td className="p-4 text-sm text-ms-gray">{article.seuilMinimum}</td>
                          <td className="p-4">
                            <Button 
                              size="sm" 
                              className="btn-ms-blue text-xs"
                              data-testid={`button-order-${article.id}`}
                            >
                              Commander
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-ms-gray">
                  <i className="fas fa-check-circle text-ms-green text-3xl mb-2"></i>
                  <p>Aucun article en stock bas</p>
                  <p className="text-sm">Tous les stocks sont à niveau acceptable</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
