import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, ShoppingCart } from "lucide-react";
import ArticleAutocomplete from "@/components/ArticleAutocomplete";
import { insertPurchaseRequestSchema, type PurchaseRequest, type InsertPurchaseRequest, type Article, type Requestor, type Supplier } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface PurchaseRequestItem {
  id: string;
  articleId: string;
  article?: Article;
  quantiteDemandee: number;
  supplierId?: string;
  prixUnitaireEstime?: number;
  observations?: string;
}

interface PurchaseRequestFormProps {
  request?: PurchaseRequest | null;
  onClose: () => void;
}

const purchaseRequestFormSchema = z.object({
  requestorId: z.string().min(1, "Demandeur requis"),
  observations: z.string().optional(),
  statut: z.string().default("en_attente"),
});

export default function EnhancedPurchaseRequestForm({ request, onClose }: PurchaseRequestFormProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<PurchaseRequestItem[]>([]);
  const isEditing = !!request;

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const { data: requestors = [] } = useQuery<Requestor[]>({
    queryKey: ["/api/requestors"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const form = useForm({
    resolver: zodResolver(purchaseRequestFormSchema),
    defaultValues: {
      requestorId: request?.requestorId || "",
      observations: request?.observations || "",
      statut: request?.statut || "en_attente",
    },
  });

  const addItem = () => {
    const newItem: PurchaseRequestItem = {
      id: Math.random().toString(36).substr(2, 9),
      articleId: "",
      quantiteDemandee: 1,
      observations: "",
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<PurchaseRequestItem>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating purchase request with data:', data);
      console.log('Items to create:', items);
      
      // Validate items
      if (items.length === 0) {
        throw new Error('Au moins un article est requis');
      }
      
      // Validate each item has required fields
      for (const item of items) {
        if (!item.articleId) {
          throw new Error('Article requis pour tous les éléments');
        }
        if (!item.quantiteDemandee || item.quantiteDemandee < 1) {
          throw new Error('Quantité doit être supérieure à 0');
        }
      }
      
      // Create purchase request header
      const headerData = {
        dateDemande: new Date().toISOString(),
        requestorId: data.requestorId,
        observations: data.observations,
        statut: data.statut || "en_attente",
        totalArticles: items.length,
      };
      
      console.log('Sending header data:', headerData);
      const response = await apiRequest("POST", "/api/purchase-requests", headerData);
      const purchaseRequest = await response.json();
      console.log('Created purchase request:', purchaseRequest);
      
      // Create purchase request items
      if (items.length > 0) {
        const itemsData = items.map(item => ({
          purchaseRequestId: purchaseRequest.id,
          articleId: item.articleId,
          quantiteDemandee: item.quantiteDemandee,
          supplierId: item.supplierId || null,
          prixUnitaireEstime: item.prixUnitaireEstime || null,
          observations: item.observations || null,
        }));
        
        console.log('Creating items:', itemsData);
        for (const itemData of itemsData) {
          const itemResponse = await apiRequest("POST", "/api/purchase-request-items", itemData);
          console.log('Created item:', await itemResponse.json());
        }
      }
      
      return purchaseRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Demande créée",
        description: "La demande d'achat avec articles a été créée avec succès",
      });
      onClose();
    },
    onError: (error) => {
      console.error('Purchase request creation error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la demande",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    console.log('Form submitted with data:', data);
    console.log('Current items:', items);
    
    if (items.length === 0) {
      toast({
        title: "Attention",
        description: "Ajoutez au moins un article à la demande",
        variant: "destructive",
      });
      return;
    }
    
    // Check if all items have required fields
    const invalidItems = items.filter(item => !item.articleId || !item.quantiteDemandee || item.quantiteDemandee < 1);
    if (invalidItems.length > 0) {
      toast({
        title: "Attention",
        description: "Tous les articles doivent avoir un article sélectionné et une quantité > 0",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate(data);
  };

  const isPending = createMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="enhanced-purchase-request-form-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>{isEditing ? "Modifier la Demande" : "Nouvelle Demande d'Achat"}</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Request Header */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations de la Demande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="requestorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Demandeur *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-requestor">
                              <SelectValue placeholder="Sélectionner un demandeur" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {requestors.map((requestor: any) => (
                              <SelectItem key={requestor.id} value={requestor.id}>
                                {requestor.nom} {requestor.prenom} - {requestor.departement}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="statut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en_attente">En Attente</SelectItem>
                            <SelectItem value="approuve">Approuvé</SelectItem>
                            <SelectItem value="refuse">Refusé</SelectItem>
                            <SelectItem value="commande">Commandé</SelectItem>
                          </SelectContent>
                        </Select>
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
                          placeholder="Observations générales de la demande..." 
                          {...field} 
                          data-testid="input-observations"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Articles List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Articles Demandés</CardTitle>
                  <Badge variant="secondary">
                    {items.length} article{items.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <Card key={item.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-medium">Article #{index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`remove-item-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="md:col-span-2 lg:col-span-1">
                          <label className="block text-sm font-medium mb-2">Article *</label>
                          <ArticleAutocomplete
                            value={item.articleId}
                            onSelect={(articleId, article) => {
                              updateItem(item.id, { 
                                articleId, 
                                article,
                                supplierId: article.fournisseurId || undefined 
                              });
                            }}
                            placeholder="Rechercher un article..."
                            data-testid={`article-autocomplete-${index}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Quantité *</label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantiteDemandee}
                            onChange={(e) => updateItem(item.id, { 
                              quantiteDemandee: parseInt(e.target.value) || 1 
                            })}
                            data-testid={`input-quantity-${index}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Prix estimé</label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={item.prixUnitaireEstime || ""}
                            onChange={(e) => updateItem(item.id, { 
                              prixUnitaireEstime: parseFloat(e.target.value) || undefined 
                            })}
                            data-testid={`input-price-${index}`}
                          />
                        </div>

                        <div className="md:col-span-2 lg:col-span-1">
                          <label className="block text-sm font-medium mb-2">Fournisseur</label>
                          <Select 
                            value={item.supplierId || "none"} 
                            onValueChange={(value) => updateItem(item.id, { 
                              supplierId: value === "none" ? undefined : value 
                            })}
                          >
                            <SelectTrigger data-testid={`select-supplier-${index}`}>
                              <SelectValue placeholder="Sélectionner un fournisseur" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Aucun fournisseur</SelectItem>
                              {suppliers.map((supplier: any) => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                  {supplier.nom}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2">Observations</label>
                          <Textarea
                            placeholder="Observations spécifiques à cet article..."
                            value={item.observations || ""}
                            onChange={(e) => updateItem(item.id, { 
                              observations: e.target.value 
                            })}
                            rows={2}
                            data-testid={`input-item-observations-${index}`}
                          />
                        </div>
                      </div>

                      {item.article && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <span className="font-medium">{item.article.designation}</span>
                              <span className="text-gray-500 ml-2">Réf: {item.article.reference}</span>
                            </div>
                            <div className="text-right">
                              <div>Stock actuel: <span className="font-medium">{item.article.stockActuel}</span></div>
                              {item.article.prixUnitaire && (
                                <div>Prix: <span className="font-medium">{item.article.prixUnitaire}€</span></div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addItem}
                  className="w-full border-dashed"
                  data-testid="add-article-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un Article
                </Button>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                data-testid="button-cancel"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isPending || items.length === 0}
                data-testid="button-submit"
              >
                {isPending ? "Création..." : (isEditing ? "Modifier" : "Créer la Demande")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}