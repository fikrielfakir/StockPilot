import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ArticleForm from "@/components/ArticleForm";
import BarcodeGenerator from "@/components/BarcodeGenerator";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generateStockReportPDF } from "@/lib/pdfUtils";
import type { Article } from "@shared/schema";

export default function Articles() {
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [selectedArticleForQR, setSelectedArticleForQR] = useState<Article | null>(null);
  const { toast } = useToast();

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const { data: suppliers = [] } = useQuery({
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

  const filteredArticles = articles.filter(article => {
    const matchesSearch = !search || 
      article.codeArticle.toLowerCase().includes(search.toLowerCase()) ||
      article.designation.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || article.categorie === categoryFilter;
    
    const matchesStock = stockFilter === "all" || 
      (stockFilter === "low" && article.stockActuel <= (article.seuilMinimum || 10)) ||
      (stockFilter === "normal" && article.stockActuel > (article.seuilMinimum || 10));
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = [...new Set(articles.map(a => a.categorie))];

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

  return (
    <div className="space-y-6" data-testid="articles-page">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-ms-gray-dark">Gestion des Articles</h3>
            <div className="flex space-x-3">
              <Button 
                onClick={() => generateStockReportPDF(filteredArticles, 'Rapport Articles')}
                variant="outline"
                className="flex items-center space-x-2"
                data-testid="button-export-pdf"
              >
                <i className="fas fa-file-pdf text-red-600"></i>
                <span>Export PDF</span>
              </Button>
              <Button 
                onClick={() => setShowForm(true)}
                className="btn-ms-blue flex items-center space-x-2"
                data-testid="button-add-article"
              >
                <i className="fas fa-plus"></i>
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
                        <td className="p-4 text-sm text-ms-gray">{article.prixUnitaire ? `€${article.prixUnitaire}` : '-'}</td>
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
