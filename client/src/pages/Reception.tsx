import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ReceptionForm from "@/components/ReceptionForm";
import { ConvertToReceptionDialog } from "@/components/ConvertToReceptionDialog";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ExportButton } from "@/components/ExportButton";
import { DocumentGenerator } from "@/components/DocumentGenerator";
import { Package2, ShoppingCart, Calendar } from "lucide-react";
import type { Reception, PurchaseRequest, Requestor } from "@shared/schema";

export default function ReceptionPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingReception, setEditingReception] = useState<Reception | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: receptions = [], isLoading } = useQuery<Reception[]>({
    queryKey: ["/api/receptions"],
  });

  const { data: articles = [] } = useQuery<any[]>({
    queryKey: ["/api/articles"],
  });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ["/api/suppliers"],
  });

  // Fetch purchase requests for conversion
  const { data: purchaseRequests = [] } = useQuery<PurchaseRequest[]>({
    queryKey: ["/api/purchase-requests"],
  });

  // Fetch requestors for purchase request details
  const { data: requestors = [] } = useQuery<Requestor[]>({
    queryKey: ["/api/requestors"],
  });

  // Filter purchase requests that can be converted (approved or ordered status)
  const convertibleRequests = purchaseRequests.filter(pr => 
    pr.statut === "approuve" || pr.statut === "commande"
  );

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

  const getRequestorName = (requestorId: string) => {
    const requestor = requestors.find((r: any) => r.id === requestorId);
    return requestor ? `${requestor.prenom} ${requestor.nom}` : "Demandeur inconnu";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "en_attente": { label: "En attente", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      "approuve": { label: "Approuvé", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      "refuse": { label: "Refusé", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
      "commande": { label: "Commandé", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      "recu": { label: "Reçu", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["en_attente"];
    return <Badge className={config.className}>{config.label}</Badge>;
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Réception de Marchandises</h1>
      </div>

      <Tabs defaultValue="receptions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receptions" className="flex items-center gap-2">
            <Package2 className="h-4 w-4" />
            Réceptions ({receptions.length})
          </TabsTrigger>
          <TabsTrigger value="purchase-requests" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Demandes d'achat ({convertibleRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receptions" className="space-y-6">
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
                  { key: 'prixUnitaire', label: 'Prix Unitaire (MAD)', format: (val) => val ? `${val} MAD` : 'N/A' },
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
                        {reception.prixUnitaire ? `${reception.prixUnitaire} MAD` : '-'}
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
        </TabsContent>

        <TabsContent value="purchase-requests" className="space-y-6">
          <Card>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Demandes d'achat à convertir</h3>
                <div className="text-sm text-gray-500">
                  {convertibleRequests.length} demande(s) éligible(s) pour conversion
                </div>
              </div>
            </div>

            <CardContent className="p-0">
              {convertibleRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Demandeur</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Articles</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Statut</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Observations</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {convertibleRequests.map((request) => (
                        <tr key={request.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-4 text-sm text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {new Date(request.dateDemande).toLocaleDateString('fr-FR')}
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-900 dark:text-gray-100">
                            {getRequestorName(request.requestorId)}
                          </td>
                          <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {request.totalArticles} article(s)
                          </td>
                          <td className="p-4">
                            {getStatusBadge(request.statut)}
                          </td>
                          <td className="p-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                            <div className="truncate">
                              {request.observations || "-"}
                            </div>
                          </td>
                          <td className="p-4">
                            <ConvertToReceptionDialog purchaseRequest={request}>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                data-testid={`button-convert-${request.id}`}
                              >
                                <Package2 className="h-4 w-4 mr-2" />
                                Convertir
                              </Button>
                            </ConvertToReceptionDialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-lg font-medium">Aucune demande d'achat à convertir</p>
                  <p className="text-sm">Les demandes d'achat approuvées ou commandées apparaîtront ici</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showForm && (
        <ReceptionForm 
          reception={editingReception}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
