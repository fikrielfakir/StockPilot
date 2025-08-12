import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OutboundForm from "@/components/OutboundForm";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Outbound } from "@shared/schema";

export default function OutboundPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingOutbound, setEditingOutbound] = useState<Outbound | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: outbounds = [], isLoading } = useQuery<Outbound[]>({
    queryKey: ["/api/outbounds"],
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["/api/articles"],
  });

  const { data: requestors = [] } = useQuery({
    queryKey: ["/api/requestors"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/outbounds/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outbounds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sortie supprimée",
        description: "La sortie de stock a été supprimée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la sortie",
        variant: "destructive",
      });
    },
  });

  const filteredOutbounds = outbounds.filter(outbound => {
    const article = articles.find((a: any) => a.id === outbound.articleId);
    const requestor = requestors.find((r: any) => r.id === outbound.requestorId);
    
    return !search || 
      (article && (article.codeArticle.toLowerCase().includes(search.toLowerCase()) ||
                   article.designation.toLowerCase().includes(search.toLowerCase()))) ||
      (requestor && `${requestor.prenom} ${requestor.nom}`.toLowerCase().includes(search.toLowerCase())) ||
      outbound.motifSortie.toLowerCase().includes(search.toLowerCase());
  });

  const getArticleName = (articleId: string) => {
    const article = articles.find((a: any) => a.id === articleId);
    return article ? `${article.codeArticle} - ${article.designation}` : "Article inconnu";
  };

  const getRequestorName = (requestorId: string) => {
    const requestor = requestors.find((r: any) => r.id === requestorId);
    return requestor ? `${requestor.prenom} ${requestor.nom}` : "Demandeur inconnu";
  };

  const handleEdit = (outbound: Outbound) => {
    setEditingOutbound(outbound);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette sortie ?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOutbound(null);
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
    <div className="space-y-6" data-testid="outbound-page">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-ms-gray-dark">Sortie de Stock</h3>
            <Button 
              onClick={() => setShowForm(true)}
              className="btn-ms-blue flex items-center space-x-2"
              data-testid="button-add-outbound"
            >
              <i className="fas fa-plus"></i>
              <span>Nouvelle Sortie</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-ms-gray-dark mb-2">Rechercher</label>
            <Input 
              type="text" 
              placeholder="Article, demandeur, motif..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        {/* Outbounds Table */}
        <CardContent className="p-0">
          {filteredOutbounds.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ms-gray-light">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Date Sortie</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Demandeur</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Article</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Quantité</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Motif</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Observations</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOutbounds.map((outbound) => (
                    <tr key={outbound.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 text-sm text-ms-gray-dark">
                        {new Date(outbound.dateSortie).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4 text-sm text-ms-gray-dark">{getRequestorName(outbound.requestorId)}</td>
                      <td className="p-4 text-sm text-ms-gray-dark">{getArticleName(outbound.articleId)}</td>
                      <td className="p-4 text-sm font-medium text-ms-gray-dark">{outbound.quantiteSortie}</td>
                      <td className="p-4 text-sm text-ms-gray">{outbound.motifSortie}</td>
                      <td className="p-4 text-sm text-ms-gray max-w-xs truncate" title={outbound.observations || ""}>
                        {outbound.observations || '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEdit(outbound)}
                            data-testid={`button-edit-${outbound.id}`}
                          >
                            <i className="fas fa-edit text-ms-blue"></i>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDelete(outbound.id)}
                            data-testid={`button-delete-${outbound.id}`}
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
              <i className="fas fa-sign-out-alt text-4xl mb-4"></i>
              <p className="text-lg font-medium">Aucune sortie trouvée</p>
              <p className="text-sm">Commencez par enregistrer une nouvelle sortie de stock</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="btn-ms-blue mt-4"
                data-testid="button-add-first-outbound"
              >
                Nouvelle sortie
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <OutboundForm 
          outbound={editingOutbound}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
