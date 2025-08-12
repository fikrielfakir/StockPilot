import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown, 
  TrendingUp,
  Search,
  Filter,
  Download,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Article, Supplier, StockMovement } from "@shared/schema";

export default function StockStatus() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  // Fetch data
  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: stockMovements = [] } = useQuery<StockMovement[]>({
    queryKey: ["/api/stock-movements"],
  });

  // Process and filter articles
  const processedArticles = useMemo(() => {
    return articles.map(article => {
      const supplier = suppliers.find(s => s.id === article.fournisseurId);
      const stockPercentage = article.seuilMinimum ? (article.stockActuel / article.seuilMinimum) * 100 : 100;
      const recentMovements = stockMovements
        .filter(m => m.articleId === article.id)
        .sort((a, b) => new Date(b.dateMovement).getTime() - new Date(a.dateMovement).getTime())
        .slice(0, 5);
      
      let stockStatus: "critical" | "low" | "medium" | "good";
      if (article.stockActuel === 0) stockStatus = "critical";
      else if (article.stockActuel <= (article.seuilMinimum || 10)) stockStatus = "low";
      else if (article.stockActuel <= (article.seuilMinimum || 10) * 2) stockStatus = "medium";
      else stockStatus = "good";

      return {
        ...article,
        supplier,
        stockPercentage,
        stockStatus,
        recentMovements,
        stockValue: article.stockActuel * (parseFloat(article.prixUnitaire || "0") || 0),
      };
    });
  }, [articles, suppliers, stockMovements]);

  // Apply filters and sorting
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = processedArticles.filter(article => {
      const matchesSearch = !searchTerm || 
        article.codeArticle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.supplier?.nom.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || article.categorie === categoryFilter;
      
      const matchesStock = stockFilter === "all" || article.stockStatus === stockFilter;
      
      return matchesSearch && matchesCategory && matchesStock;
    });

    // Sort articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.designation.localeCompare(b.designation);
        case "stock":
          return b.stockActuel - a.stockActuel;
        case "status":
          const statusOrder = { critical: 0, low: 1, medium: 2, good: 3 };
          return statusOrder[a.stockStatus] - statusOrder[b.stockStatus];
        case "value":
          return b.stockValue - a.stockValue;
        default:
          return 0;
      }
    });

    return filtered;
  }, [processedArticles, searchTerm, categoryFilter, stockFilter, sortBy]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = processedArticles.length;
    const critical = processedArticles.filter(a => a.stockStatus === "critical").length;
    const low = processedArticles.filter(a => a.stockStatus === "low").length;
    const medium = processedArticles.filter(a => a.stockStatus === "medium").length;
    const good = processedArticles.filter(a => a.stockStatus === "good").length;
    const totalValue = processedArticles.reduce((sum, a) => sum + a.stockValue, 0);
    
    return { total, critical, low, medium, good, totalValue };
  }, [processedArticles]);

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(articles.map(a => a.categorie))).filter(Boolean);
  }, [articles]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "low": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "good": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "low": return <TrendingDown className="w-4 h-4 text-orange-500" />;
      case "medium": return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      case "good": return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const ArticleCard = ({ article }: { article: typeof processedArticles[0] }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{article.designation}</CardTitle>
            <CardDescription className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>{article.codeArticle}</span>
              <span>•</span>
              <span>{article.categorie}</span>
              {article.marque && (
                <>
                  <span>•</span>
                  <span>{article.marque}</span>
                </>
              )}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(article.stockStatus)}>
            {getStatusIcon(article.stockStatus)}
            <span className="ml-1 capitalize">
              {article.stockStatus === "critical" && "Critique"}
              {article.stockStatus === "low" && "Bas"}
              {article.stockStatus === "medium" && "Moyen"}
              {article.stockStatus === "good" && "Bon"}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stock Level */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Stock Actuel</span>
            <span className="text-2xl font-bold">{article.stockActuel} {article.unite}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Seuil min: {article.seuilMinimum || 10}</span>
            <span>Stock initial: {article.stockInitial}</span>
          </div>
          <Progress 
            value={Math.min(100, article.stockPercentage)} 
            className="h-2"
          />
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {article.supplier && (
            <div>
              <span className="text-gray-600">Fournisseur:</span>
              <p className="font-medium">{article.supplier.nom}</p>
            </div>
          )}
          {article.prixUnitaire && (
            <div>
              <span className="text-gray-600">Prix unitaire:</span>
              <p className="font-medium">{parseFloat(article.prixUnitaire).toFixed(2)} €</p>
            </div>
          )}
          <div>
            <span className="text-gray-600">Valeur stock:</span>
            <p className="font-medium">{article.stockValue.toFixed(2)} €</p>
          </div>
          <div>
            <span className="text-gray-600">Dernière MAJ:</span>
            <p className="font-medium">
              {format(new Date(article.createdAt || Date.now()), "dd/MM/yyyy", { locale: fr })}
            </p>
          </div>
        </div>

        {/* Recent Movements */}
        {article.recentMovements.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium mb-2">Mouvements récents</h4>
            <div className="space-y-1">
              {article.recentMovements.slice(0, 3).map((movement, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className={`px-2 py-1 rounded ${
                    movement.type === "entree" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {movement.type === "entree" ? "+" : "-"}{Math.abs(movement.quantite)}
                  </span>
                  <span className="text-gray-600">
                    {format(new Date(movement.dateMovement), "dd/MM", { locale: fr })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">État du Stock</h1>
          <p className="text-gray-600">Vue d'ensemble et gestion des niveaux de stock</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Stock Critique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summaryStats.critical}</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Stock Bas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summaryStats.low}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Stock Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summaryStats.medium}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Stock Bon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.good}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[300px]">
          <Input
            placeholder="Rechercher par nom, code, marque ou fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Toutes catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tous états" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous états</SelectItem>
            <SelectItem value="critical">Critique</SelectItem>
            <SelectItem value="low">Bas</SelectItem>
            <SelectItem value="medium">Moyen</SelectItem>
            <SelectItem value="good">Bon</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nom</SelectItem>
            <SelectItem value="stock">Stock</SelectItem>
            <SelectItem value="status">État</SelectItem>
            <SelectItem value="value">Valeur</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stock Status Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Tous ({filteredAndSortedArticles.length})</TabsTrigger>
          <TabsTrigger value="critical">Critique ({summaryStats.critical})</TabsTrigger>
          <TabsTrigger value="low">Bas ({summaryStats.low})</TabsTrigger>
          <TabsTrigger value="medium">Moyen ({summaryStats.medium})</TabsTrigger>
          <TabsTrigger value="good">Bon ({summaryStats.good})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </TabsContent>

        {["critical", "low", "medium", "good"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedArticles
                .filter((article) => article.stockStatus === status)
                .map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {filteredAndSortedArticles.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Aucun article trouvé</p>
            <p>Essayez de modifier vos critères de recherche</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}