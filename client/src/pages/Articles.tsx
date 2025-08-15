import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ArticleForm from "@/components/ArticleForm";
import BarcodeGenerator from "@/components/BarcodeGenerator";
import BulkImportExport from "@/components/BulkImportExport";
import AdvancedSearch from "@/components/AdvancedSearch";
import InteractiveChart from "@/components/InteractiveChart";
import { ExportButton } from "@/components/ExportButton";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generateStockReportPDF } from "@/lib/pdfUtils";
import type { Article } from "@shared/schema";
import { Upload, Download, Plus, BarChart3 } from "lucide-react";

interface SearchFilters {
  query: string;
  category: string;
  stockLevel: string;
  priceRange: string;
  supplier: string;
  status: string;
}

export default function Articles() {
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [selectedArticleForQR, setSelectedArticleForQR] = useState<Article | null>(null);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<SearchFilters>({
    query: "",
    category: "",
    stockLevel: "",
    priceRange: "",
    supplier: "",
    status: ""
  });
  const { toast } = useToast();

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const { data: suppliers = [] } = useQuery<Array<{ id: string; nom: string }>>({
    queryKey: ["/api/suppliers"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article",
        variant: "destructive",
      });
    },
  });

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      // Text search with fuzzy matching
      const searchTerm = advancedFilters.query || search;
      const matchesSearch = !searchTerm || 
        article.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.codeArticle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.marque?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (article.reference?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        article.categorie.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Advanced filters
      const matchesCategory = !advancedFilters.category || advancedFilters.category === "all" || 
                             article.categorie === advancedFilters.category ||
                             (!advancedFilters.category && (categoryFilter === "all" || article.categorie === categoryFilter));
      
      const stockActuel = Number(article.stockActuel) || 0;
      const seuilMinimum = Number(article.seuilMinimum) || 10;
      
      const matchesStockLevel = !advancedFilters.stockLevel || advancedFilters.stockLevel === "all" || 
        (advancedFilters.stockLevel === "critical" && stockActuel <= seuilMinimum * 0.5) ||
        (advancedFilters.stockLevel === "low" && stockActuel <= seuilMinimum && stockActuel > seuilMinimum * 0.5) ||
        (advancedFilters.stockLevel === "normal" && stockActuel > seuilMinimum && stockActuel <= seuilMinimum * 2) ||
        (advancedFilters.stockLevel === "high" && stockActuel > seuilMinimum * 2) ||
        (!advancedFilters.stockLevel && (
          stockFilter === "all" || 
          (stockFilter === "low" && article.stockActuel < (article.seuilMinimum || 10)) ||
          (stockFilter === "normal" && article.stockActuel >= (article.seuilMinimum || 10))
        ));

      const matchesPrice = !advancedFilters.priceRange || advancedFilters.priceRange === "all" || 
        (advancedFilters.priceRange === "0-10" && (article.prixUnitaire || 0) <= 10) ||
        (advancedFilters.priceRange === "10-50" && (article.prixUnitaire || 0) > 10 && (article.prixUnitaire || 0) <= 50) ||
        (advancedFilters.priceRange === "50-100" && (article.prixUnitaire || 0) > 50 && (article.prixUnitaire || 0) <= 100) ||
        (advancedFilters.priceRange === "100-500" && (article.prixUnitaire || 0) > 100 && (article.prixUnitaire || 0) <= 500) ||
        (advancedFilters.priceRange === "500+" && (article.prixUnitaire || 0) > 500);

      const matchesSupplier = !advancedFilters.supplier || advancedFilters.supplier === "all" || 
                             article.fournisseurId === advancedFilters.supplier;
      
      return matchesSearch && matchesCategory && matchesStockLevel && matchesPrice && matchesSupplier;
    });
  }, [articles, search, categoryFilter, stockFilter, advancedFilters]);

  // Analytics data for charts
  const analyticsData = useMemo(() => {
    const categoryData = filteredArticles.reduce((acc: any, article) => {
      const cat = article.categorie || 'Non catégorisé';
      if (!acc[cat]) {
        acc[cat] = { category: cat, count: 0, value: 0, stock: 0 };
      }
      acc[cat].count++;
      acc[cat].value += Number(article.prixUnitaire || 0) * article.stockActuel;
      acc[cat].stock += article.stockActuel;
      return acc;
    }, {});

    const stockLevelData = filteredArticles.reduce((acc: any, article) => {
      const seuil = article.seuilMinimum || 10;
      let level = 'Normal';
      if (article.stockActuel <= seuil * 0.5) level = 'Critique';
      else if (article.stockActuel <= seuil) level = 'Bas';
      else if (article.stockActuel > seuil * 2) level = 'Élevé';
      
      if (!acc[level]) acc[level] = { level, count: 0 };
      acc[level].count++;
      return acc;
    }, {});

    return {
      categoryChart: Object.values(categoryData),
      stockLevelChart: Object.values(stockLevelData)
    };
  }, [filteredArticles]);

  const categories = Array.from(new Set(articles.map(a => a.categorie)));

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingArticle(null);
  };

  const getStockStatus = (article: Article) => {
    if (article.stockActuel <= (article.seuilMinimum || 10)) {
      return { color: "text-ms-red", icon: "fas fa-exclamation-triangle" };
    }
    return { color: "text-ms-green", icon: "fas fa-check-circle" };
  };

  const getSupplierName = (supplierId: string | null) => {
    if (!supplierId) return "Non défini";
    const supplier = suppliers.find((s: any) => s.id === supplierId);
    return supplier?.nom || "Inconnu";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showImportExport) {
    return <BulkImportExport entityType="articles" onClose={() => setShowImportExport(false)} />;
  }

  return (
    <div className="space-y-6" data-testid="articles-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des Articles</h1>
          <p className="text-sm text-gray-600">
            {filteredArticles.length} article(s) sur {articles.length} total
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setShowAnalytics(!showAnalytics)}
            variant={showAnalytics ? "default" : "outline"}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </Button>
          <Button 
            onClick={() => setShowImportExport(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import/Export</span>
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Article
          </Button>
        </div>
      </div>

      {/* Advanced Search */}
      <AdvancedSearch
        onFiltersChange={setAdvancedFilters}
        categories={categories}
        suppliers={suppliers as Array<{ id: string; nom: string }>}
        showAnalytics={true}
      />

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <InteractiveChart
            data={analyticsData.categoryChart as any[]}
            title="Articles par Catégorie"
            description="Répartition des articles et leur valeur"
            xAxisKey="category"
            yAxisKey="count"
            defaultType="bar"
            colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
            enableDrillDown={true}
            showAnalytics={true}
          />
          
          <InteractiveChart
            data={analyticsData.stockLevelChart as any[]}
            title="Niveaux de Stock"
            description="Distribution des niveaux de stock"
            xAxisKey="level"
            yAxisKey="count"
            defaultType="pie"
            colors={['#EF4444', '#F59E0B', '#10B981', '#3B82F6']}
            showAnalytics={true}
          />
        </div>
      )}

      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Liste des Articles</h3>
            <div className="flex space-x-3">
              <ExportButton
                data={filteredArticles}
                filename="articles_stock"
                title="Articles de Stock"
                columns={[
                  { key: 'codeArticle', label: 'Code Article' },
                  { key: 'designation', label: 'Désignation' },
                  { key: 'categorie', label: 'Catégorie' },
                  { key: 'marque', label: 'Marque' },
                  { key: 'stockActuel', label: 'Stock Actuel', format: (val) => val?.toString() || '0' },
                  { key: 'seuilMinimum', label: 'Seuil Minimum', format: (val) => val?.toString() || 'N/A' },
                  { key: 'prixUnitaire', label: 'Prix Unitaire (MAD)', format: (val) => val ? `${val} MAD` : 'N/A' },
                  { key: 'unite', label: 'Unité' },
                ]}
                className="mr-2"
              />
              <Button 
                onClick={() => setShowImportExport(true)}
                variant="outline"
                className="flex items-center space-x-2"
                data-testid="button-import-export"
              >
                <Upload className="w-4 h-4" />
                <span>Import/Export</span>
              </Button>
              <Button 
                onClick={() => generateStockReportPDF(filteredArticles, 'Rapport Articles')}
                variant="outline"
                className="flex items-center space-x-2"
                data-testid="button-export-pdf"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </Button>
              <Button 
                onClick={() => setShowForm(true)}
                className="btn-ms-blue flex items-center space-x-2"
                data-testid="button-add-article"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvel Article</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-ms-gray-dark mb-2">Rechercher</label>
              <Input 
                type="text" 
                placeholder="Code, désignation..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ms-gray-dark mb-2">Catégorie</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ms-gray-dark mb-2">Stock</label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger data-testid="select-stock">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="low">Stock bas</SelectItem>
                  <SelectItem value="normal">Stock normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ms-gray-dark mb-2">Actions</label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("all");
                  setStockFilter("all");
                }}
                data-testid="button-clear-filters"
              >
                Effacer filtres
              </Button>
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <CardContent className="p-0">
          {filteredArticles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ms-gray-light">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Code Article</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Désignation</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Catégorie</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Stock</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Prix Unitaire</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Fournisseur</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article) => {
                    const stockStatus = getStockStatus(article);
                    return (
                      <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 text-sm font-medium text-ms-gray-dark">{article.codeArticle}</td>
                        <td className="p-4 text-sm text-ms-gray-dark">{article.designation}</td>
                        <td className="p-4 text-sm text-ms-gray">{article.categorie}</td>
                        <td className="p-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <i className={`${stockStatus.icon} ${stockStatus.color}`}></i>
                            <span className={`font-medium ${stockStatus.color}`}>
                              {article.stockActuel} {article.unite}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-ms-gray">{article.prixUnitaire ? `${article.prixUnitaire} MAD` : '-'}</td>
                        <td className="p-4 text-sm text-ms-gray">{getSupplierName(article.fournisseurId)}</td>
                        <td className="p-4">
                          <div className="flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setSelectedArticleForQR(article)}
                              title="Générer QR Code"
                              data-testid={`button-qr-${article.id}`}
                            >
                              <i className="fas fa-qrcode text-ms-green"></i>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleEdit(article)}
                              title="Modifier"
                              data-testid={`button-edit-${article.id}`}
                            >
                              <i className="fas fa-edit text-ms-blue"></i>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDelete(article.id)}
                              title="Supprimer"
                              data-testid={`button-delete-${article.id}`}
                            >
                              <i className="fas fa-trash text-ms-red"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-ms-gray" data-testid="empty-state">
              <i className="fas fa-boxes text-4xl mb-4"></i>
              <p className="text-lg font-medium">Aucun article trouvé</p>
              <p className="text-sm">Commencez par ajouter votre premier article</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="btn-ms-blue mt-4"
                data-testid="button-add-first-article"
              >
                Ajouter un article
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <ArticleForm 
          article={editingArticle}
          onClose={handleCloseForm}
        />
      )}

      {selectedArticleForQR && (
        <BarcodeGenerator 
          article={selectedArticleForQR}
          isOpen={!!selectedArticleForQR}
          onClose={() => setSelectedArticleForQR(null)}
        />
      )}
    </div>
  );
}
