import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReceptionForm from "@/components/ReceptionForm";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ExportButton } from "@/components/ExportButton";
import { DocumentGenerator } from "@/components/DocumentGenerator";
import type { Reception } from "@shared/schema";

export default function ReceptionPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingReception, setEditingReception] = useState<Reception | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: receptions = [], isLoading } = useQuery<Reception[]>({
    queryKey: ["/api/receptions"],
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["/api/articles"],
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["/api/suppliers"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/receptions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/receptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Réception supprimée",
        description: "La réception a été supprimée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la réception",
        variant: "destructive",
      });
    },
  });

  const filteredReceptions = receptions.filter(reception => {
    const article = articles.find((a: any) => a.id === reception.articleId);
    const supplier = suppliers.find((s: any) => s.id === reception.supplierId);
    
    return !search || 
      (article && (article.codeArticle.toLowerCase().includes(search.toLowerCase()) ||
                   article.designation.toLowerCase().includes(search.toLowerCase()))) ||
      (supplier && supplier.nom.toLowerCase().includes(search.toLowerCase())) ||
      (reception.numeroBonLivraison && reception.numeroBonLivraison.toLowerCase().includes(search.toLowerCase()));
  });

  const getArticleName = (articleId: string) => {
    const article = articles.find((a: any) => a.id === articleId);
    return article ? `${article.codeArticle} - ${article.designation}` : "Article inconnu";
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s: any) => s.id === supplierId);
    return supplier?.nom || "Fournisseur inconnu";
  };

  const handleEdit = (reception: Reception) => {
    setEditingReception(reception);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette réception ?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingReception(null);
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
    <div className="space-y-6" data-testid="reception-page">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-ms-gray-dark">Réception de Marchandises</h3>
            <div className="flex space-x-3">
              <ExportButton
                data={filteredReceptions}
                filename="receptions"
                title="Réceptions de Marchandises"
                columns={[
                  { key: 'dateReception', label: 'Date Réception', format: (val) => new Date(val).toLocaleDateString('fr-FR') },
                  { key: 'supplierId', label: 'Fournisseur', format: (val) => getSupplierName(val) },
                  { key: 'articleId', label: 'Article', format: (val) => getArticleName(val) },
                  { key: 'quantiteRecue', label: 'Quantité Reçue', format: (val) => val?.toString() || '0' },
                  { key: 'prixUnitaire', label: 'Prix Unitaire (€)', format: (val) => val ? `${val} €` : 'N/A' },
                  { key: 'numeroBonLivraison', label: 'N° Bon Livraison' },
                ]}
                className="mr-2"
              />
              <Button 
                onClick={() => setShowForm(true)}
                className="btn-ms-blue flex items-center space-x-2"
                data-testid="button-add-reception"
              >
                <i className="fas fa-plus"></i>
                <span>Nouvelle Réception</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-ms-gray-dark mb-2">Rechercher</label>
            <Input 
              type="text" 
              placeholder="Article, fournisseur, NBL..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        {/* Receptions Table */}
        <CardContent className="p-0">
          {filteredReceptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ms-gray-light">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Date Réception</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Fournisseur</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Article</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Quantité</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Prix Unitaire</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">NBL</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceptions.map((reception) => (
                    <tr key={reception.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 text-sm text-ms-gray-dark">
                        {new Date(reception.dateReception).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4 text-sm text-ms-gray-dark">{getSupplierName(reception.supplierId)}</td>
                      <td className="p-4 text-sm text-ms-gray-dark">{getArticleName(reception.articleId)}</td>
                      <td className="p-4 text-sm font-medium text-ms-gray-dark">{reception.quantiteRecue}</td>
                      <td className="p-4 text-sm text-ms-gray">
                        {reception.prixUnitaire ? `€${reception.prixUnitaire}` : '-'}
                      </td>
                      <td className="p-4 text-sm text-ms-gray">{reception.numeroBonLivraison || '-'}</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEdit(reception)}
                            data-testid={`button-edit-${reception.id}`}
                          >
                            <i className="fas fa-edit text-ms-blue"></i>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDelete(reception.id)}
                            data-testid={`button-delete-${reception.id}`}
                          >
                            <i className="fas fa-trash text-ms-red"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-ms-gray" data-testid="empty-state">
              <i className="fas fa-truck text-4xl mb-4"></i>
              <p className="text-lg font-medium">Aucune réception trouvée</p>
              <p className="text-sm">Commencez par enregistrer une nouvelle réception</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="btn-ms-blue mt-4"
                data-testid="button-add-first-reception"
              >
                Nouvelle réception
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <ReceptionForm 
          reception={editingReception}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
