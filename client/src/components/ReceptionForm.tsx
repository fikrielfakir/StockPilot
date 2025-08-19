import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Package2, ShoppingCart, Calendar, Trash2, ArrowLeft } from "lucide-react";
import { type Reception, type PurchaseRequest, type Article, type Supplier, type Requestor } from "@shared/schema";

interface ReceptionItem {
  id: string;
  articleId: string;
  articleDesignation: string;
  quantiteDemandee: number;
  quantiteRecue: number;
  prixUnitaire: number | null;
  supplierId: string | null;
  supplierName: string | null;
}

interface ReceptionFormProps {
  reception?: Reception | null;
  onClose: () => void;
}

export default function ReceptionForm({ reception, onClose }: ReceptionFormProps) {
  const [step, setStep] = useState<'select' | 'items'>('select');
  const [selectedPurchaseRequest, setSelectedPurchaseRequest] = useState<PurchaseRequest | null>(null);
  const [receptionItems, setReceptionItems] = useState<ReceptionItem[]>([]);
  const { toast } = useToast();
  const isEditing = !!reception;

  // Fetch approved purchase requests
  const { data: purchaseRequests = [] } = useQuery<PurchaseRequest[]>({
    queryKey: ["/api/purchase-requests"],
    enabled: !isEditing,
  });

  // Fetch purchase request items when a request is selected
  const { data: purchaseRequestItems = [] } = useQuery({
    queryKey: ["/api/purchase-request-items", selectedPurchaseRequest?.id],
    queryFn: () => selectedPurchaseRequest 
      ? apiRequest("GET", `/api/purchase-request-items/${selectedPurchaseRequest.id}`).then(res => res.json())
      : Promise.resolve([]),
    enabled: !!selectedPurchaseRequest,
  });

  // Fetch articles and suppliers for item details
  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
    enabled: !isEditing,
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
    enabled: !isEditing,
  });

  const { data: requestors = [] } = useQuery<Requestor[]>({
    queryKey: ["/api/requestors"],
    enabled: !isEditing,
  });

  // Filter approved purchase requests
  const approvedRequests = purchaseRequests.filter(pr => pr.statut === "approuve");

  // Initialize reception items when data is loaded
  useEffect(() => {
    if (purchaseRequestItems.length > 0 && articles.length > 0) {
      const items: ReceptionItem[] = purchaseRequestItems.map((item: any) => {
        const article = articles.find((a: Article) => a.id === item.articleId);
        const supplier = suppliers.find((s: Supplier) => s.id === item.supplierId);
        
        return {
          id: item.id,
          articleId: item.articleId,
          articleDesignation: article?.designation || "Article inconnu",
          quantiteDemandee: item.quantiteDemandee,
          quantiteRecue: item.quantiteDemandee, // Default to requested quantity
          prixUnitaire: item.prixUnitaireEstime ? parseFloat(item.prixUnitaireEstime) : null,
          supplierId: item.supplierId,
          supplierName: supplier?.nom || "Fournisseur non spécifié",
        };
      });
      setReceptionItems(items);
    }
  }, [purchaseRequestItems, articles, suppliers]);

  const form = useForm({
    defaultValues: {
      dateReception: new Date().toISOString().split('T')[0],
      numeroBonLivraison: "",
      observations: selectedPurchaseRequest 
        ? `Réception pour demande d'achat ${selectedPurchaseRequest.id.slice(0, 8)}`
        : "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) return; // View only mode
      
      // Create individual receptions for each item
      const receptionPromises = receptionItems.map(item => 
        apiRequest("POST", "/api/receptions", {
          dateReception: data.dateReception,
          supplierId: item.supplierId,
          articleId: item.articleId,
          quantiteRecue: item.quantiteRecue,
          prixUnitaire: item.prixUnitaire,
          numeroBonLivraison: data.numeroBonLivraison,
          observations: `${data.observations} - Article: ${item.articleDesignation}`,
        })
      );
      
      await Promise.all(receptionPromises);
      
      // Update purchase request status to received
      if (selectedPurchaseRequest) {
        await apiRequest("PUT", `/api/purchase-requests/${selectedPurchaseRequest.id}`, {
          statut: "recu"
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Réception enregistrée",
        description: "La réception a été enregistrée et le stock mis à jour",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/receptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'enregistrer la réception",
      });
      console.error("Reception creation error:", error);
    },
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  const updateReceptionItem = (index: number, field: keyof ReceptionItem, value: any) => {
    setReceptionItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeReceptionItem = (index: number) => {
    setReceptionItems(prev => prev.filter((_, i) => i !== index));
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

  const selectPurchaseRequest = (request: PurchaseRequest) => {
    setSelectedPurchaseRequest(request);
    setStep('items');
  };

  if (isEditing) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl" data-testid="reception-form-modal">
          <DialogHeader>
            <DialogTitle>Détails de la Réception</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <p>Mode visualisation de réception existante (fonctionnalité à implémenter)</p>
            <Button onClick={onClose} className="mt-4">Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" data-testid="reception-form-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package2 className="h-6 w-6 text-green-600" />
            Nouvelle Réception
            {selectedPurchaseRequest && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep('select');
                  setSelectedPurchaseRequest(null);
                  setReceptionItems([]);
                }}
                className="ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Sélectionner une demande d'achat approuvée
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Choisissez une demande d'achat pour créer la réception correspondante
              </p>
            </div>

            {approvedRequests.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Demandeur</TableHead>
                      <TableHead>Articles</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Observations</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <td className="p-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(request.dateDemande).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          {getRequestorName(request.requestorId)}
                        </td>
                        <td className="p-4 text-sm font-medium">
                          {request.totalArticles} article(s)
                        </td>
                        <td className="p-4">
                          {getStatusBadge(request.statut)}
                        </td>
                        <td className="p-4 text-sm max-w-xs">
                          <div className="truncate">
                            {request.observations || "-"}
                          </div>
                        </td>
                        <td className="p-4">
                          <Button
                            size="sm"
                            onClick={() => selectPurchaseRequest(request)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Sélectionner
                          </Button>
                        </td>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Aucune demande d'achat approuvée</p>
                <p className="text-sm">Les demandes d'achat approuvées apparaîtront ici</p>
              </div>
            )}
          </div>
        )}

        {step === 'items' && selectedPurchaseRequest && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Purchase Request Info */}
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    Demande d'achat #{selectedPurchaseRequest.id.slice(0, 8)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total articles:</span>
                    <span className="ml-2 font-medium">{selectedPurchaseRequest.totalArticles}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Statut:</span>
                    <span className="ml-2">{getStatusBadge(selectedPurchaseRequest.statut)}</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package2 className="h-5 w-5" />
                  Articles à réceptionner
                </h3>
                
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">No</TableHead>
                        <TableHead>Article</TableHead>
                        <TableHead className="w-32">Qté commandée</TableHead>
                        <TableHead className="w-32">Qté reçue</TableHead>
                        <TableHead className="w-32">PU (MAD)</TableHead>
                        <TableHead>Fournisseur</TableHead>
                        <TableHead className="w-16">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receptionItems.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{item.articleDesignation}</TableCell>
                          <TableCell>{item.quantiteDemandee}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max={item.quantiteDemandee}
                              value={item.quantiteRecue}
                              onChange={(e) => updateReceptionItem(index, 'quantiteRecue', Number(e.target.value))}
                              className="w-20"
                              data-testid={`input-quantite-recue-${index}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.prixUnitaire || ""}
                              onChange={(e) => updateReceptionItem(index, 'prixUnitaire', e.target.value ? Number(e.target.value) : null)}
                              placeholder="Prix unitaire"
                              className="w-24"
                              data-testid={`input-prix-${index}`}
                            />
                          </TableCell>
                          <TableCell className="text-sm">{item.supplierName}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeReceptionItem(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              data-testid={`button-remove-${index}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Reception Details */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateReception"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de Réception *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-date-reception"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numeroBonLivraison"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>N° Bon de Livraison</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="BL-2025-001"
                          data-testid="input-bon-livraison"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observations</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Notes sur la réception, contrôle qualité, etc."
                        rows={3}
                        data-testid="textarea-observations"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  data-testid="button-cancel-reception"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || receptionItems.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-confirm-reception"
                >
                  {createMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Package2 className="h-4 w-4 mr-2" />
                      Confirmer la Réception ({receptionItems.length} articles)
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}