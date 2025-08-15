import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import EnhancedPurchaseRequestForm from "@/components/EnhancedPurchaseRequestForm";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generatePurchaseRequestPDF } from "@/lib/pdfUtils";
import { ConvertToReceptionDialog } from "@/components/ConvertToReceptionDialog";
import { ExportButton } from "@/components/ExportButton";
import { DocumentGenerator } from "@/components/DocumentGenerator";
import type { PurchaseRequest } from "@shared/schema";

export default function PurchaseRequests() {
  const [showEnhancedForm, setShowEnhancedForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PurchaseRequest | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const { data: purchaseRequests = [], isLoading } = useQuery<PurchaseRequest[]>({
    queryKey: ["/api/purchase-requests"],
  });

  const { data: articles = [] } = useQuery<any[]>({
    queryKey: ["/api/articles"],
  });

  const { data: requestors = [] } = useQuery<any[]>({
    queryKey: ["/api/requestors"],
  });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ["/api/suppliers"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: string }) => 
      apiRequest("PUT", `/api/purchase-requests/${id}`, { statut }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la demande a été mis à jour",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/purchase-requests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Demande supprimée",
        description: "La demande d'achat a été supprimée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la demande",
        variant: "destructive",
      });
    },
  });

  const filteredRequests = purchaseRequests.filter(request => {
    const article = articles.find((a: any) => a.id === request.articleId);
    const requestor = requestors.find((r: any) => r.id === request.requestorId);
    
    const matchesSearch = !search || 
      (article && article.designation.toLowerCase().includes(search.toLowerCase())) ||
      (requestor && `${requestor.prenom} ${requestor.nom}`.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || request.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getArticleName = (articleId: string) => {
    const article = articles.find((a: any) => a.id === articleId);
    return article ? `${article.codeArticle} - ${article.designation}` : "Article inconnu";
  };

  const getRequestorName = (requestorId: string) => {
    const requestor = requestors.find((r: any) => r.id === requestorId);
    return requestor ? `${requestor.prenom} ${requestor.nom}` : "Demandeur inconnu";
  };

  const getSupplierName = (supplierId: string | null) => {
    if (!supplierId) return "-";
    const supplier = suppliers.find((s: any) => s.id === supplierId);
    return supplier?.nom || "Fournisseur inconnu";
  };

  const getStatusText = (statut: string) => {
    const statusConfig = {
      en_attente: { color: "text-yellow-600 dark:text-yellow-400", label: "En attente" },
      approuve: { color: "text-green-600 dark:text-green-400", label: "Approuvé" },
      refuse: { color: "text-red-600 dark:text-red-400", label: "Refusé" },
      commande: { color: "text-blue-600 dark:text-blue-400", label: "Commandé" },
    };
    
    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig.en_attente;
    return (
      <span className={`font-semibold ${config.color}`} data-testid={`status-${statut}`}>
        {config.label}
      </span>
    );
  };

  const handleEdit = (request: PurchaseRequest) => {
    setEditingRequest(request);
    setShowEnhancedForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette demande ?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatusMutation.mutate({ id, statut: newStatus });
  };

  const handleCloseForm = () => {
    setShowEnhancedForm(false);
    setEditingRequest(null);
  };

  const handleExportPDF = (request: PurchaseRequest) => {
    const article = articles?.find((a: any) => a.id === request.articleId);
    const requestor = requestors?.find((r: any) => r.id === request.requestorId);
    const supplier = article?.fournisseurId ? suppliers?.find((s: any) => s.id === article.fournisseurId) : null;
    
    if (article && requestor) {
      generatePurchaseRequestPDF(request, article, requestor, supplier);
    } else {
      toast({
        title: "Erreur",
        description: "Impossible d'exporter la demande. Données manquantes.",
        variant: "destructive",
      });
    }
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
    <div className="space-y-6" data-testid="purchase-requests-page">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-ms-gray-dark">Demandes d'Achat</h3>
            <div className="flex space-x-3">
              <ExportButton
                data={filteredRequests}
                filename="demandes_achat"
                title="Demandes d'Achat"
                columns={[
                  { key: 'dateDemande', label: 'Date Demande', format: (val) => new Date(val).toLocaleDateString('fr-FR') },
                  { key: 'articleId', label: 'Article', format: (val) => getArticleName(val) },
                  { key: 'requestorId', label: 'Demandeur', format: (val) => getRequestorName(val) },
                  { key: 'quantiteDemandee', label: 'Quantité', format: (val) => val?.toString() || '0' },
                  { key: 'statut', label: 'Statut' },
                  { key: 'observations', label: 'Observations' },
                ]}
                className="mr-2"
              />
              <Button 
                onClick={() => setShowEnhancedForm(true)}
                className="btn-ms-blue flex items-center space-x-2"
                data-testid="button-add-request"
              >
                <i className="fas fa-plus"></i>
                <span>Nouvelle Demande</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-ms-gray-dark mb-2">Rechercher</label>
              <Input 
                type="text" 
                placeholder="Article, demandeur..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ms-gray-dark mb-2">Statut</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="approuve">Approuvé</SelectItem>
                  <SelectItem value="refuse">Refusé</SelectItem>
                  <SelectItem value="commande">Commandé</SelectItem>
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
                  setStatusFilter("all");
                }}
                data-testid="button-clear-filters"
              >
                Effacer filtres
              </Button>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <CardContent className="p-0">
          {filteredRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ms-gray-light">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Date Demande</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Demandeur</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Article</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Quantité</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Statut</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Fournisseur</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 text-sm text-ms-gray-dark">
                        {new Date(request.dateDemande).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4 text-sm text-ms-gray-dark">{getRequestorName(request.requestorId)}</td>
                      <td className="p-4 text-sm text-ms-gray-dark">{getArticleName(request.articleId)}</td>
                      <td className="p-4 text-sm font-medium text-ms-gray-dark">{request.quantiteDemandee}</td>
                      <td className="p-4">{getStatusText(request.statut)}</td>
                      <td className="p-4 text-sm text-ms-gray">{getSupplierName(request.supplierId)}</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          {/* Convert to Reception Button - Only show for approved requests */}
                          {request.statut === "approuve" && (
                            <ConvertToReceptionDialog purchaseRequest={request} />
                          )}
                          
                          <Select onValueChange={(value) => handleStatusChange(request.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en_attente">En attente</SelectItem>
                              <SelectItem value="approuve">Approuvé</SelectItem>
                              <SelectItem value="refuse">Refusé</SelectItem>
                              <SelectItem value="commande">Commandé</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleExportPDF(request)}
                            title="Exporter PDF"
                            data-testid={`button-pdf-${request.id}`}
                          >
                            <i className="fas fa-file-pdf text-red-600"></i>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEdit(request)}
                            title="Modifier"
                            data-testid={`button-edit-${request.id}`}
                          >
                            <i className="fas fa-edit text-ms-blue"></i>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDelete(request.id)}
                            title="Supprimer"
                            data-testid={`button-delete-${request.id}`}
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
              <i className="fas fa-shopping-cart text-4xl mb-4"></i>
              <p className="text-lg font-medium">Aucune demande trouvée</p>
              <p className="text-sm">Commencez par créer une nouvelle demande d'achat</p>
              <Button 
                onClick={() => setShowEnhancedForm(true)}
                className="btn-ms-blue mt-4"
                data-testid="button-add-first-request"
              >
                Nouvelle demande
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showEnhancedForm && (
        <EnhancedPurchaseRequestForm 
          isOpen={showEnhancedForm}
          onClose={handleCloseForm}
          editingRequest={editingRequest}
        />
      )}
    </div>
  );
}
